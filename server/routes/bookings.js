const router = require('express').Router()
const { getDb, save } = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware')

// Create a booking (logged in users)
router.post('/', authMiddleware, async (req, res) => {
  const { name, phone, service, date } = req.body
  if (!name || !phone || !service || !date) return res.status(400).json({ error: 'All fields required' })

  const db = await getDb()
  db.run(
    `INSERT INTO bookings (user_id, name, phone, service, date) VALUES (?, ?, ?, ?, ?)`,
    [req.user.id, name, phone, service, date]
  )
  save()
  res.json({ message: 'Booking created successfully' })
})

// Get all bookings (admin only)
router.get('/', adminMiddleware, async (req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT b.id, b.name, b.phone, b.service, b.date, b.created_at, u.email
    FROM bookings b LEFT JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC`)

  if (!result.length) return res.json([])

  const [cols, ...rows] = [result[0].columns, ...result[0].values]
  const bookings = result[0].values.map(row =>
    Object.fromEntries(cols.map((col, i) => [col, row[i]]))
  )
  res.json(bookings)
})

module.exports = router
