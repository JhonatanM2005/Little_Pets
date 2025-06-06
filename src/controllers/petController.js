const Pet = require("../models/petModel");

exports.getPets = async (req, res) => {
  try {
    // Aplicar filtros si existen en la consulta
    const filter = {};
    
    if (req.query.type) {
      filter.type = req.query.type;
    }
    
    if (req.query.size) {
      filter.size = req.query.size;
    }
    
    // Si se especifica un estado de disponibilidad en la consulta
    if (req.query.availability) {
      // Si se solicitan todas las mascotas (availability=all), no aplicar filtro de disponibilidad
      if (req.query.availability !== 'all') {
        filter.availability = req.query.availability;
      }
    } else {
      // Por defecto, mostrar solo mascotas disponibles
      filter.availability = "available";
    }
    
    const pets = await Pet.find(filter);
    res.json(pets);
  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({ mensaje: "Error al obtener mascotas" });
  }
};

exports.getPetById = async (req, res) => {
  const { id } = req.params;
  try {
    const pet = await Pet.findById(id);

    if (!pet) {
      return res.status(404).json({ mensaje: "Mascota no encontrada" });
    }

    res.json(pet);
  } catch (error) {
    console.error("Error al obtener la mascota por ID:", error);
    if (error.kind === "ObjectId") {
      return res.status(400).json({ mensaje: "ID de mascota no válido" });
    }
    res
      .status(500)
      .json({ mensaje: "Error del servidor al obtener la mascota" });
  }
};

exports.createPet = async (req, res) => {
  // Guardar los IDs públicos de las imágenes para poder eliminarlas en caso de error
  let uploadedImagePublicIds = [];
  
  try {
    const {
      name,
      breed,
      age,
      size,
      type,
      sex,  // Cambiado de gender a sex para compatibilidad con el frontend
      vaccinated,
      sterilized,
      personality,
      availability,
      existingImageUrls,
      existingImagePublicIds,
    } = req.body;

    // Validaciones básicas
    if (!name || !type) {
      return res.status(400).json({ mensaje: "El nombre y tipo de mascota son obligatorios" });
    }

    // Convertir personality a array si viene como string
    let personalityArray = personality;
    if (typeof personality === 'string' && personality.trim() !== '') {
      personalityArray = personality.split(',').map(item => item.trim());
    } else if (!Array.isArray(personality)) {
      personalityArray = [];
    }

    // Manejar múltiples imágenes
    let images = [];
    let imagesPublicIds = [];
    
    // Si hay imágenes en req.body (subidas a través del middleware)
    if (req.body.images && Array.isArray(req.body.images) && req.body.images.length > 0) {
      images = req.body.images;
      imagesPublicIds = req.body.imagesPublicIds || [];
      uploadedImagePublicIds = [...imagesPublicIds]; // Guardar para eliminar en caso de error
    }
    // Si no hay imágenes nuevas pero hay URLs existentes (en caso de edición)
    else if (existingImageUrls && Array.isArray(existingImageUrls) && existingImageUrls.length > 0) {
      images = existingImageUrls;
      imagesPublicIds = existingImagePublicIds || [];
    }

    console.log("Imágenes a guardar:", images);
    console.log("IDs públicos a guardar:", imagesPublicIds);

    // Asegurarse de que la primera imagen siempre sea la imagen principal
    const image = images.length > 0 ? images[0] : '';
    const imagePublicId = imagesPublicIds.length > 0 ? imagesPublicIds[0] : '';

    const newPet = new Pet({
      name,
      breed,
      age: parseInt(age) || 0,
      size,
      type,
      gender: sex, // Mapear sex a gender para el modelo
      vaccinated: vaccinated === true || vaccinated === 'yes' || vaccinated === 'true',
      sterilized: sterilized === true || sterilized === 'yes' || sterilized === 'true',
      personality: personalityArray,
      availability,
      image,              // Imagen principal (primera imagen)
      imagePublicId,      // ID público de la imagen principal
      images,             // Array con todas las imágenes (incluyendo la principal)
      imagesPublicIds,    // Array con todos los IDs públicos
    });

    await newPet.save();
    res.status(201).json(newPet);
  } catch (error) {
    console.error("Error al crear mascota:", error);
    
    // Si hubo un error y tenemos IDs de imágenes subidas, eliminarlas de Cloudinary
    if (uploadedImagePublicIds.length > 0) {
      try {
        const cloudinary = require('../config/cloudinary');
        console.log("Eliminando imágenes de Cloudinary debido a error:", uploadedImagePublicIds);
        
        // Eliminar cada imagen de Cloudinary
        for (const publicId of uploadedImagePublicIds) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Imagen eliminada de Cloudinary: ${publicId}`);
        }
      } catch (deleteError) {
        console.error("Error al eliminar imágenes de Cloudinary:", deleteError);
      }
    }
    
    res.status(500).json({ mensaje: "Error al crear mascota", error: error.message });
  }
};

exports.updatePet = async (req, res) => {
  const { id } = req.params;
  try {
    console.log('=== INICIO DE ACTUALIZACIÓN DE MASCOTA ===');
    console.log('ID de mascota a actualizar:', id);
    console.log('Datos recibidos en req.body:', JSON.stringify(req.body));
    console.log('Archivos recibidos:', req.files ? req.files.length : 'ninguno');
    
    const {
      name,
      breed,
      age,
      size,
      type,
      sex,  // Cambiado de gender a sex para compatibilidad con el frontend
      vaccinated,
      sterilized,
      personality,
      availability,
      existingImageUrls,
      existingImagePublicIds,
    } = req.body;

    // Preparar datos para actualización
    const updateData = {
      name,
      breed,
      age: parseInt(age) || 0,
      size,
    };
    
    // Manejar el tipo (cat/dog)
    if (type) {
      updateData.type = type.toLowerCase();
      console.log('Tipo de mascota:', updateData.type);
    }
    
    // Manejar el género (sex se mapea a gender en el modelo)
    if (sex) {
      updateData.gender = sex.toLowerCase();
      console.log('Género de mascota (desde sex):', updateData.gender);
    }
    
    // Manejar valores booleanos
    updateData.vaccinated = vaccinated === true || vaccinated === 'yes' || vaccinated === 'true';
    updateData.sterilized = sterilized === true || sterilized === 'yes' || sterilized === 'true';
    
    // Manejar disponibilidad
    if (availability) {
      updateData.availability = availability.toLowerCase();
      console.log('Disponibilidad de mascota:', updateData.availability);
    } else {
      updateData.availability = 'available'; // Valor por defecto
      console.log('Usando disponibilidad por defecto: available');
    }

    // Convertir personality a array si viene como string
    if (personality !== undefined) {
      if (typeof personality === 'string' && personality.trim() !== '') {
        updateData.personality = personality.split(',').map(item => item.trim());
      } else if (Array.isArray(personality)) {
        updateData.personality = personality;
      } else {
        updateData.personality = [];
      }
    }

    // Manejar múltiples imágenes
    let images = [];
    let imagesPublicIds = [];
    
    // Si hay imágenes en req.files (subidas a través del middleware)
    if (req.files && req.files.length > 0) {
      // Las URLs y public IDs ya fueron procesados por el middleware y están en req.cloudinaryResults
      if (req.cloudinaryResults && req.cloudinaryResults.length > 0) {
        images = req.cloudinaryResults.map(result => result.url);
        imagesPublicIds = req.cloudinaryResults.map(result => result.public_id);
        
        // Actualizar imágenes en los datos
        updateData.images = images;
        updateData.imagesPublicIds = imagesPublicIds;
        
        // La primera imagen siempre es la principal
        updateData.image = images[0];
        updateData.imagePublicId = imagesPublicIds[0];
      }
    }
    // Si no hay imágenes nuevas pero hay URLs existentes
    else if (existingImageUrls) {
      // Manejar tanto arrays como valores únicos
      let imageUrlsArray = existingImageUrls;
      let imagePublicIdsArray = existingImagePublicIds || [];
      
      // Convertir a array si no lo es
      if (!Array.isArray(imageUrlsArray)) {
        imageUrlsArray = [imageUrlsArray];
      }
      
      if (!Array.isArray(imagePublicIdsArray)) {
        imagePublicIdsArray = [imagePublicIdsArray];
      }
      
      console.log('URLs de imágenes existentes recibidas:', imageUrlsArray);
      console.log('IDs públicos existentes recibidos:', imagePublicIdsArray);
      
      // Actualizar solo si hay imágenes válidas
      if (imageUrlsArray.length > 0) {
        updateData.images = imageUrlsArray;
        updateData.imagesPublicIds = imagePublicIdsArray;
        
        // La primera imagen siempre es la principal
        updateData.image = imageUrlsArray[0];
        updateData.imagePublicId = imagePublicIdsArray.length > 0 ? imagePublicIdsArray[0] : '';
      }
    }

    const updatedPet = await Pet.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedPet) {
      return res.status(404).json({ mensaje: "Mascota no encontrada" });
    }

    res.json(updatedPet);
  } catch (error) {
    console.error("Error al actualizar mascota:", error);
    res.status(500).json({ mensaje: "Error al actualizar mascota", error: error.message });
  }
};

exports.deletePet = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPet = await Pet.findByIdAndDelete(id);
    
    if (!deletedPet) {
      return res.status(404).json({ mensaje: "Mascota no encontrada" });
    }
    
    res.json({ mensaje: "Mascota eliminada correctamente", pet: deletedPet });
  } catch (error) {
    console.error("Error al eliminar mascota:", error);
    res.status(500).json({ mensaje: "Error al eliminar mascota", error: error.message });
  }
};
