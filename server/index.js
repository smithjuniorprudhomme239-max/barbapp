require('dotenv').config()
const express = require('express')
const cors = require('cors')
const { getDb } = require('./db')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', require('./routes/auth'))
app.use('/api/bookings', require('./routes/bookings'))

app.get('/api/health', (_, res) => res.json({ status: 'ok' }))
app.get('/', (_, res) => res.send('FadeKing API is running. Frontend is at http://localhost:5173'))

const PORT = process.env.PORT || 5000

getDb().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))
})
