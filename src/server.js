require('dotenv').config();
const express = require('express');
const app = express();
const pool = require('./config/db');
const connectMongo = require('./config/mongodb');          
const usersRouter = require('./routes/users'); 
const cattlesRouter = require('./routes/cattles'); 
const collarDataRouter = require('./routes/collarData');
const geofencesRouter = require('./routes/geofences');
const PORT = process.env.PORT || 3000;

connectMongo();


// CORS middleware (manual implementation - no extra dependencies)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});


app.use(express.json());         

app.use('/api/collar-data', collarDataRouter);

app.use('/api/users', usersRouter);
app.use('/api/cattles', cattlesRouter);
app.use('/api/geofences', geofencesRouter);  // ⬅️ new line

app.get('/', (req, res) => res.send('OK'));



// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});



app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});