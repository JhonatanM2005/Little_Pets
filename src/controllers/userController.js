const User = require("../models/userModel");
const bcrypt = require("bcryptjs");

// Obtener el perfil del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    // `req.user` contiene la información decodificada del token, incluyendo el `id` del usuario
    const user = await User.findById(req.user.id).select("-password"); // Excluimos la contraseña por seguridad

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener el perfil del usuario:", error);
    res
      .status(500)
      .json({ message: "Error al obtener el perfil del usuario." });
  }
};

// Obtener todos los usuarios (solo para administradores)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios." });
  }
};

// Obtener un usuario por ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario." });
  }
};

// Crear un nuevo usuario
const createUser = async (req, res) => {
  console.log("Iniciando creación de usuario:", req.body);
  try {
    const { name, email, password, role, status, cedula } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !password || !cedula) {
      console.log("Datos faltantes en la solicitud:", { name, email, password: password ? "[PRESENTE]" : "[AUSENTE]", cedula });
      return res.status(400).json({ message: "Todos los campos son obligatorios (nombre, email, contraseña y cédula)." });
    }
    
    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`Email ${email} ya está registrado.`);
      return res.status(400).json({ message: "El email ya está registrado." });
    }
    
    // Verificar si la cédula ya está registrada
    const existingCedula = await User.findOne({ cedula });
    if (existingCedula) {
      console.log(`Cédula ${cedula} ya está registrada.`);
      return res.status(400).json({ message: "La cédula ya está registrada." });
    }
    
    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el nuevo usuario
    const newUser = new User({
      name,
      email,
      cedula,
      password: hashedPassword,
      role: role || "user",
      status: status || "active"
    });
    
    console.log("Guardando nuevo usuario:", {
      name: newUser.name,
      email: newUser.email,
      cedula: newUser.cedula,
      role: newUser.role,
      status: newUser.status
    });
    
    await newUser.save();
    console.log("Usuario guardado correctamente con ID:", newUser._id);
    
    // Devolver el usuario creado sin la contraseña
    const userResponse = { ...newUser._doc };
    delete userResponse.password;
    
    res.status(201).json(userResponse);
  } catch (error) {
    console.error("Error al crear el usuario:", error);
    
    // Manejar errores específicos de MongoDB/Mongoose
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: "Error de validación", errors: messages });
    }
    
    if (error.code === 11000) { // Error de duplicado
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ message: `El ${field} ya está en uso.` });
    }
    
    res.status(500).json({ message: "Error al crear el usuario.", error: error.message });
  }
};

// Actualizar un usuario
const updateUser = async (req, res) => {
  try {
    const { name, email, password, role, status, cedula } = req.body;
    
    // Verificar si el usuario existe
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    
    // Si se está actualizando el email, verificar que no exista otro usuario con ese email
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "El email ya está registrado por otro usuario." });
      }
    }
    
    // Si se está actualizando la cédula, verificar que no exista otro usuario con esa cédula
    if (cedula && cedula !== user.cedula) {
      const existingCedula = await User.findOne({ cedula });
      if (existingCedula) {
        return res.status(400).json({ message: "La cédula ya está registrada por otro usuario." });
      }
    }
    
    // Actualizar los campos del usuario
    if (name) user.name = name;
    if (email) user.email = email;
    if (cedula) user.cedula = cedula;
    if (role) user.role = role;
    if (status) user.status = status;
    
    // Si se proporciona una nueva contraseña, encriptarla
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }
    
    await user.save();
    
    // Devolver el usuario actualizado sin la contraseña
    const userResponse = { ...user._doc };
    delete userResponse.password;
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error al actualizar el usuario:", error);
    res.status(500).json({ message: "Error al actualizar el usuario." });
  }
};

// Eliminar un usuario
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Verificar si el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    
    // No permitir eliminar al propio usuario administrador que realiza la solicitud
    if (userId === req.user.id) {
      return res.status(400).json({ message: "No puedes eliminar tu propio usuario." });
    }
    
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: "Usuario eliminado correctamente." });
  } catch (error) {
    console.error("Error al eliminar el usuario:", error);
    res.status(500).json({ message: "Error al eliminar el usuario." });
  }
};

module.exports = { 
  getUserProfile,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
