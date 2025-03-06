// auth.js
// Este archivo contiene las funciones de autenticación

import supabase from './supabase-client.js';

/**
 * Inicia sesión con email y contraseña
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @returns {Promise} - Resultado de la autenticación
 */
export async function signIn(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        return { user: null, error };
    }
}

/**
 * Registra un nuevo usuario (para implementar la funcionalidad "Solicitar Acceso")
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña
 * @param {Object} userData - Datos adicionales del usuario
 * @returns {Promise} - Resultado del registro
 */
export async function signUp(email, password, userData = {}) {
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData // Metadatos adicionales del usuario
            }
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Error al registrar usuario:', error.message);
        return { user: null, error };
    }
}

/**
 * Cierra la sesión actual
 * @returns {Promise} - Resultado del cierre de sesión
 */
export async function signOut() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error al cerrar sesión:', error.message);
        return { error };
    }
}

/**
 * Recupera la sesión actual del usuario
 * @returns {Promise} - Información de la sesión actual
 */
export async function getCurrentUser() {
    try {
        const { data, error } = await supabase.auth.getUser();
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Error al obtener usuario actual:', error.message);
        return { user: null, error };
    }
}

/**
 * Recupera la contraseña del usuario
 * @param {string} email - Email del usuario
 * @returns {Promise} - Resultado de la solicitud de recuperación
 */
export async function resetPassword(email) {
    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/reset-password.html',
        });
        
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error al solicitar recuperación de contraseña:', error.message);
        return { error };
    }
}

/**
 * Actualiza el perfil del usuario
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise} - Resultado de la actualización
 */
export async function updateProfile(updates) {
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: updates
        });
        
        if (error) throw error;
        return { user: data.user, error: null };
    } catch (error) {
        console.error('Error al actualizar perfil:', error.message);
        return { user: null, error };
    }
}