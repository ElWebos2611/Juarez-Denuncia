// Configuración ImgBB (reemplaza con tu API Key)
const IMGBB_API_KEY = "37d55bf458c8bf6cc83f3a998bde7c38";

document.getElementById("denunciaForm").addEventListener("submit", async function(e) {
  e.preventDefault();
  
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const statusElement = document.getElementById("mensaje-estado");
  
  submitBtn.disabled = true;
  submitBtn.textContent = "Enviando...";
  statusElement.innerHTML = `<span class="cargando">⌛ Subiendo imagen...</span>`;

  try {
    // 1. Preparar datos básicos
    const templateParams = {
      titulo: document.getElementById("titulo").value,
      section: document.getElementById("seccion").value,
      detalles: document.getElementById("detalles").value,
      imagen_url: "No se adjuntaron imágenes" // Valor por defecto
    };

    // 2. Subir imagen si existe
    const fileInput = document.getElementById("archivo");
    if (fileInput.files[0]) {
      const imagenUrl = await subirImagenImgBB(fileInput.files[0]);
      templateParams.imagen_url = `
        <a href="${imagenUrl}" target="_blank" style="color: #004aad; text-decoration: underline;">
          Ver imagen adjunta
        </a><br>
        <img src="${imagenUrl}" style="max-width: 300px; border: 1px solid #ddd; margin-top: 10px;">
      `;
    }

    // 3. Enviar por EmailJS
    await emailjs.send("service_gbzhc1d", "template_00pl9dp", templateParams);
    
    statusElement.innerHTML = `
      <span class="exito">✓ Denuncia enviada</span>
      <small style="display: block; margin-top: 5px;">La imagen estará disponible por 30 días</small>
    `;
    document.getElementById("denunciaForm").reset();

  } catch (error) {
    console.error("Error:", error);
    statusElement.innerHTML = `
      <span class="error">⚠️ ${error.message || "Error al enviar"}</span>
      <small style="display: block; margin-top: 5px;">Intenta con una imagen más pequeña o vuelve a intentarlo</small>
    `;
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Enviar denuncia";
  }
});

// Función para subir a ImgBB
async function subirImagenImgBB(file) {
  // Validar imagen (max 5MB para ImgBB gratis)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("La imagen es muy grande (máximo 5MB)");
  }

  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(data.error?.message || "Error al subir imagen");
  }
  
  return data.data.url; // Devuelve URL como: https://i.ibb.co/abc123/foto.jpg
}