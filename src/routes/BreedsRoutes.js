// src/routes/BreedsRoutes.js
const express = require("express");
const router = express.Router();
const Pet = require("../models/petModel");

// GET /api/breeds - Lista de razas únicas de la base de datos
router.get("/", async (req, res) => {
  try {
    const breeds = await Pet.distinct("breed");
    res.json(breeds);
  } catch (err) {
    console.error("Error al obtener las razas:", err);
    res.status(500).json({ error: "Error al obtener las razas" });
  }
});

module.exports = router;