const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { getDb, save } = require('../db')

// User signup
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' })

  const db = await getDb()
  const existing = db.exec(`SELECT id FROM users WHERE email = '${email}'`)
  if (existing.length && existing[0].values.length) return res.status(409).json({ error: 'Email already registered' })

  const hashed = await bcrypt.hash(password, 10)
  db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, hashed])
  save()

  const row = db.exec(`SELECT id, name, email FROM users WHERE email = '${email}'`)[0].values[0]
  const user = { id: row[0], name: row[1], email: row[2] }
  const token = jwt.sign({ id: user.id, name: user.name, email: user.email, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })

  res.json({ token, user })
})

// User login
router.post('/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'All fields required' })

  const db = await getDb()
  const result = db.exec(`SELECT id, name, email, password FROM users WHERE email = '${email}'`)
  if (!result.length || !result[0].values.length) return res.status(401).json({ error: 'Invalid email or password' })

  const [id, name, userEmail, hashed] = result[0].values[0]
  const match = await bcrypt.compare(password, hashed)
  if (!match) return res.status(401).json({ error: 'Invalid email or password' })

  const token = jwt.sign({ id, name, email: userEmail, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: { id, name, email: userEmail } })
})

// Admin login
router.post('/admin', (req, res) => {
  const { username, password } = req.body
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' })
    return res.json({ token })
  }
  res.status(401).json({ error: 'Invalid credentials' })
})

module.exports = router
