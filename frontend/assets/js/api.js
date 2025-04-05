/**
 * API Client para el Sistema de Gestión de Reclutas
 * 
 * Este módulo centraliza todas las comunicaciones con el backend
 */

// URL base de la API
const API_URL = 'http://localhost:5000/api';

// Token de autenticación almacenado
let token = localStorage.getItem('token');

/**
 * Actualiza el token de autenticación
 * @param {string} newToken - Nuevo token JWT
 */
const setToken = (newToken) => {
  token = newToken;
  localStorage.setItem('token', newToken);
};

/**
 * Elimina el token de autenticación (logout)
 */
const removeToken = () => {
  token = null;
  localStorage.removeItem('token');
};

/**
 * Función base para realizar peticiones a la API
 * @param {string} endpoint - Endpoint relativo a la URL base
 * @param {Object} options - Opciones de fetch
 * @returns {Promise<Object>} - Respuesta del servidor
 */
const fetchApi = async (endpoint, options = {}) => {
  // Construir opciones de la petición
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
    }
  };

  // Añadir token de autenticación si existe
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  // Combinar opciones por defecto con las proporcionadas
  const fetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, fetchOptions);
    const data = await response.json();

    if (!response.ok) {
      // Si el error es de autenticación, redirigir al login
      if (response.status === 401) {
        removeToken();
        window.dispatchEvent(new CustomEvent('session-expired'));
        throw new Error('Sesión expirada. Por favor inicie sesión de nuevo.');
      }
      
      throw new Error(data.error || 'Ha ocurrido un error');
    }

    return data;
  } catch (error) {
    console.error('Error en la petición:', error);
    throw error;
  }
};

/**
 * API Client con todas las funciones para comunicarse con el backend
 */
const api = {
  setToken,
  removeToken,
  
  /**
   * Autenticación y gestión de usuarios
   */
  auth: {
    /**
     * Iniciar sesión
     * @param {string} email - Email del usuario
     * @param {string} password - Contraseña del usuario
     * @returns {Promise<Object>} - Datos del usuario y token
     */
    login: async (email, password) => {
      const data = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      
      if (data.token) {
        setToken(data.token);
      }
      
      return data;
    },
    
    /**
     * Cerrar sesión
     * @returns {Promise<Object>}
     */
    logout: async () => {
      await fetchApi('/auth/logout');
      removeToken();
    },
    
    /**
     * Registrar nuevo usuario (solo admin)
     * @param {Object} userData - Datos del nuevo usuario
     * @returns {Promise<Object>} - Usuario creado
     */
    register: async (userData) => {
      return await fetchApi('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      });
    },
    
    /**
     * Obtener perfil del usuario actual
     * @returns {Promise<Object>} - Datos del usuario
     */
    getProfile: async () => {
      return await fetchApi('/auth/me');
    },
    
    /**
     * Actualizar datos de perfil
     * @param {Object} userData - Datos a actualizar del usuario
     * @returns {Promise<Object>} - Usuario actualizado
     */
    updateProfile: async (userData) => {
      return await fetchApi('/auth/updatedetails', {
        method: 'PUT',
        body: JSON.stringify(userData)
      });
    },
    
    /**
     * Cambiar contraseña
     * @param {string} currentPassword - Contraseña actual
     * @param {string} newPassword - Nueva contraseña
     * @returns {Promise<Object>}
     */
    changePassword: async (currentPassword, newPassword) => {
      return await fetchApi('/auth/updatepassword', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });
    },
    
    /**
     * Subir foto de perfil
     * @param {FormData} photoFormData - FormData con la foto
     * @returns {Promise<Object>}
     */
    uploadProfilePhoto: async (photoFormData) => {
      return await fetchApi('/auth/photo', {
        method: 'PUT',
        headers: {
          // No incluir Content-Type para que el navegador establezca el boundary correcto
        },
        body: photoFormData
      });
    },
    
    /**
     * Solicitar recuperación de contraseña
     * @param {string} email - Email del usuario
     * @returns {Promise<Object>}
     */
    forgotPassword: async (email) => {
      return await fetchApi('/auth/forgotpassword', {
        method: 'POST',
        body: JSON.stringify({ email })
      });
    },
    
    /**
     * Restablecer contraseña con token
     * @param {string} token - Token de recuperación
     * @param {string} password - Nueva contraseña
     * @returns {Promise<Object>}
     */
    resetPassword: async (token, password) => {
      return await fetchApi(`/auth/resetpassword/${token}`, {
        method: 'PUT',
        body: JSON.stringify({ password })
      });
    }
  },
  
  /**
   * Gestión de reclutas
   */
  reclutas: {
    /**
     * Obtener lista de reclutas
     * @param {string} queryParams - Parámetros de consulta (opcional)
     * @returns {Promise<Object>} - Lista de reclutas
     */
    getAll: async (queryParams = '') => {
      return await fetchApi(`/reclutas${queryParams}`);
    },
    
    /**
     * Obtener un recluta específico
     * @param {string} id - ID del recluta
     * @returns {Promise<Object>} - Datos del recluta
     */
    getOne: async (id) => {
      return await fetchApi(`/reclutas/${id}`);
    },
    
    /**
     * Crear nuevo recluta
     * @param {Object} reclutaData - Datos del recluta
     * @returns {Promise<Object>} - Recluta creado
     */
    create: async (reclutaData) => {
      return await fetchApi('/reclutas', {
        method: 'POST',
        body: JSON.stringify(reclutaData)
      });
    },
    
    /**
     * Actualizar recluta
     * @param {string} id - ID del recluta
     * @param {Object} reclutaData - Datos a actualizar
     * @returns {Promise<Object>} - Recluta actualizado
     */
    update: async (id, reclutaData) => {
      return await fetchApi(`/reclutas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(reclutaData)
      });
    },
    
    /**
     * Eliminar recluta
     * @param {string} id - ID del recluta
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
      return await fetchApi(`/reclutas/${id}`, {
        method: 'DELETE'
      });
    },
    
    /**
     * Subir foto de recluta
     * @param {string} id - ID del recluta
     * @param {FormData} photoFormData - FormData con la foto
     * @returns {Promise<Object>}
     */
    uploadPhoto: async (id, photoFormData) => {
      return await fetchApi(`/reclutas/${id}/photo`, {
        method: 'PUT',
        headers: {
          // No incluir Content-Type para que el navegador establezca el boundary correcto
        },
        body: photoFormData
      });
    }
  },
  
  /**
   * Gestión de entrevistas
   */
  entrevistas: {
    /**
     * Obtener todas las entrevistas
     * @returns {Promise<Object>} - Lista de entrevistas
     */
    getAll: async () => {
      return await fetchApi('/entrevistas');
    },
    
    /**
     * Obtener entrevistas de un recluta
     * @param {string} reclutaId - ID del recluta
     * @returns {Promise<Object>} - Lista de entrevistas del recluta
     */
    getByRecluta: async (reclutaId) => {
      return await fetchApi(`/reclutas/${reclutaId}/entrevistas`);
    },
    
    /**
     * Obtener una entrevista específica
     * @param {string} id - ID de la entrevista
     * @returns {Promise<Object>} - Datos de la entrevista
     */
    getOne: async (id) => {
      return await fetchApi(`/entrevistas/${id}`);
    },
    
    /**
     * Crear nueva entrevista
     * @param {string} reclutaId - ID del recluta
     * @param {Object} entrevistaData - Datos de la entrevista
     * @returns {Promise<Object>} - Entrevista creada
     */
    create: async (reclutaId, entrevistaData) => {
      return await fetchApi(`/reclutas/${reclutaId}/entrevistas`, {
        method: 'POST',
        body: JSON.stringify(entrevistaData)
      });
    },
    
    /**
     * Actualizar entrevista
     * @param {string} id - ID de la entrevista
     * @param {Object} entrevistaData - Datos a actualizar
     * @returns {Promise<Object>} - Entrevista actualizada
     */
    update: async (id, entrevistaData) => {
      return await fetchApi(`/entrevistas/${id}`, {
        method: 'PUT',
        body: JSON.stringify(entrevistaData)
      });
    },
    
    /**
     * Eliminar entrevista
     * @param {string} id - ID de la entrevista
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
      return await fetchApi(`/entrevistas/${id}`, {
        method: 'DELETE'
      });
    },
    
    /**
     * Enviar recordatorio de entrevista
     * @param {string} id - ID de la entrevista
     * @returns {Promise<Object>}
     */
    sendReminder: async (id) => {
      return await fetchApi(`/entrevistas/${id}/enviarrecordatorio`, {
        method: 'POST'
      });
    }
  },
  
  /**
   * Estadísticas y dashboard
   */
  stats: {
    /**
     * Obtener estadísticas para el dashboard
     * @returns {Promise<Object>} - Datos para el dashboard
     */
    getDashboard: async () => {
      return await fetchApi('/stats/dashboard');
    },
    
    /**
     * Obtener estadísticas de reclutas
     * @returns {Promise<Object>} - Estadísticas de reclutas
     */
    getReclutas: async () => {
      return await fetchApi('/stats/reclutas');
    },
    
    /**
     * Obtener estadísticas de entrevistas
     * @returns {Promise<Object>} - Estadísticas de entrevistas
     */
    getEntrevistas: async () => {
      return await fetchApi('/stats/entrevistas');
    },
    
    /**
     * Obtener datos de calendario para un mes específico
     * @param {number} mes - Mes (0-11)
     * @param {number} año - Año
     * @returns {Promise<Object>} - Datos del calendario
     */
    getCalendario: async (mes, año) => {
      return await fetchApi(`/stats/calendario?mes=${mes}&año=${año}`);
    }
  },
  
  /**
   * Búsqueda avanzada
   */
  search: {
    /**
     * Búsqueda avanzada de reclutas
     * @param {Object} params - Parámetros de búsqueda
     * @returns {Promise<Object>} - Resultados de búsqueda
     */
    reclutas: async (params) => {
      // Construir queryString a partir de un objeto de parámetros
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      return await fetchApi(`/search/reclutas?${queryString}`);
    },
    
    /**
     * Obtener puestos únicos para filtrado
     * @returns {Promise<Object>} - Lista de puestos únicos
     */
    getPuestos: async () => {
      return await fetchApi('/search/puestos');
    }
  }
};

// Exponer la API globalmente para facilitar el uso
window.api = api;
