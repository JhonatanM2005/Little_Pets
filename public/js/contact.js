document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.name.value;
    const email = form.email.value;
    const message = form.message.value;

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message })
      });

      const result = await res.json();
      if (res.ok) {
        Toastify({
          text: result.message || "Mensaje enviado con éxito.",
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)", // Verde para éxito
            color: "#FFFFFF",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            padding: "18px 25px",
            borderRadius: "8px"
          }
        }).showToast();
        form.reset();
      } else {
        Toastify({
          text: result.message || "Error al enviar el mensaje.",
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #FF8A2B, #E57300)", // Naranja para error
            color: "#FFFFFF",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            padding: "18px 25px",
            borderRadius: "8px"
          }
        }).showToast();
      }
    } catch (error) {
      Toastify({
        text: "Error de conexión al enviar el mensaje.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "linear-gradient(to right, #FF8A2B, #E57300)", // Naranja para error
          color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "16px",
          padding: "18px 25px",
          borderRadius: "8px"
        }
      }).showToast();
    }
  });
});
