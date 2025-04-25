const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

// Generar el jwt
const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

// Funcion del register
exports.register = async (req, res) => {
  // Definir al usuario
  const { name, cedula, email, password, role } = req.body;

  // Validar que no hayan correos ya registrados
  try {
    const exists = await User.findOne({ email });
    if (exists) {
      return res
        .status(400)
        .json({ mensaje: "Ya existe un usuario con ese correo" });
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      cedula,
      email,
      password: hash,
      role: role,
    });

    await newUser.save();
    const token = generateToken(newUser);

    res.status(201).json({
      token,
      user: { name: newUser.name, email: newUser.email, role: newUser.role },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el registro" });
  }
};

// Funcion del login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      User: { name: user.name, email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el login" });
  }
};
