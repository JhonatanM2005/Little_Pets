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

router.get("/profile", verifyToken, userController.getUserProfile);

module.exports = router;
