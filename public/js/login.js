document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.querySelector(".login-form");
  
  // Verificar si hay un parámetro de redirección en la URL
  const urlParams = new URLSearchParams(window.location.search);
  const redirectUrl = urlParams.get("redirect");
  
  // Si viene de una página que requiere autenticación, mostrar mensaje
  if (redirectUrl) {
    Toastify({
      text: "Debes iniciar sesión para acceder al formulario de adopción",
      duration: 4000,
      gravity: "bottom",
      position: "right",
      style: {
        background: "linear-gradient(to right, #FF8A2B, #E57300)", // Naranja para info
        color: "#FFFFFF",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "16px",
        padding: "18px 25px",
        borderRadius: "8px"
      }
    }).showToast();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const emailInput = loginForm.querySelector("#email");
    const passwordInput = loginForm.querySelector("#password");

    const email = emailInput.value;
    const password = passwordInput.value;

    if (!email || !password) {
      Toastify({
        text: "Por favor, introduce tu email y contraseña.",
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
        
        // Almacenar el tipo de usuario (en un entorno real, esto vendría del servidor)
        // Por ahora, simulamos diferentes tipos de usuario según el email
        let userType = "user";
        if (email.includes("admin")) {
          userType = "admin";
        } else if (email.includes("operator") || email.includes("ope")) {
          userType = "operator";
        }
        localStorage.setItem("userType", userType);
        
        // Almacenar el email del usuario para mostrarlo en el perfil
        localStorage.setItem("email", email);
        
        // Verificar si hay un parámetro de redirección en la URL
        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get("redirect");
        
        // Si hay una URL de redirección, redirigir a esa página
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          // Redirigir según el tipo de usuario
          if (userType === "admin") {
            window.location.href = "./account_admin.html";
          } else if (userType === "operator") {
            window.location.href = "./account_ope.html";
          } else {
            window.location.href = "./account_user.html";
          }
        }
      } else {
        // Error en la autenticación
        Toastify({
          text: data.mensaje || "Error al iniciar sesión. Credenciales incorrectas.",
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
      console.error("Error al iniciar sesión:", error);
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
