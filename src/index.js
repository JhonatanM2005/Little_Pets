const express = require("express");
const dbConnect = require("./config/dbConnect");
const dotenv = require("dotenv").config();
const path = require("path");

// Importar rutas
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const petRoutes = require("./routes/petRoutes");

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
app.use("/api/pets", petRoutes);

// Inicializar el servidor
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`El servidor se ha inicializado en http://localhost:${PORT}`);
});
