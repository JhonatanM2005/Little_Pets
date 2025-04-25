document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector(".register-form");
  const messageDiv = document.createElement("div"); // Para mostrar mensajes de error/éxito
  registerForm.parentNode.insertBefore(messageDiv, registerForm);
  messageDiv.style.marginTop = "10px";

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

    if (password !== confirmPassword) {
      messageDiv.textContent = "Las contraseñas no coinciden.";
      messageDiv.style.color = "red";
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
        messageDiv.textContent =
          "Registro exitoso. Serás redirigido para iniciar sesión.";
        messageDiv.style.color = "green";
        setTimeout(() => {
          window.location.href = "./login.html"; // Redirigir a la página de inicio de sesión
        }, 2000); // Redirigir después de 2 segundos
      } else {
        // Error en el registro
        messageDiv.textContent =
          data.mensaje || "Error al registrar el usuario.";
        messageDiv.style.color = "red";
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      messageDiv.textContent = "Error de conexión con el servidor.";
      messageDiv.style.color = "red";
    }
  });
});
