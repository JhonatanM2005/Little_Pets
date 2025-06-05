document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = registerForm.querySelector("#name");
    const cedulaInput = registerForm.querySelector("#id-number");
    const emailInput = registerForm.querySelector("#email");
    const passwordInput = registerForm.querySelector("#password");
    const confirmPasswordInput =
      registerForm.querySelector("#confirm-password");

    const name = nameInput.value;
    const cedula = cedulaInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validación para el número de ID (solo números)
    const idNumberPattern = /^\d+$/;
    if (!idNumberPattern.test(cedula)) {
      Toastify({
        text: "El número de ID solo debe contener números.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "linear-gradient(to right, #FF8A2B, #E57300)",
          color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "16px",
          padding: "18px 25px",
          borderRadius: "8px"
        }
      }).showToast();
      return;
    }

    // Validación para la longitud de la contraseña (mínimo 8 caracteres)
    if (password.length < 8) {
      Toastify({
        text: "La contraseña debe tener al menos 8 caracteres.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "linear-gradient(to right, #FF8A2B, #E57300)",
          color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "16px",
          padding: "18px 25px",
          borderRadius: "8px"
        }
      }).showToast();
      return;
    }

    if (password !== confirmPassword) {
      Toastify({
        text: "Las contraseñas no coinciden.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "linear-gradient(to right, #FF8A2B, #E57300)",
          color: "#FFFFFF",
          fontFamily: "'Poppins', sans-serif",
          fontSize: "16px",
          padding: "18px 25px",
          borderRadius: "8px"
        }
      }).showToast();
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, cedula, email, password, role: "user" }), // Establecemos el rol por defecto como 'user'
      });

      const data = await response.json();

      if (response.ok) {
        // Registro exitoso
        Toastify({
          text: "Registro exitoso. Serás redirigido para iniciar sesión.",
          duration: 2000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            color: "#FFFFFF",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            padding: "18px 25px",
            borderRadius: "8px"
          },
          callback: function() {
            window.location.href = "./login.html"; // Redirigir a la página de inicio de sesión
          }
        }).showToast();
      } else {
        // Error en el registro
        Toastify({
          text: data.mensaje || "Error al registrar el usuario.",
          duration: 3000,
          gravity: "bottom",
          position: "right",
          style: {
            background: "linear-gradient(to right, #FF8A2B, #E57300)",
            color: "#FFFFFF",
            fontFamily: "'Poppins', sans-serif",
            fontSize: "16px",
            padding: "18px 25px",
            borderRadius: "8px"
          }
        }).showToast();
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      Toastify({
        text: "Error de conexión con el servidor.",
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
          background: "linear-gradient(to right, #FF8A2B, #E57300)",
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
