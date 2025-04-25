const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos suficientes." });
    }
    next();
  };
};

module.exports = allowRoles;
