document.addEventListener('DOMContentLoaded', function() {
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

    // Función para aprobar un formulario
    function approveForm(formId) {
        // Aquí iría la lógica para aprobar el formulario en el backend
        console.log(`Aprobando formulario con ID: ${formId}`);
        
        // Actualizar el estado en la interfaz
        updateFormStatus(formId, 'approved');
        
        // Mostrar notificación de éxito
        showNotification(`Formulario #${formId} aprobado exitosamente`, true);
        
        // Recargar la tabla para mostrar los cambios
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            activeTab.click();
        }
    }
    
    // Función para rechazar un formulario
    function rejectForm(formId) {
        // Aquí iría la lógica para rechazar el formulario en el backend
        console.log(`Rechazando formulario con ID: ${formId}`);
        
        // Actualizar el estado en la interfaz
        updateFormStatus(formId, 'rejected');
        
        // Mostrar notificación
        showNotification(`Formulario #${formId} ha sido rechazado`, false);
        
        // Recargar la tabla para mostrar los cambios
        const activeTab = document.querySelector('.tab-btn.active');
        if (activeTab) {
            activeTab.click();
        }
    }
    
    // Función para actualizar el estado de un formulario en los datos
    function updateFormStatus(formId, newStatus) {
        // Buscar el formulario en los datos
        // Nota: Esta función asume que hay una variable global 'sampleForms' definida en view_adoption_forms.js
        if (window.sampleForms) {
            const formIndex = window.sampleForms.findIndex(form => form.id === formId);
            if (formIndex !== -1) {
                window.sampleForms[formIndex].status = newStatus;
            }
        }
    }
    
    // Agregar eventos a los botones de aprobar y rechazar cuando se crean dinámicamente
    document.addEventListener('click', function(event) {
        // Botón de aprobar
        if (event.target.classList.contains('approve-btn')) {
            const formId = event.target.getAttribute('data-id');
            if (formId) {
                approveForm(formId);
            }
        }
        
        // Botón de rechazar
        if (event.target.classList.contains('reject-btn')) {
            const formId = event.target.getAttribute('data-id');
            if (formId) {
                rejectForm(formId);
            }
        }
    });
});
