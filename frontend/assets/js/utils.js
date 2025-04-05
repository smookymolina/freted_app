/**
 * Utilidades generales para el Sistema de Gestión de Reclutas
 */

// Variable para estado del tema oscuro
let darkMode = localStorage.getItem('darkMode') === 'true';

/**
 * Mostrar notificación
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de notificación (info, success, error, warning)
 */
function showNotification(message, type = 'info') {
  const notification = document.getElementById('notification');
  const notificationMessage = document.getElementById('notification-message');
  
  if (!notification || !notificationMessage) return;
  
  notificationMessage.textContent = message;
  
  // Configurar tipo de notificación
  notification.className = 'notification';
  notification.classList.add(type);
  notification.classList.add('show');
  
  // Auto-ocultar después de 5 segundos
  setTimeout(hideNotification, 5000);
}

/**
 * Ocultar notificación
 */
function hideNotification() {
  const notification = document.getElementById('notification');
  if (notification) notification.classList.remove('show');
}

/**
 * Formatear fecha
 * @param {string|Date} dateString - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
function formatDate(dateString) {
  if (!dateString) return 'Fecha no disponible';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    return 'Error al formatear fecha';
  }
}

/**
 * Cambiar la sección activa en el dashboard
 * @param {string} targetSection - ID de la sección a activar
 */
function changeActiveSection(targetSection) {
  if (!targetSection) return;
  
  // Actualizar tab activa
  const navItems = document.querySelectorAll('.dashboard-nav li');
  if (navItems) {
    navItems.forEach(li => {
      li.classList.remove('active');
      const link = li.querySelector(`[data-section="${targetSection}"]`);
      if (link) {
        li.classList.add('active');
      }
    });
  }
  
  // Actualizar sección visible
  const sections = document.querySelectorAll('.dashboard-content-section');
  if (sections) {
    sections.forEach(section => {
      section.classList.remove('active');
    });
  }
  
  const targetElement = document.getElementById(targetSection);
  if (targetElement) targetElement.classList.add('active');
}

/**
 * Activar/desactivar modo oscuro
 * @param {boolean} value - Estado del modo oscuro (opcional)
 */
function toggleDarkMode(value) {
  try {
    // Si se proporciona un valor, usar ese; si no, alternar
    darkMode = value !== undefined ? value : !darkMode;
    
    const body = document.body;
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (darkMode) {
      if (body) body.classList.add('dark-mode');
      if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
      if (body) body.classList.remove('dark-mode');
      if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Guardar preferencia
    localStorage.setItem('darkMode', darkMode);
    
    // Actualizar switch en configuración si existe
    const darkThemeToggle = document.getElementById('dark-theme-toggle');
    if (darkThemeToggle) {
      darkThemeToggle.checked = darkMode;
    }
  } catch (error) {
    console.error('Error al cambiar modo oscuro:', error);
  }
}

/**
 * Cambiar color primario
 * @param {string} color - Código hexadecimal del color
 */
function changePrimaryColor(color) {
  try {
    if (!color) return;
    
    document.documentElement.style.setProperty('--primary-color', color);
    
    // Ajustar color oscuro basado en el primario
    const darkenedColor = darkenColor(color, 20);
    document.documentElement.style.setProperty('--primary-dark', darkenedColor);
    
    // Guardar preferencia
    localStorage.setItem('primaryColor', color);
    
    // Actualizar selección en la UI
    const colorOptions = document.querySelectorAll('.color-option');
    if (colorOptions) {
      colorOptions.forEach(option => {
        option.classList.remove('selected');
        const input = option.querySelector('input');
        if (input && input.value === color) {
          option.classList.add('selected');
        }
      });
    }
  } catch (error) {
    console.error('Error al cambiar color primario:', error);
  }
}

/**
 * Oscurecer color (para generar variante dark)
 * @param {string} hex - Color en hexadecimal
 * @param {number} percent - Porcentaje de oscurecimiento
 * @returns {string} - Color oscurecido en hexadecimal
 */
function darkenColor(hex, percent) {
  try {
    if (!hex || typeof hex !== 'string' || !hex.startsWith('#') || hex.length !== 7) {
      return '#0056b3'; // Valor por defecto si hay error
    }
    
    // Convertir a RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Aplicar porcentaje de oscurecimiento
    r = Math.max(0, Math.floor(r * (100 - percent) / 100));
    g = Math.max(0, Math.floor(g * (100 - percent) / 100));
    b = Math.max(0, Math.floor(b * (100 - percent) / 100));
    
    // Convertir de vuelta a hex
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  } catch (error) {
    console.error('Error al oscurecer color:', error);
    return '#0056b3'; // Valor por defecto si hay error
  }
}

/**
 * Mostrar ayuda
 */
function showHelp() {
  showNotification('Sistema de Gestión de Reclutas: Versión 2.0. Para más información, contacta al soporte técnico.', 'info');
}

/**
 * Toggle dropdown de perfil
 */
function toggleProfileDropdown() {
  const dropdown = document.getElementById('profile-dropdown-content');
  if (dropdown) dropdown.classList.toggle('show');
}

/**
 * Cerrar menús al hacer clic fuera
 * @param {Event} event - Evento de clic
 */
function closeMenusOnClickOutside(event) {
  // No hacer nada si no hay evento
  if (!event || !event.target) return;
  
  // Dropdown de perfil
  if (!event.target.matches('.profile-dropdown-button') && 
      !event.target.closest('.profile-dropdown-button')) {
    const dropdown = document.getElementById('profile-dropdown-content');
    if (dropdown && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
    }
  }
  
  // Modal de añadir recluta
  const addModal = document.getElementById('add-recluta-modal');
  if (addModal && event.target === addModal) {
    closeAddReclutaModal();
  }
  
  // Modal de ver/editar recluta
  const viewModal = document.getElementById('view-recluta-modal');
  if (viewModal && event.target === viewModal) {
    closeViewReclutaModal();
  }
  
  // Modal de confirmación
  const confirmModal = document.getElementById('confirm-modal');
  if (confirmModal && event.target === confirmModal) {
    closeConfirmModal();
  }
  
  // Modal de programación de entrevista
  const scheduleModal = document.getElementById('schedule-interview-modal');
  if (scheduleModal && event.target === scheduleModal) {
    closeScheduleModal();
  }
  
  // Modal de ver entrevista
  const viewInterviewModal = document.getElementById('view-interview-modal');
  if (viewInterviewModal && event.target === viewInterviewModal) {
    closeViewInterviewModal();
  }
  
  // Modal de olvidó contraseña
  const forgotModal = document.getElementById('forgot-password-modal');
  if (forgotModal && event.target === forgotModal) {
    closeForgotPasswordModal();
  }
}

/**
 * Aplicar tema guardado
 */
function applyStoredTheme() {
  try {
    // Comprobar si hay un tema guardado en localStorage
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme === 'true') {
      toggleDarkMode(true);
    }
    
    // Comprobar si hay un color primario guardado
    const savedColor = localStorage.getItem('primaryColor');
    if (savedColor) {
      changePrimaryColor(savedColor);
    }
  } catch (error) {
    console.error('Error al cargar tema guardado:', error);
  }
}

/**
 * Inicializar eventos generales
 */
function initGeneralEvents() {
  // Toggle modo oscuro
  const darkModeToggle = document.getElementById('dark-mode-toggle');
  if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => toggleDarkMode());
  }
  
  // Toggle de tema en configuración
  const darkThemeToggle = document.getElementById('dark-theme-toggle');
  if (darkThemeToggle) {
    darkThemeToggle.addEventListener('change', function() {
      toggleDarkMode(this.checked);
    });
  }
  
  // Cambio de color primario
  const colorOptions = document.querySelectorAll('input[name="primary-color"]');
  if (colorOptions && colorOptions.length > 0) {
    colorOptions.forEach(option => {
      option.addEventListener('change', function() {
        changePrimaryColor(this.value);
      });
    });
  }
  
  // Botón de ayuda
  const helpButton = document.getElementById('help-button');
  if (helpButton) {
    helpButton.addEventListener('click', showHelp);
  }
  
  // Dropdown de perfil
  const profileDropdownButton = document.getElementById('profile-dropdown-button');
  if (profileDropdownButton) {
    profileDropdownButton.addEventListener('click', toggleProfileDropdown);
  }
  
  // Cerrar notificaciones
  const notificationCloseButton = document.getElementById('notification-close');
  if (notificationCloseButton) {
    notificationCloseButton.addEventListener('click', hideNotification);
  }
  
  // Navegación del dashboard
  const navLinks = document.querySelectorAll('.dashboard-nav a');
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetSection = this.getAttribute('data-section');
        changeActiveSection(targetSection);
      });
    });
  }
  
  // Enlace de logout
  const logoutButton = document.getElementById('logout-button');
  if (logoutButton) {
    logoutButton.addEventListener('click', function(e) {
      e.preventDefault();
      auth.logout();
    });
  }
  
  // Cerrar menús/modales al hacer clic fuera
  window.addEventListener('click', closeMenusOnClickOutside);
  
  // Forgot password link
  const forgotPasswordLink = document.querySelector('.forgot-password');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener('click', function(e) {
      e.preventDefault();
      auth.showForgotPasswordModal();
    });
  }
  
  // Inicializar eventos de entrada
  document.getElementById('login-button')?.addEventListener('click', auth.login);
  document.getElementById('profile-upload')?.addEventListener('change', auth.uploadProfilePhoto);
  document.getElementById('update-profile-btn')?.addEventListener('click', auth.updateProfile);
  document.getElementById('change-password-btn')?.addEventListener('click', auth.changePassword);
  document.getElementById('send-recovery-btn')?.addEventListener('click', auth.sendPasswordRecovery);
}

// Exportar funciones para uso global
window.utils = {
  showNotification,
  hideNotification,
  formatDate,
  changeActiveSection,
  toggleDarkMode,
  changePrimaryColor,
  showHelp,
  applyStoredTheme,
  initGeneralEvents
};
