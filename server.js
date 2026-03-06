const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Data directory
const DATA_DIR = path.join(__dirname, 'server-data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SITES_FILE = path.join(DATA_DIR, 'sites.json');
const SHARES_FILE = path.join(DATA_DIR, 'shares.json');
const STATUS_FILE = path.join(DATA_DIR, 'status.json');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Read JSON file
async function readJsonFile(filePath, defaultValue = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    if (err.code === 'ENOENT') {
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    throw err;
  }
}

// Write JSON file
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// Check site status
async function checkSiteStatus(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const timeout = 10000;
    
    const options = {
      method: 'HEAD',
      timeout: timeout,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const protocol = url.startsWith('https') ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      const responseTime = Date.now() - startTime;
      const isOnline = res.statusCode >= 200 && res.statusCode < 500;
      
      resolve({
        url,
        status: isOnline ? 'online' : 'offline',
        statusCode: res.statusCode,
        responseTime,
        lastChecked: new Date().toISOString()
      });
    });

    req.on('error', () => {
      resolve({
        url,
        status: 'offline',
        statusCode: null,
        responseTime: null,
        lastChecked: new Date().toISOString()
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        url,
        status: 'offline',
        statusCode: null,
        responseTime: null,
        lastChecked: new Date().toISOString()
      });
    });

    req.end();
  });
}

// ===== USERS API =====

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create user
app.post('/api/users', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const newUser = {
      id: `user-${Date.now()}`,
      ...req.body,
      joinedAt: new Date().toISOString(),
      isOnline: true
    };
    users.push(newUser);
    await writeJsonFile(USERS_FILE, users);
    res.json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put('/api/users/:id', async (req, res) => {
  try {
    const users = await readJsonFile(USERS_FILE);
    const index = users.findIndex(u => u.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'User not found' });
    }
    users[index] = { ...users[index], ...req.body };
    await writeJsonFile(USERS_FILE, users);
    res.json(users[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login user
app.post('/api/users/login', async (req, res) => {
  try {
    const { username } = req.body;
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isOnline = true;
    user.lastLogin = new Date().toISOString();
    await writeJsonFile(USERS_FILE, users);
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logout user
app.post('/api/users/logout', async (req, res) => {
  try {
    const { id } = req.body;
    const users = await readJsonFile(USERS_FILE);
    const user = users.find(u => u.id === id);
    
    if (user) {
      user.isOnline = false;
      await writeJsonFile(USERS_FILE, users);
    }
    
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SITES API =====

// Get all submitted sites
app.get('/api/sites', async (req, res) => {
  try {
    const sites = await readJsonFile(SITES_FILE);
    res.json(sites);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Submit new site
app.post('/api/sites', async (req, res) => {
  try {
    const sites = await readJsonFile(SITES_FILE);
    const newSite = {
      id: `site-${Date.now()}`,
      ...req.body,
      submittedAt: new Date().toISOString(),
      status: { status: 'checking', lastChecked: new Date().toISOString() }
    };
    sites.push(newSite);
    await writeJsonFile(SITES_FILE, sites);
    res.json(newSite);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== SHARES API =====

// Get all shares
app.get('/api/shares', async (req, res) => {
  try {
    const shares = await readJsonFile(SHARES_FILE);
    res.json(shares);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create share
app.post('/api/shares', async (req, res) => {
  try {
    const shares = await readJsonFile(SHARES_FILE);
    const newShare = {
      id: `share-${Date.now()}`,
      ...req.body,
      sharedAt: new Date().toISOString()
    };
    shares.unshift(newShare);
    // Keep only last 100 shares
    if (shares.length > 100) {
      shares.length = 100;
    }
    await writeJsonFile(SHARES_FILE, shares);
    res.json(newShare);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== STATUS API =====

// Get all cached statuses
app.get('/api/status', async (req, res) => {
  try {
    const statuses = await readJsonFile(STATUS_FILE, {});
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check single site status
app.post('/api/status/check', async (req, res) => {
  try {
    const { url } = req.body;
    const status = await checkSiteStatus(url);
    
    // Save to cache
    const statuses = await readJsonFile(STATUS_FILE, {});
    statuses[url] = status;
    await writeJsonFile(STATUS_FILE, statuses);
    
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Check multiple sites
app.post('/api/status/check-batch', async (req, res) => {
  try {
    const { urls } = req.body;
    const results = {};
    
    // Check sites in parallel (max 5 at a time)
    for (let i = 0; i < urls.length; i += 5) {
      const batch = urls.slice(i, i + 5);
      const batchResults = await Promise.all(batch.map(url => checkSiteStatus(url)));
      batchResults.forEach(result => {
        results[result.url] = result;
      });
    }
    
    // Save to cache
    const statuses = await readJsonFile(STATUS_FILE, {});
    Object.assign(statuses, results);
    await writeJsonFile(STATUS_FILE, statuses);
    
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get cached status for URL
app.get('/api/status/:url', async (req, res) => {
  try {
    const url = decodeURIComponent(req.params.url);
    const statuses = await readJsonFile(STATUS_FILE, {});
    const status = statuses[url] || { status: 'unknown', url };
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve extensions data
app.get('/api/extensions', async (req, res) => {
  try {
    const data = await fs.readFile(path.join(__dirname, 'public', 'data', 'extensions.json'), 'utf8');
    res.json(JSON.parse(data));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('dist'));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

// Initialize and start server
async function startServer() {
  await ensureDataDir();
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer().catch(console.error);
