const pool = require('../config/db');

const SCHEMA = 'MooMapSchema';
const CATTLE_TBL = `"${SCHEMA}"."cattle"`;

// 🔵 GET ALL CATTLE
exports.getAllCattles = async (req, res) => {
  try {
    const userId = req.user.userId;  // show only user's cattle

    const result = await pool.query(
      `SELECT * FROM ${CATTLE_TBL} 
       WHERE "userId" = $1 
       ORDER BY "cattleId" ASC`,
      [userId]
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching cattle" });
  }
};

// 🔵 GET SINGLE CATTLE
exports.getCattleById = async (req, res) => {
  const { id } = req.params; // id = cattleId

  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT * FROM ${CATTLE_TBL} 
       WHERE "cattleId" = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Cattle not found" });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching cattle" });
  }
};

// 🔵 CREATE CATTLE
exports.createCattle = async (req, res) => {
  const {
    cattleId, name, breed, age, gender, color, weight,
    healthNotes, farmName, address, Image, collarId
  } = req.body;

  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `INSERT INTO ${CATTLE_TBL}
      ("cattleId","name","breed","age","gender","color","weight",
       "healthNotes","farmName","address","Image","collarId","userId")
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [
        cattleId, name, breed, age, gender, color, weight,
        healthNotes, farmName, address, Image, collarId, userId
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);

    if (error.code === "23503") {
      return res.status(400).json({ message: "Invalid collarId (not found in collar table)" });
    }

    if (error.code === "23505") {
      return res.status(409).json({ message: "cattleId already exists" });
    }

    res.status(500).json({ message: "Error creating cattle" });
  }
};

// 🔵 UPDATE CATTLE
exports.updateCattle = async (req, res) => {
  const { id } = req.params; // cattleId
  const {
    name, breed, age, gender, color, weight,
    healthNotes, farmName, address, Image, collarId
  } = req.body;

  const userId = req.user.userId;

  try {
    const existing = await pool.query(
      `SELECT * FROM ${CATTLE_TBL} 
       WHERE "cattleId" = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const result = await pool.query(
      `UPDATE ${CATTLE_TBL} SET
        "name"=$1,"breed"=$2,"age"=$3,"gender"=$4,"color"=$5,"weight"=$6,
        "healthNotes"=$7,"farmName"=$8,"address"=$9,"Image"=$10,"collarId"=$11
       WHERE "cattleId"=$12
       RETURNING *`,
      [
        name, breed, age, gender, color, weight,
        healthNotes, farmName, address, Image, collarId, id
      ]
    );

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error updating cattle" });
  }
};

// 🔵 DELETE CATTLE
exports.deleteCattle = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId;

  try {
    const existing = await pool.query(
      `SELECT * FROM ${CATTLE_TBL} 
       WHERE "cattleId" = $1 AND "userId" = $2`,
      [id, userId]
    );

    if (existing.rows.length === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await pool.query(
      `DELETE FROM ${CATTLE_TBL}
       WHERE "cattleId" = $1`,
      [id]
    );

    res.status(200).json({ message: "Cattle deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cattle" });
  }
};
