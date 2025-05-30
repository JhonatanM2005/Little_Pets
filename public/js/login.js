document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  const messageDiv = document.createElement("div"); // Para mostrar mensajes de error
  loginForm.parentNode.insertBefore(messageDiv, loginForm);
  messageDiv.style.color = "red";
  messageDiv.style.marginBottom = "10px";
  
  // Verificar si hay un parámetro de redirección en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect");
  
  // Si viene de una página que requiere autenticación, mostrar mensaje
  if (redirectUrl) {
    const infoDiv = document.createElement("div");
    infoDiv.textContent = "Debes iniciar sesión para acceder al formulario de adopción";
    infoDiv.style.color = "#ff6b00";
    infoDiv.style.marginBottom = "15px";
    infoDiv.style.fontWeight = "bold";
    loginForm.parentNode.insertBefore(infoDiv, messageDiv);
  }

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
        
        // Verificar si hay un parámetro de redirección en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");
        
        // Si hay una URL de redirección, redirigir a esa página, de lo contrario ir a la página de perfil
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = "./account_user.html"; // Redirige a la página de perfil por defecto
        }
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
