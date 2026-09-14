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

// 3 Admin Accounts with Role-Based Access Control (RBAC)
const USERS = {
  admin_general: {
    username: 'admin_general',
    password: process.env.ADMIN_GENERAL_PASS || 'Auipr#Gen@2026!Sec',
    role: 'super_admin',
    name: 'المشرف العام (كافة الفروع)',
    allowedBranches: ['all', 'main', 'lebanon', 'jordan']
  },
  admin_lebanon: {
    username: 'admin_lebanon',
    password: process.env.ADMIN_LEBANON_PASS || 'Auipr#Lb@2026!Beir',
    role: 'lebanon_admin',
    name: 'مشرف ممثل الجمهورية اللبنانية',
    allowedBranches: ['lebanon']
  },
  admin_jordan: {
    username: 'admin_jordan',
    password: process.env.ADMIN_JORDAN_PASS || 'Auipr#Jor@2026!Amm',
    role: 'jordan_admin',
    name: 'مشرف فرع الأردن',
    allowedBranches: ['main', 'jordan']
  }
};

function createToken(user) {
  const payload = {
    username: user.username,
    role: user.role,
    name: user.name,
    allowedBranches: user.allowedBranches,
    exp: Date.now() + 14 * 24 * 3600 * 1000 // 14 days
  };
  const str = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
  return `${str}.${sig}`;
}

function verifyToken(rawToken) {
  if (!rawToken) return null;
  let token = rawToken.trim();
  try { token = decodeURIComponent(token); } catch(e) {}

  // Legacy fallback if someone uses old ADMIN_TOKEN
  const legacyToken = (process.env.ADMIN_TOKEN || 'reem.auipr2026').trim();
  if (token === legacyToken) {
    return USERS.admin_general;
  }

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [str, sig] = parts;

  try {
    const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(str).digest('base64url');
    if (sig.length !== expectedSig.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) return null;

    const payload = JSON.parse(Buffer.from(str, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Date.now()) return null;
    const user = USERS[payload.username];
    if (!user) return null;
    return {
      username: user.username,
      role: user.role,
      name: user.name,
      allowedBranches: user.allowedBranches
    };
  } catch (e) {
    return null;
  }
}

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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-admin-token',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Content-Type': 'application/json; charset=utf-8'
};

exports.handler = async (event, context) => {
  // Handle CORS preflight
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

  // 1. Action: Login with Username & Password
  if (query.action === 'login' || (method === 'POST' && query.action === 'login')) {
    let body = {};
    try { body = JSON.parse(event.body || '{}'); } catch(e) {}
    const username = (body.username || query.username || '').trim();
    const password = (body.password || query.password || '').trim();

    const user = USERS[username];
    if (user && user.password === password) {
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
            allowedBranches: user.allowedBranches
          }
        })
      };
    } else {
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
            allowedBranches: user.allowedBranches
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

    // GET: Fetch all news or single news by ID / Slug
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
        try {
          const singleItem = await collection.findOne({ _id: new ObjectId(newsId) });
          if (singleItem) {
            return { statusCode: 200, headers, body: JSON.stringify(singleItem) };
          }
        } catch (e) {}
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

    // POST: Create news item
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

      let rawSlug = (data.slug && data.slug.trim()) || data.title.trim();
      let cleanSlug = rawSlug.replace(/\s+/g, '-');

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
        title: data.title,
        slug: cleanSlug,
        summary: data.summary,
        content: data.content || data.summary,
        imageUrl: data.imageUrl || 'img/ip_conference_2026.png',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.category || 'أخبار الاتحاد',
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

    // DELETE: Remove news item
    if (method === 'DELETE') {
      const newsId = (query && query.id) ||
                     (event.body && JSON.parse(event.body).id);

      if (!newsId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'News ID is required for deletion' }) };
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
              body: JSON.stringify({ error: 'غير مصرح لك بحذف أخبار تابعة لفروع أخرى' })
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
