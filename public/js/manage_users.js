document.addEventListener('DOMContentLoaded', function() {
    // Datos de ejemplo para usuarios (en un entorno real, esto vendría de una base de datos)
    const sampleUsers = [
        {
            id: '12345',
            name: 'Admin User',
            email: 'admin@littlepets.com',
            type: 'admin',
            status: 'active'
        },
        {
            id: '67890',
            name: 'John Operator',
            email: 'john@littlepets.com',
            type: 'operator',
            status: 'active'
        },
        {
            id: '54321',
            name: 'Jane Operator',
            email: 'jane@littlepets.com',
            type: 'operator',
            status: 'inactive'
        },
        {
            id: '98765',
            name: 'Regular User',
            email: 'user@example.com',
            type: 'user',
            status: 'active'
        }
    ];

    // Elementos del DOM
    const usersTable = document.getElementById('users-table');
    const userForm = document.querySelector('.user-form-section');
    const saveBtn = document.querySelector('.save-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const addBtn = document.querySelector('.add-btn');
    
    // Campos del formulario
    const idInput = document.getElementById('id-number');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const userTypeSelect = document.getElementById('user-type');
    const statusSelect = document.getElementById('status');
    
    // Variable para almacenar el ID del usuario seleccionado actualmente
    let selectedUserId = null;
    
    // Función para cargar los usuarios en la tabla
    function loadUsers() {
        const tbody = usersTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        sampleUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Crear las celdas de la tabla
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td><span class="user-type-badge ${user.type}">${user.type}</span></td>
                <td><span class="status-badge ${user.status}">${user.status}</span></td>
                <td class="user-actions">
                    <button class="edit-btn" data-id="${user.id}">Edit</button>
                    <button class="delete-btn" data-id="${user.id}">Delete</button>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        // Agregar eventos a los botones de editar y eliminar
        attachButtonEvents();
    }
    
    // Función para adjuntar eventos a los botones de la tabla
    function attachButtonEvents() {
        // Botones de editar
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                editUser(userId);
            });
        });
        
        // Botones de eliminar
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const userId = this.getAttribute('data-id');
                deleteUser(userId);
            });
        });
    }
    
    // Función para cargar los datos de un usuario en el formulario
    function editUser(userId) {
        // Buscar el usuario por ID
        const user = sampleUsers.find(u => u.id === userId);
        
        if (user) {
            // Cargar los datos en el formulario
            idInput.value = user.id;
            nameInput.value = user.name;
            emailInput.value = user.email;
            userTypeSelect.value = user.type;
            statusSelect.value = user.status;
            
            // Limpiar los campos de contraseña
            passwordInput.value = '';
            confirmPasswordInput.value = '';
            
            // Guardar el ID del usuario seleccionado
            selectedUserId = userId;
            
            // Desplazarse al formulario
            userForm.scrollIntoView({ behavior: 'smooth' });
        }
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
    
    // Función para eliminar un usuario
    function deleteUser(userId) {
        // Mostrar diálogo de confirmación personalizado
        showConfirmationDialog(
            `¿Estás seguro de que deseas eliminar al usuario con ID ${userId}?`,
            () => {
                // En un entorno real, aquí se haría una llamada a la API para eliminar el usuario
                
                // Eliminar el usuario de los datos de ejemplo
                const index = sampleUsers.findIndex(u => u.id === userId);
                if (index !== -1) {
                    sampleUsers.splice(index, 1);
                    
                    // Recargar la tabla
                    loadUsers();
                    
                    // Limpiar el formulario si el usuario eliminado era el seleccionado
                    if (selectedUserId === userId) {
                        clearForm();
                    }
                    
                    // Mostrar notificación de éxito
                    showNotification('Usuario eliminado correctamente', true);
                } else {
                    showNotification('Error: No se pudo encontrar el usuario', false);
                }
            }
        );
    }
    
    // Función para limpiar el formulario
    function clearForm() {
        idInput.value = '';
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        userTypeSelect.value = 'user';
        statusSelect.value = 'active';
        
        selectedUserId = null;
    }
    
    // Función para guardar un usuario (crear o actualizar)
    function saveUser() {
        // Validar el formulario
        if (!validateForm()) {
            return;
        }
        
        // Obtener los datos del formulario
        const userData = {
            id: idInput.value,
            name: nameInput.value,
            email: emailInput.value,
            type: userTypeSelect.value,
            status: statusSelect.value
        };
        
        if (selectedUserId) {
            // Actualizar usuario existente
            const index = sampleUsers.findIndex(u => u.id === selectedUserId);
            if (index !== -1) {
                sampleUsers[index] = userData;
                alert('Usuario actualizado correctamente');
            }
        } else {
            // Crear nuevo usuario
            sampleUsers.push(userData);
            alert('Usuario creado correctamente');
        }
        
        // Recargar la tabla y limpiar el formulario
        loadUsers();
        clearForm();
    }
    
    // Función para validar el formulario
    function validateForm() {
        // Validar que los campos obligatorios estén completos
        if (!idInput.value || !nameInput.value || !emailInput.value) {
            alert('Por favor, completa todos los campos obligatorios');
            return false;
        }
        
        // Validar el formato del email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput.value)) {
            alert('Por favor, ingresa un email válido');
            return false;
        }
        
        // Si es un nuevo usuario o se está cambiando la contraseña
        if (!selectedUserId || passwordInput.value) {
            // Validar que la contraseña tenga al menos 6 caracteres
            if (passwordInput.value.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return false;
            }
            
            // Validar que las contraseñas coincidan
            if (passwordInput.value !== confirmPasswordInput.value) {
                alert('Las contraseñas no coinciden');
                return false;
            }
        }
        
        return true;
    }
    
    // Eventos de los botones
    saveBtn.addEventListener('click', saveUser);
    
    deleteBtn.addEventListener('click', function() {
        if (selectedUserId) {
            deleteUser(selectedUserId);
        } else {
            alert('Por favor, selecciona un usuario para eliminar');
        }
    });
    
    addBtn.addEventListener('click', function() {
        clearForm();
        // Generar un ID aleatorio para el nuevo usuario
        idInput.value = Math.floor(10000 + Math.random() * 90000).toString();
    });
    
    // Inicializar la página
    loadUsers();
});
