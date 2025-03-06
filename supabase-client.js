// app.js - Script principal actualizado con integración real de Supabase

// Inicialización de Supabase - Usamos el cliente importado desde supabase-client.js
let supabase;
let currentGerente = null;
let profileImage = null;
let reclutaImage = null;

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si estamos usando el cliente modular o necesitamos inicializarlo directamente
    if (!window.supabase) {
        const SUPABASE_URL = 'https://ennikrxyqkafmoflgpam.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVubmlrcnh5cWthZm1vZmxncGFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzMDE5NjEsImV4cCI6MjA1Njg3Nzk2MX0.yKYRFduvVkm2NkYg7SkCovrF6qSLbUXiKzxTAjU0oyI';
        supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    } else {
        supabase = window.supabase;
    }

    // Verificar si hay una sesión activa
    checkSession();

    // Configurar listeners de eventos
    setupEventListeners();
});

// Verificar si hay una sesión activa
async function checkSession() {
    try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
            console.error('Error al verificar sesión:', error.message);
            return;
        }
        
        if (data.session) {
            // Si hay una sesión, obtener el usuario actual
            const { data: userData, error: userError } = await supabase.auth.getUser();
            
            if (userError) {
                console.error('Error al obtener usuario:', userError.message);
                return;
            }
            
            if (userData.user) {
                currentGerente = userData.user;
                
                // Mostrar el panel de control y configurar la UI
                document.getElementById('login-section').style.display = 'none';
                document.getElementById('dashboard-section').style.display = 'block';
                document.getElementById('gerente-name').textContent = userData.user.email.split('@')[0];
                
                // Mostrar avatar si existe
                if (userData.user.user_metadata && userData.user.user_metadata.avatar_url) {
                    document.getElementById('dashboard-profile-pic').src = userData.user.user_metadata.avatar_url;
                }
                
                // Cargar los reclutas
                loadReclutas();
            }
        } else {
            // Asegurar que se muestre la pantalla de login
            document.getElementById('login-section').style.display = 'block';
            document.getElementById('dashboard-section').style.display = 'none';
        }
    } catch (err) {
        console.error('Error al verificar sesión:', err);
    }
}

// Configurar event listeners
function setupEventListeners() {
    // Deshabilitar el botón de selección de foto de perfil inicialmente
    const profileUploadButton = document.getElementById('profile-upload');
    if (profileUploadButton) {
        profileUploadButton.disabled = true;
        document.querySelector('#login-section button[type="button"]').disabled = true;
        
        // Manejo de la foto de perfil en el login
        profileUploadButton.addEventListener('change', handleProfileImageChange);
    }
    
    // Manejo de la foto del recluta
    const reclutaUploadButton = document.getElementById('recluta-upload');
    if (reclutaUploadButton) {
        reclutaUploadButton.addEventListener('change', handleReclutaImageChange);
    }
    
    // Cambio de color de fondo
    const colorPicker = document.getElementById('page-color');
    if (colorPicker) {
        colorPicker.addEventListener('change', function() {
            changeBackgroundColor(this.value);
        });
    }
}

// Manejador para cambio de imagen de perfil
function handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('login-profile-pic').src = e.target.result;
            profileImage = file;
        };
        reader.readAsDataURL(file);
    }
}

// Manejador para cambio de imagen de recluta
function handleReclutaImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const previewDiv = document.getElementById('recluta-pic-preview');
            // Limpiar el div
            previewDiv.innerHTML = '';
            // Crear imagen
            const img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('profile-pic');
            img.style.margin = '0';
            img.style.width = '80px';
            img.style.height = '80px';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            previewDiv.appendChild(img);
            reclutaImage = file;
        };
        reader.readAsDataURL(file);
    }
}

// Función de inicio de sesión
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Por favor, completa todos los campos");
        return;
    }
    
    // Mostrar indicador de carga
    const loginButton = document.querySelector('#login-section button[type="submit"]');
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    loginButton.disabled = true;
    
    try {
        // Iniciar sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) {
            throw error;
        }
        
        // Habilitar el botón de selección de foto de perfil después del inicio de sesión
        document.getElementById('profile-upload').disabled = false;
        document.querySelector('#login-section button[type="button"]').disabled = false;
        
        // Si hay un archivo de imagen, subir a storage
        if (profileImage) {
            const fileName = `profile_${Date.now()}.jpg`;
            const filePath = `${data.user.id}/${fileName}`;
            
            const { data: fileData, error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, profileImage, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Error al subir imagen de perfil:', uploadError);
            } else {
                // Obtener la URL pública
                const { data: publicUrlData } = supabase.storage
                    .from('profiles')
                    .getPublicUrl(filePath);
                
                // Actualizar los metadatos del usuario con la URL del avatar
                await supabase.auth.updateUser({
                    data: { avatar_url: publicUrlData.publicUrl }
                });
                
                // Actualizar la variable del usuario actual
                data.user.user_metadata = { 
                    ...data.user.user_metadata, 
                    avatar_url: publicUrlData.publicUrl 
                };
            }
        }
        
        currentGerente = data.user;
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('gerente-name').textContent = data.user.email.split('@')[0];
        
        // Mostrar avatar si existe
        if (data.user.user_metadata && data.user.user_metadata.avatar_url) {
            document.getElementById('dashboard-profile-pic').src = data.user.user_metadata.avatar_url;
        }
        
        // Cargar reclutas
        loadReclutas();
        
    } catch (error) {
        alert(error.message || 'Error al iniciar sesión');
        console.error('Error al iniciar sesión:', error);
    } finally {
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        loginButton.disabled = false;
    }
}

// Cargar reclutas del gerente actual
async function loadReclutas() {
    if (!currentGerente) return;
    
    try {
        const { data, error } = await supabase
            .from('reclutas')
            .select('*')
            .eq('gerente_id', currentGerente.id);
        
        if (error) {
            throw error;
        }
        
        const reclutasList = document.getElementById('reclutas-list');
        reclutasList.innerHTML = '';
        
        if (!data || data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" style="text-align: center; padding: 15px;">No se encontraron reclutas. ¡Agrega tu primer recluta!</td>`;
            reclutasList.appendChild(row);
        } else {
            data.forEach(recluta => {
                const row = document.createElement('tr');
                row.style.borderBottom = '1px solid #dee2e6';
                
                row.innerHTML = `
                    <td style="padding: 8px;">
                        <img src="${recluta.fotoUrl || '/api/placeholder/40/40'}" 
                             alt="${recluta.nombre}" 
                             style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                    </td>
                    <td style="padding: 8px;">${recluta.nombre}</td>
                    <td style="padding: 8px;">${recluta.email}</td>
                    <td style="padding: 8px;">${recluta.telefono}</td>
                    <td style="padding: 8px;">
                        <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; 
                                     background-color: ${recluta.estado === 'Activo' ? 'rgba(40, 167, 69, 0.15)' : 'rgba(255, 153, 0, 0.15)'};
                                     color: ${recluta.estado === 'Activo' ? '#28a745' : '#ff9900'};">
                            ${recluta.estado}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: right;">
                        <button class="action-btn" onclick="editRecluta(${recluta.id})" 
                                style="background: none; border: none; color: #007bff; cursor: pointer; margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn" onclick="deleteRecluta(${recluta.id})"
                                style="background: none; border: none; color: #dc3545; cursor: pointer;">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                reclutasList.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error al cargar reclutas:', error);
        alert('Error al cargar reclutas: ' + error.message);
    }
}

// Funciones del modal
function openAddReclutaModal() {
    document.getElementById('add-recluta-modal').style.display = 'block';
    // Limpiar formulario
    document.getElementById('recluta-nombre').value = '';
    document.getElementById('recluta-email').value = '';
    document.getElementById('recluta-telefono').value = '';
    document.getElementById('recluta-pic-preview').innerHTML = '<i class="fas fa-user-circle" style="font-size: 48px; color: #ccc;"></i>';
    reclutaImage = null;
}

function closeAddReclutaModal() {
    document.getElementById('add-recluta-modal').style.display = 'none';
}

// Agregar un nuevo recluta
async function addRecluta() {
    const nombre = document.getElementById('recluta-nombre').value;
    const email = document.getElementById('recluta-email').value;
    const telefono = document.getElementById('recluta-telefono').value;
    
    if (!nombre || !email || !telefono) {
        alert("Por favor, completa todos los campos");
        return;
    }
    
    const saveButton = document.querySelector('#add-recluta-modal button:last-child');
    saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    saveButton.disabled = true;
    
    try {
        // Datos básicos del recluta
        const reclutaData = {
            gerente_id: currentGerente.id,
            nombre,
            email,
            telefono,
            estado: 'En proceso',
            fotoUrl: '/api/placeholder/40/40' // URL por defecto
        };
        
        // Si hay una imagen de perfil, subirla primero
        if (reclutaImage) {
            const fileName = `recluta_${Date.now()}.jpg`;
            const filePath = `${currentGerente.id}/${fileName}`;
            
            const { data: fileData, error: uploadError } = await supabase.storage
                .from('reclutas')
                .upload(filePath, reclutaImage, {
                    cacheControl: '3600',
                    upsert: true
                });
            
            if (uploadError) {
                console.error('Error al subir imagen del recluta:', uploadError);
            } else {
                // Obtener la URL pública
                const { data: publicUrlData } = supabase.storage
                    .from('reclutas')
                    .getPublicUrl(filePath);
                
                // Actualizar la URL de la foto en los datos del recluta
                reclutaData.fotoUrl = publicUrlData.publicUrl;
            }
        }
        
        // Guardar el recluta en la base de datos
        const { data, error } = await supabase
            .from('reclutas')
            .insert([reclutaData])
            .select();
        
        if (error) {
            throw error;
        }
        
        // Cerrar el modal y recargar la lista de reclutas
        closeAddReclutaModal();
        loadReclutas();
        
    } catch (error) {
        console.error('Error al crear recluta:', error);
        alert('Error al crear recluta: ' + error.message);
    } finally {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Recluta';
        saveButton.disabled = false;
    }
}

// Eliminar un recluta
async function deleteRecluta(id) {
    if (confirm('¿Estás seguro de eliminar este recluta?')) {
        try {
            // Primero obtener los datos del recluta para poder eliminar la imagen si existe
            const { data: reclutaData, error: fetchError } = await supabase
                .from('reclutas')
                .select('*')
                .eq('id', id)
                .single();
            
            if (fetchError) {
                throw fetchError;
            }
            
            // Eliminar el recluta de la base de datos
            const { error } = await supabase
                .from('reclutas')
                .delete()
                .eq('id', id);
            
            if (error) {
                throw error;
            }
            
            // Si el recluta tenía una foto personalizada (no la imagen por defecto), eliminarla del storage
            if (reclutaData.fotoUrl && !reclutaData.fotoUrl.includes('/api/placeholder')) {
                // Extraer el path del archivo de la URL
                const urlParts = reclutaData.fotoUrl.split('/');
                const fileName = urlParts[urlParts.length - 1];
                const filePath = `${currentGerente.id}/${fileName}`;
                
                const { error: storageError } = await supabase.storage
                    .from('reclutas')
                    .remove([filePath]);
                
                if (storageError) {
                    console.error('Error al eliminar la imagen del recluta:', storageError);
                }
            }
            
            // Recargar la lista de reclutas
            loadReclutas();
            
        } catch (error) {
            console.error('Error al eliminar recluta:', error);
            alert('Error al eliminar recluta: ' + error.message);
        }
    }
}

// Editar un recluta (implementación básica para demo)
function editRecluta(id) {
    alert('Función de edición: En una implementación completa, aquí abrirías un modal con los datos del recluta ID: ' + id);
    // Para implementar la edición completa, necesitarías:
    // 1. Crear un modal similar al de agregar recluta
    // 2. Cargar los datos del recluta seleccionado
    // 3. Permitir editar los campos
    // 4. Actualizar la BD con supabase.from('reclutas').update(...)
}

// Cerrar sesión
async function logout() {
    try {
        const { error } = await supabase.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        currentGerente = null;
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.getElementById('login-profile-pic').src = '/api/placeholder/100/100';
        document.body.style.backgroundColor = "#e9f2f9";
        document.getElementById('page-color').value = "#e9f2f9";
        
        // Deshabilitar el botón de selección de foto de perfil al cerrar sesión
        document.getElementById('profile-upload').disabled = true;
        document.querySelector('#login-section button[type="button"]').disabled = true;
        
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Error al cerrar sesión: ' + error.message);
    }
}

// Cambiar color de fondo
function changeBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}

// Cerrar modal cuando se hace clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('add-recluta-modal');
    if (event.target === modal) {
        closeAddReclutaModal();
    }
};