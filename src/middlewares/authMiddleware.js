// middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    // Obtener el header de autorización
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    // Verificar si existe el header y tiene el formato correcto
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("No se encontró el token de autorización o formato incorrecto");
      return res.status(401).json({ message: "Acceso denegado. Formato de autorización inválido." });
    }
    
    // Extraer el token
    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.error("Token vacío después de separar");
      return res.status(401).json({ message: "Acceso denegado. Token no proporcionado." });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Guardar la información del usuario en la solicitud
    req.user = decoded;
    
    console.log("Usuario autenticado correctamente:", {
      id: decoded.id,
      role: decoded.role
    });
    
    // Continuar con la siguiente función
    next();
    
  } catch (error) {
    console.error("Error en la verificación del token:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido." });
    } else if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado. Por favor, inicie sesión nuevamente." });
    } else {
      return res.status(500).json({ message: "Error en la autenticación." });
    }
  }
};

module.exports = verifyToken;
