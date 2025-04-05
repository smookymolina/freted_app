/**
 * Módulo de autenticación para el Sistema de Gestión de Reclutas
 * 
 * Maneja login, logout y gestión de sesiones
 */

// Referencia al usuario actual
let currentUser = null;

/**
 * Verifica si hay una sesión activa al cargar la página
 * @returns {Promise<boolean>} - true si hay sesión activa
 */
async function checkSession() {
  try {
    // Verificar si hay token almacenado
    const token = localStorage.getItem('token');
    if (!token) {
      showLoginScreen();
      return false;
    }
    
    // Validar token obteniendo perfil
    const response = await api.auth.getProfile();
    currentUser = response.data;
    
    // Mostrar dashboard
    showDashboard();
    return true;
  } catch (error) {
    console.error('Error verificando sesión:', error);
    showLoginScreen();
    return false;
  }
}

/**
 * Iniciar sesión con credenciales
 * @returns {Promise<void>}
 */
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  if (!email || !password) {
    showNotification('Por favor, completa todos los campos', 'error');
    return;
  }
  
  // Mostrar estado de carga
  const loginButton = document.getElementById('login-button');
  if (!loginButton) return;
  
  loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
  loginButton.disabled = true;
  
  try {
    // Llamar a la API de login
    const response = await api.auth.login(email, password);
    
    // Guardar datos del usuario
    currentUser = response.data;
    
    // Mostrar dashboard
    showDashboard();
    
    // Mostrar notificación de bienvenida
    showNotification(`¡Bienvenido ${currentUser.nombre}! Has iniciado sesión correctamente.`, 'success');
    
  } catch (error) {
    showNotification('Error al iniciar sesión: ' + (error.message || 'Verifica tus credenciales'), 'error');
  } finally {
    // Restaurar el botón de login
    if (loginButton) {
      loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
      loginButton.disabled = false;
    }
  }
}

/**
 * Cerrar sesión
 * @returns {Promise<void>}
 */
async function logout() {
  try {
    await api.auth.logout();
    currentUser = null;
    showLoginScreen();
    showNotification('Has cerrado sesión correctamente', 'success');
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    // Aún así, limpiar datos locales
    api.removeToken();
    currentUser = null;
    showLoginScreen();
  }
}

/**
 * Mostrar pantalla de login
 */
function showLoginScreen() {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  
  if (loginSection) loginSection.style.display = 'block';
  if (dashboardSection) dashboardSection.style.display = 'none';
  
  // Limpiar campos
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  
  if (emailInput) emailInput.value = '';
  if (passwordInput) passwordInput.value = '';
}

/**
 * Mostrar dashboard con datos del usuario
 */
function showDashboard() {
  const loginSection = document.getElementById('login-section');
  const dashboardSection = document.getElementById('dashboard-section');
  
  if (loginSection) loginSection.style.display = 'none';
  if (dashboardSection) dashboardSection.style.display = 'block';
  
  // Actualizar información del usuario en la UI
  updateUserInfo();
  
  // Cargar reclutas del usuario
  loadReclutas();
}

/**
 * Actualizar información del usuario en la interfaz
 */
function updateUserInfo() {
  if (!currentUser) return;
  
  const gerenteName = document.getElementById('gerente-name');
  const dropdownUserName = document.getElementById('dropdown-user-name');
  const dashboardProfilePic = document.getElementById('dashboard-profile-pic');
  
  if (gerenteName) gerenteName.textContent = currentUser.nombre;
  if (dropdownUserName) dropdownUserName.textContent = currentUser.nombre;
  
  if (dashboardProfilePic && currentUser.profileUrl) {
    dashboardProfilePic.src = currentUser.profileUrl;
  } else if (dashboardProfilePic) {
    dashboardProfilePic.src = 'assets/img/placeholder.png';
  }
  
  // Inicializar datos del usuario en el formulario de perfil
  const userNameField = document.getElementById('user-name');
  const userEmail = document.getElementById('user-email');
  const userPhone = document.getElementById('user-phone');
  
  if (userNameField) userNameField.value = currentUser.nombre || '';
  if (userEmail) userEmail.value = currentUser.email || '';
  if (userPhone) userPhone.value = currentUser.telefono || '';
}

/**
 * Mostrar modal de recuperación de contraseña
 */
function showForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) {
    modal.style.display = 'block';
    
    // Limpiar campo
    const recoveryEmail = document.getElementById('recovery-email');
    if (recoveryEmail) recoveryEmail.value = '';
  }
}

/**
 * Cerrar modal de recuperación de contraseña
 */
function closeForgotPasswordModal() {
  const modal = document.getElementById('forgot-password-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

/**
 * Enviar solicitud de recuperación de contraseña
 * @returns {Promise<void>}
 */
async function sendPasswordRecovery() {
  const recoveryEmail = document.getElementById('recovery-email');
  const sendButton = document.getElementById('send-recovery-btn');
  
  if (!recoveryEmail || !recoveryEmail.value) {
    showNotification('Por favor ingresa tu dirección de correo electrónico', 'error');
    return;
  }
  
  try {
    if (sendButton) {
      sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
      sendButton.disabled = true;
    }
    
    await api.auth.forgotPassword(recoveryEmail.value);
    
    closeForgotPasswordModal();
    showNotification('Se han enviado instrucciones de recuperación a tu correo', 'success');
  } catch (error) {
    showNotification('Error: ' + (error.message || 'No se pudo procesar la solicitud'), 'error');
  } finally {
    if (sendButton) {
      sendButton.innerHTML = '<i class="fas fa-paper-plane"></i> Enviar Instrucciones';
      sendButton.disabled = false;
    }
  }
}

/**
 * Actualizar perfil de usuario
 * @returns {Promise<void>}
 */
async function updateProfile() {
  const nameField = document.getElementById('user-name');
  const emailField = document.getElementById('user-email');
  const phoneField = document.getElementById('user-phone');
  const updateButton = document.getElementById('update-profile-btn');
  
  if (!nameField || !emailField) {
    showNotification('Faltan campos requeridos', 'error');
    return;
  }
  
  // Datos actualizados
  const userData = {
    nombre: nameField.value,
    email: emailField.value,
    telefono: phoneField ? phoneField.value : undefined
  };
  
  try {
    if (updateButton) {
      updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
      updateButton.disabled = true;
    }
    
    const response = await api.auth.updateProfile(userData);
    currentUser = response.data;
    
    updateUserInfo();
    showNotification('Perfil actualizado correctamente', 'success');
  } catch (error) {
    showNotification('Error: ' + (error.message || 'No se pudo actualizar el perfil'), 'error');
  } finally {
    if (updateButton) {
      updateButton.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
      updateButton.disabled = false;
    }
  }
}

/**
 * Cambiar contraseña
 * @returns {Promise<void>}
 */
async function changePassword() {
  const currentPasswordField = document.getElementById('current-password');
  const newPasswordField = document.getElementById('new-password');
  const confirmPasswordField = document.getElementById('confirm-password');
  const changeButton = document.getElementById('change-password-btn');
  
  if (!currentPasswordField || !newPasswordField || !confirmPasswordField) {
    showNotification('Error al obtener campos del formulario', 'error');
    return;
  }
  
  const currentPassword = currentPasswordField.value;
  const newPassword = newPasswordField.value;
  const confirmPassword = confirmPasswordField.value;
  
  if (!currentPassword || !newPassword || !confirmPassword) {
    showNotification('Por favor, completa todos los campos', 'error');
    return;
  }
  
  if (newPassword !== confirmPassword) {
    showNotification('Las contraseñas nuevas no coinciden', 'error');
    return;
  }
  
  try {
    if (changeButton) {
      changeButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cambiando...';
      changeButton.disabled = true;
    }
    
    await api.auth.changePassword(currentPassword, newPassword);
    
    // Limpiar campos
    currentPasswordField.value = '';
    newPasswordField.value = '';
    confirmPasswordField.value = '';
    
    showNotification('Contraseña cambiada correctamente', 'success');
  } catch (error) {
    showNotification('Error: ' + (error.message || 'No se pudo cambiar la contraseña'), 'error');
  } finally {
    if (changeButton) {
      changeButton.innerHTML = '<i class="fas fa-key"></i> Cambiar Contraseña';
      changeButton.disabled = false;
    }
  }
}

/**
 * Subir foto de perfil
 * @param {Event} event - Evento de cambio del input file
 * @returns {Promise<void>}
 */
async function uploadProfilePhoto(event) {
  if (!event || !event.target || !event.target.files || !event.target.files[0]) return;
  
  const file = event.target.files[0];
  const profilePic = document.getElementById('dashboard-profile-pic');
  
  if (!profilePic) return;
  
  try {
    // Mostrar vista previa antes de subir
    const reader = new FileReader();
    reader.onload = function(e) {
      if (e && e.target && e.target.result) {
        profilePic.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
    
    // Crear FormData
    const formData = new FormData();
    formData.append('photo', file);
    
    // Subir a la API
    const response = await api.auth.uploadProfilePhoto(formData);
    
    // Actualizar URL en usuario actual
    if (currentUser) {
      currentUser.profileUrl = response.data.profileUrl;
    }
    
    showNotification('Foto de perfil actualizada correctamente', 'success');
  } catch (error) {
    showNotification('Error al subir la foto: ' + (error.message || 'Intenta de nuevo'), 'error');
  }
}

/**
 * Manejo de eventos de sesión expirada
 */
window.addEventListener('session-expired', () => {
  showNotification('Tu sesión ha expirado. Por favor inicia sesión nuevamente.', 'warning');
  showLoginScreen();
});

// Exportar funciones para uso global
window.auth = {
  checkSession,
  login,
  logout,
  showForgotPasswordModal,
  closeForgotPasswordModal,
  sendPasswordRecovery,
  updateProfile,
  changePassword,
  uploadProfilePhoto,
  getCurrentUser: () => currentUser
};