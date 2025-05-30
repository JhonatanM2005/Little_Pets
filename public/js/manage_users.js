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
    
    // Función para eliminar un usuario
    function deleteUser(userId) {
        // Confirmar la eliminación
        if (confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${userId}?`)) {
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
                
                // Mostrar mensaje de éxito
                alert('Usuario eliminado correctamente');
            }
        }
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
