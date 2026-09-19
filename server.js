const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Database = require('better-sqlite3');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const db = new Database('investors.db');

// ========== FILE UPLOAD SETUP ==========
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
fs.mkdirSync(uploadDir, { recursive: true });
console.log('✓ Created public/uploads folder');
}

const storage = multer.diskStorage({
destination: (req, file, cb) => cb(null, uploadDir),
filename: (req, file, cb) => {
const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
cb(null, unique + '-' + file.originalname.replace(/\s+/g, '_'));
}
});
const upload = multer({ storage });

// ========== DATABASE SETUP ==========
db.exec(`
CREATE TABLE IF NOT EXISTS users (
id INTEGER PRIMARY KEY AUTOINCREMENT,
full_name TEXT,
username TEXT UNIQUE,
password TEXT,
investment_amount REAL DEFAULT 0,
current_value REAL DEFAULT 0,
profit_percentage REAL DEFAULT 15,
phone TEXT DEFAULT '',
date_of_birth TEXT DEFAULT '',
wallet_btc TEXT DEFAULT '',
wallet_usdt TEXT DEFAULT '',
wallet_eth TEXT DEFAULT '',
wallet_sol TEXT DEFAULT '',
wallet_bnb TEXT DEFAULT '',
wallet_trx TEXT DEFAULT '',
agreement_status TEXT DEFAULT 'Pending',
agreement_date TEXT DEFAULT '',
contract_file TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS transactions (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
type TEXT,
amount REAL,
description TEXT,
payment_method TEXT DEFAULT '',
transaction_no TEXT DEFAULT '',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS withdrawals (
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
amount REAL,
wallet_address TEXT,
crypto_currency TEXT DEFAULT '',
status TEXT DEFAULT 'pending',
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`);

const columnsToAdd = [
{ table: 'users', column: 'profit_percentage', type: 'REAL DEFAULT 15' },
{ table: 'users', column: 'phone', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'date_of_birth', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_btc', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_usdt', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_eth', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_sol', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_bnb', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'wallet_trx', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'agreement_status', type: "TEXT DEFAULT 'Pending'" },
{ table: 'users', column: 'agreement_date', type: "TEXT DEFAULT ''" },
{ table: 'users', column: 'contract_file', type: "TEXT DEFAULT ''" },
{ table: 'transactions', column: 'payment_method', type: "TEXT DEFAULT ''" },
{ table: 'transactions', column: 'transaction_no', type: "TEXT DEFAULT ''" },
{ table: 'withdrawals', column: 'crypto_currency', type: "TEXT DEFAULT ''" }
];

columnsToAdd.forEach(c => {
try { db.exec(`ALTER TABLE ${c.table} ADD COLUMN ${c.column} ${c.type}`); } catch (e) {}
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
secret: 'a-day-to-forget-secret-key-2026',
resave: false,
saveUninitialized: false
}));

// ========== SHARED STYLES ==========
const baseStyles = `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif;
background: #0b1120;
color: #e5e7eb;
line-height: 1.5;
}
a { text-decoration: none; color: inherit; }
button, .btn {
cursor: pointer;
border: none;
font-family: inherit;
transition: all 0.2s ease;
}
`;

// ========== MOVIE INFO ==========
const movieInfoHTML = `
<div style="margin-top: 48px; padding-top: 40px; border-top: 1px solid #1e293b;">
<div style="display:flex; align-items:center; gap:12px; margin-bottom:20px;">
<div style="width:4px; height:28px; background:#3b82f6; border-radius:2px;"></div>
<h2 style="font-size:22px; font-weight:600; color:#f8fafc;">Monolithic Pictures</h2>
</div>
<h3 style="font-size:18px; color:#94a3b8; margin-bottom:24px; font-weight:500;">A Day to Forget</h3>

<h4 style="font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:10px;">Synopsis</h4>
<p style="line-height:1.75; color:#cbd5e1; margin-bottom:28px; max-width:820px;">
When a case of mistaken identity brings hitmen to his door, one man watches his entire world burn — his wife, his children, everything he loved, gone in a single, merciless night. Left for dead and buried alongside his family in every way that matters, he claws his way back from the edge of death with nothing left inside him but ash.<br><br>
No name. No home. No mercy.<br><br>
Now he moves through the shadows of the men who destroyed him, peeling back the layers of a conspiracy far bigger than the lie that got his family killed. Every step closer to the truth is a step deeper into the darkness he's become. The line between justice and monster blurs with every body he leaves behind, and the people who made the mistake are about to learn that killing the wrong man was the last mistake they'll ever get to make.<br><br>
Some men seek revenge. He is revenge.<br><br>
<strong style="color:#f8fafc;">A DAY TO FORGET</strong> — the day they took everything... is the day they signed their own death warrant.
</p>

<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:24px; margin-top:32px;">
<div>
<h4 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:8px;">Genre</h4>
<p style="color:#e2e8f0;">Grounded Revenge Thriller</p>
</div>
<div>
<h4 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:8px;">Status</h4>
<p style="color:#4ade80;">In Production</p>
</div>
<div>
<h4 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:8px;">Director</h4>
<p style="color:#e2e8f0;">Joseph Kosinski</p>
</div>
</div>

<div style="margin-top:32px;">
<h4 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:12px;">Streaming Partners</h4>
<div style="display:flex; gap:12px; flex-wrap:wrap;">
<span style="background:#1e293b; border:1px solid #334155; padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#60a5fa;">Paramount+</span>
<span style="background:#1e293b; border:1px solid #334155; padding:8px 16px; border-radius:8px; font-size:14px; font-weight:500; color:#34d399;">Hulu</span>
</div>
</div>

<div style="margin-top:32px;">
<h4 style="font-size:12px; text-transform:uppercase; letter-spacing:1px; color:#64748b; margin-bottom:12px;">Main Cast</h4>
<div style="display:flex; flex-wrap:wrap; gap:10px 20px; color:#cbd5e1; font-size:15px;">
<span>Garrett Hedlund</span>
<span>Matt Dillon</span>
<span>Elizabeth Feldstein</span>
<span>Dylan McDermott</span>
<span>Juno Temple</span>
<span>Simon Webster</span>
</div>
</div>
</div>
`;

// ========== USER ROUTES ==========
app.get('/', (req, res) => {
if (req.session.userId) return res.redirect('/dashboard');
res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.post('/register', (req, res) => {
const { full_name, email, password, phone, date_of_birth } = req.body;
const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(email);
if (existing) return res.send('Email already registered. <a href="/register" style="color:#60a5fa">Try again</a>');

const hashedPassword = bcrypt.hashSync(password, 10);
db.prepare(`INSERT INTO users (full_name, username, password, phone, date_of_birth) VALUES (?, ?, ?, ?, ?)`)
.run(full_name, email, hashedPassword, phone || '', date_of_birth || '');

res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; height:100vh; display:flex; align-items:center; justify-content:center;">
<div style="text-align:center; background:#111827; padding:48px; border-radius:16px; border:1px solid #1e293b; max-width:420px;">
<div style="width:64px; height:64px; background:#065f46; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 24px; font-size:28px;">✓</div>
<h2 style="font-size:24px; margin-bottom:12px;">Account Created</h2>
<p style="color:#94a3b8; margin-bottom:28px;">Welcome to Monolithic Pictures</p>
<a href="/" style="display:inline-block; background:#3b82f6; color:white; padding:12px 32px; border-radius:8px; font-weight:500;">Sign In</a>
</div>
</div>
`);
});

app.post('/login', (req, res) => {
const { username, password } = req.body;
const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

if (user && bcrypt.compareSync(password, user.password)) {
req.session.userId = user.id;
return res.redirect('/dashboard');
}

res.send(`
<!DOCTYPE html>
<html>
<head>
<title>Login Failed</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
body {
font-family: 'Segoe UI', system-ui, sans-serif;
background: #0a0e1a;
color: #e2e8f0;
height: 100vh;
display: flex;
align-items: center;
justify-content: center;
margin: 0;
}
.box {
background: #0f172a;
padding: 40px;
border-radius: 16px;
border: 1px solid #1e293b;
text-align: center;
max-width: 400px;
width: 90%;
}
h2 { color: #f87171; margin-bottom: 16px; }
a { color: #3b82f6; text-decoration: none; font-weight: 500; }
a:hover { text-decoration: underline; }
</style>
</head>
<body>
<div class="box">
<h2>Wrong email or password</h2>
<p style="color:#94a3b8; margin-bottom:24px;">Please check your credentials and try again.</p>
<a href="/">← Try again</a>
</div>
</body>
</html>
`);
});

app.get('/dashboard', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
if (!user) { req.session.destroy(); return res.redirect('/'); }

const investment = Number(user.investment_amount) || 0;
const profitPct = Number(user.profit_percentage) || 15;
const estimatedValue = investment * (1 + profitPct / 100);
const estimatedReturn = estimatedValue - investment;
const isProfit = estimatedReturn >= 0;
const returnText = isProfit
? `+$${estimatedReturn.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
: `-$${Math.abs(estimatedReturn).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
<title>Dashboard – Monolithic Pictures</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${baseStyles}
.layout { display: flex; min-height: 100vh; }
.sidebar {
width: 260px;
background: #020617;
border-right: 1px solid #1e293b;
display: flex;
flex-direction: column;
padding: 28px 0;
position: fixed;
height: 100vh;
z-index: 100;
transition: transform 0.3s ease;
}
.logo {
padding: 0 28px 36px;
}
.logo h1 {
font-size: 18px;
font-weight: 700;
color: #f8fafc;
letter-spacing: -0.3px;
}
.logo span {
display: block;
font-size: 12px;
color: #64748b;
margin-top: 4px;
font-weight: 500;
}
.nav { flex: 1; }
.nav-item {
display: flex;
align-items: center;
gap: 12px;
padding: 12px 28px;
color: #94a3b8;
font-size: 14px;
font-weight: 500;
transition: all 0.15s;
}
.nav-item:hover { background: #0f172a; color: #e2e8f0; }
.nav-item.active {
background: #0f172a;
color: #60a5fa;
border-right: 3px solid #3b82f6;
}
.logout {
padding: 16px 28px;
color: #f87171;
font-size: 14px;
font-weight: 500;
border-top: 1px solid #1e293b;
}
.logout:hover { background: #0f172a; }
.main {
margin-left: 260px;
flex: 1;
display: flex;
flex-direction: column;
min-width: 0;
}
.header {
background: #020617;
border-bottom: 1px solid #1e293b;
padding: 16px 20px;
display: flex;
justify-content: space-between;
align-items: center;
position: sticky;
top: 0;
z-index: 50;
}
.header-left {
display: flex;
align-items: center;
gap: 12px;
}
.menu-toggle {
display: none;
background: none;
border: none;
color: #e2e8f0;
font-size: 24px;
padding: 6px 10px;
cursor: pointer;
border-radius: 8px;
}
.menu-toggle:hover { background: #1e293b; }
.header h2 { font-size: 18px; font-weight: 600; color: #f8fafc; }
.user-badge {
font-size: 14px;
color: #94a3b8;
}
.content { padding: 24px 16px; max-width: 1200px; width: 100%; }
.hero {
background: #111827;
border: 1px solid #1e293b;
border-radius: 16px;
overflow: hidden;
margin-bottom: 24px;
}
.hero img {
width: 100%;
height: 200px;
object-fit: cover;
display: block;
}
.hero-text { padding: 20px; }
.hero-text h2 { font-size: 20px; font-weight: 600; margin-bottom: 8px; color: #f8fafc; }
.hero-text p { color: #94a3b8; font-size: 14px; }
.stats {
display: grid;
grid-template-columns: 1fr;
gap: 16px;
margin-bottom: 24px;
}
.stat-card {
background: #111827;
border: 1px solid #1e293b;
border-radius: 14px;
padding: 20px;
}
.stat-card .label {
font-size: 12px;
text-transform: uppercase;
letter-spacing: 0.8px;
color: #64748b;
margin-bottom: 8px;
font-weight: 500;
}
.stat-card .value {
font-size: 24px;
font-weight: 700;
color: #f8fafc;
letter-spacing: -0.5px;
}
.positive { color: #4ade80 !important; }
.negative { color: #f87171 !important; }
.chart-card {
background: #111827;
border: 1px solid #1e293b;
border-radius: 14px;
padding: 20px;
margin-bottom: 20px;
}
.chart-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 16px;
flex-wrap: wrap;
gap: 8px;
}
.chart-header h3 { font-size: 15px; font-weight: 600; color: #e2e8f0; }
.live-time { font-size: 13px; color: #64748b; }

/* Mobile overlay */
.sidebar-overlay {
display: none;
position: fixed;
inset: 0;
background: rgba(0,0,0,0.6);
z-index: 90;
}
.sidebar-overlay.active { display: block; }

/* ========== MOBILE STYLES ========== */
@media (max-width: 768px) {
.sidebar {
transform: translateX(-100%);
width: 280px;
box-shadow: 4px 0 20px rgba(0,0,0,0.4);
}
.sidebar.open {
transform: translateX(0);
}
.main {
margin-left: 0;
}
.menu-toggle {
display: block;
}
.header {
padding: 14px 16px;
}
.header h2 {
font-size: 16px;
}
.user-badge {
font-size: 13px;
}
.content {
padding: 16px 12px;
}
.hero img {
height: 160px;
}
.stats {
grid-template-columns: 1fr;
}
.stat-card .value {
font-size: 22px;
}
}

@media (min-width: 769px) {
.stats {
grid-template-columns: repeat(3, 1fr);
}
.content {
padding: 36px;
}
.hero img {
height: 260px;
}
.hero-text {
padding: 28px 32px;
}
.hero-text h2 {
font-size: 24px;
}
}
</style>
</head>
<body>
<div class="sidebar-overlay" id="sidebarOverlay" onclick="closeSidebar()"></div>

<div class="layout">
<aside class="sidebar" id="sidebar">
<div class="logo">
<h1>Monolithic Pictures</h1>
<span>A Day to Forget</span>
</div>
<nav class="nav">
<a href="/dashboard" class="nav-item active" onclick="closeSidebar()">📊 Dashboard</a>
<a href="/invest" class="nav-item" onclick="closeSidebar()">💰 Invest</a>
<a href="/documents" class="nav-item" onclick="closeSidebar()">📁 Investment Documents</a>
<a href="/transactions" class="nav-item" onclick="closeSidebar()">📄 Transactions</a>
<a href="/withdraw" class="nav-item" onclick="closeSidebar()">🏦 Withdraw</a>
<a href="/settings" class="nav-item" onclick="closeSidebar()">⚙️ Settings</a>
</nav>
<a href="/logout" class="logout">🚪 Sign Out</a>
</aside>

<div class="main">
<header class="header">
<div class="header-left">
<button class="menu-toggle" id="menuToggle" onclick="toggleSidebar()" aria-label="Open menu">☰</button>
<h2>Investor Dashboard</h2>
</div>
<div class="user-badge">Welcome back, <strong style="color:#e2e8f0">${user.full_name}</strong></div>
</header>

<div class="content">
<div class="hero">
<img src="/hero.jpg" alt="A Day to Forget">
<div class="hero-text">
<h2>Welcome, ${user.full_name}</h2>
<p>Here’s an overview of your investment in <strong>A Day to Forget</strong>.</p>
</div>
</div>

<div class="stats">
<div class="stat-card">
<div class="label">Total Investment</div>
<div class="value">$${investment.toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="label">Current Estimated Value</div>
<div class="value" id="currentValue">$${Math.round(estimatedValue).toLocaleString()}</div>
</div>
<div class="stat-card">
<div class="label">Estimated Return</div>
<div class="value ${isProfit ? 'positive' : 'negative'}" id="profitLoss">${returnText}</div>
</div>
</div>

<div class="chart-card">
<div class="chart-header">
<h3>Portfolio Performance</h3>
<div class="live-time">New York Time: <span id="nyTime"></span></div>
</div>
<canvas id="performanceChart" height="90"></canvas>
</div>

${movieInfoHTML}
</div>
</div>
</div>

<script>
function toggleSidebar() {
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');
sidebar.classList.toggle('open');
overlay.classList.toggle('active');
}
function closeSidebar() {
document.getElementById('sidebar').classList.remove('open');
document.getElementById('sidebarOverlay').classList.remove('active');
}

function updateNYTime() {
const options = { timeZone: 'America/New_York', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true };
document.getElementById('nyTime').textContent = new Date().toLocaleString('en-US', options);
}
updateNYTime();
setInterval(updateNYTime, 1000);

const baseInvestment = ${investment};
const profitPct = ${profitPct};
let chart;

function getNYLabels() {
const labels = [];
const now = new Date();
for (let i = 6; i >= 0; i--) {
const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
labels.push(d.toLocaleString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }));
}
return labels;
}

function generateLiveData() {
const data = [];
for (let i = 0; i < 7; i++) {
const growth = 1 + (profitPct / 100) * (i / 6) + (Math.random() * 0.02 - 0.01);
data.push(Math.round(baseInvestment * growth));
}
data[6] = Math.round(baseInvestment * (1 + profitPct / 100) * (1 + (Math.random() * 0.015 - 0.0075)));
return data;
}

function createChart() {
const ctx = document.getElementById('performanceChart').getContext('2d');
chart = new Chart(ctx, {
type: 'line',
data: {
labels: getNYLabels(),
datasets: [{
label: 'Portfolio Value',
data: generateLiveData(),
borderColor: '#3b82f6',
backgroundColor: 'rgba(59, 130, 246, 0.08)',
fill: true,
tension: 0.4,
pointRadius: 4,
pointBackgroundColor: '#3b82f6',
borderWidth: 2.5
}]
},
options: {
responsive: true,
maintainAspectRatio: true,
plugins: { legend: { display: false } },
scales: {
y: { beginAtZero: false, grid: { color: '#1e293b' }, ticks: { color: '#64748b' } },
x: { grid: { display: false }, ticks: { color: '#64748b' } }
}
}
});
}

function updateLiveChart() {
if (!chart) return;
chart.data.labels = getNYLabels();
chart.data.datasets[0].data = generateLiveData();
chart.update('none');
const liveValue = chart.data.datasets[0].data[6];
const liveReturn = liveValue - baseInvestment;
document.getElementById('currentValue').innerText = '$' + liveValue.toLocaleString();
const el = document.getElementById('profitLoss');
if (liveReturn >= 0) {
el.innerText = '+$' + Math.round(liveReturn).toLocaleString();
el.className = 'value positive';
} else {
el.innerText = '-$' + Math.round(Math.abs(liveReturn)).toLocaleString();
el.className = 'value negative';
}
}

createChart();
setInterval(updateLiveChart, 8000);
</script>
</body>
</html>
`);
});

// ========== INVEST PAGE ==========
app.get('/invest', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
if (!user) { req.session.destroy(); return res.redirect('/'); }

res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Invest – Monolithic Pictures</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${baseStyles}
.container { max-width: 780px; margin: 0 auto; padding: 24px 16px; }
.header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.header h1 { font-size: 22px; font-weight: 700; color: #f8fafc; }
.back { color: #94a3b8; font-size: 14px; font-weight: 500; }
.back:hover { color: #60a5fa; }
.card {
background: #111827;
border: 1px solid #1e293b;
border-radius: 16px;
padding: 24px;
margin-bottom: 20px;
}
.card h2 { font-size: 16px; font-weight: 600; color: #e2e8f0; margin-bottom: 20px; }
.asset {
display: flex;
align-items: center;
padding: 14px 0;
border-bottom: 1px solid #1e293b;
}
.asset:last-child { border-bottom: none; }
.asset img { width: 36px; height: 36px; border-radius: 50%; margin-right: 14px; }
.asset-name { flex: 1; font-weight: 500; color: #e2e8f0; }
.asset-price { text-align: right; }
.asset-price .price { font-weight: 600; color: #f8fafc; }
.positive { color: #4ade80; }
.negative { color: #f87171; }
.deposit-btn {
display: block;
width: 100%;
background: #3b82f6;
color: white;
padding: 16px;
border-radius: 12px;
font-size: 16px;
font-weight: 600;
text-align: center;
}
.deposit-btn:hover { background: #2563eb; }
.modal {
display: none;
position: fixed;
inset: 0;
background: rgba(0,0,0,0.75);
z-index: 1000;
align-items: center;
justify-content: center;
padding: 16px;
}
.modal-content {
background: #111827;
border: 1px solid #1e293b;
border-radius: 16px;
padding: 28px;
max-width: 420px;
width: 100%;
text-align: center;
}
.crypto-btn {
display: block;
width: 100%;
padding: 14px;
margin: 8px 0;
background: #0f172a;
border: 1px solid #1e293b;
color: #e2e8f0;
border-radius: 10px;
font-size: 15px;
font-weight: 500;
}
.crypto-btn:hover { background: #1e293b; border-color: #334155; }
.wallet-address {
background: #0f172a;
border: 1px solid #1e293b;
padding: 14px;
border-radius: 10px;
word-break: break-all;
margin: 16px 0;
font-size: 13px;
color: #94a3b8;
}
.close-btn {
margin-top: 20px;
background: #ef4444;
color: white;
padding: 10px 28px;
border-radius: 8px;
font-weight: 500;
}
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Invest / Add Funds</h1>
<a href="/dashboard" class="back">← Back to Dashboard</a>
</div>

<div class="card">
<h2>Live Market Prices</h2>
<div id="assets-list"><p style="color:#64748b;">Loading prices...</p></div>
</div>

<div class="card" style="text-align:center;">
<h2 style="margin-bottom:12px;">Deposit Funds</h2>
<p style="color:#94a3b8; margin-bottom:24px; font-size:14px;">Select a cryptocurrency to receive deposit instructions</p>
<button class="deposit-btn" onclick="openModal()">Deposit with Crypto</button>
</div>
</div>

<div class="modal" id="depositModal">
<div class="modal-content">
<h2 style="color:#f8fafc; margin-bottom:20px; font-size:20px;">Select Cryptocurrency</h2>
<div id="cryptoSelection">
<button class="crypto-btn" onclick="showWallet('btc', 'Bitcoin')">Bitcoin (BTC)</button>
<button class="crypto-btn" onclick="showWallet('usdt', 'USDT')">USDT (Tether)</button>
<button class="crypto-btn" onclick="showWallet('eth', 'Ethereum')">Ethereum (ETH)</button>
<button class="crypto-btn" onclick="showWallet('sol', 'Solana')">Solana (SOL)</button>
<button class="crypto-btn" onclick="showWallet('bnb', 'BNB')">BNB</button>
<button class="crypto-btn" onclick="showWallet('trx', 'Tron')">Tron (TRX)</button>
</div>
<div id="walletBox" style="display:none;">
<h3 id="selectedCrypto" style="color:#60a5fa; margin-bottom:8px;"></h3>
<p style="color:#94a3b8; font-size:14px; margin-bottom:12px;">Send only this coin to the address below</p>
<div class="wallet-address" id="walletAddress"></div>
<img id="qrCode" src="" alt="QR" style="margin:12px 0; border-radius:8px; max-width:180px;">
<br>
<button class="close-btn" onclick="closeModal()">Close</button>
</div>
</div>
</div>

<script>
const wallets = {
btc: "${user.wallet_btc || 'Not set by admin yet'}",
usdt: "${user.wallet_usdt || 'Not set by admin yet'}",
eth: "${user.wallet_eth || 'Not set by admin yet'}",
sol: "${user.wallet_sol || 'Not set by admin yet'}",
bnb: "${user.wallet_bnb || 'Not set by admin yet'}",
trx: "${user.wallet_trx || 'Not set by admin yet'}"
};

function openModal() {
document.getElementById('depositModal').style.display = 'flex';
document.getElementById('cryptoSelection').style.display = 'block';
document.getElementById('walletBox').style.display = 'none';
}
function closeModal() { document.getElementById('depositModal').style.display = 'none'; }
function showWallet(coin, name) {
document.getElementById('cryptoSelection').style.display = 'none';
document.getElementById('walletBox').style.display = 'block';
document.getElementById('selectedCrypto').innerText = name;
document.getElementById('walletAddress').innerText = wallets[coin];
if (wallets[coin] && wallets[coin] !== 'Not set by admin yet') {
document.getElementById('qrCode').src = 'https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=' + encodeURIComponent(wallets[coin]);
} else {
document.getElementById('qrCode').src = '';
}
}

async function loadLivePrices() {
try {
const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,tether,ethereum,solana,binancecoin,tron&vs_currencies=usd&include_24hr_change=true');
const data = await res.json();
const assets = [
{ id: 'bitcoin', name: 'Bitcoin', image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
{ id: 'tether', name: 'USDT', image: 'https://assets.coingecko.com/coins/images/325/small/Tether.png' },
{ id: 'ethereum', name: 'Ethereum', image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
{ id: 'solana', name: 'Solana', image: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
{ id: 'binancecoin', name: 'BNB', image: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
{ id: 'tron', name: 'Tron', image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png' }
];
let html = '';
assets.forEach(a => {
const price = data[a.id]?.usd || 0;
const change = data[a.id]?.usd_24h_change || 0;
const cls = change >= 0 ? 'positive' : 'negative';
html += \`<div class="asset">
<img src="\${a.image}" alt="\${a.name}">
<div class="asset-name">\${a.name}</div>
<div class="asset-price">
<div class="price">$\${price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}</div>
<div class="\${cls}" style="font-size:13px;">\${change>=0?'+':''}\${change.toFixed(2)}%</div>
</div>
</div>\`;
});
document.getElementById('assets-list').innerHTML = html;
} catch(e) {
document.getElementById('assets-list').innerHTML = '<p style="color:#f87171;">Unable to load prices</p>';
}
}
loadLivePrices();
setInterval(loadLivePrices, 60000);
</script>
</body>
</html>
`);
});

// ========== SIMPLE PAGE HELPER ==========
function createSimplePage(title, content) {
return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} – Monolithic Pictures</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${baseStyles}
.container {
max-width: 900px;
margin: 32px auto;
padding: 0 16px;
}
.card {
background: #111827;
border: 1px solid #1e293b;
border-radius: 16px;
padding: 28px 20px;
}
h1 { font-size: 22px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
.subtitle { color: #64748b; font-size: 14px; margin-bottom: 28px; }
a.back { color: #60a5fa; font-size: 14px; font-weight: 500; }
table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
th { text-align: left; padding: 12px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; border-bottom: 1px solid #1e293b; }
td { padding: 12px 10px; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
@media (max-width: 600px) {
table { display: block; overflow-x: auto; }
}
</style>
</head>
<body>
<div class="container">
<div class="card">
<h1>${title}</h1>
<p class="subtitle">Monolithic Pictures · A Day to Forget</p>
${content}
<div style="margin-top:32px;">
<a href="/dashboard" class="back">← Back to Dashboard</a>
</div>
</div>
</div>
</body>
</html>`;
}

// ========== INVESTMENT DOCUMENTS ==========
app.get('/documents', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
if (!user) { req.session.destroy(); return res.redirect('/'); }

const investment = Number(user.investment_amount) || 0;
const status = user.agreement_status || 'Pending';
const agreementDate = user.agreement_date || 'Not set';
const statusColor = ['signed','active'].includes(status.toLowerCase()) ? '#4ade80' : '#fbbf24';

const contractSection = user.contract_file
? `<a href="/uploads/${user.contract_file}" target="_blank"
style="display:inline-flex; align-items:center; gap:10px; background:#3b82f6; color:white; padding:14px 28px; border-radius:10px; font-weight:600; font-size:15px; margin-top:8px;">
📄 Download Contract
</a>`
: `<p style="color:#64748b; margin-top:8px;">No contract has been uploaded yet.</p>`;

res.send(createSimplePage('Investment Documents', `
<div style="background:#0f172a; border:1px solid #1e293b; border-radius:14px; padding:24px; margin-bottom:8px;">
<div style="display:flex; align-items:center; gap:12px; margin-bottom:6px;">
<div style="width:4px; height:24px; background:#3b82f6; border-radius:2px;"></div>
<h2 style="font-size:18px; font-weight:600; color:#f8fafc;">A Day to Forget — Investment Agreement</h2>
</div>
<p style="color:#94a3b8; font-size:14px; margin-bottom:28px; padding-left:16px;">Motion Picture Investment Agreement</p>

<div style="display:grid; grid-template-columns:1fr; gap:20px; margin-bottom:28px;">
<div>
<div style="font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:6px;">Status</div>
<div style="font-size:20px; font-weight:600; color:${statusColor};">${status}</div>
</div>
<div>
<div style="font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:6px;">Current Investment</div>
<div style="font-size:20px; font-weight:600; color:#f8fafc;">$${investment.toLocaleString()}</div>
</div>
<div>
<div style="font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:6px;">Date Agreement Entered</div>
<div style="font-size:16px; font-weight:500; color:#e2e8f0;">${agreementDate}</div>
</div>
</div>

<div style="border-top:1px solid #1e293b; padding-top:20px;">
<div style="font-size:12px; text-transform:uppercase; letter-spacing:0.8px; color:#64748b; margin-bottom:12px;">Your Signed Contract</div>
${contractSection}
</div>
</div>
`));
});

// ========== TRANSACTIONS ==========
app.get('/transactions', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const txs = db.prepare(`SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC`).all(req.session.userId);

let html = `<table>
<thead>
<tr>
<th>Date</th>
<th>Type</th>
<th>Amount</th>
<th>Method</th>
<th>Transaction No</th>
<th>Description</th>
</tr>
</thead>
<tbody>`;

if (txs.length === 0) {
html += `<tr><td colspan="6" style="text-align:center; padding:40px; color:#64748b;">No transactions yet</td></tr>`;
} else {
txs.forEach(tx => {
html += `<tr>
<td>${tx.created_at}</td>
<td>${tx.type || '—'}</td>
<td>$${Number(tx.amount || 0).toLocaleString()}</td>
<td>${tx.payment_method || '—'}</td>
<td style="font-family:monospace; font-size:13px;">${tx.transaction_no || '—'}</td>
<td>${tx.description || '—'}</td>
</tr>`;
});
}
html += `</tbody></table>`;
res.send(createSimplePage('Transactions', html));
});

// ========== WITHDRAW ==========
app.get('/withdraw', (req, res) => {
if (!req.session.userId) return res.redirect('/');
res.send(createSimplePage('Withdraw Funds', `
<form method="POST" action="/request-withdraw" style="max-width:480px;">
<div style="margin-bottom:20px;">
<label style="display:block; margin-bottom:8px; color:#94a3b8; font-size:14px;">Cryptocurrency</label>
<select name="crypto_currency" required style="width:100%; padding:13px 16px; background:#0f172a; border:1px solid #1e293b; border-radius:10px; color:white; font-size:15px;">
<option value="">Select currency</option>
<option value="USDT (TRC20)">USDT (TRC20)</option>
<option value="USDT (ERC20)">USDT (ERC20)</option>
<option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
<option value="Ethereum (ETH)">Ethereum (ETH)</option>
<option value="Solana (SOL)">Solana (SOL)</option>
<option value="BNB">BNB</option>
<option value="Tron (TRX)">Tron (TRX)</option>
</select>
</div>
<div style="margin-bottom:20px;">
<label style="display:block; margin-bottom:8px; color:#94a3b8; font-size:14px;">Amount (USD)</label>
<input type="number" name="amount" step="0.01" min="10" required
style="width:100%; padding:13px 16px; background:#0f172a; border:1px solid #1e293b; border-radius:10px; color:white; font-size:15px;">
</div>
<div style="margin-bottom:28px;">
<label style="display:block; margin-bottom:8px; color:#94a3b8; font-size:14px;">Your Wallet Address</label>
<input type="text" name="wallet" required placeholder="Enter wallet address"
style="width:100%; padding:13px 16px; background:#0f172a; border:1px solid #1e293b; border-radius:10px; color:white; font-size:15px;">
</div>
<button type="submit" style="width:100%; padding:15px; background:#3b82f6; color:white; border-radius:10px; font-size:16px; font-weight:600;">
Submit Withdrawal Request
</button>
</form>
`));
});

app.post('/request-withdraw', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const { amount, wallet, crypto_currency } = req.body;
db.prepare(`INSERT INTO withdrawals (user_id, amount, wallet_address, crypto_currency) VALUES (?, ?, ?, ?)`)
.run(req.session.userId, amount, wallet, crypto_currency);

res.send(createSimplePage('Withdrawal Requested', `
<div style="text-align:center; padding:20px 0;">
<div style="width:64px; height:64px; background:#065f46; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px; font-size:28px; color:#4ade80;">✓</div>
<h2 style="font-size:22px; margin-bottom:12px; color:#f8fafc;">Request Submitted</h2>
<p style="color:#94a3b8; margin-bottom:8px;">${crypto_currency}</p>
<p style="font-size:24px; font-weight:600; color:#f8fafc; margin-bottom:8px;">$${amount}</p>
<p style="color:#64748b;">Status: Pending approval</p>
</div>
`));
});

// ========== SETTINGS ==========
app.get('/settings', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);
if (!user) { req.session.destroy(); return res.redirect('/'); }

res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Settings – Monolithic Pictures</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${baseStyles}
.container { max-width: 860px; margin: 32px auto; padding: 0 16px; }
.header { display:flex; justify-content:space-between; align-items:center; margin-bottom:24px; flex-wrap:wrap; gap:12px; }
.header h1 { font-size:22px; font-weight:700; color:#f8fafc; }
.back { color:#94a3b8; font-size:14px; }
.tabs { display:flex; gap:8px; margin-bottom:20px; flex-wrap:wrap; }
.tab {
padding:10px 16px;
background:#111827;
border:1px solid #1e293b;
border-radius:8px;
color:#94a3b8;
font-size:14px;
font-weight:500;
cursor:pointer;
}
.tab.active { background:#3b82f6; border-color:#3b82f6; color:white; }
.section {
display:none;
background:#111827;
border:1px solid #1e293b;
border-radius:16px;
padding:24px 20px;
}
.section.active { display:block; }
.section h2 { font-size:18px; font-weight:600; color:#f8fafc; margin-bottom:20px; }
.info-row {
display:flex;
justify-content:space-between;
padding:14px 0;
border-bottom:1px solid #1e293b;
flex-wrap:wrap;
gap:8px;
}
.info-row:last-child { border-bottom:none; }
.label { color:#64748b; font-size:14px; }
.value { font-weight:500; color:#e2e8f0; }
input {
width:100%;
padding:12px 16px;
margin:8px 0 18px;
background:#0f172a;
border:1px solid #1e293b;
border-radius:10px;
color:white;
font-size:15px;
}
button {
background:#3b82f6;
color:white;
padding:12px 28px;
border-radius:10px;
font-weight:600;
font-size:15px;
}
button:hover { background:#2563eb; }
.security-item {
background:#0f172a;
border:1px solid #1e293b;
border-radius:12px;
padding:18px;
margin-bottom:12px;
}
.security-item h3 { font-size:15px; margin-bottom:6px; color:#e2e8f0; }
.security-item p { color:#94a3b8; font-size:13px; }
</style>
</head>
<body>
<div class="container">
<div class="header">
<h1>Settings</h1>
<a href="/dashboard" class="back">← Back to Dashboard</a>
</div>

<div class="tabs">
<div class="tab active" onclick="showSection('profile', this)">My Profile</div>
<div class="tab" onclick="showSection('password', this)">Change Password</div>
<div class="tab" onclick="showSection('security', this)">Security</div>
<div class="tab" onclick="showSection('about', this)">About</div>
</div>

<div id="profile" class="section active">
<h2>My Profile</h2>
<div class="info-row"><span class="label">Full Name</span><span class="value">${user.full_name}</span></div>
<div class="info-row"><span class="label">Email</span><span class="value">${user.username}</span></div>
<div class="info-row"><span class="label">Phone</span><span class="value">${user.phone || 'Not provided'}</span></div>
<div class="info-row"><span class="label">Date of Birth</span><span class="value">${user.date_of_birth || 'Not provided'}</span></div>
<div class="info-row"><span class="label">Account Status</span><span class="value" style="color:#4ade80;">Active Investor</span></div>
</div>

<div id="password" class="section">
<h2>Change Password</h2>
<form method="POST" action="/settings/change-password">
<label style="color:#94a3b8; font-size:14px;">Current Password</label>
<input type="password" name="current_password" required>
<label style="color:#94a3b8; font-size:14px;">New Password</label>
<input type="password" name="new_password" required minlength="6">
<label style="color:#94a3b8; font-size:14px;">Confirm New Password</label>
<input type="password" name="confirm_password" required minlength="6">
<button type="submit">Update Password</button>
</form>
</div>

<div id="security" class="section">
<h2>Security Center</h2>
<div class="security-item">
<h3>Two-Factor Authentication</h3>
<p>Status: <span style="color:#fbbf24;">Not Enabled</span> · Coming soon</p>
</div>
<div class="security-item">
<h3>Login Alerts</h3>
<p>Status: <span style="color:#4ade80;">Enabled</span></p>
</div>
<div class="security-item">
<h3>Active Sessions</h3>
<p>This device · Last activity: Just now</p>
</div>
</div>

<div id="about" class="section">
<h2>About Monolithic Pictures</h2>
<p style="line-height:1.7; color:#cbd5e1; margin-bottom:16px;">
Monolithic Pictures is a private film investment platform that allows accredited investors to participate in high-quality cinematic projects.
</p>
<p style="line-height:1.7; color:#cbd5e1; margin-bottom:16px;">
Our current flagship project is <strong>A Day to Forget</strong> — a grounded revenge thriller directed by Joseph Kosinski.
</p>
<p style="color:#64748b; margin-top:24px; font-size:13px;">© 2026 Monolithic Pictures. All rights reserved.</p>
</div>
</div>

<script>
function showSection(id, el) {
document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
document.getElementById(id).classList.add('active');
el.classList.add('active');
}
</script>
</body>
</html>
`);
});

app.post('/settings/change-password', (req, res) => {
if (!req.session.userId) return res.redirect('/');
const { current_password, new_password, confirm_password } = req.body;
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.session.userId);

if (!user || !bcrypt.compareSync(current_password, user.password)) {
return res.send('Current password is incorrect. <a href="/settings" style="color:#60a5fa">Go back</a>');
}
if (new_password !== confirm_password) {
return res.send('New passwords do not match. <a href="/settings" style="color:#60a5fa">Go back</a>');
}

const hashed = bcrypt.hashSync(new_password, 10);
db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hashed, req.session.userId);
res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; height:100vh; display:flex; align-items:center; justify-content:center;">
<div style="text-align:center; background:#111827; padding:40px; border-radius:16px; border:1px solid #1e293b;">
<h2 style="color:#4ade80; margin-bottom:16px;">Password Updated</h2>
<a href="/settings" style="color:#60a5fa;">Back to Settings</a>
</div>
</div>
`);
});

app.get('/logout', (req, res) => {
req.session.destroy();
res.redirect('/');
});

// ========== ADMIN ==========
const ADMIN_PASSWORD = 'monolith2026';

app.get('/admin', (req, res) => {
if (req.session.isAdmin) return res.redirect('/admin/dashboard');
res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; height:100vh; display:flex; align-items:center; justify-content:center; padding:16px;">
<form method="POST" action="/admin/login" style="background:#111827; padding:40px; border-radius:16px; width:100%; max-width:360px; border:1px solid #1e293b;">
<h2 style="margin-bottom:24px; color:#f8fafc; font-size:22px;">Admin Login</h2>
<input type="password" name="password" placeholder="Admin Password" required
style="width:100%; padding:14px; margin-bottom:16px; border-radius:10px; border:1px solid #1e293b; background:#0f172a; color:white;">
<button type="submit" style="width:100%; padding:14px; background:#3b82f6; color:white; border:none; border-radius:10px; font-weight:600; cursor:pointer;">Sign In</button>
</form>
</div>
`);
});

app.post('/admin/login', (req, res) => {
if (req.body.password === ADMIN_PASSWORD) {
req.session.isAdmin = true;
return res.redirect('/admin/dashboard');
}
res.send('Wrong password. <a href="/admin" style="color:#60a5fa">Try again</a>');
});

app.get('/admin/dashboard', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');

const users = db.prepare('SELECT * FROM users ORDER BY id DESC').all();
const withdrawals = db.prepare(`
SELECT w.*, u.full_name FROM withdrawals w JOIN users u ON w.user_id = u.id ORDER BY w.created_at DESC
`).all();
const allTxs = db.prepare(`
SELECT t.*, u.full_name FROM transactions t LEFT JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC
`).all();

let usersHTML = users.map(u => `
<tr>
<td>${u.id}</td>
<td>${u.full_name}</td>
<td>${u.username}</td>
<td>$${Number(u.investment_amount || 0).toLocaleString()}</td>
<td>${u.profit_percentage || 15}%</td>
<td>$${Number(u.current_value || 0).toLocaleString()}</td>
<td><a href="/admin/edit/${u.id}" style="color:#60a5fa;">Edit</a></td>
</tr>
`).join('');

let withdrawalsHTML = withdrawals.map(w => `
<tr>
<td>${w.id}</td>
<td>${w.full_name}</td>
<td>$${Number(w.amount || 0).toLocaleString()}</td>
<td>${w.crypto_currency || '—'}</td>
<td style="font-size:13px; max-width:180px; overflow:hidden; text-overflow:ellipsis;">${w.wallet_address}</td>
<td>${w.status}</td>
<td>
${w.status === 'pending' ? `
<a href="/admin/approve/${w.id}" style="color:#4ade80; margin-right:12px;">Approve</a>
<a href="/admin/reject/${w.id}" style="color:#f87171;">Reject</a>
` : w.status}
</td>
</tr>
`).join('');

let txsHTML = allTxs.map(tx => `
<tr>
<td>${tx.id}</td>
<td>${tx.full_name || '—'}</td>
<td>${tx.created_at}</td>
<td>$${Number(tx.amount || 0).toLocaleString()}</td>
<td>${tx.payment_method || '—'}</td>
<td style="font-family:monospace; font-size:13px;">${tx.transaction_no || '—'}</td>
<td>
<a href="/admin/transactions/edit/${tx.id}" style="color:#60a5fa; margin-right:10px;">Edit</a>
<a href="/admin/transactions/delete/${tx.id}" style="color:#f87171;" onclick="return confirm('Delete?')">Delete</a>
</td>
</tr>
`).join('');

res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin – Monolithic Pictures</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>
${baseStyles}
body { padding: 24px 16px; }
h1 { font-size: 24px; font-weight: 700; color: #f8fafc; margin-bottom: 8px; }
h2 { font-size: 18px; font-weight: 600; color: #e2e8f0; margin: 36px 0 16px; }
.logout { float: right; color: #f87171; font-weight: 500; }
table { width: 100%; border-collapse: collapse; background: #111827; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b; font-size: 14px; }
th { background: #0f172a; padding: 12px 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }
td { padding: 12px; border-top: 1px solid #1e293b; color: #e2e8f0; }
.btn { display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; border-radius: 8px; font-weight: 500; margin-bottom: 16px; }
@media (max-width: 700px) {
table { display: block; overflow-x: auto; }
}
</style>
</head>
<body>
<a href="/admin/logout" class="logout">Logout</a>
<h1>Admin Panel</h1>
<p style="color:#64748b; margin-bottom:28px;">Monolithic Pictures · A Day to Forget</p>

<h2>All Investors</h2>
<table>
<tr>
<th>ID</th><th>Name</th><th>Email</th><th>Investment</th><th>Profit %</th><th>Current Value</th><th>Action</th>
</tr>
${usersHTML}
</table>

<h2>All Transactions</h2>
<a href="/admin/transactions/add" class="btn">+ Add Transaction</a>
<table>
<tr>
<th>ID</th><th>User</th><th>Date</th><th>Amount</th><th>Method</th><th>Tx No</th><th>Actions</th>
</tr>
${txsHTML || '<tr><td colspan="7" style="text-align:center;padding:30px;color:#64748b;">No transactions</td></tr>'}
</table>

<h2>Withdrawal Requests</h2>
<table>
<tr>
<th>ID</th><th>User</th><th>Amount</th><th>Crypto</th><th>Wallet</th><th>Status</th><th>Action</th>
</tr>
${withdrawalsHTML}
</table>
</body>
</html>
`);
});

// ========== ADMIN TRANSACTIONS ==========
app.get('/admin/transactions/add', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const users = db.prepare('SELECT id, full_name FROM users ORDER BY full_name').all();
const userOptions = users.map(u => `<option value="${u.id}">${u.full_name} (ID: ${u.id})</option>`).join('');

res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; min-height:100vh; padding:24px 16px;">
<h2 style="color:#f8fafc; margin-bottom:24px;">Add New Transaction</h2>
<form method="POST" action="/admin/transactions/add" style="max-width:520px;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">User</label>
<select name="user_id" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<option value="">Select investor</option>
${userOptions}
</select>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Date</label>
<input type="datetime-local" name="created_at" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Amount</label>
<input type="number" name="amount" step="0.01" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Payment Method</label>
<select name="payment_method" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<option value="USDT (TRC20)">USDT (TRC20)</option>
<option value="USDT (ERC20)">USDT (ERC20)</option>
<option value="Bitcoin (BTC)">Bitcoin (BTC)</option>
<option value="Ethereum (ETH)">Ethereum (ETH)</option>
<option value="Bank Transfer">Bank Transfer</option>
<option value="Credit Card">Credit Card</option>
<option value="Other">Other</option>
</select>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Transaction No</label>
<input type="text" name="transaction_no" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Type</label>
<input type="text" name="type" value="Deposit" style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Description</label>
<input type="text" name="description" style="width:100%; padding:12px; margin-bottom:24px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<button type="submit" style="padding:12px 28px; background:#3b82f6; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Add Transaction</button>
<a href="/admin/dashboard" style="margin-left:16px; color:#94a3b8;">Cancel</a>
</form>
</div>
`);
});

app.post('/admin/transactions/add', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const { user_id, created_at, amount, payment_method, transaction_no, type, description } = req.body;
db.prepare(`INSERT INTO transactions (user_id, created_at, amount, payment_method, transaction_no, type, description)
VALUES (?, ?, ?, ?, ?, ?, ?)`).run(user_id, created_at, amount, payment_method, transaction_no, type, description || '');
res.redirect('/admin/dashboard');
});

app.get('/admin/transactions/edit/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const tx = db.prepare('SELECT * FROM transactions WHERE id = ?').get(req.params.id);
if (!tx) return res.send('Transaction not found');
const users = db.prepare('SELECT id, full_name FROM users ORDER BY full_name').all();
const userOptions = users.map(u => `<option value="${u.id}" ${u.id == tx.user_id ? 'selected' : ''}>${u.full_name}</option>`).join('');

res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; min-height:100vh; padding:24px 16px;">
<h2 style="color:#f8fafc; margin-bottom:24px;">Edit Transaction #${tx.id}</h2>
<form method="POST" action="/admin/transactions/edit/${tx.id}" style="max-width:520px;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">User</label>
<select name="user_id" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">${userOptions}</select>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Date</label>
<input type="datetime-local" name="created_at" value="${tx.created_at ? tx.created_at.replace(' ', 'T').substring(0,16) : ''}" required
style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Amount</label>
<input type="number" name="amount" value="${tx.amount}" step="0.01" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Payment Method</label>
<select name="payment_method" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<option value="USDT (TRC20)" ${tx.payment_method === 'USDT (TRC20)' ? 'selected' : ''}>USDT (TRC20)</option>
<option value="USDT (ERC20)" ${tx.payment_method === 'USDT (ERC20)' ? 'selected' : ''}>USDT (ERC20)</option>
<option value="Bitcoin (BTC)" ${tx.payment_method === 'Bitcoin (BTC)' ? 'selected' : ''}>Bitcoin (BTC)</option>
<option value="Ethereum (ETH)" ${tx.payment_method === 'Ethereum (ETH)' ? 'selected' : ''}>Ethereum (ETH)</option>
<option value="Bank Transfer" ${tx.payment_method === 'Bank Transfer' ? 'selected' : ''}>Bank Transfer</option>
<option value="Credit Card" ${tx.payment_method === 'Credit Card' ? 'selected' : ''}>Credit Card</option>
<option value="Other" ${tx.payment_method === 'Other' ? 'selected' : ''}>Other</option>
</select>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Transaction No</label>
<input type="text" name="transaction_no" value="${tx.transaction_no || ''}" required style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Type</label>
<input type="text" name="type" value="${tx.type || ''}" style="width:100%; padding:12px; margin-bottom:16px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Description</label>
<input type="text" name="description" value="${tx.description || ''}" style="width:100%; padding:12px; margin-bottom:24px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<button type="submit" style="padding:12px 28px; background:#3b82f6; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Save Changes</button>
<a href="/admin/dashboard" style="margin-left:16px; color:#94a3b8;">Cancel</a>
</form>
</div>
`);
});

app.post('/admin/transactions/edit/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const { user_id, created_at, amount, payment_method, transaction_no, type, description } = req.body;
db.prepare(`UPDATE transactions SET user_id=?, created_at=?, amount=?, payment_method=?, transaction_no=?, type=?, description=? WHERE id=?`)
.run(user_id, created_at, amount, payment_method, transaction_no, type, description, req.params.id);
res.redirect('/admin/dashboard');
});

app.get('/admin/transactions/delete/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
db.prepare('DELETE FROM transactions WHERE id = ?').run(req.params.id);
res.redirect('/admin/dashboard');
});

// ========== ADMIN EDIT USER ==========
app.get('/admin/edit/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
if (!user) return res.send('User not found');

res.send(`
<div style="font-family:Inter,system-ui; background:#0b1120; color:white; min-height:100vh; padding:24px 16px;">
<h2 style="color:#f8fafc; margin-bottom:28px;">Edit Investor: ${user.full_name}</h2>
<form method="POST" action="/admin/update/${user.id}" enctype="multipart/form-data" style="max-width:580px;">

<h3 style="color:#60a5fa; margin:24px 0 12px; font-size:15px;">Investment</h3>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Investment Amount</label>
<input type="number" name="investment_amount" value="${user.investment_amount || 0}" step="0.01" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Profit Percentage (%)</label>
<input type="number" name="profit_percentage" value="${user.profit_percentage || 15}" step="0.1" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Current Value</label>
<input type="number" name="current_value" value="${user.current_value || 0}" step="0.01" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<h3 style="color:#60a5fa; margin:28px 0 12px; font-size:15px;">Investment Agreement</h3>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Status</label>
<select name="agreement_status" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<option value="Pending" ${user.agreement_status === 'Pending' ? 'selected' : ''}>Pending</option>
<option value="Signed" ${user.agreement_status === 'Signed' ? 'selected' : ''}>Signed</option>
<option value="Active" ${user.agreement_status === 'Active' ? 'selected' : ''}>Active</option>
<option value="Under Review" ${user.agreement_status === 'Under Review' ? 'selected' : ''}>Under Review</option>
<option value="Expired" ${user.agreement_status === 'Expired' ? 'selected' : ''}>Expired</option>
</select>

<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Date Agreement Entered</label>
<input type="date" name="agreement_date" value="${user.agreement_date || ''}" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Upload Contract</label>
<input type="file" name="contract" style="width:100%; padding:12px; margin-bottom:8px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
${user.contract_file ? `<p style="color:#64748b; font-size:13px; margin-bottom:14px;">Current: <a href="/uploads/${user.contract_file}" target="_blank" style="color:#60a5fa;">${user.contract_file}</a></p>` : '<p style="color:#64748b; font-size:13px; margin-bottom:14px;">No contract uploaded</p>'}

<h3 style="color:#60a5fa; margin:28px 0 12px; font-size:15px;">Profile</h3>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Phone</label>
<input type="text" name="phone" value="${user.phone || ''}" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Date of Birth</label>
<input type="date" name="date_of_birth" value="${user.date_of_birth || ''}" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<h3 style="color:#60a5fa; margin:28px 0 12px; font-size:15px;">Crypto Wallets</h3>
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Bitcoin (BTC)</label>
<input type="text" name="wallet_btc" value="${user.wallet_btc || ''}" style="width:100%; padding:12px; margin-bottom:12px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">USDT</label>
<input type="text" name="wallet_usdt" value="${user.wallet_usdt || ''}" style="width:100%; padding:12px; margin-bottom:12px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Ethereum (ETH)</label>
<input type="text" name="wallet_eth" value="${user.wallet_eth || ''}" style="width:100%; padding:12px; margin-bottom:12px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Solana (SOL)</label>
<input type="text" name="wallet_sol" value="${user.wallet_sol || ''}" style="width:100%; padding:12px; margin-bottom:12px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">BNB</label>
<input type="text" name="wallet_bnb" value="${user.wallet_bnb || ''}" style="width:100%; padding:12px; margin-bottom:12px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">
<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">Tron (TRX)</label>
<input type="text" name="wallet_trx" value="${user.wallet_trx || ''}" style="width:100%; padding:12px; margin-bottom:14px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<label style="display:block; margin-bottom:6px; color:#94a3b8; font-size:14px;">New Password (leave blank to keep)</label>
<input type="text" name="new_password" placeholder="Leave blank to keep current" style="width:100%; padding:12px; margin-bottom:28px; background:#111827; border:1px solid #1e293b; border-radius:8px; color:white;">

<button type="submit" style="padding:13px 32px; background:#3b82f6; color:white; border:none; border-radius:8px; font-weight:600; cursor:pointer;">Save Changes</button>
<a href="/admin/dashboard" style="margin-left:16px; color:#94a3b8;">Cancel</a>
</form>
</div>
`);
});

app.post('/admin/update/:id', upload.single('contract'), (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
const {
investment_amount, profit_percentage, current_value,
phone, date_of_birth,
wallet_btc, wallet_usdt, wallet_eth, wallet_sol, wallet_bnb, wallet_trx,
new_password, agreement_status, agreement_date
} = req.body;

let finalCurrentValue = current_value;
if (!current_value || current_value === '') {
finalCurrentValue = (Number(investment_amount) || 0) * (1 + (Number(profit_percentage) || 15) / 100);
}

let contractFile = null;
if (req.file) {
contractFile = req.file.filename;
} else {
const existing = db.prepare('SELECT contract_file FROM users WHERE id = ?').get(req.params.id);
contractFile = existing ? existing.contract_file : '';
}

if (new_password && new_password.trim() !== '') {
const hashed = bcrypt.hashSync(new_password, 10);
db.prepare(`
UPDATE users SET
investment_amount=?, profit_percentage=?, current_value=?,
phone=?, date_of_birth=?,
wallet_btc=?, wallet_usdt=?, wallet_eth=?, wallet_sol=?, wallet_bnb=?, wallet_trx=?,
agreement_status=?, agreement_date=?, contract_file=?,
password=?
WHERE id=?
`).run(
investment_amount, profit_percentage, finalCurrentValue,
phone, date_of_birth,
wallet_btc, wallet_usdt, wallet_eth, wallet_sol, wallet_bnb, wallet_trx,
agreement_status || 'Pending', agreement_date || '', contractFile,
hashed, req.params.id
);
} else {
db.prepare(`
UPDATE users SET
investment_amount=?, profit_percentage=?, current_value=?,
phone=?, date_of_birth=?,
wallet_btc=?, wallet_usdt=?, wallet_eth=?, wallet_sol=?, wallet_bnb=?, wallet_trx=?,
agreement_status=?, agreement_date=?, contract_file=?
WHERE id=?
`).run(
investment_amount, profit_percentage, finalCurrentValue,
phone, date_of_birth,
wallet_btc, wallet_usdt, wallet_eth, wallet_sol, wallet_bnb, wallet_trx,
agreement_status || 'Pending', agreement_date || '', contractFile,
req.params.id
);
}

res.redirect('/admin/dashboard');
});

app.get('/admin/approve/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run('approved', req.params.id);
res.redirect('/admin/dashboard');
});

app.get('/admin/reject/:id', (req, res) => {
if (!req.session.isAdmin) return res.redirect('/admin');
db.prepare('UPDATE withdrawals SET status = ? WHERE id = ?').run('rejected', req.params.id);
res.redirect('/admin/dashboard');
});

app.get('/admin/logout', (req, res) => {
req.session.isAdmin = false;
res.redirect('/admin');
});

app.listen(3000, () => {
console.log('Server running at http://localhost:3000');
console.log('Admin: http://localhost:3000/admin | Password: monolith2026');
});