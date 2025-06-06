// src/routes/adoptionRoutes.js
const express = require("express");
const router = express.Router();
const adoptionController = require("../controllers/adoptionController");
const allowRole = require("../middlewares/roleMiddleware");
const verifyToken = require("../middlewares/authMiddleware");

// Create a new adoption request (public route)
router.post("/", adoptionController.createAdoptionRequest);

// Servir PDFs locales
router.get("/pdf/:fileName", adoptionController.servePdf);

// Get adoption requests by user email (public route)
router.get("/user/:email", adoptionController.getAdoptionRequestsByEmail);

// Get all adoption requests (admin/manager only)
router.get(
  "/",
  verifyToken,
  allowRole("admin", "manager"),
  adoptionController.getAllAdoptionRequests
);

// Get a single adoption request by ID (admin/manager only)
router.get(
  "/:id", 
  verifyToken,
  allowRole("admin", "manager"),
  adoptionController.getAdoptionRequestById
);

// Update adoption request status (admin/manager only)
router.patch(
  "/:id/status",
  verifyToken,
  allowRole("admin", "manager"),
  adoptionController.updateAdoptionRequestStatus
);

module.exports = router;
