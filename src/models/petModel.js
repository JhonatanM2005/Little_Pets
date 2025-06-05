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
    enum: ["dog", "cat", "Dog", "Cat"],  // Permitir ambos formatos para compatibilidad
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "Male", "Female"],  // Permitir ambos formatos para compatibilidad
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
    default: [],
  },
  availability: {
    type: String,
    enum: ["available", "adopted", "fostered", "pending"],
    default: "available",
    trim: true,
  },
  image: {
    type: String,
  },
  imagePublicId: {
    type: String,
  },
  images: {
    type: [String],
    default: [],
  },
  imagesPublicIds: {
    type: [String],
    default: [],
  },
}, {
  timestamps: true,  // Agregar createdAt y updatedAt
});

// Middleware para asegurar que el tipo y género estén en minúsculas
petSchema.pre('save', function(next) {
  if (this.type) {
    this.type = this.type.toLowerCase();
  }
  if (this.gender) {
    this.gender = this.gender.toLowerCase();
  }
  if (this.availability) {
    this.availability = this.availability.toLowerCase();
  }
  next();
});

module.exports = mongoose.models.Pet || mongoose.model("Pet", petSchema);
