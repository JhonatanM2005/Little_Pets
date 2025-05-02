function switchCategory(type) {
    const cat = document.querySelector('.cat');
    const dog = document.querySelector('.dog');

    const catImg = document.getElementById('catImg');
    const dogImg = document.getElementById('dogImg');

    if (type === 'cat') {
      cat.classList.add('selected');
      dog.classList.remove('selected');
      catImg.src = '../media/images/blob_cat_select.png';
      dogImg.src = '../media/images/blob_dog_unselect.png';
    } else {
      dog.classList.add('selected');
      cat.classList.remove('selected');
      catImg.src = '../media/images/blob_cat_unselect.png';
      dogImg.src = '../media/images/blob_dog_select.png';
    }
  }