const User = require("../models/userModel");

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

module.exports = { getUserProfile };
