const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');

const db = new Database('investors.db');

// Create the table first
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    full_name TEXT,
    investment_amount REAL,
    current_value REAL
  )
`);

const users = [
  {
    username: 'investor1',
    password: 'password123',
    full_name: 'John Investor',
    investment_amount: 50000,
    current_value: 62500
  },
  {
    username: 'investor2',
    password: 'password123',
    full_name: 'Sarah Producer',
    investment_amount: 25000,
    current_value: 31000
  }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO users (username, password, full_name, investment_amount, current_value)
  VALUES (?, ?, ?, ?, ?)
`);

users.forEach(user => {
  const hashed = bcrypt.hashSync(user.password, 10);
  insert.run(user.username, hashed, user.full_name, user.investment_amount, user.current_value);
  console.log(`Created user: ${user.username}`);
});

console.log('Done! You can now log in with:');
console.log('Username: investor1   Password: password123');
console.log('Username: investor2   Password: password123');