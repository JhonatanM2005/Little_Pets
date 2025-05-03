const Pet = require("../models/petModel");

exports.getPets = async (req, res) => {
  try {
    const pets = await Pet.find();
    res.json(pets);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener pets" });
  }
};

exports.getPetById = async (req, res) => {
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ mensaje: "Mascota no encontrada" });
    }

    res.json(pet);
  } catch (error) {
    console.error("Error al obtener la mascota por ID:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ mensaje: "ID de mascota no válido" });
    }
    res
      .status(500)
      .json({ mensaje: "Error del servidor al obtener la mascota" });
  }
};

exports.createPet = async (req, res) => {
  const {
    name,
    breed,
    age,
    size,
    type,
    gender,
    vaccinated,
    sterilized,
    personality,
    image,
  } = req.body;

  try {
    const newPet = new Pet({
      name,
      breed,
      age,
      size,
      type,
      gender,
      vaccinated,
      sterilized,
      personality,
      image,
    });
    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error("Error al crear mascota:", error);
    res.status(500).json({ mensaje: "Error al crear mascota" });
  }
};

exports.updatePet = async (req, res) => {
  const { id } = req.params;
  try {
    const updatedPet = await Pet.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(updatedPet);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar mascota" });
  }
};

exports.deletePet = async (req, res) => {
  const { id } = req.params;
  try {
    await Pet.findByIdAndDelete(id);
    res.json({ mensaje: "Pet eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar mascota" });
  }
};
