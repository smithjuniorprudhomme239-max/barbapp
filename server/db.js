const initSqlJs = require('sql.js')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, 'barber.db')

let db

async function getDb() {
  if (db) return db

  const SQL = await initSqlJs()

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `)

  save()
  return db
}

function save() {
  if (!db) return
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

module.exports = { getDb, save }
