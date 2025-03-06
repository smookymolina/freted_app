// storage.js
// Este archivo contiene las funciones para manejar almacenamiento de archivos

import supabase from './supabase-client.js';

/**
 * Sube un archivo al almacenamiento de Supabase
 * @param {string} bucket - Nombre del bucket
 * @param {string} path - Ruta destino del archivo
 * @param {File} file - Archivo a subir
 * @returns {Promise} - Resultado de la subida con la URL pública
 */
export async function uploadFile(bucket, path, file) {
    try {
        // Subir el archivo
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(path, file, {
                cacheControl: '3600',
                upsert: true // Sobrescribe si ya existe
            });
        
        if (error) throw error;
        
        // Obtener la URL pública del archivo
        const { data: publicUrlData } = await supabase.storage
            .from(bucket)
            .getPublicUrl(path);
        
        return { 
            data: {
                path: data.path,
                publicUrl: publicUrlData.publicUrl
            }, 
            error: null 
        };
    } catch (error) {
        console.error('Error al subir archivo:', error.message);
        return { data: null, error };
    }
}

/**
 * Elimina un archivo del almacenamiento
 * @param {string} bucket - Nombre del bucket
 * @param {string} path - Ruta del archivo
 * @returns {Promise} - Resultado de la eliminación
 */
export async function deleteFile(bucket, path) {
    try {
        const { error } = await supabase.storage
            .from(bucket)
            .remove([path]);
        
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error al eliminar archivo:', error.message);
        return { error };
    }
}

/**
 * Crea un nombre de archivo único basado en id y timestamp
 * @param {string} userId - ID del usuario
 * @param {string} fileName - Nombre original del archivo
 * @returns {string} - Nombre de archivo único
 */
export function generateUniqueFileName(userId, fileName) {
    const timestamp = new Date().getTime();
    const extension = fileName.split('.').pop();
    return `${userId}_${timestamp}.${extension}`;
}