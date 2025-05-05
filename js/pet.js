document.addEventListener("DOMContentLoaded", () => {
    let currentIndex = 0;
    const images = document.querySelectorAll('.carousel img');
  
    function showSlide(index) {
      images.forEach((img, i) => {
        img.classList.toggle('active', i === index);
      });
    }
  
    window.prevSlide = function () {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      showSlide(currentIndex);
    }
  
    window.nextSlide = function () {
      currentIndex = (currentIndex + 1) % images.length;
      showSlide(currentIndex);
    }
  
    // Mostrar la primera imagen por defecto
    showSlide(currentIndex);
  });
  