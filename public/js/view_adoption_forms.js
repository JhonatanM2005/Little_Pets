document.addEventListener('DOMContentLoaded', function() {
    // Import PDF.js library
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

    // Variables para el visor de PDF
    let pdfDoc = null;
    let pageNum = 1;
    let pageRendering = false;
    let pageNumPending = null;
    let scale = 1.0;
    let canvas = document.getElementById('pdf-canvas');
    let ctx = canvas.getContext('2d');
    let currentPdfUrl = null;
    
    // Elementos de la interfaz
    const pdfLoader = document.getElementById('pdf-loader');
    const pdfNoDocument = document.getElementById('pdf-no-document');
    const pageIndicator = document.querySelector('.page-indicator');
    const zoomLevel = document.querySelector('.zoom-level');
    const zoomIn = document.getElementById('zoom-in');
    const zoomOut = document.getElementById('zoom-out');
    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    const fitWidth = document.getElementById('fit-width');
    const downloadPdf = document.getElementById('download-pdf');
    const formsTable = document.getElementById('forms-table');
    const statusTabs = document.querySelectorAll('.tab-btn');
    
    // Datos de ejemplo para formularios
    const sampleForms = [
        {
            id: '12345',
            name: 'John Doe',
            email: 'john@example.com',
            pet: 'Max (Dog)',
            date: '2023-05-15',
            status: 'pending',
            pdfUrl: '../media/pdfs/sample-form.pdf'
        },
        {
            id: '67890',
            name: 'Jane Smith',
            email: 'jane@example.com',
            pet: 'Whiskers (Cat)',
            date: '2023-05-20',
            status: 'approved',
            pdfUrl: '../media/pdfs/sample-form.pdf'
        },
        {
            id: '01234',
            name: 'Mike Johnson',
            email: 'mike@example.com',
            pet: 'Buddy (Dog)',
            date: '2023-05-18',
            status: 'rejected',
            pdfUrl: '../media/pdfs/sample-form.pdf'
        }
    ];
    
    // Función para renderizar una página del PDF
    function renderPage(num) {
        pageRendering = true;
        
        pdfLoader.style.display = 'block';
        
        pdfDoc.getPage(num).then(function(page) {
            const viewport = page.getViewport({ scale: scale });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Reset la transformación del canvas
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            
            // Limpiar el canvas antes de renderizar
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport,
                transform: [1, 0, 0, 1, 0, 0] // Forzar transformación normal
            };
            
            const renderTask = page.render(renderContext);
            
            // Esperar a que termine el renderizado
            renderTask.promise.then(function() {
                pageRendering = false;
                pdfLoader.style.display = 'none';
                
                // Si hay una página pendiente, renderizarla
                if (pageNumPending !== null) {
                    renderPage(pageNumPending);
                    pageNumPending = null;
                }
            });
        });
        
        // Actualizar el indicador de página
        pageIndicator.textContent = `${num} / ${pdfDoc.numPages}`;
    }
    
    // Función para cambiar de página
    function queueRenderPage(num) {
        if (pageRendering) {
            pageNumPending = num;
        } else {
            renderPage(num);
        }
    }
    
    // Ir a la página anterior
    function onPrevPage() {
        if (pageNum <= 1) {
            return;
        }
        pageNum--;
        queueRenderPage(pageNum);
    }
    
    // Ir a la página siguiente
    function onNextPage() {
        if (pageNum >= pdfDoc.numPages) {
            return;
        }
        pageNum++;
        queueRenderPage(pageNum);
    }
    
    // Función para cambiar el zoom
    function changeZoom(delta) {
        scale += delta;
        
        // Limitar el zoom entre 0.5 y 3
        scale = Math.max(0.5, Math.min(3, scale));
        
        // Actualizar el indicador de zoom
        zoomLevel.textContent = `${Math.round(scale * 100)}%`;
        
        // Volver a renderizar la página con el nuevo zoom
        queueRenderPage(pageNum);
    }
    
    // Función para ajustar al ancho
    function fitToWidth() {
        // Obtener el ancho del contenedor
        const containerWidth = document.querySelector('.document-content').clientWidth - 40; // Restar el padding
        
        // Obtener el ancho de la página actual
        pdfDoc.getPage(pageNum).then(function(page) {
            const viewport = page.getViewport({ scale: 1.0 });
            
            // Calcular la escala necesaria para ajustar al ancho
            scale = containerWidth / viewport.width;
            
            // Actualizar el indicador de zoom
            zoomLevel.textContent = `${Math.round(scale * 100)}%`;
            
            // Volver a renderizar la página
            queueRenderPage(pageNum);
        });
    }
    
    // Función para cargar un PDF
    function loadPDF(url) {
        // Mostrar el loader
        pdfLoader.style.display = 'block';
        canvas.style.display = 'none';
        pdfNoDocument.style.display = 'none';
        
        // Guardar la URL actual
        currentPdfUrl = url;
        
        // Cargar el documento
        pdfjsLib.getDocument(url).promise.then(function(pdfDoc_)
        {
            console.log('PDF loaded successfully');
            pdfDoc = pdfDoc_;
            
            // Resetear la página y el zoom
            pageNum = 1;
            scale = 1.0;
            zoomLevel.textContent = '100%';
            
            // Mostrar el canvas y ocultar el loader
            canvas.style.display = 'block';
            pdfLoader.style.display = 'none';
            
            // Renderizar la primera página
            renderPage(pageNum);
        }).catch(function(error) {
            console.error('Error loading PDF:', error);
            pdfLoader.style.display = 'none';
            pdfNoDocument.style.display = 'block';
        });
    }
    
    // Función para descargar el PDF actual
    function downloadCurrentPdf() {
        if (currentPdfUrl) {
            const link = document.createElement('a');
            link.href = currentPdfUrl;
            link.download = currentPdfUrl.split('/').pop();
            link.target = '_blank';
            link.click();
        }
    }
    
    // Función para renderizar la tabla de formularios según el estado seleccionado
    function renderFormsTable(status) {
        const tbody = formsTable.querySelector('tbody');
        tbody.innerHTML = '';
        
        // Filtrar los formularios por estado
        const filteredForms = sampleForms.filter(form => form.status === status);
        
        if (filteredForms.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" class="no-results">No forms found</td>`;
            tbody.appendChild(row);
            
            // Ocultar el canvas y mostrar el mensaje de no documento
            canvas.style.display = 'none';
            pdfLoader.style.display = 'none';
            pdfNoDocument.style.display = 'block';
            
            return;
        }
        
        // Crear las filas de la tabla
        filteredForms.forEach((form, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${form.id}</td>
                <td>${form.name}</td>
                <td>${form.email}</td>
                <td>${form.pet}</td>
                <td>${form.date}</td>
            `;
            
            // Añadir clase 'selected-row' a la primera fila
            if (index === 0) {
                row.classList.add('selected-row');
                
                // Cargar el PDF de la primera fila
                loadPDF(form.pdfUrl);
            }
            
            // Añadir evento click para seleccionar la fila y cargar el PDF
            row.addEventListener('click', function() {
                // Quitar la clase 'selected-row' de todas las filas
                tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
                
                // Añadir la clase 'selected-row' a la fila seleccionada
                row.classList.add('selected-row');
                
                // Cargar el PDF
                loadPDF(form.pdfUrl);
            });
            
            tbody.appendChild(row);
        });
    }
    
    // Función para buscar formularios
    function searchForms(field, value) {
        // Implementar la búsqueda cuando se conecte a la base de datos
        console.log(`Searching for ${value} in field ${field}`);
    }
    
    // Event listeners
    
    // Botones de zoom
    zoomIn.addEventListener('click', () => changeZoom(0.1));
    zoomOut.addEventListener('click', () => changeZoom(-0.1));
    
    // Botones de navegación
    prevPage.addEventListener('click', onPrevPage);
    nextPage.addEventListener('click', onNextPage);
    
    // Botón de ajustar al ancho
    fitWidth.addEventListener('click', fitToWidth);
    
    // Botón de descarga
    downloadPdf.addEventListener('click', downloadCurrentPdf);
    
    // Pestañas de estado
    statusTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Quitar la clase 'active' de todas las pestañas
            statusTabs.forEach(t => t.classList.remove('active'));
            
            // Añadir la clase 'active' a la pestaña seleccionada
            this.classList.add('active');
            
            // Renderizar la tabla según el estado seleccionado
            renderFormsTable(this.dataset.status);
        });
    });
    
    // Botones de búsqueda
    document.querySelectorAll('.search-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const field = this.dataset.search;
            const value = document.getElementById(`search-${field}`).value;
            searchForms(field, value);
        });
    });
    
    // Inicialización
    
    // Renderizar la tabla de formularios pendientes al cargar la página
    renderFormsTable('pending');
});