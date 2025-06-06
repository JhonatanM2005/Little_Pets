document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const nameInput = registerForm.querySelector("#name");
    const cedulaInput = registerForm.querySelector("#id-number");
    const emailInput = registerForm.querySelector("#email");
    const passwordInput = registerForm.querySelector("#password");
    const confirmPasswordInput = registerForm.querySelector("#confirm-password");
    const submitButton = registerForm.querySelector("button[type='submit']");
    
    // Deshabilitar el botón y mostrar indicador de carga
    submitButton.disabled = true;
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
  
    const name = nameInput.value;
    const cedula = cedulaInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // Validación para el número de ID (solo números)
    const idNumberPattern = /^\d+$/;
    if (!idNumberPattern.test(cedula)) {
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;

      Toastify({
        text: "The ID number must only contain numbers.",
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
        text: "The password must be at least 8 characters long.",
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
        text: "Passwords do not match.",
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
          text: "Registration successful. You will be redirected to log in.",
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
          text: data.message || "Registration error. Please try again.",
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
      submitButton.disabled = false;
      submitButton.innerHTML = originalButtonText;
      Toastify({
        text: "Server connection error. Please try again later.",
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
