/**
 * Módulo de gestión de reclutas para el Sistema de Gestión de Reclutas
 * 
 * Maneja la visualización, creación, actualización y eliminación de reclutas
 */

// Lista global de reclutas
let reclutas = [];

// ID del recluta actual para operaciones
let currentReclutaId = null;

// Imagen temporal para subir
let reclutaImage = null;

/**
 * Cargar reclutas desde la API
 * @returns {Promise<Array>} - Lista de reclutas
 */
async function loadReclutas() {
  try {
    const response = await api.reclutas.getAll();
    reclutas = response.data;
    
    // Mostrar reclutas en la tabla
    displayReclutas(reclutas);
    
    return reclutas;
  } catch (error) {
    showNotification('Error al cargar reclutas: ' + error.message, 'error');
    return [];
  }
}

/**
 * Mostrar lista de reclutas en la tabla
 * @param {Array} reclutasToDisplay - Lista de reclutas a mostrar
 */
function displayReclutas(reclutasToDisplay) {
  const reclutasList = document.getElementById('reclutas-list');
  if (!reclutasList) return;
  
  reclutasList.innerHTML = '';
  
  if (!reclutasToDisplay || reclutasToDisplay.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = `<td colspan="6" style="text-align: center;">No se encontraron reclutas. ¡Agrega tu primer recluta!</td>`;
    reclutasList.appendChild(row);
  } else {
    reclutasToDisplay.forEach(recluta => {
      const row = document.createElement('tr');
      const badgeClass = recluta.estado === 'Activo' ? 'badge-success' : 
                        (recluta.estado === 'Rechazado' ? 'badge-danger' : 'badge-warning');
      
      row.innerHTML = `
          <td><img src="${recluta.foto_url}" alt="${recluta.nombre}" class="recluta-foto"></td>
          <td>${recluta.nombre}</td>
          <td>${recluta.email}</td>
          <td>${recluta.telefono}</td>
          <td><span class="badge ${badgeClass}">${recluta.estado}</span></td>
          <td>
              <button class="action-btn view-recluta-btn" data-id="${recluta._id}" title="Ver detalles">
                  <i class="fas fa-eye"></i>
              </button>
              <button class="action-btn edit-recluta-btn" data-id="${recluta._id}" title="Editar">
                  <i class="fas fa-edit"></i>
              </button>
              <button class="action-btn delete-recluta-btn" data-id="${recluta._id}" title="Eliminar">
                  <i class="fas fa-trash-alt"></i>
              </button>
          </td>
      `;
      reclutasList.appendChild(row);
    });
    
    // Añadir event listeners a los botones
    addReclutaButtonsListeners();
  }
  
  // Actualizar paginación (si hay datos de paginación)
  if (reclutasToDisplay.pagination) {
    updatePagination(reclutasToDisplay.pagination);
  } else {
    // Si no hay paginación, mostrar como una sola página
    updatePagination({
      pagina: 1,
      paginas: 1,
      total: reclutasToDisplay.length
    });
  }
}

/**
 * Añadir event listeners a los botones de acción de reclutas
 */
function addReclutaButtonsListeners() {
  // Botones de ver detalles
  document.querySelectorAll('.view-recluta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      viewRecluta(id);
    });
  });
  
  // Botones de editar
  document.querySelectorAll('.edit-recluta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      editRecluta(id);
    });
  });
  
  // Botones de eliminar
  document.querySelectorAll('.delete-recluta-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.currentTarget.getAttribute('data-id');
      confirmDeleteRecluta(id);
    });
  });
}

/**
 * Actualizar paginación
 * @param {Object} paginacion - Datos de paginación
 */
function updatePagination(paginacion) {
  const paginationElements = {
    prevBtn: document.getElementById('prev-page'),
    nextBtn: document.getElementById('next-page'),
    totalPages: document.getElementById('total-pages'),
    currentPage: document.querySelector('.current-page')
  };
  
  if (!paginationElements.totalPages) return;
  
  paginationElements.totalPages.textContent = paginacion.paginas || 1;
  
  if (paginationElements.currentPage) {
    paginationElements.currentPage.textContent = paginacion.pagina || 1;
  }
  
  // Habilitar/deshabilitar botones si existen
  if (paginationElements.prevBtn) {
    paginationElements.prevBtn.disabled = paginacion.pagina <= 1;
  }
  
  if (paginationElements.nextBtn) {
    paginationElements.nextBtn.disabled = paginacion.pagina >= paginacion.paginas;
  }
}

/**
 * Abrir modal para ver detalles de un recluta
 * @param {string} id - ID del recluta
 * @returns {Promise<void>}
 */
async function viewRecluta(id) {
  try {
    const response = await api.reclutas.getOne(id);
    const recluta = response.data;
    
    currentReclutaId = recluta._id;
    
    // Rellenar los datos en el modal
    const detailsElements = {
      nombre: document.getElementById('detail-recluta-nombre'),
      puesto: document.getElementById('detail-recluta-puesto'),
      email: document.getElementById('detail-recluta-email'),
      telefono: document.getElementById('detail-recluta-telefono'),
      fecha: document.getElementById('detail-recluta-fecha'),
      notas: document.getElementById('detail-recluta-notas'),
      pic: document.getElementById('detail-recluta-pic'),
      estado: document.getElementById('detail-recluta-estado'),
      viewButtons: document.getElementById('view-mode-buttons'),
      editForm: document.getElementById('edit-mode-form'),
      modal: document.getElementById('view-recluta-modal')
    };
    
    if (!detailsElements.modal) {
      showNotification('Error al mostrar detalles: Modal no encontrado', 'error');
      return;
    }
    
    // Rellenar los datos disponibles
    if (detailsElements.nombre) detailsElements.nombre.textContent = recluta.nombre;
    if (detailsElements.puesto) detailsElements.puesto.textContent = recluta.puesto || 'No especificado';
    if (detailsElements.email) detailsElements.email.textContent = recluta.email;
    if (detailsElements.telefono) detailsElements.telefono.textContent = recluta.telefono;
    if (detailsElements.fecha) detailsElements.fecha.textContent = formatDate(recluta.fecha_registro);
    if (detailsElements.notas) detailsElements.notas.textContent = recluta.notas || 'Sin notas';
    if (detailsElements.pic) detailsElements.pic.src = recluta.foto_url;
    
    // Actualizar estado
    if (detailsElements.estado) {
      detailsElements.estado.textContent = recluta.estado;
      detailsElements.estado.className = `badge badge-${recluta.estado === 'Activo' ? 'success' : (recluta.estado === 'Rechazado' ? 'danger' : 'warning')}`;
    }
    
    // Mostrar la vista y ocultar la edición
    if (detailsElements.viewButtons) detailsElements.viewButtons.style.display = 'flex';
    if (detailsElements.editForm) detailsElements.editForm.style.display = 'none';
    
    // Mostrar el modal
    detailsElements.modal.style.display = 'block';
  } catch (error) {
    showNotification('Error al cargar detalles del recluta: ' + error.message, 'error');
  }
}

/**
 * Abrir modal para editar un recluta
 * @param {string} id - ID del recluta
 * @returns {Promise<void>}
 */
async function editRecluta(id) {
  try {
    await viewRecluta(id);
    enableEditMode();
  } catch (error) {
    showNotification('Error al abrir formulario de edición: ' + error.message, 'error');
  }
}

/**
 * Habilitar modo de edición en modal de recluta
 */
function enableEditMode() {
  if (!reclutas || !currentReclutaId) return;
  
  const recluta = reclutas.find(r => r._id === currentReclutaId);
  if (!recluta) return;
  
  // Elementos del formulario
  const formElements = {
    nombre: document.getElementById('edit-recluta-nombre'),
    email: document.getElementById('edit-recluta-email'),
    telefono: document.getElementById('edit-recluta-telefono'),
    puesto: document.getElementById('edit-recluta-puesto'),
    estado: document.getElementById('edit-recluta-estado'),
    notas: document.getElementById('edit-recluta-notas'),
    viewButtons: document.getElementById('view-mode-buttons'),
    editForm: document.getElementById('edit-mode-form')
  };
  
  // Verificar si los elementos existen
  if (!formElements.nombre || !formElements.email || !formElements.telefono || 
      !formElements.viewButtons || !formElements.editForm) {
    showNotification('Error al cargar el formulario de edición', 'error');
    return;
  }
  
  // Rellenar formulario con datos actuales
  formElements.nombre.value = recluta.nombre;
  formElements.email.value = recluta.email;
  formElements.telefono.value = recluta.telefono;
  if (formElements.puesto) formElements.puesto.value = recluta.puesto || '';
  if (formElements.estado) formElements.estado.value = recluta.estado;
  if (formElements.notas) formElements.notas.value = recluta.notas || '';
  
  // Ocultar vista y mostrar edición
  formElements.viewButtons.style.display = 'none';
  formElements.editForm.style.display = 'block';
}

/**
 * Cancelar edición de recluta
 */
function cancelEdit() {
  const viewButtons = document.getElementById('view-mode-buttons');
  const editForm = document.getElementById('edit-mode-form');
  
  if (viewButtons) viewButtons.style.display = 'flex';
  if (editForm) editForm.style.display = 'none';
}

/**
 * Guardar cambios en el recluta
 * @returns {Promise<void>}
 */
async function saveReclutaChanges() {
  if (!reclutas || !currentReclutaId) {
    showNotification('Error: No hay datos para guardar', 'error');
    return;
  }
  
  // Obtener elementos del formulario
  const formElements = {
    nombre: document.getElementById('edit-recluta-nombre'),
    email: document.getElementById('edit-recluta-email'),
    telefono: document.getElementById('edit-recluta-telefono'),
    puesto: document.getElementById('edit-recluta-puesto'),
    estado: document.getElementById('edit-recluta-estado'),
    notas: document.getElementById('edit-recluta-notas'),
    saveButton: document.querySelector('.edit-mode-buttons .btn-primary')
  };
  
  // Verificar si los elementos obligatorios existen
  if (!formElements.nombre || !formElements.email || !formElements.telefono) {
    showNotification('Error al obtener datos del formulario', 'error');
    return;
  }
  
  // Obtener valores del formulario
  const nombre = formElements.nombre.value;
  const email = formElements.email.value;
  const telefono = formElements.telefono.value;
  const puesto = formElements.puesto ? formElements.puesto.value : '';
  const estado = formElements.estado ? formElements.estado.value : 'En proceso';
  const notas = formElements.notas ? formElements.notas.value : '';
  
  if (!nombre || !email || !telefono) {
    showNotification('Por favor, completa los campos obligatorios', 'error');
    return;
  }
  
  // Mostrar estado de carga si el botón existe
  if (formElements.saveButton) {
    formElements.saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    formElements.saveButton.disabled = true;
  }
  
  try {
    // Actualizar objeto
    const reclutaData = {
      nombre,
      email,
      telefono,
      puesto,
      estado,
      notas
    };
    
    // Llamar a la API
    const response = await api.reclutas.update(currentReclutaId, reclutaData);
    const updatedRecluta = response.data;
    
    // Actualizar lista local
    const index = reclutas.findIndex(r => r._id === currentReclutaId);
    if (index !== -1) {
      reclutas[index] = updatedRecluta;
    }
    
    // Actualizar datos en la vista
    updateReclutaDetailsView(updatedRecluta);
    
    // Volver a modo vista
    cancelEdit();
    
    // Refrescar lista
    displayReclutas(reclutas);
    
    // Mostrar notificación
    showNotification('Recluta actualizado correctamente', 'success');
  } catch (error) {
    showNotification('Error al actualizar recluta: ' + (error.message || 'Error desconocido'), 'error');
  } finally {
    // Restaurar botón
    if (formElements.saveButton) {
      formElements.saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
      formElements.saveButton.disabled = false;
    }
  }
}

/**
 * Actualizar la vista de detalles del recluta
 * @param {Object} recluta - Datos del recluta
 */
function updateReclutaDetailsView(recluta) {
  if (!recluta) return;
  
  const detailsElements = {
    nombre: document.getElementById('detail-recluta-nombre'),
    puesto: document.getElementById('detail-recluta-puesto'),
    email: document.getElementById('detail-recluta-email'),
    telefono: document.getElementById('detail-recluta-telefono'),
    notas: document.getElementById('detail-recluta-notas'),
    estado: document.getElementById('detail-recluta-estado'),
    fecha: document.getElementById('detail-recluta-fecha'),
    pic: document.getElementById('detail-recluta-pic')
  };
  
  // Actualizar los elementos que existan
  if (detailsElements.nombre) detailsElements.nombre.textContent = recluta.nombre;
  if (detailsElements.puesto) detailsElements.puesto.textContent = recluta.puesto || 'No especificado';
  if (detailsElements.email) detailsElements.email.textContent = recluta.email;
  if (detailsElements.telefono) detailsElements.telefono.textContent = recluta.telefono;
  if (detailsElements.notas) detailsElements.notas.textContent = recluta.notas || 'Sin notas';
  if (detailsElements.fecha) detailsElements.fecha.textContent = formatDate(recluta.fecha_registro);
  if (detailsElements.pic && recluta.foto_url) detailsElements.pic.src = recluta.foto_url;
  
  // Actualizar estado
  if (detailsElements.estado) {
    detailsElements.estado.textContent = recluta.estado;
    detailsElements.estado.className = `badge badge-${recluta.estado === 'Activo' ? 'success' : (recluta.estado === 'Rechazado' ? 'danger' : 'warning')}`;
  }
}

/**
 * Mostrar modal de confirmación para eliminar recluta
 * @param {string} id - ID del recluta a eliminar
 */
function confirmDeleteRecluta(id) {
  // Si no se pasa ID, usar el actual del modal
  const reclutaId = id || currentReclutaId;
  
  if (!reclutas) {
    showNotification('No hay reclutas cargados', 'error');
    return;
  }
  
  const recluta = reclutas.find(r => r._id === reclutaId);
  
  if (!recluta) {
    showNotification('Recluta no encontrado', 'error');
    return;
  }
  
  // Elementos del modal de confirmación
  const confirmElements = {
    title: document.getElementById('confirm-title'),
    message: document.getElementById('confirm-message'),
    button: document.getElementById('confirm-action-btn'),
    modal: document.getElementById('confirm-modal')
  };
  
  if (!confirmElements.modal) {
    // Si no hay modal, eliminar directamente
    deleteRecluta(reclutaId);
    return;
  }
  
  // Configurar modal de confirmación
  if (confirmElements.title) confirmElements.title.textContent = 'Eliminar Recluta';
  if (confirmElements.message) confirmElements.message.textContent = 
      `¿Estás seguro de que deseas eliminar a ${recluta.nombre}? Esta acción no se puede deshacer.`;
  
  // Configurar acción de confirmación
  if (confirmElements.button) {
    confirmElements.button.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar';
    confirmElements.button.className = 'btn-danger';
    confirmElements.button.onclick = function() {
      deleteRecluta(reclutaId);
    };
  }
  
  // Mostrar modal
  confirmElements.modal.style.display = 'block';
}

/**
 * Eliminar recluta
 * @param {string} id - ID del recluta a eliminar
 * @returns {Promise<void>}
 */
async function deleteRecluta(id) {
  if (!reclutas || reclutas.length === 0) {
    showNotification('No hay reclutas para eliminar', 'error');
    return;
  }
  
  if (!id) {
    showNotification('ID de recluta no proporcionado', 'error');
    return;
  }
  
  try {
    // Llamar a la API para eliminar
    await api.reclutas.delete(id);
    
    // Eliminar de la lista local
    const index = reclutas.findIndex(r => r._id === id);
    if (index !== -1) {
      reclutas.splice(index, 1);
    }
    
    // Refrescar lista
    displayReclutas(reclutas);
    
    // Cerrar modal de detalles si está abierto
    if (currentReclutaId === id) {
      closeViewReclutaModal();
    }
    
    // Cerrar modal de confirmación
    closeConfirmModal();
    
    // Mostrar notificación
    showNotification('Recluta eliminado correctamente', 'success');
  } catch (error) {
    showNotification('Error al eliminar recluta: ' + error.message, 'error');
  }
}

/**
 * Cerrar modal de ver recluta
 */
function closeViewReclutaModal() {
  const modal = document.getElementById('view-recluta-modal');
  if (modal) modal.style.display = 'none';
  currentReclutaId = null;
}

/**
 * Cerrar modal de confirmación
 */
function closeConfirmModal() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Abrir modal para agregar nuevo recluta
 */
function openAddReclutaModal() {
  const modal = document.getElementById('add-recluta-modal');
  if (!modal) return;
  
  modal.style.display = 'block';
  
  // Limpiar formulario
  const nombreInput = document.getElementById('recluta-nombre');
  const emailInput = document.getElementById('recluta-email');
  const telefonoInput = document.getElementById('recluta-telefono');
  const puestoInput = document.getElementById('recluta-puesto');
  const estadoSelect = document.getElementById('recluta-estado');
  const notasTextarea = document.getElementById('recluta-notas');
  const picPreview = document.getElementById('recluta-pic-preview');
  
  if (nombreInput) nombreInput.value = '';
  if (emailInput) emailInput.value = '';
  if (telefonoInput) telefonoInput.value = '';
  if (puestoInput) puestoInput.value = '';
  if (estadoSelect) estadoSelect.value = 'En proceso';
  if (notasTextarea) notasTextarea.value = '';
  
  // Limpiar preview de imagen
  if (picPreview) picPreview.innerHTML = '<i class="fas fa-user-circle"></i>';
  reclutaImage = null;
}

/**
 * Cerrar modal de añadir recluta
 */
function closeAddReclutaModal() {
  const modal = document.getElementById('add-recluta-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Añadir nuevo recluta
 * @returns {Promise<void>}
 */
async function addRecluta() {
  const nombreInput = document.getElementById('recluta-nombre');
  const emailInput = document.getElementById('recluta-email');
  const telefonoInput = document.getElementById('recluta-telefono');
  const puestoInput = document.getElementById('recluta-puesto');
  const estadoSelect = document.getElementById('recluta-estado');
  const notasTextarea = document.getElementById('recluta-notas');
  
  if (!nombreInput || !emailInput || !telefonoInput) {
    showNotification('Error al obtener los campos del formulario', 'error');
    return;
  }
  
  const nombre = nombreInput.value;
  const email = emailInput.value;
  const telefono = telefonoInput.value;
  const puesto = puestoInput ? puestoInput.value : '';
  const estado = estadoSelect ? estadoSelect.value : 'En proceso';
  const notas = notasTextarea ? notasTextarea.value : '';
  
  if (!nombre || !email || !telefono) {
    showNotification('Por favor, completa los campos obligatorios', 'error');
    return;
  }
  
  // Mostrar estado de carga
  const saveButton = document.querySelector('#add-recluta-modal .btn-primary');
  if (!saveButton) {
    return;
  }
  
  saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
  saveButton.disabled = true;
  
  try {
    // Crear objeto de nuevo recluta
    const reclutaData = {
      nombre,
      email,
      telefono,
      estado,
      puesto,
      notas
    };
    
    // Llamar a la API para crear el recluta
    const response = await api.reclutas.create(reclutaData);
    const nuevoRecluta = response.data;
    
    // Si hay una foto, subirla en una petición separada
    if (reclutaImage) {
      const formData = new FormData();
      formData.append('photo', reclutaImage);
      
      const photoResponse = await api.reclutas.uploadPhoto(nuevoRecluta._id, formData);
      nuevoRecluta.foto_url = photoResponse.data.foto_url;
    }
    
    // Añadir a la lista local
    reclutas.push(nuevoRecluta);
    
    // Cerrar modal
    closeAddReclutaModal();
    
    // Refrescar lista
    displayReclutas(reclutas);
    
    // Mostrar notificación
    showNotification('Recluta añadido correctamente', 'success');
  } catch (error) {
    showNotification('Error al añadir recluta: ' + (error.message || 'Error desconocido'), 'error');
  } finally {
    // Restaurar botón
    if (saveButton) {
      saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Recluta';
      saveButton.disabled = false;
    }
  }
}

/**
 * Manejar la carga y vista previa de imagen para recluta
 * @param {Event} event - Evento del input file
 */
function handleReclutaImageChange(event) {
  if (!event || !event.target || !event.target.files || !event.target.files[0]) return;
  
  const file = event.target.files[0];
  const previewDiv = document.getElementById('recluta-pic-preview');
  
  if (!previewDiv) return;
  
  const reader = new FileReader();
  reader.onload = function(e) {
    if (!e || !e.target || !e.target.result) return;
    
    // Limpiar el div
    previewDiv.innerHTML = '';
    
    // Crear imagen
    const img = document.createElement('img');
    img.src = e.target.result;
    img.classList.add('profile-pic');
    previewDiv.appendChild(img);
    reclutaImage = file;
  };
  reader.readAsDataURL(file);
}

/**
 * Filtrar reclutas según búsqueda y filtros
 * @returns {Promise<void>}
 */
async function filterReclutas() {
  try {
    const searchInput = document.getElementById('search-reclutas');
    const filterEstado = document.getElementById('filter-estado');
    
    if (!searchInput && !filterEstado) return;
    
    const searchText = searchInput ? searchInput.value.toLowerCase() : '';
    const estadoFilter = filterEstado ? filterEstado.value : 'todos';
    
    // Construir parámetros de búsqueda
    const searchParams = {};
    
    if (searchText) {
      searchParams.q = searchText;
    }
    
    if (estadoFilter !== 'todos') {
      searchParams.estado = estadoFilter;
    }
    
    // Obtener el criterio de ordenamiento
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      searchParams.ordenarPor = sortSelect.value;
    }
    
    // Realizar búsqueda a través de la API
    const response = await api.search.reclutas(searchParams);
    
    // Actualizar la lista global de reclutas
    reclutas = response.data;
    
    // Mostrar resultados
    displayReclutas(reclutas);
    
    // Actualizar paginación si es necesario
    if (response.paginacion) {
      updatePagination(response.paginacion);
    }
  } catch (error) {
    showNotification('Error al filtrar reclutas: ' + error.message, 'error');
  }
}

/**
 * Ordenar reclutas
 * @param {string} sortOption - Opción de ordenamiento
 */
function sortReclutas(sortOption) {
  // Si no hay reclutas, no hacer nada
  if (!reclutas || reclutas.length === 0) return;
  
  // Si se llama desde un evento, obtener valor del select
  let sortBy = sortOption;
  if (!sortOption) {
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) sortBy = sortSelect.value;
    else sortBy = 'nombre-asc'; // Valor por defecto
  }
  
  // Ordenar según opción
  switch (sortBy) {
    case 'nombre-asc':
      reclutas.sort((a, b) => a.nombre.localeCompare(b.nombre));
      break;
    case 'nombre-desc':
      reclutas.sort((a, b) => b.nombre.localeCompare(a.nombre));
      break;
    case 'fecha-asc':
      reclutas.sort((a, b) => new Date(a.fecha_registro) - new Date(b.fecha_registro));
      break;
    case 'fecha-desc':
      reclutas.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
      break;
  }
  
  // Mostrar lista ordenada
  displayReclutas(reclutas);
}

/**
 * Inicializar eventos de reclutas
 */
function initReclutasEvents() {
  // Evento para buscar reclutas
  const searchInput = document.getElementById('search-reclutas');
  if (searchInput) {
    searchInput.addEventListener('input', filterReclutas);
  }
  
  // Evento para filtrar por estado
  const filterEstado = document.getElementById('filter-estado');
  if (filterEstado) {
    filterEstado.addEventListener('change', filterReclutas);
  }
  
  // Evento para ordenar
  const sortBy = document.getElementById('sort-by');
  if (sortBy) {
    sortBy.addEventListener('change', () => sortReclutas(sortBy.value));
  }
  
  // Evento para abrir modal de añadir recluta
  const addReclutaButton = document.getElementById('add-recluta-button');
  if (addReclutaButton) {
    addReclutaButton.addEventListener('click', openAddReclutaModal);
  }
  
  // Evento para cerrar modal de añadir recluta
  const closeAddReclutaBtn = document.getElementById('close-add-recluta-modal');
  if (closeAddReclutaBtn) {
    closeAddReclutaBtn.addEventListener('click', closeAddReclutaModal);
  }
  
  // Evento para botón cancelar en modal añadir
  const cancelAddBtn = document.getElementById('cancel-add-recluta');
  if (cancelAddBtn) {
    cancelAddBtn.addEventListener('click', closeAddReclutaModal);
  }
  
  // Evento para guardar recluta
  const saveReclutaBtn = document.getElementById('save-recluta');
  if (saveReclutaBtn) {
    saveReclutaBtn.addEventListener('click', addRecluta);
  }
  
  // Evento para cerrar modal de detalles
  const closeViewReclutaBtn = document.getElementById('close-view-recluta-modal');
  if (closeViewReclutaBtn) {
    closeViewReclutaBtn.addEventListener('click', closeViewReclutaModal);
  }
  
  // Evento para cerrar modal de confirmación
  const closeConfirmBtn = document.getElementById('close-confirm-modal');
  if (closeConfirmBtn) {
    closeConfirmBtn.addEventListener('click', closeConfirmModal);
  }
  
  // Evento para cancelar confirmación
  const cancelConfirmBtn = document.getElementById('cancel-confirm-btn');
  if (cancelConfirmBtn) {
    cancelConfirmBtn.addEventListener('click', closeConfirmModal);
  }
  
  // Evento para editar recluta desde modal de detalles
  const editReclutaBtn = document.getElementById('edit-recluta-btn');
  if (editReclutaBtn) {
    editReclutaBtn.addEventListener('click', enableEditMode);
  }
  
  // Evento para eliminar recluta desde modal de detalles
  const deleteReclutaBtn = document.getElementById('delete-recluta-btn');
  if (deleteReclutaBtn) {
    deleteReclutaBtn.addEventListener('click', () => confirmDeleteRecluta(currentReclutaId));
  }
  
  // Evento para programar entrevista desde modal de detalles
  const scheduleInterviewBtn = document.getElementById('schedule-interview-btn');
  if (scheduleInterviewBtn) {
    scheduleInterviewBtn.addEventListener('click', () => programarEntrevista(currentReclutaId));
  }
  
  // Evento para cancelar edición
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  if (cancelEditBtn) {
    cancelEditBtn.addEventListener('click', cancelEdit);
  }
  
  // Evento para guardar cambios de edición
  const saveEditBtn = document.getElementById('save-edit-btn');
  if (saveEditBtn) {
    saveEditBtn.addEventListener('click', saveReclutaChanges);
  }
  
  // Evento para cambiar imagen de recluta
  const reclutaUploadInput = document.getElementById('recluta-upload');
  if (reclutaUploadInput) {
    reclutaUploadInput.addEventListener('change', handleReclutaImageChange);
  }
  
  // Eventos de paginación
  const prevPageBtn = document.getElementById('prev-page');
  const nextPageBtn = document.getElementById('next-page');
  
  if (prevPageBtn) {
    prevPageBtn.addEventListener('click', () => {
      const currentPage = parseInt(document.querySelector('.current-page').textContent);
      if (currentPage > 1) {
        changePage(currentPage - 1);
      }
    });
  }
  
  if (nextPageBtn) {
    nextPageBtn.addEventListener('click', () => {
      const currentPage = parseInt(document.querySelector('.current-page').textContent);
      const totalPages = parseInt(document.getElementById('total-pages').textContent);
      if (currentPage < totalPages) {
        changePage(currentPage + 1);
      }
    });
  }
}

/**
 * Cambiar de página en la paginación
 * @param {number} page - Número de página
 * @returns {Promise<void>}
 */
async function changePage(page) {
  try {
    const searchInput = document.getElementById('search-reclutas');
    const filterEstado = document.getElementById('filter-estado');
    
    // Construir parámetros de búsqueda
    const searchParams = {
      pagina: page
    };
    
    if (searchInput && searchInput.value) {
      searchParams.q = searchInput.value;
    }
    
    if (filterEstado && filterEstado.value !== 'todos') {
      searchParams.estado = filterEstado.value;
    }
    
    // Obtener el criterio de ordenamiento
    const sortSelect = document.getElementById('sort-by');
    if (sortSelect) {
      searchParams.ordenarPor = sortSelect.value;
    }
    
    // Realizar búsqueda con la nueva página
    const response = await api.search.reclutas(searchParams);
    
    // Actualizar la lista global de reclutas
    reclutas = response.data;
    
    // Mostrar resultados
    displayReclutas(reclutas);
    
    // Actualizar paginación
    if (response.paginacion) {
      updatePagination(response.paginacion);
    }
  } catch (error) {
    showNotification('Error al cambiar de página: ' + error.message, 'error');
  }
}

// Exportar funciones para uso global
window.reclutas = {
  loadReclutas,
  displayReclutas,
  viewRecluta,
  editRecluta,
  deleteRecluta,
  addRecluta,
  filterReclutas,
  sortReclutas,
  openAddReclutaModal,
  closeAddReclutaModal,
  closeViewReclutaModal,
  initReclutasEvents
};