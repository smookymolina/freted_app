/**
 * Módulo de gestión de entrevistas para el Sistema de Gestión de Reclutas
 */

// ID de entrevista actual para operaciones
let currentEntrevistaId = null;

/**
 * Programar entrevista para un recluta
 * @param {string} reclutaId - ID del recluta
 * @returns {Promise<void>}
 */
async function programarEntrevista(reclutaId) {
  if (!reclutaId) {
    showNotification('Error: No se puede programar entrevista', 'error');
    return;
  }
  
  try {
    // Obtener datos del recluta
    const response = await api.reclutas.getOne(reclutaId);
    const recluta = response.data;
    
    // Cerrar modal de detalles
    closeViewReclutaModal();
    
    // Elementos del modal de entrevista
    const interviewElements = {
      candidatePic: document.getElementById('interview-candidate-pic'),
      candidateName: document.getElementById('interview-candidate-name'),
      candidatePuesto: document.getElementById('interview-candidate-puesto'),
      dateInput: document.getElementById('interview-date'),
      timeInput: document.getElementById('interview-time'),
      durationSelect: document.getElementById('interview-duration'),
      typeSelect: document.getElementById('interview-type'),
      locationInput: document.getElementById('interview-location'),
      notesInput: document.getElementById('interview-notes'),
      sendEmailCheckbox: document.getElementById('send-invitation'),
      modal: document.getElementById('schedule-interview-modal')
    };
    
    if (!interviewElements.modal) {
      showNotification('No se puede mostrar el modal de entrevista', 'error');
      return;
    }
    
    // Configurar datos del candidato en el modal
    if (interviewElements.candidatePic) interviewElements.candidatePic.src = recluta.foto_url;
    if (interviewElements.candidateName) interviewElements.candidateName.textContent = recluta.nombre;
    if (interviewElements.candidatePuesto) interviewElements.candidatePuesto.textContent = recluta.puesto || 'No especificado';
    
    // Establecer fecha por defecto (mañana)
    if (interviewElements.dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      interviewElements.dateInput.value = tomorrow.toISOString().split('T')[0];
    }
    
    // Hora por defecto (10:00 AM)
    if (interviewElements.timeInput) interviewElements.timeInput.value = '10:00';
    
    // Guardar ID del recluta para la función de guardar
    interviewElements.modal.setAttribute('data-recluta-id', recluta._id);
    
    // Mostrar modal
    interviewElements.modal.style.display = 'block';
  } catch (error) {
    showNotification('Error al cargar datos del recluta: ' + error.message, 'error');
  }
}

/**
 * Cerrar modal de programación de entrevista
 */
function closeScheduleModal() {
  const modal = document.getElementById('schedule-interview-modal');
  if (modal) modal.style.display = 'none';
}

/**
 * Guardar entrevista
 * @returns {Promise<void>}
 */
async function saveInterview() {
  const modal = document.getElementById('schedule-interview-modal');
  if (!modal) return;
  
  const reclutaId = modal.getAttribute('data-recluta-id');
  if (!reclutaId) {
    showNotification('Error: ID de recluta no encontrado', 'error');
    return;
  }
  
  const interviewElements = {
    dateInput: document.getElementById('interview-date'),
    timeInput: document.getElementById('interview-time'),
    durationSelect: document.getElementById('interview-duration'),
    typeSelect: document.getElementById('interview-type'),
    locationInput: document.getElementById('interview-location'),
    notesInput: document.getElementById('interview-notes'),
    sendEmailCheckbox: document.getElementById('send-invitation'),
    saveButton: document.getElementById('save-interview-btn')
  };
  
  if (!interviewElements.dateInput || !interviewElements.timeInput) {
    showNotification('Error al obtener datos del formulario', 'error');
    return;
  }
  
  const fecha = interviewElements.dateInput.value;
  const hora = interviewElements.timeInput.value;
  
  if (!fecha || !hora) {
    showNotification('Por favor, completa los campos de fecha y hora', 'error');
    return;
  }
  
  // Mostrar estado de carga
  if (interviewElements.saveButton) {
    interviewElements.saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    interviewElements.saveButton.disabled = true;
  }
  
  try {
    // Construir datos de la entrevista
    const entrevistaData = {
      fecha: fecha,
      hora: hora,
      duracion: interviewElements.durationSelect ? parseInt(interviewElements.durationSelect.value) : 60,
      tipo: interviewElements.typeSelect ? interviewElements.typeSelect.value : 'presencial',
      ubicacion: interviewElements.locationInput ? interviewElements.locationInput.value : '',
      notas: interviewElements.notesInput ? interviewElements.notesInput.value : '',
      enviar_email: interviewElements.sendEmailCheckbox ? interviewElements.sendEmailCheckbox.checked : false
    };
    
    // Llamar a la API
    await api.entrevistas.create(reclutaId, entrevistaData);
    
    // Cerrar modal
    closeScheduleModal();
    
    // Mostrar notificación
    showNotification('Entrevista programada correctamente', 'success');
    
    // Actualizar información del calendario si estamos en esa sección
    const calendarioSection = document.getElementById('calendario-section');
    if (calendarioSection && calendarioSection.classList.contains('active')) {
      const now = new Date();
      loadCalendarEntrevistas(now.getMonth(), now.getFullYear());
    }
  } catch (error) {
    showNotification('Error al programar la entrevista: ' + error.message, 'error');
  } finally {
    // Restaurar botón
    if (interviewElements.saveButton) {
      interviewElements.saveButton.innerHTML = '<i class="fas fa-calendar-check"></i> Programar';
      interviewElements.saveButton.disabled = false;
    }
  }
}

/**
 * Ver detalles de una entrevista
 * @param {string} id - ID de la entrevista
 * @returns {Promise<void>}
 */
async function viewEntrevista(id) {
  try {
    const response = await api.entrevistas.getOne(id);
    const entrevista = response.data;
    
    currentEntrevistaId = entrevista._id;
    
    // Obtener elementos del modal
    const modal = document.getElementById('view-interview-modal');
    if (!modal) {
      showNotification('Error: Modal no encontrado', 'error');
      return;
    }
    
    // Elementos para rellenar
    const elements = {
      title: modal.querySelector('.modal-header h3'),
      name: document.getElementById('interview-detail-name'),
      position: document.getElementById('interview-detail-position'),
      date: document.getElementById('interview-detail-date'),
      time: document.getElementById('interview-detail-time'),
      duration: document.getElementById('interview-detail-duration'),
      type: document.getElementById('interview-detail-type'),
      location: document.getElementById('interview-detail-location'),
      notes: document.getElementById('interview-detail-notes'),
      editBtn: document.getElementById('edit-interview-btn'),
      deleteBtn: document.getElementById('delete-interview-btn'),
      reminderBtn: document.getElementById('send-reminder-btn')
    };
    
    // Rellenar datos
    if (elements.title) elements.title.textContent = 'Detalles de Entrevista';
    if (elements.name) elements.name.textContent = entrevista.recluta.nombre;
    if (elements.position) elements.position.textContent = entrevista.recluta.puesto || 'No especificado';
    if (elements.date) elements.date.textContent = formatDate(entrevista.fecha);
    if (elements.time) elements.time.textContent = entrevista.hora;
    if (elements.duration) elements.duration.textContent = `${entrevista.duracion} minutos`;
    if (elements.type) elements.type.textContent = entrevista.tipo.charAt(0).toUpperCase() + entrevista.tipo.slice(1);
    if (elements.location) elements.location.textContent = entrevista.ubicacion || 'No especificada';
    if (elements.notes) elements.notes.textContent = entrevista.notas || 'Sin notas';
    
    // Configurar acciones
    if (elements.editBtn) {
      elements.editBtn.onclick = () => editEntrevista(entrevista._id);
    }
    
    if (elements.deleteBtn) {
      elements.deleteBtn.onclick = () => confirmDeleteEntrevista(entrevista._id);
    }
    
    if (elements.reminderBtn) {
      elements.reminderBtn.onclick = () => sendEntrevistaReminder(entrevista._id);
    }
    
    // Mostrar modal
    modal.style.display = 'block';
  } catch (error) {
    showNotification('Error al cargar detalles de la entrevista: ' + error.message, 'error');
  }
}

/**
 * Cerrar modal de visualización de entrevista
 */
function closeViewInterviewModal() {
  const modal = document.getElementById('view-interview-modal');
  if (modal) modal.style.display = 'none';
  currentEntrevistaId = null;
}

/**
 * Editar entrevista
 * @param {string} id - ID de la entrevista
 * @returns {Promise<void>}
 */
async function editEntrevista(id) {
  // Esta función abriría un modal para editar la entrevista
  // Similar a programarEntrevista pero con los datos cargados
  showNotification('Edición de entrevista no implementada', 'warning');
}

/**
 * Confirmar eliminación de entrevista
 * @param {string} id - ID de la entrevista
 */
function confirmDeleteEntrevista(id) {
  // Elementos del modal de confirmación
  const confirmElements = {
    title: document.getElementById('confirm-title'),
    message: document.getElementById('confirm-message'),
    button: document.getElementById('confirm-action-btn'),
    modal: document.getElementById('confirm-modal')
  };
  
  if (!confirmElements.modal) {
    // Si no hay modal, eliminar directamente
    deleteEntrevista(id);
    return;
  }
  
  // Configurar modal de confirmación
  if (confirmElements.title) confirmElements.title.textContent = 'Cancelar Entrevista';
  if (confirmElements.message) confirmElements.message.textContent = 
      '¿Estás seguro de que deseas cancelar esta entrevista? Esta acción no se puede deshacer.';
  
  // Configurar acción de confirmación
  if (confirmElements.button) {
    confirmElements.button.innerHTML = '<i class="fas fa-trash-alt"></i> Cancelar Entrevista';
    confirmElements.button.className = 'btn-danger';
    confirmElements.button.onclick = function() {
      deleteEntrevista(id);
    };
  }
  
  // Mostrar modal
  confirmElements.modal.style.display = 'block';
}

/**
 * Eliminar entrevista
 * @param {string} id - ID de la entrevista
 * @returns {Promise<void>}
 */
async function deleteEntrevista(id) {
  try {
    await api.entrevistas.delete(id);
    
    // Cerrar modales
    closeViewInterviewModal();
    closeConfirmModal();
    
    // Actualizar calendario si estamos en esa sección
    const calendarioSection = document.getElementById('calendario-section');
    if (calendarioSection && calendarioSection.classList.contains('active')) {
      const now = new Date();
      loadCalendarEntrevistas(now.getMonth(), now.getFullYear());
    }
    
    showNotification('Entrevista cancelada correctamente', 'success');
  } catch (error) {
    showNotification('Error al cancelar la entrevista: ' + error.message, 'error');
  }
}

/**
 * Enviar recordatorio de entrevista
 * @param {string} id - ID de la entrevista
 * @returns {Promise<void>}
 */
async function sendEntrevistaReminder(id) {
  try {
    const reminderBtn = document.getElementById('send-reminder-btn');
    if (reminderBtn) {
      reminderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      reminderBtn.disabled = true;
    }
    
    await api.entrevistas.sendReminder(id);
    
    showNotification('Recordatorio enviado correctamente', 'success');
  } catch (error) {
    showNotification('Error al enviar recordatorio: ' + error.message, 'error');
  } finally {
    const reminderBtn = document.getElementById('send-reminder-btn');
    if (reminderBtn) {
      reminderBtn.innerHTML = '<i class="fas fa-envelope"></i> Enviar Recordatorio';
      reminderBtn.disabled = false;
    }
  }
}

/**
 * Obtener todas las entrevistas
 * @returns {Promise<Array>} - Lista de entrevistas
 */
async function getAllEntrevistas() {
  try {
    const response = await api.entrevistas.getAll();
    return response.data;
  } catch (error) {
    showNotification('Error al cargar entrevistas: ' + error.message, 'error');
    return [];
  }
}

/**
 * Inicializar eventos de entrevistas
 */
function initEntrevistasEvents() {
  // Evento para cerrar modal de programación
  const closeScheduleBtn = document.getElementById('close-schedule-modal');
  if (closeScheduleBtn) {
    closeScheduleBtn.addEventListener('click', closeScheduleModal);
  }
  
  // Evento para cancelar programación
  const cancelScheduleBtn = document.getElementById('cancel-schedule-btn');
  if (cancelScheduleBtn) {
    cancelScheduleBtn.addEventListener('click', closeScheduleModal);
  }
  
  // Evento para guardar entrevista
  const saveInterviewBtn = document.getElementById('save-interview-btn');
  if (saveInterviewBtn) {
    saveInterviewBtn.addEventListener('click', saveInterview);
  }
  
  // Evento para cerrar modal de visualización
  const closeViewInterviewBtn = document.getElementById('close-view-interview-modal');
  if (closeViewInterviewBtn) {
    closeViewInterviewBtn.addEventListener('click', closeViewInterviewModal);
  }
}

// Exportar funciones para uso global
window.entrevistas = {
  programarEntrevista,
  closeScheduleModal,
  viewEntrevista,
  closeViewInterviewModal,
  editEntrevista,
  confirmDeleteEntrevista,
  deleteEntrevista,
  sendEntrevistaReminder,
  getAllEntrevistas,
  initEntrevistasEvents
};