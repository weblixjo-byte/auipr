try { require('dotenv').config(); } catch (e) {}
try {
  const dns = require('dns');
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}
const { MongoClient, ObjectId } = require('mongodb');

let cachedClient = null;
let cachedDb = null;

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'auipr2026admin';
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.MONGODB_DB_NAME || 'auipr_db';

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

  try {
    // Check MongoDB Connection
    if (!MONGODB_URI) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'warning',
          message: 'MONGODB_URI environment variable is missing in Netlify. Please set MONGODB_URI in Netlify dashboard.',
          news: []
        })
      };
    }

    const { db } = await connectToDatabase();
    const collection = db.collection('news');

    // GET: Fetch all news or single news by ID / Slug
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const newsId = params.id;
      const newsSlug = params.slug;

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

      const allNews = await collection.find({}).sort({ createdAt: -1 }).toArray();
      return { statusCode: 200, headers, body: JSON.stringify({ news: allNews }) };
    }

    // Auth check for POST and DELETE
    const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    if (token !== ADMIN_TOKEN) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({ error: 'Unauthorized: Invalid Admin Token' })
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

      const newsItem = {
        title: data.title,
        slug: cleanSlug,
        summary: data.summary,
        content: data.content || data.summary,
        imageUrl: data.imageUrl || 'img/ip_conference_2026.png',
        date: data.date || new Date().toISOString().split('T')[0],
        category: data.category || 'أخبار العامة',
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
      const newsId = (event.queryStringParameters && event.queryStringParameters.id) ||
                     (event.body && JSON.parse(event.body).id);

      if (!newsId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'News ID is required for deletion' }) };
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

    return { statusCode: 450, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  } catch (error) {
    console.error('Serverless Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};
