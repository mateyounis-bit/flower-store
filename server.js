const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.json({ success: false, message: 'Missing fields' });
  db.getUserByUsername(username, (err, user) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    if (!user) return res.json({ success: false, message: 'Invalid credentials' });
    if (user.password !== password) return res.json({ success: false, message: 'Invalid credentials' });
    res.json({ success: true, user: { id: user.id, username: user.username } });
  });
});

app.post('/api/submit-form', (req, res) => {
  const { name, email, message } = req.body || {};
  if (!name || !email || !message) return res.json({ success: false, message: 'Missing fields' });
  db.insertSubmission({ name, email, message }, (err, id) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, id });
  });
});

app.get('/api/products', (req, res) => {
  db.getProducts((err, products) => {
    if (err) return res.status(500).json({ success: false, message: 'DB error' });
    res.json({ success: true, products: products || [] });
  });
});

app.post('/api/products', (req, res) => {
  const { name, image_url, small, medium, large, description } = req.body || {};
  if (!name || !small || !medium || !large) return res.json({ success: false, message: 'Missing required fields' });
  db.insertProduct({ name, image_url, small, medium, large, description }, (err, id) => {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.json({ success: false, message: 'Product name already exists' });
      }
      return res.status(500).json({ success: false, message: 'DB error: ' + err.message });
    }
    res.json({ success: true, id });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
