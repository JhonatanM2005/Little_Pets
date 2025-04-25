document.addEventListener('DOMContentLoaded', function() {
    // Get all testimonial slides and navigation buttons
    const slides = document.querySelectorAll('.testimonial-slide');
    const navButtons = document.querySelectorAll('.nav-button');
    
    // Add click event listeners to navigation buttons
    navButtons.forEach(button => {
      button.addEventListener('click', function() {
        // Get the slide index from the data attribute
        const slideIndex = parseInt(this.getAttribute('data-slide'));
        
        // Show the selected slide and hide others
        showSlide(slideIndex);
      });
    });
    
    // Function to show a specific slide
    function showSlide(index) {
      // Hide all slides and remove active class from nav buttons
      slides.forEach(slide => {
        slide.classList.remove('active');
      });
      
      navButtons.forEach(button => {
        button.classList.remove('active');
      });
      
      // Show the selected slide and mark its nav button as active
      slides[index].classList.add('active');
      navButtons[index].classList.add('active');
    }
    
    // Optional: Auto-rotate testimonials
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function autoRotate() {
      currentSlide = (currentSlide + 1) % totalSlides;
      showSlide(currentSlide);
    }
    
    // Uncomment the following line to enable auto-rotation (every 5 seconds)
    const slideInterval = setInterval(autoRotate, 5000);
    
    // Optional: Add video play functionality
    const playButton = document.querySelector('.play-button');
    const videoElement = document.querySelector('.video-thumbnail');
    
    if (playButton && videoElement) {
        playButton.addEventListener('click', function() {
            // Iniciar la reproducción del video
            videoElement.play();
            
            // Ocultar el botón de play
            playButton.style.display = 'none';
            
            // Agregar controles al video cuando comience
            videoElement.controls = true;
        });

        // Mostrar el botón de play nuevamente cuando el video termine
        videoElement.addEventListener('ended', function() {
            playButton.style.display = 'block';
            videoElement.controls = false;
        });
    }
  });