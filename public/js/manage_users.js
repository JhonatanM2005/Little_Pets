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
        initializeUserManagement(token);
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al verificar permisos');
        window.location.href = '../index.html';
    });
});

// Función que inicializa la gestión de usuarios una vez verificados los permisos

// Función que inicializa la gestión de usuarios una vez verificados los permisos
function initializeUserManagement(token) {
    // Referencias a elementos del DOM
    const usersTable = document.getElementById('users-table').getElementsByTagName('tbody')[0];
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const cedulaInput = document.getElementById('cedula');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const userTypeSelect = document.getElementById('user-type');
    const statusSelect = document.getElementById('status');
    const saveBtn = document.querySelector('.save-btn');
    const deleteBtn = document.querySelector('.delete-btn');
    const addBtn = document.querySelector('.add-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const modal = document.getElementById('user-modal');
    const closeModalBtn = document.querySelector('.close-modal');
    const modalTitle = document.getElementById('modal-title');
    
    // Variable para almacenar el ID del usuario seleccionado
    let selectedUserId = null;
    
    // Función para cargar los usuarios desde la API
    function loadUsers() {
        // Mostrar indicador de carga
        usersTable.innerHTML = '<tr><td colspan="6">Cargando usuarios...</td></tr>';
        
        // Obtener usuarios desde la API
        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los usuarios');
            }
            return response.json();
        })
        .then(users => {
            // Limpiar la tabla
            usersTable.innerHTML = '';
            
            // Verificar si hay usuarios
            if (users.length === 0) {
                usersTable.innerHTML = '<tr><td colspan="6">No hay usuarios registrados</td></tr>';
                return;
            }
            
            // Agregar cada usuario a la tabla
            users.forEach(user => {
                const row = document.createElement('tr');
                
                // Crear celdas para cada propiedad del usuario
                const nameCell = document.createElement('td');
                nameCell.textContent = user.name;
                
                const emailCell = document.createElement('td');
                emailCell.textContent = user.email;
                
                const cedulaCell = document.createElement('td');
                cedulaCell.textContent = user.cedula;
                
                const typeCell = document.createElement('td');
                typeCell.textContent = user.role;
                
                const statusCell = document.createElement('td');
                statusCell.textContent = user.status || 'active';
                
                // Crear celda para botones de acción
                const actionsCell = document.createElement('td');
                const editBtn = document.createElement('button');
                editBtn.textContent = 'Edit';
                editBtn.classList.add('edit-btn');
                editBtn.addEventListener('click', () => selectUser(user));
                
                actionsCell.appendChild(editBtn);
                
                // Agregar todas las celdas a la fila
                row.appendChild(nameCell);
                row.appendChild(emailCell);
                row.appendChild(cedulaCell);
                row.appendChild(typeCell);
                row.appendChild(statusCell);
                row.appendChild(actionsCell);
                
                // Agregar la fila a la tabla
                usersTable.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            usersTable.innerHTML = '<tr><td colspan="6">Error al cargar los usuarios</td></tr>';
        });
    }
    
    // Función para seleccionar un usuario para editar
    function selectUser(user) {
        selectedUserId = user._id;
        
        // Llenar el formulario con los datos del usuario
        nameInput.value = user.name;
        emailInput.value = user.email;
        cedulaInput.value = user.cedula;
        userTypeSelect.value = user.role;
        statusSelect.value = user.status || 'active';
        
        // Limpiar los campos de contraseña
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        
        // Abrir el modal en modo edición
        openModal('edit');
    }
    
    // Función para limpiar el formulario
    function clearForm() {
        selectedUserId = null;
        nameInput.value = '';
        emailInput.value = '';
        cedulaInput.value = '';
        passwordInput.value = '';
        confirmPasswordInput.value = '';
        userTypeSelect.value = 'user';
        statusSelect.value = 'active';
    }
    
    // Función para guardar un usuario (crear o actualizar)
    function saveUser() {
        console.log('Iniciando saveUser...');
        
        // Validar el formulario
        if (!validateForm()) {
            console.log('Validación del formulario fallida');
            return;
        }
        
        // Crear objeto con los datos del usuario
        const userData = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            cedula: cedulaInput.value.trim(),
            role: userTypeSelect.value,
            status: statusSelect.value
        };
        
        console.log('Datos del usuario a guardar:', userData);
        
        // Si hay contraseña, agregarla al objeto
        if (passwordInput.value) {
            userData.password = passwordInput.value;
            console.log('Contraseña incluida en la solicitud');
        } else if (!selectedUserId) {
            // Si es un nuevo usuario, la contraseña es obligatoria
            alert('La contraseña es obligatoria para crear un nuevo usuario');
            console.log('Error: Contraseña obligatoria para nuevo usuario');
            return;
        }
        
        let url, method;
        
        // Si es un usuario existente, actualizar
        if (selectedUserId) {
            url = `/api/users/${selectedUserId}`;
            method = 'PUT';
            console.log(`Actualizando usuario con ID: ${selectedUserId}`);
        } else {
            // Crear nuevo usuario
            url = '/api/users';
            method = 'POST';
            console.log('Creando nuevo usuario');
        }
        
        // Mostrar indicador de carga
        const saveButtonText = saveBtn.textContent;
        saveBtn.textContent = 'Guardando...';
        saveBtn.disabled = true;
        
        console.log(`Enviando solicitud ${method} a ${url}`);
        console.log('Datos enviados:', JSON.stringify(userData));
        
        // Enviar solicitud a la API
        fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            console.log('Respuesta recibida:', response.status);
            if (!response.ok) {
                return response.json().then(data => {
                    console.error('Error en la respuesta:', data);
                    throw new Error(data.message || 'Error al guardar el usuario');
                });
            }
            return response.json();
        })
        .then(data => {
            console.log('Usuario guardado exitosamente:', data);
            // Mostrar mensaje de éxito
            if (selectedUserId) {
                alert('Usuario actualizado correctamente');
            } else {
                alert('Usuario creado correctamente');
            }
            
            // Recargar la tabla, limpiar el formulario y cerrar el modal
            loadUsers();
            closeModal();
        })
        .catch(error => {
            console.error('Error al guardar usuario:', error);
            alert(error.message || 'Error al guardar el usuario');
        })
        .finally(() => {
            // Restaurar el botón
            saveBtn.textContent = saveButtonText;
            saveBtn.disabled = false;
        });
    }
    
    // Función para validar el formulario
    function validateForm() {
        // Validar que los campos obligatorios estén completos
        if (!nameInput.value || !emailInput.value || !cedulaInput.value) {
            alert('Por favor, completa todos los campos obligatorios (nombre, email y cédula)');
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
    
    // Función para eliminar un usuario
    function deleteUser() {
        if (!selectedUserId) {
            alert('Por favor, selecciona un usuario para eliminar');
            return;
        }
        
        // Confirmar antes de eliminar
        if (!confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
            return;
        }
        
        // Enviar solicitud a la API
        fetch(`/api/users/${selectedUserId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || 'Error al eliminar el usuario');
                });
            }
            return response.json();
        })
        .then(data => {
            alert('Usuario eliminado correctamente');
            loadUsers();
            closeModal();
        })
        .catch(error => {
            console.error('Error:', error);
            alert(error.message || 'Error al eliminar el usuario');
        });
    }
    
    // Referencias a elementos de búsqueda
    const searchNameInput = document.getElementById('search-name');
    const searchEmailInput = document.getElementById('search-email');
    const searchCedulaInput = document.getElementById('search-cedula');
    const searchNameBtn = document.getElementById('search-name-btn');
    const searchEmailBtn = document.getElementById('search-email-btn');
    const searchCedulaBtn = document.getElementById('search-cedula-btn');
    const resetSearchBtn = document.getElementById('reset-search-btn');
    
    // Variables para almacenar todos los usuarios y los filtros actuales
    let allUsers = [];
    let currentFilters = {
        name: '',
        email: '',
        cedula: ''
    };
    
    // Agregar event listeners para los botones de búsqueda
    searchNameBtn.addEventListener('click', () => {
        currentFilters.name = searchNameInput.value.toLowerCase();
        filterUsers();
    });
    
    searchEmailBtn.addEventListener('click', () => {
        currentFilters.email = searchEmailInput.value.toLowerCase();
        filterUsers();
    });
    
    searchCedulaBtn.addEventListener('click', () => {
        currentFilters.cedula = searchCedulaInput.value.toLowerCase();
        filterUsers();
    });
    
    resetSearchBtn.addEventListener('click', () => {
        // Limpiar los campos de búsqueda
        searchNameInput.value = '';
        searchEmailInput.value = '';
        searchCedulaInput.value = '';
        
        // Resetear los filtros
        currentFilters = {
            name: '',
            email: '',
            cedula: ''
        };
        
        // Mostrar todos los usuarios
        displayUsers(allUsers);
    });
    
    // Función para filtrar usuarios
    function filterUsers() {
        const filteredUsers = allUsers.filter(user => {
            const nameMatch = !currentFilters.name || user.name.toLowerCase().includes(currentFilters.name);
            const emailMatch = !currentFilters.email || user.email.toLowerCase().includes(currentFilters.email);
            const cedulaMatch = !currentFilters.cedula || (user.cedula && user.cedula.toLowerCase().includes(currentFilters.cedula));
            
            return nameMatch && emailMatch && cedulaMatch;
        });
        
        displayUsers(filteredUsers);
    }
    
    // Funciones para manejar el modal
    function openModal(mode) {
        if (mode === 'add') {
            modalTitle.textContent = 'Add New User';
            deleteBtn.style.display = 'none';
            clearForm();
        } else if (mode === 'edit') {
            modalTitle.textContent = 'Edit User';
            deleteBtn.style.display = 'inline-block';
        }
        modal.style.display = 'block';
    }
    
    function closeModal() {
        modal.style.display = 'none';
        clearForm();
    }
    
    // Eventos de los botones
    saveBtn.addEventListener('click', saveUser);
    deleteBtn.addEventListener('click', deleteUser);
    addBtn.addEventListener('click', function() {
        openModal('add');
    });
    
    cancelBtn.addEventListener('click', closeModal);
    closeModalBtn.addEventListener('click', closeModal);
    
    // Cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });
    
    // Cargar usuarios al inicializar
    loadUsers();
    
    // Función para cargar los usuarios desde la API
    function loadUsers() {
        // Mostrar indicador de carga
        usersTable.innerHTML = '<tr><td colspan="6">Cargando usuarios...</td></tr>';
        
        // Obtener usuarios desde la API
        fetch('/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener los usuarios');
            }
            return response.json();
        })
        .then(users => {
            // Guardar todos los usuarios para filtrado
            allUsers = users;
            
            // Mostrar los usuarios
            displayUsers(users);
        })
        .catch(error => {
            console.error('Error:', error);
            usersTable.innerHTML = '<tr><td colspan="6">Error al cargar los usuarios</td></tr>';
        });
    }
    
    // Función para mostrar usuarios en la tabla
    function displayUsers(users) {
        // Limpiar la tabla
        usersTable.innerHTML = '';
        
        // Verificar si hay usuarios
        if (users.length === 0) {
            usersTable.innerHTML = '<tr><td colspan="6">No hay usuarios que coincidan con la búsqueda</td></tr>';
            return;
        }
        
        // Agregar cada usuario a la tabla
        users.forEach(user => {
            const row = document.createElement('tr');
            
            // Crear celdas para cada propiedad del usuario
            const nameCell = document.createElement('td');
            nameCell.textContent = user.name;
            
            const emailCell = document.createElement('td');
            emailCell.textContent = user.email;
            
            const cedulaCell = document.createElement('td');
            cedulaCell.textContent = user.cedula;
            
            const typeCell = document.createElement('td');
            typeCell.textContent = user.role;
            
            const statusCell = document.createElement('td');
            statusCell.textContent = user.status || 'active';
            
            // Crear celda para botones de acción
            const actionsCell = document.createElement('td');
            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => selectUser(user));
            
            // Aplicar estilos al botón de edición
            editBtn.style.backgroundColor = '#FF8A2B';
            editBtn.style.color = 'white';
            editBtn.style.border = 'none';
            editBtn.style.borderRadius = '5px';
            editBtn.style.padding = '5px 10px';
            editBtn.style.cursor = 'pointer';
            
            actionsCell.appendChild(editBtn);
            
            // Agregar todas las celdas a la fila
            row.appendChild(nameCell);
            row.appendChild(emailCell);
            row.appendChild(cedulaCell);
            row.appendChild(typeCell);
            row.appendChild(statusCell);
            row.appendChild(actionsCell);
            
            // Agregar la fila a la tabla
            usersTable.appendChild(row);
        });
    }
}
