const mongoose = require("mongoose");

const COLLECTION_NAME = "devices";

/**
 * GET /api/collar-data/:id
 * Returns a single device document by _id (device_id)
 * Examples of valid ids:
 *   7454927D7850
 *   TEST12345678
 */
const getCollarDataById = async (req, res) => {
  try {
    // Trim to avoid hidden spaces/newlines
    const rawId = req.params.id;
    const id = (rawId || "").trim();

    console.log("📡 getCollarDataById called with raw id:", JSON.stringify(rawId));
    console.log("➡ using trimmed id:", JSON.stringify(id));

    const db = mongoose.connection.db;
    console.log("📂 Connected DB name:", db.databaseName);

    const collections = await db.listCollections().toArray();
    console.log("📜 Existing collections:", collections.map((c) => c.name));

    const collection = db.collection(COLLECTION_NAME);
    console.log("🔎 Searching collection:", COLLECTION_NAME, "for _id =", id);

    // Match whether _id is a string or an ObjectId by converting _id to string
    const device = await collection.findOne({
      $expr: { $eq: [{ $toString: "$_id" }, id] },
    });

    if (!device) {
      console.log("❌ No document found (after $toString match) for id:", id);
      return res.status(404).json({ message: "Device not found" });
    }

    console.log("✅ Found document:", device._id);
    return res.json(device);
  } catch (err) {
    console.error("💥 getCollarDataById ERROR:", err);
    return res.status(500).json({
      message: "Failed to fetch collar data",
      error: err.message,
    });
  }
};

module.exports = {
  getCollarDataById,
};
