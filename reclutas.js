// reclutas.js
// Este archivo contiene las funciones para gestionar los reclutas

import supabase from './supabase-client.js';

/**
 * Obtiene los reclutas asociados a un gerente
 * @param {string} gerenteId - ID del gerente
 * @returns {Promise} - Lista de reclutas
 */
export async function getReclutas(gerenteId) {
    try {
        const { data, error } = await supabase
            .from('reclutas')
            .select('*')
            .eq('gerente_id', gerenteId);
        
        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error al obtener reclutas:', error.message);
        return { data: [], error };
    }
}

/**
 * Crea un nuevo recluta
 * @param {Object} reclutaData - Datos del recluta
 * @returns {Promise} - Recluta creado
 */
export async function createRecluta(reclutaData) {
    try {
        const { data, error } = await supabase
            .from('reclutas')
            .insert([reclutaData])
            .select();
        
        if (error) throw error;
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Error al crear recluta:', error.message);
        return { data: null, error };
    }
}

/**
 * Actualiza un recluta existente
 * @param {string} reclutaId - ID del recluta
 * @param {Object} updates - Campos a actualizar
 * @returns {Promise} - Resultado de la actualización
 */
export async function updateRecluta(reclutaId, updates) {
    try {
        const { data, error } = await supabase
            .from('reclutas')
            .update(updates)
            .eq('id', reclutaId)
            .select();
        
        if (error) throw error;
        return { data: data[0], error: null };
    } catch (error) {
        console.error('Error al actualizar recluta:', error.message);
        return { data: null, error };
    }
}

/**
 * Elimina un recluta
 * @param {string} reclutaId - ID del recluta
 * @returns {Promise} - Resultado de la eliminación
 */
export async function deleteRecluta(reclutaId) {
    try {
        const { error } = await supabase
            .from('reclutas')
            .delete()
            .eq('id', reclutaId);
        
        if (error) throw error;
        return { error: null };
    } catch (error) {
        console.error('Error al eliminar recluta:', error.message);
        return { error };
    }
}