/**
 * Módulo de gestión del calendario para el Sistema de Gestión de Reclutas
 */

// Almacenamiento de entrevistas para el calendario
let calendarEvents = {};

// Mes y año actuales
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

/**
 * Inicializar calendario
 */
function initCalendar() {
  const calendarGrid = document.getElementById('calendar-grid');
  const currentMonthElement = document.getElementById('current-month');
  
  if (!calendarGrid || !currentMonthElement) return;
  
  // Fecha actual
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();
  
  // Mostrar mes actual
  currentMonthElement.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
  
  // Cargar entrevistas y generar calendario
  loadCalendarEntrevistas(currentMonth, currentYear);
}

/**
 * Cargar entrevistas para el calendario
 * @param {number} month - Mes (0-11)
 * @param {number} year - Año
 * @returns {Promise<void>}
 */
async function loadCalendarEntrevistas(month, year) {
  try {
    // Mostrar indicador de carga
    const calendarGrid = document.getElementById('calendar-grid');
    if (calendarGrid) {
      calendarGrid.innerHTML = '<div class="loading-calendar"><i class="fas fa-spinner fa-spin"></i> Cargando calendario...</div>';
    }
    
    // Actualizar mes y año actuales
    currentMonth = month;
    currentYear = year;
    
    // Actualizar título del mes
    const currentMonthElement = document.getElementById('current-month');
    if (currentMonthElement) {
      currentMonthElement.textContent = `${getMonthName(month)} ${year}`;
    }
    
    // Obtener datos del calendario desde la API
    const response = await api.stats.getCalendario(month, year);
    calendarEvents = response.data.entrevistas || {};
    
    // Generar días del calendario con los eventos
    generateCalendarDays(year, month, calendarEvents);
    
    // Cargar próximas entrevistas
    loadUpcomingEvents();
  } catch (error) {
    showNotification('Error al cargar datos del calendario: ' + error.message, 'error');
    
    // En caso de error, generar calendario sin eventos
    generateCalendarDays(year, month, {});
  }
}

/**
 * Generar días del calendario
 * @param {number} year - Año
 * @param {number} month - Mes (0-11)
 * @param {Object} eventsByDay - Eventos organizados por día
 */
function generateCalendarDays(year, month, eventsByDay) {
  const calendarGrid = document.getElementById('calendar-grid');
  if (!calendarGrid) return;
  
  calendarGrid.innerHTML = '';
  
  // Primer día del mes
  const firstDay = new Date(year, month, 1);
  // Último día del mes
  const lastDay = new Date(year, month + 1, 0);
  
  // Día de la semana en que empieza el mes (0 = domingo)
  const startDayOfWeek = firstDay.getDay();
  
  // Días del mes anterior
  for (let i = 0; i < startDayOfWeek; i++) {
    const prevMonthDate = new Date(year, month, -startDayOfWeek + i + 1);
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day other-month';
    dayDiv.innerHTML = `<div class="calendar-day-number">${prevMonthDate.getDate()}</div>`;
    calendarGrid.appendChild(dayDiv);
  }
  
  // Días del mes actual
  const today = new Date();
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day';
    
    // Marcar el día actual
    if (today.getDate() === i && today.getMonth() === month && today.getFullYear() === year) {
      dayDiv.classList.add('today');
    }
    
    dayDiv.innerHTML = `<div class="calendar-day-number">${i}</div>`;
    
    // Añadir eventos para este día
    if (eventsByDay && eventsByDay[i] && eventsByDay[i].length > 0) {
      const events = eventsByDay[i];
      events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'calendar-event';
        eventDiv.setAttribute('data-id', event.id);
        eventDiv.textContent = `${event.hora} - ${event.recluta.nombre}`;
        eventDiv.addEventListener('click', () => viewEntrevista(event.id));
        dayDiv.appendChild(eventDiv);
      });
    }
    
    calendarGrid.appendChild(dayDiv);
  }
  
  // Calcular casillas restantes para completar la cuadrícula
  const totalCells = 42;
  const remainingCells = totalCells - (startDayOfWeek + lastDay.getDate());
  
  // Días del mes siguiente
  for (let i = 1; i <= remainingCells; i++) {
    const dayDiv = document.createElement('div');
    dayDiv.className = 'calendar-day other-month';
    dayDiv.innerHTML = `<div class="calendar-day-number">${i}</div>`;
    calendarGrid.appendChild(dayDiv);
  }
}

/**
 * Navegación del calendario
 * @param {number} direction - Dirección (-1 para mes anterior, 1 para mes siguiente)
 */
function navigateCalendar(direction) {
  let newMonth = currentMonth + direction;
  let newYear = currentYear;
  
  // Ajustar año si necesario
  if (newMonth < 0) {
    newMonth = 11;
    newYear--;
  } else if (newMonth > 11) {
    newMonth = 0;
    newYear++;
  }
  
  // Cargar nuevo mes
  loadCalendarEntrevistas(newMonth, newYear);
}

/**
 * Cargar próximas entrevistas en el panel lateral
 * @returns {Promise<void>}
 */
async function loadUpcomingEvents() {
  const upcomingList = document.getElementById('upcoming-events-list');
  if (!upcomingList) return;
  
  try {
    // Mostrar indicador de carga
    upcomingList.innerHTML = '<div class="loading-events"><i class="fas fa-spinner fa-spin"></i> Cargando...</div>';
    
    // Obtener estadísticas de entrevistas que incluyen las próximas
    const response = await api.stats.getEntrevistas();
    const proximasEntrevistas = response.data.proximasEntrevistas || [];
    
    // Limpiar contenedor
    upcomingList.innerHTML = '';
    
    // Mostrar mensaje si no hay entrevistas próximas
    if (proximasEntrevistas.length === 0) {
      upcomingList.innerHTML = '<p class="no-events">No hay entrevistas programadas para los próximos días.</p>';
      return;
    }
    
    // Mostrar entrevistas próximas
    proximasEntrevistas.forEach(entrevista => {
      const eventDate = new Date(entrevista.fecha);
      const day = eventDate.getDate();
      const month = getMonthShortName(eventDate.getMonth());
      
      const eventItem = document.createElement('div');
      eventItem.className = 'event-item';
      eventItem.setAttribute('data-id', entrevista._id);
      eventItem.innerHTML = `
        <div class="event-date">
          <span class="event-day">${day}</span>
          <span class="event-month">${month}</span>
        </div>
        <div class="event-details">
          <h6>${entrevista.recluta.nombre}</h6>
          <p><i class="fas fa-clock"></i> ${entrevista.hora}</p>
        </div>
      `;
      
      // Añadir evento para ver detalles
      eventItem.addEventListener('click', () => viewEntrevista(entrevista._id));
      
      upcomingList.appendChild(eventItem);
    });
  } catch (error) {
    upcomingList.innerHTML = '<p class="error-events">Error al cargar entrevistas próximas.</p>';
    console.error('Error al cargar próximas entrevistas:', error);
  }
}

/**
 * Obtener nombre del mes
 * @param {number} monthIndex - Índice del mes (0-11)
 * @returns {string} - Nombre del mes
 */
function getMonthName(monthIndex) {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[monthIndex] || '';
}

/**
 * Obtener nombre corto del mes
 * @param {number} monthIndex - Índice del mes (0-11)
 * @returns {string} - Nombre corto del mes
 */
function getMonthShortName(monthIndex) {
  const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  return months[monthIndex] || '';
}

/**
 * Inicializar eventos del calendario
 */
function initCalendarEvents() {
  // Navegación del calendario
  const prevMonthBtn = document.getElementById('prev-month');
  const nextMonthBtn = document.getElementById('next-month');
  
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => navigateCalendar(-1));
  }
  
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => navigateCalendar(1));
  }
  
  // Botón para añadir evento en calendario
  const addEventButton = document.getElementById('add-event-button');
  if (addEventButton) {
    addEventButton.addEventListener('click', () => {
      // Mostrar notificación
      showNotification('Por favor selecciona un recluta para programar una entrevista', 'info');
      
      // Cambiar a la sección de reclutas
      changeActiveSection('reclutas-section');
    });
  }
}

// Exportar funciones para uso global
window.calendar = {
  initCalendar,
  loadCalendarEntrevistas,
  navigateCalendar,
  loadUpcomingEvents,
  initCalendarEvents
};
