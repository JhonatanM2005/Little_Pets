const Mascota = require("../models/petModel");

exports.obtenerMascotas = async (req, res) => {
  try {
    const mascotas = await Mascota.find();
    res.json(mascotas);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener mascotas" });
  }
};

exports.crearMascota = async (req, res) => {
  const { nombre, tipo, edad, descripcion, imagenUrl } = req.body;

  try {
    const nuevaMascota = new Mascota({
      nombre,
      tipo,
      edad,
      descripcion,
      imagenUrl,
    });
    await nuevaMascota.save();
    res.status(201).json(nuevaMascota);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al crear mascota" });
  }
};

exports.actualizarMascota = async (req, res) => {
  const { id } = req.params;
  try {
    const actualizada = await Mascota.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json(actualizada);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al actualizar mascota" });
  }
};

exports.eliminarMascota = async (req, res) => {
  const { id } = req.params;
  try {
    await Mascota.findByIdAndDelete(id);
    res.json({ mensaje: "Mascota eliminada" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al eliminar mascota" });
  }
};
