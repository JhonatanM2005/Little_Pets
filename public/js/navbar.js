document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded and parsed');
    
    // Elementos del menú hamburguesa
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');
    
    // Elementos de autenticación
    const loginLink = document.getElementById('login-link');
    const accountLink = document.getElementById('account-link');
    const logoutLink = document.getElementById('logout-link');
    const logoutBtn = document.getElementById('logout-btn');
    
    console.log('Auth elements:', { loginLink, accountLink, logoutLink, logoutBtn });
    
    // Verificar estado de autenticación
    const token = localStorage.getItem('token');
    const isAuthenticated = !!token; // Verificar si hay un token de autenticación
    console.log('User authenticated:', isAuthenticated);
    
    // Función para actualizar la UI según el estado de autenticación
    function updateAuthUI(isLoggedIn) {
        console.log('Updating UI. Logged in:', isLoggedIn);
        
        if (loginLink) {
            loginLink.style.display = isLoggedIn ? 'none' : 'block';
            console.log('Login link display:', loginLink.style.display);
        }
        
        if (accountLink) {
            accountLink.style.display = isLoggedIn ? 'block' : 'none';
            console.log('Account link display:', accountLink.style.display);
        }
        
        if (logoutLink) {
            logoutLink.style.display = isLoggedIn ? 'block' : 'none';
            console.log('Logout link display:', logoutLink.style.display);
            
            // Asegurar que los estilos sean consistentes
            if (isLoggedIn) {
                logoutLink.style.display = 'block';
                logoutLink.style.visibility = 'visible';
                logoutLink.style.opacity = '1';
            } else {
                logoutLink.style.display = 'none';
                logoutLink.style.visibility = 'hidden';
                logoutLink.style.opacity = '0';
            }
        }
        
        // Forzar un reflow para asegurar que los cambios se apliquen
        if (logoutLink) void logoutLink.offsetHeight;
    }
    
    // Inicializar UI
    updateAuthUI(isAuthenticated);
    
    // Manejador del menú hamburguesa
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('is-active');
            navLinks.classList.toggle('is-active');
        });
    }
    
    // Manejador del botón de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Mostrar confirmación
            if (confirm('Are you sure you want to log out?')) {
                // Eliminar estado de autenticación
                localStorage.removeItem('token');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                
                // Actualizar UI
                updateAuthUI(false);
                
                // Redirigir a la página de inicio
                window.location.href = '../index.html';
                
                // Mostrar notificación de cierre de sesión exitoso
                if (typeof Toastify !== 'undefined') {
                    Toastify({
                        text: 'You have been successfully logged out',
                        duration: 3000,
                        gravity: 'bottom',
                        position: 'right',
                        style: {
                            background: 'linear-gradient(to right, #4CAF50, #45a049)',
                            color: '#FFFFFF',
                            fontFamily: "'Poppins', sans-serif",
                            fontSize: '16px',
                            padding: '18px 25px',
                            borderRadius: '8px'
                        }
                    }).showToast();
                }
            }
        });
    }
    
    // Cerrar el menú móvil al hacer clic en un enlace
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (hamburgerMenu && navLinks) {
                hamburgerMenu.classList.remove('is-active');
                navLinks.classList.remove('is-active');
            }
        });
    });
});
