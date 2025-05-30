document.addEventListener('DOMContentLoaded', function() {
    // Función para aprobar un formulario
    function approveForm(formId) {
        // Aquí iría la lógica para aprobar el formulario en el backend
        console.log(`Aprobando formulario con ID: ${formId}`);
        
        // Simulación de aprobación (en un entorno real, esto sería una llamada a la API)
        alert(`Formulario #${formId} aprobado exitosamente`);
        
        // Actualizar el estado en la interfaz
        updateFormStatus(formId, 'approved');
        
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
        
        // Simulación de rechazo (en un entorno real, esto sería una llamada a la API)
        alert(`Formulario #${formId} rechazado`);
        
        // Actualizar el estado en la interfaz
        updateFormStatus(formId, 'rejected');
        
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
