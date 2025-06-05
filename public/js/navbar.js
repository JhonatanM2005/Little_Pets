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
    
    // Función para mostrar diálogo de confirmación personalizado
    function showConfirmationDialog(message, onConfirm, onCancel) {
        // Crear contenedor del diálogo
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            font-family: 'Poppins', sans-serif;
        `;
        
        // Crear contenido del diálogo
        dialog.innerHTML = `
            <div style="
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                max-width: 400px;
                width: 90%;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            ">
                <h3 style="margin-top: 0; color: #333; font-size: 20px; margin-bottom: 20px;">
                    ${message}
                </h3>
                <div style="display: flex; justify-content: center; gap: 15px; margin-top: 25px;">
                    <button id="confirmBtn" style="
                        background: #FF8A2B;
                        color: white;
                        border: none;
                        padding: 10px 25px;
                        border-radius: 6px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.3s;
                        font-family: 'Poppins', sans-serif;
                    ">
                        Confirmar
                    </button>
                    <button id="cancelBtn" style="
                        background: #f0f0f0;
                        color: #666;
                        border: 1px solid #ddd;
                        padding: 10px 25px;
                        border-radius: 6px;
                        font-size: 16px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.3s;
                        font-family: 'Poppins', sans-serif;
                    ">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        // Agregar al documento
        document.body.appendChild(dialog);
        
        // Manejadores de eventos
        dialog.querySelector('#confirmBtn').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (typeof onConfirm === 'function') onConfirm();
        });
        
        dialog.querySelector('#cancelBtn').addEventListener('click', () => {
            document.body.removeChild(dialog);
            if (typeof onCancel === 'function') onCancel();
        });
    }
    
    // Función para mostrar notificación con Toastify
    function showNotification(message, isSuccess = true) {
        if (typeof Toastify !== 'undefined') {
            Toastify({
                text: message,
                duration: 3000,
                gravity: 'bottom',
                position: 'right',
                style: {
                    background: isSuccess 
                        ? 'linear-gradient(to right, #4CAF50, #45a049)'
                        : 'linear-gradient(to right, #f44336, #d32f2f)',
                    color: '#FFFFFF',
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: '16px',
                    padding: '18px 25px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                }
            }).showToast();
        }
    }
    
    // Manejador del botón de logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Mostrar diálogo de confirmación personalizado
            showConfirmationDialog('¿Estás seguro de que deseas cerrar sesión?', () => {
                // Eliminar estado de autenticación
                localStorage.removeItem('token');
                localStorage.removeItem('isAuthenticated');
                localStorage.removeItem('userEmail');
                localStorage.removeItem('userRole');
                
                // Actualizar UI
                updateAuthUI(false);
                
                // Mostrar notificación de éxito
                showNotification('Has cerrado sesión correctamente', true);
                
                // Redirigir después de un breve retraso para que se vea la notificación
                setTimeout(() => {
                    window.location.href = '../index.html';
                }, 1500);
            });
        });
    }
    
    // Cerrar el menú móvil al hacer clic en un enlace
    const navItems = document.querySelectorAll('.nav-links a, .nav-links #logout-btn');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            if (hamburgerMenu && navLinks) {
                hamburgerMenu.classList.remove('is-active');
                navLinks.classList.remove('is-active');
            }
        });
    });
});
