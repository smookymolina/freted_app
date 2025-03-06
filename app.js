// Inicialización de Supabase
const SUPABASE_URL = 'https://jizxkjrdmkylwmssjnws.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImppenhranJkbWt5bHdtc3NqbndzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzNTI1MjgsImV4cCI6MjA1NTkyODUyOH0.FaaBjP3nJE3E0LVsx9VJT2qI0lXbn9uJNQkgNO86IX8';

// Esto es solo un mockup para demostración - en producción usarías la librería real de Supabase
const supabase = {
    auth: {
        signIn: async function(credentials) {
            // Simulación de login para demo
            if (credentials.email && credentials.password) {
                return { 
                    user: { 
                        id: '12345', 
                        email: credentials.email,
                        profileUrl: '/api/placeholder/100/100' // Ahora usamos una imagen predeterminada
                    }, 
                    error: null 
                };
            } else {
                return { user: null, error: { message: 'Credenciales incorrectas' } };
            }
        },
        signOut: async function() {
            return { error: null };
        }
    },
    from: function(table) {
        return {
            select: function(columns) {
                return {
                    eq: function(field, value) {
                        // Datos simulados para la demo
                        return { 
                            data: [
                                { id: 1, nombre: 'Ana García', email: 'ana@ejemplo.com', telefono: '555-1234', estado: 'Activo', fotoUrl: '/api/placeholder/40/40' },
                                { id: 2, nombre: 'Carlos López', email: 'carlos@ejemplo.com', telefono: '555-5678', estado: 'En proceso', fotoUrl: '/api/placeholder/40/40' }
                            ], 
                            error: null 
                        };
                    }
                };
            },
            insert: function(data) {
                // Simulación de inserción
                return { data: [{ id: Math.floor(Math.random() * 1000), ...data }], error: null };
            },
            delete: function() {
                return {
                    eq: function(field, value) {
                        return { error: null };
                    }
                };
            }
        };
    },
    storage: {
        from: function(bucket) {
            return {
                upload: async function(path, file) {
                    // Simular subida de archivos
                    return { data: { path }, error: null };
                }
            };
        }
    }
};

let currentGerente = null;
let profileImage = null;
let reclutaImage = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Manejo de la foto de perfil en el dashboard (después del login)
    const profileUploadInput = document.getElementById('profile-upload');
    if (profileUploadInput) {
        profileUploadInput.addEventListener('change', handleProfileImageChange);
    }

    // Manejo de la foto del recluta
    const reclutaUploadInput = document.getElementById('recluta-upload');
    if (reclutaUploadInput) {
        reclutaUploadInput.addEventListener('change', handleReclutaImageChange);
    }

    // Configurar el botón de ajustes
    const settingsButton = document.getElementById('settings-button');
    if (settingsButton) {
        settingsButton.addEventListener('click', toggleSettingsDropdown);
    }

    // Cerrar el menú desplegable cuando se hace clic fuera de él
    window.addEventListener('click', closeDropdownOnClickOutside);

    // Cerrar modal cuando se hace clic fuera de él
    window.addEventListener('click', closeModalOnClickOutside);
});

// Manejo de imágenes
function handleProfileImageChange(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('dashboard-profile-pic').src = e.target.result;
            profileImage = file;
            
            // Actualizar la imagen de perfil en el objeto currentGerente
            if (currentGerente) {
                currentGerente.profileUrl = e.target.result;
                
                // En una implementación real, aquí subirías la imagen al servidor
                supabase.storage
                    .from('profiles')
                    .upload(`${currentGerente.id}/profile.jpg`, file)
                    .then(({ data, error }) => {
                        if (error) {
                            console.error('Error al subir la imagen:', error);
                        }
                    });
            }
        };
        reader.readAsDataURL(file);
    }
}

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
            previewDiv.appendChild(img);
            reclutaImage = file;
        };
        reader.readAsDataURL(file);
    }
}

// Funciones de UI
function toggleSettingsDropdown(event) {
    document.getElementById('settings-dropdown').classList.toggle('show');
    event.stopPropagation();
}

function closeDropdownOnClickOutside(event) {
    if (!event.target.matches('.settings-button') && !event.target.matches('.settings-button *')) {
        const dropdown = document.getElementById('settings-dropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    }
}

function closeModalOnClickOutside(event) {
    const modal = document.getElementById('add-recluta-modal');
    if (modal && event.target === modal) {
        closeAddReclutaModal();
    }
}

// Funciones de autenticación
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Por favor, completa todos los campos");
        return;
    }
    
    // Mostrar estado de carga
    const loginButton = document.querySelector('#login-section button');
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    loginButton.disabled = true;
    
    try {
        // Usar la autenticación real de Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        
        // Obtener datos adicionales del usuario desde la tabla usuarios
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (userError) throw userError;
        
        currentGerente = {
            ...data.user,
            nombre: userData.nombre,
            profileUrl: userData.foto_url || '/api/placeholder/100/100'
        };
        
        // Actualizar UI
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        document.getElementById('gerente-name').textContent = userData.nombre || data.user.email.split('@')[0];
        document.getElementById('dashboard-profile-pic').src = currentGerente.profileUrl;
        
        // Cargar reclutas
        loadReclutas();
        
    } catch (error) {
        alert(error.message || "Error al iniciar sesión");
    } finally {
        loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
        loginButton.disabled = false;
    }
}

async function logout() {
    try {
        await supabase.auth.signOut();
        currentGerente = null;
        
        // Restablecer UI
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('dashboard-section').style.display = 'none';
        document.getElementById('email').value = '';
        document.getElementById('password').value = '';
        document.body.style.backgroundColor = "#e9f2f9";
        document.getElementById('page-color').value = "#e9f2f9";
        profileImage = null;
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    }
}

// Funciones de gestión de reclutas
async function loadReclutas() {
    try {
        // Consultar reclutas del gerente actual
        const { data, error } = await supabase
            .from('reclutas')
            .select('*')
            .eq('gerente_id', currentGerente.id)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const reclutasList = document.getElementById('reclutas-list');
        reclutasList.innerHTML = '';
        
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" style="text-align: center;">No se encontraron reclutas. ¡Agrega tu primer recluta!</td>`;
            reclutasList.appendChild(row);
        } else {
            data.forEach(recluta => {
                const row = document.createElement('tr');
                const fotoSrc = recluta.foto_url || '/api/placeholder/40/40';
                
                row.innerHTML = `
                    <td><img src="${fotoSrc}" alt="${recluta.nombre}" class="recluta-foto"></td>
                    <td>${recluta.nombre}</td>
                    <td>${recluta.email}</td>
                    <td>${recluta.telefono}</td>
                    <td><span class="badge ${recluta.estado === 'Activo' ? 'badge-success' : 'badge-warning'}">${recluta.estado}</span></td>
                    <td>
                        <button class="action-btn" onclick="editRecluta('${recluta.id}')"><i class="fas fa-edit"></i></button>
                        <button class="action-btn" onclick="deleteRecluta('${recluta.id}')"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                reclutasList.appendChild(row);
            });
        }
    } catch (error) {
        alert("Error al cargar reclutas: " + error.message);
    }
}

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
        // Determinar la URL de la foto
        let fotoUrl = null;
        
        if (reclutaImage) {
            // Generar un nombre único para el archivo
            const fileExtension = reclutaImage.name.split('.').pop();
            const fileName = `${currentGerente.id}/${Date.now()}.${fileExtension}`;
            
            // Subir la imagen a Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recruit_images')
                .upload(fileName, reclutaImage);
                
            if (uploadError) throw uploadError;
            
            // Obtener la URL pública de la imagen
            const { data: { publicUrl } } = supabase.storage
                .from('recruit_images')
                .getPublicUrl(fileName);
                
            fotoUrl = publicUrl;
        }
        
        // Insertar el nuevo recluta en la base de datos
        const { data, error } = await supabase
            .from('reclutas')
            .insert([
                { 
                    gerente_id: currentGerente.id,
                    nombre,
                    email,
                    telefono,
                    estado: 'En proceso',
                    foto_url: fotoUrl
                }
            ]);
        
        if (error) throw error;
        
        // Cerrar el modal y recargar la lista
        closeAddReclutaModal();
        await loadReclutas();
        
    } catch (error) {
        alert("Error al guardar el recluta: " + error.message);
    } finally {
        saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Recluta';
        saveButton.disabled = false;
    }
}

async function deleteRecluta(id) {
    if (confirm('¿Estás seguro de eliminar este recluta?')) {
        const { error } = await supabase
            .from('reclutas')
            .delete()
            .eq('id', id);
        
        if (error) {
            alert(error.message);
        } else {
            loadReclutas();
        }
    }
}

function editRecluta(id) {
    alert('Función de edición: En una implementación completa, aquí abrirías un modal con los datos del recluta ID: ' + id);
}

// Función para cambiar el color de fondo
function changeBackgroundColor(color) {
    document.body.style.backgroundColor = color;
}