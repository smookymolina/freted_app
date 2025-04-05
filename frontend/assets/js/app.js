/**
 * Archivo principal de la aplicación
 * Sistema de Gestión de Reclutas
 */

// Evento para cuando se carga completamente el documento
document.addEventListener('DOMContentLoaded', function() {
  // Iniciar aplicación
  initApp();
});

/**
 * Inicializar aplicación
 */
async function initApp() {
  try {
    console.log('Inicializando Sistema de Gestión de Reclutas...');
    
    // Aplicar tema guardado
    utils.applyStoredTheme();
    
    // Inicializar eventos generales
    utils.initGeneralEvents();
    
    // Inicializar eventos de módulos específicos
    reclutas.initReclutasEvents();
    entrevistas.initEntrevistasEvents();
    calendar.initCalendarEvents();
    stats.initStatsEvents();
    
    // Comprobar sesión de usuario
    const sessionActive = await auth.checkSession();
    
    // Si hay sesión activa, inicializar calendario
    if (sessionActive) {
      calendar.initCalendar();
      
      // Cargar estadísticas si estamos en esa sección
      const estadisticasSection = document.getElementById('estadisticas-section');
      if (estadisticasSection && estadisticasSection.classList.contains('active')) {
        stats.loadDashboardStats();
      }
    }
    
    // Configurar evento para cambio de sección
    configureSectionChangeEvents();
    
    console.log('Sistema de Gestión de Reclutas inicializado correctamente.');
  } catch (error) {
    console.error('Error al inicializar la aplicación:', error);
    utils.showNotification('Error al inicializar la aplicación. Por favor recarga la página.', 'error');
  }
}

/**
 * Configurar eventos para carga de datos cuando se cambia de sección
 */
function configureSectionChangeEvents() {
  const navLinks = document.querySelectorAll('.dashboard-nav a');
  if (!navLinks) return;
  
  navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      const targetSection = this.getAttribute('data-section');
      
      // Cargar datos según la sección
      switch (targetSection) {
        case 'reclutas-section':
          reclutas.loadReclutas();
          break;
        case 'estadisticas-section':
          stats.loadDashboardStats();
          break;
        case 'calendario-section':
          calendar.initCalendar();
          break;
        // No es necesario cargar nada en configuración
      }
    });
  });
}

// Variables globales para datos temporales
let currentReclutaId = null;
