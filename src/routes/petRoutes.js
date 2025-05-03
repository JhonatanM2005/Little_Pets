const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const verifyToken = require("../middlewares/authMiddleware");
const allowRole = require("../middlewares/roleMiddleware");

// Todos pueden ver las mascotas
router.get("/", petController.getPets);

// Obtener los datos especificos de una mascota
router.get("/:id", petController.getPetById);

// Solo admins o managers pueden crear, editar o eliminar mascotas
router.post(
  "/",
  verifyToken,
  allowRole("admin", "manager"),
  petController.createPet
);

router.put(
  "/:id",
  verifyToken,
  allowRole("admin", "manager"),
  petController.updatePet
);

router.delete(
  "/:id",
  verifyToken,
  allowRole("admin", "manager"),
  petController.deletePet
);

module.exports = router;
