const express = require("express");
const dotenv = require("dotenv").config();
const dbConnect = require("./config/dbConnect");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const path = require("path");

// Conectar con la base de datos
dbConnect();

// Inicializar proyecto
const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Inicializar el servidor
const PORT = process.env.PORT || 2000;
console.log("ANTES de iniciar el servidor...");
app.listen(PORT, () => {
  console.log(`El servidor se ha inicializado en http://localhost:${PORT}`);
});
