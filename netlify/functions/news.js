try { require('dotenv').config(); } catch (e) {}
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');

let cachedClient = null;
let cachedDb = null;

const AUTH_SECRET = process.env.AUTH_SECRET || 'auipr_secret_hmac_key_2026_rbac';
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'auipr_db';

// 3 Admin Accounts with Role-Based Access Control (RBAC) & Branch Association
const USERS = {
  admin_general: {
    username: 'admin_general',
    password: process.env.ADMIN_GENERAL_PASS || 'Auipr#Gen@2026!Sec',
    role: 'super_admin',
    name: 'المشرف العام',
    branchId: 'main',
    allowedBranches: ['all', 'main', 'lebanon', 'jordan']
  },
  admin_lebanon: {
    username: 'admin_lebanon',
    password: process.env.ADMIN_LEBANON_PASS || 'Auipr#Lb@2026!Beir',
    role: 'lebanon_admin',
    name: 'المشرف',
    branchId: 'lebanon',
    allowedBranches: ['lebanon']
  },
  admin_jordan: {
    username: 'admin_jordan',
    password: process.env.ADMIN_JORDAN_PASS || 'Auipr#Jor@2026!Amm',
    role: 'jordan_admin',
    name: 'المشرف',
    branchId: 'jordan',
    allowedBranches: ['main', 'jordan']
  }
};

// Default Branch Controls
const DEFAULT_BRANCH_CONTROLS = {
  lebanon: {
    branchId: 'lebanon',
    branchName: 'ممثل الجمهورية اللبنانية (بيروت)',
    adminUsername: 'admin_lebanon',
    isFrozen: false,
    updatedAt: null,
    updatedBy: null
  },
  jordan: {
    branchId: 'jordan',
    branchName: 'فرع المملكة الأردنية الهاشمية (عمّان)',
    adminUsername: 'admin_jordan',
    isFrozen: false,
    updatedAt: null,
    updatedBy: null
  }
};

// Constant-time password check to prevent timing attacks
function verifyPassword(inputPassword, storedPassword) {
  if (!inputPassword || !storedPassword) return false;
  try {
    const hashA = crypto.createHash('sha256').update(String(inputPassword)).digest();
    const hashB = crypto.createHash('sha256').update(String(storedPassword)).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  } catch (e) {
    return false;
  }
}

// Rate Limiter for Login Attempts
const loginAttempts = new Map(); // ip -> { count, firstAttempt, lockedUntil }

function checkRateLimit(ip) {
  if (!ip) return { allowed: true };
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };

  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSecs = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      message: `تم حظر محاولات الدخول مؤقتاً بسبب تكرار المحاولات الخاطئة. يرجى الانتظار ${remainingSecs} ثانية.`
    };
  }

  // Clear if window expired (15 mins)
  if (now - record.firstAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordLoginFailure(ip) {
  if (!ip) return;
  const now = Date.now();
  const record = loginAttempts.get(ip) || { count: 0, firstAttempt: now, lockedUntil: null };
  record.count += 1;
  if (record.count >= 5) {
    record.lockedUntil = now + 10 * 60 * 1000; // 10 minute ban
  }
  loginAttempts.set(ip, record);
}

function clearLoginFailures(ip) {
  if (ip) loginAttempts.delete(ip);
}

// Token Generation
function createToken(user) {
  const payload = {
    username: user.username,
    role: user.role,
    name: user.name,
    branchId: user.branchId,
    allowedBranches: user.allowedBranches,
    exp: Date.now() + 14 * 24 * 3600 * 1000 // 14 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

// Secure Token Verification - Backdoors eliminated completely
function verifyToken(rawToken) {
  if (!rawToken) return null;
  let token = rawToken.trim();
  try { token = decodeURIComponent(token); } catch(e) {}

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [str, sig] = parts;

  try {
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
    if (sig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;

    // Strict Server-Side Authority: permissions MUST come from immutable USERS table
    const user = USERS[payload.username];
    if (!user) return null;

    return {
      username: user.username,
      role: user.role,
      name: user.name,
      branchId: user.branchId,
      allowedBranches: user.allowedBranches
    };
  } catch (e) {
    return null;
  }
}

// Database Connection
async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set in Netlify environment variables.');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

// Fetch Branch Controls from MongoDB
async function getBranchControls(db) {
  const collection = db.collection('branch_controls');
  const docs = await collection.find({}).toArray();
  const controls = {
    lebanon: { ...DEFAULT_BRANCH_CONTROLS.lebanon },
    jordan: { ...DEFAULT_BRANCH_CONTROLS.jordan }
  };

  for (const doc of docs) {
    if (doc.branchId && controls[doc.branchId]) {
      controls[doc.branchId] = {
        ...controls[doc.branchId],
        isFrozen: Boolean(doc.isFrozen),
        updatedAt: doc.updatedAt || null,
        updatedBy: doc.updatedBy || null
      };
    }
  }
  return controls;
}

// Check if a branch is frozen
async function isBranchFrozen(db, branchId) {
  if (!branchId || branchId === 'main') return false; // Egypt HQ cannot be frozen
  const controls = await getBranchControls(db);
  return Boolean(controls[branchId] && controls[branchId].isFrozen);
}

// Input sanitizer to prevent Stored XSS
function sanitizeText(str, maxLength = 1000) {
  if (!str) return '';
  let cleaned = String(str).replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  if (cleaned.length > maxLength) {
    cleaned = cleaned.slice(0, maxLength);
  }
  return cleaned.trim();
}

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

exports.handler = async (event, context) => {
  // CORS Preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  const method = event.httpMethod;
  const query = event.queryStringParameters || {};

  const getHeader = (hdrList, name) => {
    const lower = name.toLowerCase();
    for (const k of Object.keys(hdrList || {})) {
      if (k.toLowerCase() === lower) return hdrList[k];
    }
    return null;
  };

  const clientIp = (
    getHeader(event.headers, 'x-nf-client-connection-ip') ||
    getHeader(event.headers, 'client-ip') ||
    getHeader(event.headers, 'x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );

  // 1. Action: Login with Username & Password
  if (query.action === 'login' || (method === 'POST' && query.action === 'login')) {
    const rateCheck = checkRateLimit(clientIp);
    if (!rateCheck.allowed) {
      return {
        statusCode: 429,
        headers,
        body: JSON.stringify({ ok: false, error: rateCheck.message })
      };
    }

    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch(e) {}
    const username = (body.username || query.username || '').trim();
    const password = (body.password || query.password || '').trim();

    const user = USERS[username];
    if (user && verifyPassword(password, user.password)) {
      // Connect to DB to verify branch freeze status
      if (MONGODB_URI && user.branchId !== 'main') {
        try {
          const { db } = await connectToDatabase();
          const frozen = await isBranchFrozen(db, user.branchId);
          if (frozen) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({
                ok: false,
                isFrozen: true,
                error: 'تم تعطيل هذا الحساب مؤقتاً. يرجى التواصل مع الإدارة.'
              })
            };
          }
        } catch (dbErr) {
          console.error('Error checking branch status during login:', dbErr);
        }
      }

      clearLoginFailures(clientIp);
      const token = createToken(user);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          token,
          user: {
            username: user.username,
            role: user.role,
            name: user.name,
            branchId: user.branchId,
            allowedBranches: user.allowedBranches,
            isFrozen: false
          }
        })
      };
    } else {
      recordLoginFailure(clientIp);
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, error: 'اسم المستخدم أو كلمة المرور غير صحيحة' })
      };
    }
  }

  // 2. Action: Verify Session Token
  if (query.action === 'verify_auth') {
    const rawToken = getHeader(event.headers, 'x-admin-token') || getHeader(event.headers, 'authorization');
    const user = verifyToken(rawToken);

    if (user) {
      // Check if user's branch is frozen
      let frozen = false;
      if (MONGODB_URI && user.branchId !== 'main') {
        try {
          const { db } = await connectToDatabase();
          frozen = await isBranchFrozen(db, user.branchId);
        } catch (dbErr) {
          console.error('Error checking branch status during verify_auth:', dbErr);
        }
      }

      if (frozen) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            ok: false,
            isFrozen: true,
            error: 'تم تعطيل هذا الحساب مؤقتاً.',
            user: { ...user, isFrozen: true }
          })
        };
      }

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: 'Authenticated',
          user: {
            username: user.username,
            role: user.role,
            name: user.name,
            branchId: user.branchId,
            allowedBranches: user.allowedBranches,
            isFrozen: false
          }
        })
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ ok: false, error: 'انتهت صلاحية الجلسة أو الرمز غير صالح' })
      };
    }
  }

  try {
    // Check MongoDB Connection
    if (!MONGODB_URI) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'warning',
          message: 'MONGODB_URI environment variable is missing in Netlify.',
          news: []
        })
      };
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('news');

    // 3. Action: Get Branch Controls (Super Admin Only)
    if (query.action === 'get_branch_controls') {
      const rawToken = getHeader(event.headers, 'x-admin-token') || getHeader(event.headers, 'authorization');
      const user = verifyToken(rawToken);

      if (!user || user.role !== 'super_admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ ok: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء.' })
        };
      }

      const controls = await getBranchControls(db);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ ok: true, controls })
      };
    }

    // 4. Action: Toggle Branch Control (Freeze / Unfreeze) - Super Admin Only
    if (query.action === 'toggle_branch_control' && method === 'POST') {
      const rawToken = getHeader(event.headers, 'x-admin-token') || getHeader(event.headers, 'authorization');
      const user = verifyToken(rawToken);

      if (!user || user.role !== 'super_admin') {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({ ok: false, error: 'غير مصرح لك بتنفيذ هذا الإجراء.' })
        };
      }

      let payload = {};
      try { payload = JSON.parse(event.body || '{}'); } catch(e) {}
      const targetBranchId = (payload.branchId || '').trim().toLowerCase();
      const shouldFreeze = Boolean(payload.isFrozen);

      // Validation
      if (!['lebanon', 'jordan'].includes(targetBranchId)) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ ok: false, error: 'الفرع المحدد غير صالح.' })
        };
      }

      // Update in MongoDB
      const branchUpdate = {
        branchId: targetBranchId,
        branchName: targetBranchId === 'lebanon' ? 'ممثل الجمهورية اللبنانية (بيروت)' : 'فرع المملكة الأردنية الهاشمية (عمّان)',
        isFrozen: shouldFreeze,
        updatedAt: new Date(),
        updatedBy: user.username
      };

      await db.collection('branch_controls').updateOne(
        { branchId: targetBranchId },
        { 
          $set: branchUpdate,
          $unset: { reason: "" }
        },
        { upsert: true }
      );

      // Security Audit Trail Log
      try {
        await db.collection('admin_audit_logs').insertOne({
          action: shouldFreeze ? 'FREEZE_BRANCH' : 'UNFREEZE_BRANCH',
          branchId: targetBranchId,
          performedBy: user.username,
          clientIp,
          timestamp: new Date()
        });
      } catch (auditErr) {
        console.error('Audit log failed:', auditErr);
      }

      const updatedControls = await getBranchControls(db);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ok: true,
          message: shouldFreeze ? 'تم تجميد حساب وحركات الفرع بنجاح' : 'تم فك التجميد وتفعيل حساب وحركات الفرع بنجاح',
          controls: updatedControls
        })
      };
    }

    // 5. GET: Fetch all news or single news by ID / Slug
    if (method === 'GET') {
      const newsId = query.id;
      const newsSlug = query.slug;

      if (newsSlug) {
        const singleItem = await collection.findOne({ slug: newsSlug });
        if (singleItem) {
          return { statusCode: 200, headers, body: JSON.stringify(singleItem) };
        }
      }

      if (newsId) {
        if (/^[0-9a-fA-F]{24}$/.test(newsId)) {
          try {
            const singleItem = await collection.findOne({ _id: new ObjectId(newsId) });
            if (singleItem) {
              return { statusCode: 200, headers, body: JSON.stringify(singleItem) };
            }
          } catch (e) {}
        }
      }

      if (newsSlug || newsId) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'News item not found' }) };
      }

      const branch = query.branch;
      let queryFilter = {};

      if (branch && branch !== 'all') {
        queryFilter = {
          $or: [
            { branches: { $in: ['all', branch] } },
            { branch: { $in: ['all', branch] } },
            { branches: { $exists: false }, branch: { $exists: false } }
          ]
        };
      }

      const allNews = await collection.find(queryFilter).sort({ createdAt: -1 }).toArray();
      return { statusCode: 200, headers, body: JSON.stringify({ news: allNews }) };
    }

    // Require Auth for POST and DELETE
    const rawToken = getHeader(event.headers, 'x-admin-token') || getHeader(event.headers, 'authorization');
    const user = verifyToken(rawToken);

    if (!user) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'غير مصرح: يرجى تسجيل الدخول أولاً' })
      };
    }

    // Check if user's branch is frozen (Super Admin is immune)
    if (user.role !== 'super_admin') {
      const frozen = await isBranchFrozen(db, user.branchId);
      if (frozen) {
        return {
          statusCode: 403,
          headers,
          body: JSON.stringify({
            error: 'تم تعطيل هذا الحساب مؤقتاً.'
          })
        };
      }
    }

    // 6. POST: Create news item
    if (method === 'POST') {
      let data;
      try {
        data = JSON.parse(event.body);
      } catch (err) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
      }

      if (!data.title || !data.summary) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Title and Summary are required' }) };
      }

      const cleanTitle = sanitizeText(data.title, 300);
      const cleanSummary = sanitizeText(data.summary, 1500);
      const cleanContent = sanitizeText(data.content || data.summary, 50000);
      const cleanCategory = sanitizeText(data.category || 'أخبار الاتحاد', 100);

      let rawSlug = (data.slug && data.slug.trim()) || cleanTitle;
      let cleanSlug = rawSlug.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\u0600-\u06FF\-]/g, '');

      // Enforce branch permissions based on role
      let targetBranches;
      if (user.role === 'lebanon_admin') {
        // Lebanon Admin can ONLY publish to lebanon
        targetBranches = ['lebanon'];
      } else if (user.role === 'jordan_admin') {
        // Jordan Admin can ONLY publish to main / jordan
        targetBranches = ['main', 'jordan'];
      } else {
        // Super Admin can publish to any branches
        targetBranches = Array.isArray(data.branches) && data.branches.length > 0
          ? data.branches
          : (data.branch ? [data.branch] : ['all']);
      }

      const newsItem = {
        title: cleanTitle,
        slug: cleanSlug,
        summary: cleanSummary,
        content: cleanContent,
        imageUrl: data.imageUrl || 'img/ip_conference_2026.png',
        date: data.date || new Date().toISOString().split('T')[0],
        category: cleanCategory,
        branches: targetBranches,
        createdBy: user.username,
        authorName: user.name,
        createdAt: new Date()
      };

      const result = await collection.insertOne(newsItem);
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          message: 'News item created successfully',
          id: result.insertedId,
          item: newsItem
        })
      };
    }

    // 7. DELETE: Remove news item
    if (method === 'DELETE') {
      const newsId = (query && query.id) ||
                     (event.body && (() => { try { return JSON.parse(event.body).id; } catch(e){ return null; } })());

      if (!newsId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'News ID is required for deletion' }) };
      }

      if (!/^[0-9a-fA-F]{24}$/.test(newsId)) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'معرف الخبر غير صالح' }) };
      }

      // Check if user has permission to delete this specific news item
      if (user.role !== 'super_admin') {
        try {
          const existing = await collection.findOne({ _id: new ObjectId(newsId) });
          if (!existing) {
            return { statusCode: 404, headers, body: JSON.stringify({ error: 'News item not found' }) };
          }
          const itemBranches = existing.branches || (existing.branch ? [existing.branch] : ['all']);
          const isAllowed = itemBranches.some(b => user.allowedBranches.includes(b));
          if (!isAllowed) {
            return {
              statusCode: 403,
              headers,
              body: JSON.stringify({ error: 'غير مصرح لك بحذف هذا الخبر.' })
            };
          }
        } catch(e) {
          return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid ID format' }) };
        }
      }

      try {
        const result = await collection.deleteOne({ _id: new ObjectId(newsId) });
        if (result.deletedCount === 0) {
          return { statusCode: 404, headers, body: JSON.stringify({ error: 'News item not found' }) };
        }
        return { statusCode: 200, headers, body: JSON.stringify({ message: 'News item deleted successfully' }) };
      } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Invalid ID format' }) };
      }
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
