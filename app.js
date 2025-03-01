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
                        profileUrl: document.getElementById('login-profile-pic').src
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

// Deshabilitar el botón de selección de foto de perfil inicialmente
document.getElementById('profile-upload').disabled = true;
document.querySelector('#login-section button[type="button"]').disabled = true;

// Manejo de la foto de perfil en el login
document.getElementById('profile-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('login-profile-pic').src = e.target.result;
            profileImage = file;
        };
        reader.readAsDataURL(file);
    }
});

// Manejo de la foto del recluta
document.getElementById('recluta-upload').addEventListener('change', function(event) {
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
});

// Función de inicio de sesión
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    if (!email || !password) {
        alert("Por favor, completa todos los campos");
        return;
    }
    
    // Simular la carga
    const loginButton = document.querySelector('#login-section button[type="submit"]');
    loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verificando...';
    loginButton.disabled = true;
    
    // Simulamos una pequeña demora para un efecto más realista
    setTimeout(async () => {
        const { user, error } = await supabase.auth.signIn({
            email,
            password
        });
        
        if (error) {
            alert(error.message);
            loginButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Iniciar Sesión';
            loginButton.disabled = false;
        } else {
            // Habilitar el botón de selección de foto de perfil después del inicio de sesión
            document.getElementById('profile-upload').disabled = false;
            document.querySelector('#login-section button[type="button"]').disabled = false;
            
            // Si hay un archivo de imagen, subir a storage
            if (profileImage) {
                const { data, error } = await supabase.storage
                    .from('profiles')
                    .upload(`${user.id}/profile.jpg`, profileImage);
                    
                if (!error) {
                    user.profileUrl = document.getElementById('login-profile-pic').src;
                }
            }
            
            currentGerente = user;
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('dashboard-section').style.display = 'block';
            document.getElementById('gerente-name').textContent = user.email.split('@')[0];
            document.getElementById('dashboard-profile-pic').src = user.profileUrl;
            loadReclutas();
        }
    }, 1000);
}

// Cargar reclutas del gerente actual
async function loadReclutas() {
    const { data, error } = await supabase
        .from('reclutas')
        .select('*')
        .eq('gerente_id', currentGerente.id);
    
    if (error) {
        alert(error.message);
    } else {
        const reclutasList = document.getElementById('reclutas-list');
        reclutasList.innerHTML = '';
        if (data.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="6" style="text-align: center;">No se encontraron reclutas. ¡Agrega tu primer recluta!</td>`;
            reclutasList.appendChild(row);
        } else {
            data.forEach(recluta => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><img src="${recluta.fotoUrl}" alt="${recluta.nombre}" class="recluta-foto"></td>
                    <td>${recluta.nombre}</td>
                    <td>${recluta.email}</td>
                    <td>${recluta.telefono}</td>
                    <td><span class="badge ${recluta.estado === 'Activo' ? 'badge-success' : 'badge-warning'}">${recluta.estado}</span></td>
                    <td>
                        <button class="action-btn" onclick="editRecluta(${recluta.id})"><i class="fas fa-edit"></i></button>
                        <button class="action-btn" onclick="deleteRecluta(${recluta.id})"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
                reclutasList.appendChild(row);
            });
        }
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
    
    let fotoUrl = '/api/placeholder/40/40'; // Imagen por defecto
    
    if (reclutaImage) {
        // En una implementación real, subirías la imagen a Supabase Storage
        const { data, error } = await supabase.storage
            .from('reclutas')
            .upload(`${currentGerente.id}/${Date.now()}.jpg`, reclutaImage);
            
        if (!error) {
            // En una implementación real, obtendrías la URL pública de la imagen
            fotoUrl = document.querySelector('#recluta-pic-preview img').src;
        }
    }
    
    // Simular una pequeña demora
    setTimeout(async () => {
        const { data, error } = await supabase
            .from('reclutas')
            .insert([
                { 
                    gerente_id: currentGerente.id,
                    nombre,
                    email,
                    telefono,
                    estado: 'En proceso',
                    fotoUrl
                }
            ]);
        
        if (error) {
            alert(error.message);
        } else {
            closeAddReclutaModal();
            loadReclutas();
        }
        
        saveButton.innerHTML = '<i class="fas fa-save"></i> Guardar Recluta';
        saveButton.disabled = false;
    }, 1000);
}

// Eliminar un recluta
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

// Editar un recluta (implementación básica para demo)
function editRecluta(id) {
    alert('Función de edición: En una implementación completa, aquí abrirías un modal con los datos del recluta ID: ' + id);
}

// Cerrar sesión
async function logout() {
    await supabase.auth.signOut();
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
}
