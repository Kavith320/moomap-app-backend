// src/controllers/usersController.js

const pool = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');   // use bcryptjs

const SCHEMA = 'MooMapSchema';
const USER_TBL = `"${SCHEMA}"."user"`;

// If you ever want UUID style ids, uncomment this and use uuidv4()
// const { v4: uuidv4 } = require('uuid');


// ---------------- REGISTER ----------------
exports.createUser = async (req, res) => {
  try {
    const { firstName, lastName, gender, mobile, nicNo, address, password } = req.body;

    // Backend generates userId automatically
    // 5-digit numeric userId as a string: "12345"
    const userId = String(Math.floor(10000 + Math.random() * 90000));


    // Or: const userId = uuidv4();

    // Input validation
    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({
        error: 'firstName, lastName, mobile, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    if (!/^\d{10,15}$/.test(mobile)) {
      return res.status(400).json({ error: 'Mobile must be 10-15 digits' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Insert user into PostgreSQL
    const { rows } = await pool.query(
      `INSERT INTO ${USER_TBL}
       ("userId","firstName","lastName","gender","mobile","nicNo","address","password")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING "userId","firstName","lastName","mobile"`,
      [userId, firstName, lastName, gender, mobile, nicNo, address, hashed]
    );

    res.status(201).json({
      message: 'User registered',
      user: rows[0],
    });
  } catch (err) {
    console.error('Error creating user:', err);

    if (err.code === '23505') {
      return res.status(409).json({ error: 'Mobile already in use' });
    }

    res.status(500).json({ error: 'Failed to register user' });
  }
};


// ---------------- LOGIN ----------------
exports.loginUser = async (req, res) => {
  try {
    const { mobile, password } = req.body;
    if (!mobile || !password) {
      return res.status(400).json({ error: 'Mobile and password required' });
    }

    const { rows } = await pool.query(
      `SELECT "userId","firstName","lastName","mobile","password"
       FROM ${USER_TBL}
       WHERE "mobile"=$1`,
      [mobile]
    );

    if (!rows.length) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId, mobile: user.mobile },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        mobile: user.mobile,
      },
    });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Login failed' });
  }
};


// ---------------- READ (GET PROFILE) ----------------
exports.getUser = async (req, res) => {
  try {
    const myUserId = req.user.userId;

    const { rows } = await pool.query(
      `SELECT "userId","firstName","lastName","gender","mobile","nicNo","address"
       FROM ${USER_TBL}
       WHERE "userId"=$1`,
      [myUserId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};


// ---------------- UPDATE ----------------
exports.updateUser = async (req, res) => {
  try {
    const myUserId = req.user.userId;
    const { firstName, lastName, gender, mobile, nicNo, address, password } = req.body;

    let hashedPassword = null;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const { rows } = await pool.query(
      `UPDATE ${USER_TBL}
       SET "firstName"=$1,
           "lastName"=$2,
           "gender"=$3,
           "mobile"=$4,
           "nicNo"=$5,
           "address"=$6,
           "password" = COALESCE($7, "password")
       WHERE "userId"=$8
       RETURNING "userId","firstName","lastName","mobile"`,
      [firstName, lastName, gender, mobile, nicNo, address, hashedPassword, myUserId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User updated', user: rows[0] });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};


// ---------------- DELETE ----------------
exports.deleteUser = async (req, res) => {
  try {
    const myUserId = req.user.userId;

    const { rows } = await pool.query(
      `DELETE FROM ${USER_TBL}
       WHERE "userId"=$1
       RETURNING "userId"`,
      [myUserId]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
