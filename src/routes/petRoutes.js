const express = require("express");
const router = express.Router();
const mascotaController = require("../controllers/petController");
const {
  verificarToken,
  permitirRoles,
} = require("../middlewares/authMiddleware");

// Todos pueden ver las mascotas
router.get("/", mascotaController.obtenerMascotas);

// Solo admins o managers pueden crear, editar o eliminar mascotas
router.post(
  "/",
  verificarToken,
  permitirRoles("admin", "manager"),
  mascotaController.crearMascota
);
router.put(
  "/:id",
  verificarToken,
  permitirRoles("admin", "manager"),
  mascotaController.actualizarMascota
);
router.delete(
  "/:id",
  verificarToken,
  permitirRoles("admin", "manager"),
  mascotaController.eliminarMascota
);
