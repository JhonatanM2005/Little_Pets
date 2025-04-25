document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const messageDiv = document.createElement("div"); // Para mostrar mensajes de error
  loginForm.parentNode.insertBefore(messageDiv, loginForm);
  messageDiv.style.color = "red";
  messageDiv.style.marginBottom = "10px";

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = loginForm.querySelector("#email");
    const passwordInput = loginForm.querySelector("#password");

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      messageDiv.textContent = "Por favor, introduce tu email y contraseña.";
      return;
    }

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Autenticación exitosa
        localStorage.setItem("token", data.token);
        localStorage.setItem("isAuthenticated", "true");
        window.location.href = "./account_user.html"; // Redirige a la página de perfil
      } else {
        // Error en la autenticación
        messageDiv.textContent =
          data.mensaje || "Error al iniciar sesión. Credenciales incorrectas.";
      }
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      messageDiv.textContent = "Error de conexión con el servidor.";
    }
  });
});
