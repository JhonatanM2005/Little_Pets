const express = require("express");
const verifyToken = require("../middlewares/authMiddleware");
const allowRoles = require("../middlewares/roleMiddleware");
const userController = require("../controllers/userController");
const router = express.Router();

// Rutas de admin
router.get("/admin", verifyToken, allowRoles("admin"), (req, res) => {
  res.json({ message: "Bienvenido Admin!" });
});

// Rutas de manager
router.get(
  "/manager",
  verifyToken,
  allowRoles("admin", "manager"),
  (req, res) => {
    res.json({ message: "Bienvenido Manager!" });
  }
);

// Rutas de user
router.get(
  "/user",
  verifyToken,
  allowRoles("admin", "manager", "user"),
  (req, res) => {
    res.json({ message: "Bienvenido User!" });
  }
);

// Ruta para obtener el perfil del usuario autenticado
router.get("/profile", verifyToken, userController.getUserProfile);

// Rutas CRUD para gestión de usuarios (solo accesibles por administradores)
// Obtener todos los usuarios
router.get("/", verifyToken, allowRoles("admin"), userController.getAllUsers);

// Obtener un usuario por ID
router.get("/:id", verifyToken, allowRoles("admin"), userController.getUserById);

// Crear un nuevo usuario
router.post("/", verifyToken, allowRoles("admin"), userController.createUser);

// Actualizar un usuario
router.put("/:id", verifyToken, allowRoles("admin"), userController.updateUser);

// Eliminar un usuario
router.delete("/:id", verifyToken, allowRoles("admin"), userController.deleteUser);

module.exports = router;
