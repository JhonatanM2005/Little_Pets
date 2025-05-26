const sgMail = require('@sendgrid/mail');
require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const contact = async (req, res) => {
  const { name, email, message } = req.body;

  const msg = {
    to: process.env.TO_EMAIL,
    from: process.env.FROM_EMAIL,
    subject: 'Nuevo mensaje desde el formulario de contacto',
    text: `Nombre: ${name}\nCorreo: ${email}\nMensaje:\n${message}`,
  };

  try {
    await sgMail.send(msg);
    res.status(200).json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error al enviar correo:', error);
    res.status(500).json({ message: 'Error al enviar el mensaje' });
  }
};

module.exports = { contact };
