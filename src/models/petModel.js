// src/models/petModel.js
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  breed: {
    type: String,
    trim: true,
  },
  age: {
    type: Number,
    min: 0,
  },
  size: {
    type: String,
    enum: ["Small", "Medium", "Large"],
    trim: true,
  },
  type: {
    type: String,
    enum: ["Dog", "Cat"],
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    trim: true,
  },
  vaccinated: {
    type: Boolean,
    default: false,
  },
  sterilized: {
    type: Boolean,
    default: false,
  },
  personality: {
    type: [String],
    trim: true,
  },
  image: {
    type: String,
  },
});

module.exports = mongoose.models.Pet || mongoose.model("Pet", petSchema);
