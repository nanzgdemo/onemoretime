const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const escape = require('escape-html');

const app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// 🚨 Initialize an in-memory SQLite database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
    db.run("CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
    db.run("INSERT INTO users (username, password) VALUES ('admin', 'securepassword')");
});

/**
 * 🚨 Vulnerability 1: SQL Injection
 * - Directly concatenates user input into an SQL query.
 * - Attackers can manipulate queries to bypass authentication or exfiltrate data.
 */
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`; // ⚠️ UNSAFE: SQL Injection risk
    db.get(query, (err, row) => {
        if (row) {
            res.send(`Welcome, ${row.username}!`);
        } else {
            res.status(401).send("Invalid credentials");
        }
    });
});

/**
 * 🚨 Vulnerability 2: Cross-Site Scripting (XSS)
 * - Directly renders user input in an HTML response without sanitization.
 * - Attackers can inject malicious scripts that execute in the user's browser.
 */
app.get('/greet', (req, res) => {
    const name = req.query.name;
    res.send(`<h1>Hello, ${escape(name)}!</h1>`); // SAFE: User input sanitized before injecting into HTML
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
