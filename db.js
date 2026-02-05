const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS submissions (id INTEGER PRIMARY KEY, name TEXT, email TEXT, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`);

  db.get('SELECT COUNT(*) AS c FROM users', (err, row) => {
    if (!err && row && row.c === 0) {
      // seed a demo user: username=admin password=secret
      db.run('INSERT INTO users (username,password) VALUES (?,?)', ['admin', 'secret']);
    }
  });
});

module.exports = {
  getUserByUsername: (username, cb) => db.get('SELECT * FROM users WHERE username = ?', [username], cb),
  insertSubmission: (data, cb) => db.run('INSERT INTO submissions (name,email,message) VALUES (?,?,?)', [data.name, data.email, data.message], function(err){ cb(err, this.lastID); })
};
