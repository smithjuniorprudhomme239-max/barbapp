const router = require('express').Router()
const { getDb, save } = require('../db')
const { authMiddleware, adminMiddleware } = require('../middleware')
const { createClient } = require('@supabase/supabase-js')

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

// Create a booking - PUBLIC (anyone can book without login)
router.post('/', async (req, res) => {
  const { name, phone, service, date } = req.body
  if (!name || !phone || !service || !date) return res.status(400).json({ error: 'All fields required' })

  const db = await getDb()

  const existing = db.exec(`SELECT id FROM bookings WHERE date = ? LIMIT 1`, [date])
  if (existing.length && existing[0].values.length > 0) {
    return res.status(409).json({ error: 'This time slot is already taken. Please choose another one.' })
  }

  db.run(
    `INSERT INTO bookings (user_id, name, phone, service, date) VALUES (?, ?, ?, ?, ?)`,
    [null, name, phone, service, date]
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

// Update booking status - uses Supabase service role to bypass RLS
router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  if (!status || !['pending', 'completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status. Must be pending or completed.' })
  }

  const { error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)

  if (error) {
    console.error('Supabase update error:', error)
    return res.status(500).json({ error: error.message })
  }

  res.json({ message: 'Status updated', id, status })
})

module.exports = router