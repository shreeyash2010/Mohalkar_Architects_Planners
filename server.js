const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DATA_DIR = path.join(__dirname, 'data');
function readJson(file, def = []) {
  try {
    const full = path.join(DATA_DIR, file);
    if (!fs.existsSync(full)) return def;
    return JSON.parse(fs.readFileSync(full, 'utf-8'));
  } catch (e) {
    return def;
  }
}

function writeJson(file, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(data, null, 2));
    return true;
  } catch (e) {
    console.error('Error writing JSON:', file, e);
    return false;
  }
}

function logActivity(action, details, user = 'Admin', badge = 'info') {
  try {
    const activity = readJson('activity.json', []);
    activity.unshift({
      id: 'act-' + Date.now(),
      action,
      details,
      user,
      timestamp: new Date().toISOString(),
      badge
    });
    writeJson('activity.json', activity.slice(0, 100));
  } catch (e) {
    console.error('Error logging activity:', e);
  }
}

// Public Enquiry API endpoint
const enquiryHandler = require('./api/send-enquiry');
app.post('/api/send-enquiry', (req, res) => {
  return enquiryHandler(req, res);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', serverTime: new Date().toISOString() });
});

// ── ADMIN API ROUTES ──────────────────────────────────────────────

// Admin Auth Login
app.post('/api/admin/login', (req, res) => {
  const { passcode, username, password } = req.body || {};
  const settings = readJson('settings.json', { masterPasscode: 'mohalkar2026', users: [] });
  const users = settings.users || [];

  let matchedUser = null;

  if (username && password) {
    matchedUser = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password);
  }

  if (!matchedUser && passcode) {
    const cleanedCode = passcode.trim();
    if (cleanedCode === settings.masterPasscode || cleanedCode === 'mohalkar2026') {
      matchedUser = users[0] || {
        id: 'usr-abhishek',
        name: 'Ar. Abhishek Mohalkar',
        role: 'Principal Architect',
        accessLevel: 'Super Admin',
        email: 'abhishekmohalkar.1996@gmail.com'
      };
    } else if (cleanedCode === 'mali2026') {
      matchedUser = users.find(u => u.username === 'shreeyash') || {
        id: 'usr-shreeyash',
        name: 'Shreeyash Mali',
        role: 'Associate Architect',
        accessLevel: 'Super Admin',
        email: 'shreeyash.mali.in@gmail.com'
      };
    }
  }

  if (matchedUser) {
    logActivity('Admin Authentication', `Successful login for ${matchedUser.name} (${matchedUser.accessLevel})`, matchedUser.name, 'success');
    return res.status(200).json({
      success: true,
      user: {
        id: matchedUser.id,
        name: matchedUser.name,
        role: matchedUser.role,
        accessLevel: matchedUser.accessLevel,
        email: matchedUser.email,
        phone: matchedUser.phone
      }
    });
  }

  return res.status(401).json({ success: false, error: 'Invalid passcode or credentials.' });
});

// Enquiries CRM
app.get('/api/admin/enquiries', (req, res) => {
  const enquiries = readJson('enquiries.json', []);
  res.json({ success: true, count: enquiries.length, data: enquiries });
});

app.post('/api/admin/enquiries', (req, res) => {
  const enquiries = readJson('enquiries.json', []);
  const body = req.body || {};
  const newLead = {
    id: 'enq-' + Date.now(),
    name: body.name || 'Anonymous Client',
    email: body.email || '',
    phone: body.phone || '',
    location: body.location || 'Maharashtra',
    type: body.type || 'residential',
    budget: body.budget || 'Not specified',
    source: body.source || 'Admin Manual Entry',
    message: body.message || '',
    status: body.status || 'new',
    notes: body.notes || '',
    timestamp: new Date().toISOString()
  };
  enquiries.unshift(newLead);
  writeJson('enquiries.json', enquiries);
  logActivity('New Lead Created', `Manually added lead for ${newLead.name}`, body.actor || 'Admin', 'primary');
  res.status(201).json({ success: true, data: newLead });
});

app.put('/api/admin/enquiries/:id', (req, res) => {
  const enquiries = readJson('enquiries.json', []);
  const body = req.body || {};
  let index = enquiries.findIndex(e => e.id === req.params.id);

  // If not found by ID, attempt match by email or name
  if (index === -1 && (body.email || body.name)) {
    index = enquiries.findIndex(e => (body.email && e.email === body.email) || (body.name && e.name === body.name));
  }

  // If still not found, upsert as a new enquiry record (never 404)
  if (index === -1) {
    const newLead = {
      id: req.params.id || ('enq-' + Date.now()),
      name: body.name || 'Anonymous Client',
      email: body.email || '',
      phone: body.phone || '',
      location: body.location || 'Maharashtra',
      type: body.type || 'residential',
      budget: body.budget || 'Not specified',
      source: body.source || 'Admin Entry',
      message: body.message || '',
      status: body.status || 'new',
      notes: body.notes || '',
      timestamp: body.timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    enquiries.unshift(newLead);
    writeJson('enquiries.json', enquiries);
    logActivity('Lead Saved', `Saved details for ${newLead.name}`, body.actor || 'Admin', 'primary');
    return res.json({ success: true, data: newLead });
  }

  const oldStatus = enquiries[index].status;
  enquiries[index] = {
    ...enquiries[index],
    ...body,
    updatedAt: new Date().toISOString()
  };
  writeJson('enquiries.json', enquiries);

  if (body.status && body.status !== oldStatus) {
    logActivity('Lead Status Changed', `${enquiries[index].name} marked as ${body.status.toUpperCase()}`, body.actor || 'Admin', 'warning');
  } else {
    logActivity('Lead Dossier Updated', `Updated details for ${enquiries[index].name}`, body.actor || 'Admin', 'info');
  }
  res.json({ success: true, data: enquiries[index] });
});

app.delete('/api/admin/enquiries/:id', (req, res) => {
  let enquiries = readJson('enquiries.json', []);
  const target = enquiries.find(e => e.id === req.params.id);
  enquiries = enquiries.filter(e => e.id !== req.params.id);
  writeJson('enquiries.json', enquiries);
  if (target) {
    const actor = req.body?.actor || req.query?.actor || 'Admin';
    logActivity('Lead Removed', `Deleted lead for ${target.name}`, actor, 'danger');
  }
  res.json({ success: true });
});

// ── Public Projects API (Consumed by live website projects.html) ──
app.get('/api/projects', (req, res) => {
  const projects = readJson('projects.json', []);
  const showAll = req.query.all === 'true';
  const data = showAll ? projects : projects.filter(p => p.status !== 'draft');
  res.json({ success: true, count: data.length, data });
});

// ── Projects Management ──
app.get('/api/admin/projects', (req, res) => {
  const projects = readJson('projects.json', []);
  res.json({ success: true, count: projects.length, data: projects });
});

app.put('/api/admin/projects/:id', (req, res) => {
  let projects = readJson('projects.json', []);
  const p = req.body || {};
  const id = req.params.id || p.id;
  const idx = projects.findIndex(item => item.id === id);

  if (idx !== -1) {
    projects[idx] = { ...projects[idx], ...p, id, updatedAt: new Date().toISOString() };
    writeJson('projects.json', projects);
    logActivity('Project Updated', `Modified portfolio item "${projects[idx].title}"`, p.actor || 'Admin', 'info');
    return res.json({ success: true, data: projects[idx] });
  }

  // If not found, create it
  const newProj = {
    id: id || ('proj-' + Date.now()),
    title: p.title || 'Untitled Project',
    category: p.category || 'architecture',
    location: p.location || 'Maharashtra',
    tag: p.tag || (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Architecture'),
    label: p.label || 'Professional',
    image: p.image || '/images/arc2.jpg',
    status: p.status || 'published',
    scope: p.scope || '',
    scale: p.scale || '',
    createdAt: new Date().toISOString()
  };
  projects.unshift(newProj);
  writeJson('projects.json', projects);
  logActivity('New Project Published', `Added "${newProj.title}" to portfolio`, p.actor || 'Admin', 'success');
  res.status(201).json({ success: true, data: newProj });
});

app.post('/api/admin/projects', (req, res) => {
  let projects = readJson('projects.json', []);
  const p = req.body || {};
  if (p.id) {
    const idx = projects.findIndex(item => item.id === p.id);
    if (idx !== -1) {
      projects[idx] = { ...projects[idx], ...p, updatedAt: new Date().toISOString() };
      writeJson('projects.json', projects);
      logActivity('Project Updated', `Modified portfolio item "${p.title}"`, p.actor || 'Admin', 'info');
      return res.json({ success: true, data: projects[idx] });
    }
  }

  const newProj = {
    id: 'proj-' + Date.now(),
    title: p.title || 'Untitled Project',
    category: p.category || 'architecture',
    location: p.location || 'Maharashtra',
    tag: p.tag || (p.category ? p.category.charAt(0).toUpperCase() + p.category.slice(1) : 'Architecture'),
    label: p.label || 'Professional',
    image: p.image || '/images/arc2.jpg',
    status: p.status || 'published',
    scope: p.scope || '',
    scale: p.scale || '',
    createdAt: new Date().toISOString()
  };
  projects.unshift(newProj);
  writeJson('projects.json', projects);
  logActivity('New Project Published', `Added "${newProj.title}" to ${newProj.category} portfolio`, p.actor || 'Admin', 'success');
  res.status(201).json({ success: true, data: newProj });
});

app.delete('/api/admin/projects/:id', (req, res) => {
  let projects = readJson('projects.json', []);
  const target = projects.find(p => p.id === req.params.id);
  projects = projects.filter(p => p.id !== req.params.id);
  writeJson('projects.json', projects);
  if (target) {
    const actor = req.body?.actor || req.query?.actor || 'Admin';
    logActivity('Project Archived', `Removed "${target.title}" from portfolio`, actor, 'danger');
  }
  res.json({ success: true });
});

// Activity Log
app.get('/api/admin/activity', (req, res) => {
  const activity = readJson('activity.json', []);
  res.json({ success: true, data: activity });
});

app.post('/api/admin/activity', (req, res) => {
  const { action, details, user, badge } = req.body || {};
  logActivity(action, details, user, badge);
  res.json({ success: true });
});

// Studio Settings & User Management
app.get('/api/admin/settings', (req, res) => {
  const settings = readJson('settings.json', {});
  res.json({ success: true, data: settings });
});

app.post('/api/admin/settings', (req, res) => {
  const current = readJson('settings.json', {});
  const body = req.body || {};
  const updated = { ...current, ...body };
  writeJson('settings.json', updated);
  logActivity('Settings Modified', 'Studio configurations or team credentials updated', body.actor || 'Super Admin', 'warning');
  res.json({ success: true, data: updated });
});

// Route /admin explicitly to admin.html
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Serve static assets with automatic .html extension resolution
app.use(express.static(__dirname, { extensions: ['html'] }));

// Fallback for html requests or unmatched routes
app.use((req, res) => {
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'index.html'));
  } else {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening on http://${HOST}:${PORT}`);
});
