// middleware/auth.js
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  let token;
  const authHeader = req.headers.Authorization || req.headers.authorization;

  // Revisar que el metodo contenga el header Authorization
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];

    // Revisar si existe el token
    if (!token)
      return res.status(401).json({ message: "Acceso denegado. Falta token." });
    // Decodificar el token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decode; // contiene { id, role }
      console.log("El usuario decodificado es:", req.user);

      next();
    } catch (err) {
      res.status(400).json({ message: "Token inválido." });
    }
  } else {
    return res.status(401).json({ message: "Acceso denegado. Falta token." });
  }
};

module.exports = verifyToken;
