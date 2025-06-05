document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el usuario está autenticado y tiene permisos de administrador
    function getToken() {
        return localStorage.getItem('token');
    }
    
    const token = getToken();
    
    if (!token) {
        // Si no hay token, redirigir al inicio de sesión
        alert('Debes iniciar sesión para acceder a esta página');
        window.location.href = '../index.html';
        return;
    }
    
    // Verificar el rol del usuario
    fetch('/api/users/profile', {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error al obtener el perfil');
        }
        return response.json();
    })
    .then(user => {
        // Verificar si el usuario tiene rol de administrador
        if (user.role !== 'admin') {
            // Si no es administrador, mostrar mensaje y redirigir
            alert('No tienes permisos para acceder a esta página');
            window.location.href = '../index.html';
            return;
        }
        
        // Si es administrador, continuar con la carga de la página
        initializeUserManagement();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al verificar permisos');
        window.location.href = '../index.html';
    });
});

// Función que inicializa la gestión de usuarios una vez verificados los permisos
function initializeUserManagement() {
    // Datos de ejemplo para usuarios (en un entorno real, esto vendría de una base de datos)
    const sampleUsers = [
        {
            id: '12345',
            name: 'Juan Pérez',
            email: 'juan@example.com',
            type: 'admin',
            status: 'active'
        },
        {
            id: '67890',
            name: 'María López',
            email: 'maria@example.com',
            type: 'user',
            status: 'active'
        },
        {
            id: '54321',
            name: 'Carlos Rodríguez',
            email: 'carlos@example.com',
            type: 'operator',
            status: 'inactive'
        }
    ];
    
    // Referencias a elementos del DOM
    const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
    const idInput = document.getElementById('id-number');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const userTypeSelect = document.getElementById('user-type');
    const statusSelect = document.getElementById('status');
    const saveBtn = document.querySelector('.save-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const addBtn = document.querySelector('.add-btn');
    
    // Variable para almacenar el ID del usuario seleccionado
    let selectedUserId = null;
    
    // Función para cargar los usuarios en la tabla
    function loadUsers() {
        // Limpiar la tabla
        usersTable.innerHTML = '';
        
        // Agregar cada usuario a la tabla
        sampleUsers.forEach(user => {
            const row = document.createElement('tr');
            
            // Crear celdas para cada propiedad del usuario
            const idCell = document.createElement('td');
            idCell.textContent = user.id;
            
            const nameCell = document.createElement('td');
            nameCell.textContent = user.name;
            
            const emailCell = document.createElement('td');
            emailCell.textContent = user.email;
            
            const typeCell = document.createElement('td');
            typeCell.textContent = user.type;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = user.status;
            
            // Crear celda para botones de acción
            const actionsCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => selectUser(user));
            
            actionsCell.appendChild(editBtn);
            
            // Agregar todas las celdas a la fila
            row.appendChild(idCell);
            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(typeCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            
            // Agregar la fila a la tabla
            usersTable.appendChild(row);
        });
    }
    
    // Función para seleccionar un usuario para editar
    function selectUser(user) {
        selectedUserId = user.id;
        
        // Llenar el formulario con los datos del usuario
        idInput.value = user.id;
        nameInput.value = user.name;
        emailInput.value = user.email;
        userTypeSelect.value = user.type;
        statusSelect.value = user.status;
        
        // Limpiar los campos de contraseña
        passwordInput.value = '';
        confirmPasswordInput.value = '';
    }
    
    // Función para limpiar el formulario
    function clearForm() {
        selectedUserId = null;
        idInput.value = '';
        nameInput.value = '';
        emailInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        userTypeSelect.value = 'user';
        statusSelect.value = 'active';
    }
    
    // Función para guardar un usuario (crear o actualizar)
    function saveUser() {
        // Validar el formulario
        if (!validateForm()) {
            return;
        }
        
        // Crear objeto con los datos del usuario
        const userData = {
            id: idInput.value,
            name: nameInput.value,
            email: emailInput.value,
            type: userTypeSelect.value,
            status: statusSelect.value
        };
        
        // Si es un usuario existente, actualizar
        if (selectedUserId) {
            const index = sampleUsers.findIndex(user => user.id === selectedUserId);
            
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
            const index = sampleUsers.findIndex(user => user.id === selectedUserId);
            
            if (index !== -1) {
                // Confirmar antes de eliminar
                if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
                    sampleUsers.splice(index, 1);
                    loadUsers();
                    clearForm();
                    alert('Usuario eliminado correctamente');
                }
            }
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
}
