// script.js - Código JavaScript para index.html y dashboard.html con Firebase

// Detectar en qué página estamos
const isLoginPage = document.getElementById('loginForm') !== null;
const isDashboardPage = document.querySelector('.dashboard-container') !== null;

// Funciones compartidas para ambas páginas
function showElement(element) {
    if (element) {
        element.style.display = 'block';
    }
}

function hideElement(element) {
    if (element) {
        element.style.display = 'none';
    }
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        
        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }, 5000);
    }
}

// Función para mostrar notificaciones
function showNotification(type, title, message) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    // Contenido de la notificación
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Agregar evento para cerrar la notificación
    notification.querySelector('.notification-close').addEventListener('click', () => {
        document.body.removeChild(notification);
    });
    
    // Cerrar automáticamente después de 5 segundos
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

// Funciones específicas para la página de login
if (isLoginPage) {
    const loginForm = document.getElementById('loginForm');
    const togglePassword = document.getElementById('togglePassword');
    const passwordField = document.getElementById('password');
    
    // Mostrar/ocultar contraseña
    if (togglePassword && passwordField) {
        togglePassword.addEventListener('click', function() {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
            
            // Cambiar el ícono del ojo
            const eyeIcon = this.querySelector('i');
            eyeIcon.classList.toggle('fa-eye');
            eyeIcon.classList.toggle('fa-eye-slash');
        });
    }
    
    // Manejar envío del formulario de login con Firebase
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Validación de campos
            if (!email || !password) {
                showError('Por favor complete todos los campos.');
                return;
            }
            
            // Deshabilitar botón y mostrar estado de carga
            const submitButton = this.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner"></span> Iniciando sesión...';
            
            // Iniciar sesión con Firebase
            firebase.auth().signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Usuario autenticado
                    const user = userCredential.user;
                    
                    // Guardar preferencia de "recordarme" si está activada
                    if (rememberMe) {
                        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
                    } else {
                        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION);
                    }
                    
                    // Redireccionar al dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch((error) => {
                    // Restaurar botón
                    submitButton.disabled = false;
                    submitButton.textContent = originalButtonText;
                    
                    // Mostrar mensaje de error según el código
                    let errorMessage = 'Error al iniciar sesión';
                    
                    switch (error.code) {
                        case 'auth/invalid-email':
                            errorMessage = 'El correo electrónico no es válido';
                            break;
                        case 'auth/user-disabled':
                            errorMessage = 'Esta cuenta ha sido deshabilitada';
                            break;
                        case 'auth/user-not-found':
                            errorMessage = 'No existe ningún usuario con este correo electrónico';
                            break;
                        case 'auth/wrong-password':
                            errorMessage = 'Contraseña incorrecta';
                            break;
                        case 'auth/too-many-requests':
                            errorMessage = 'Demasiados intentos fallidos. Intente más tarde';
                            break;
                    }
                    
                    showError(errorMessage);
                });
        });
    }
}

// Funciones específicas para el dashboard
if (isDashboardPage) {
    // Elementos del DOM
    const overlay = document.getElementById('overlay');
    const clientModal = document.getElementById('client-modal');
    const deleteModal = document.getElementById('delete-modal');
    const addClientBtn = document.getElementById('add-client-btn');
    const clientForm = document.getElementById('client-form');
    const saveClientBtn = document.getElementById('save-client');
    const confirmDeleteBtn = document.getElementById('confirm-delete');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameElement = document.getElementById('user-name');
    
    // Variables de estado
    let clients = [];
    let currentPage = 1;
    const pageSize = 10;
    let currentClientId = null;
    
    // Verificar autenticación
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // Usuario autenticado
            if (userNameElement) {
                // Mostrar nombre del usuario o su correo
                userNameElement.textContent = user.displayName || user.email.split('@')[0];
            }
            
            // Cargar clientes desde Firestore
            loadClients();
        } else {
            // No hay usuario autenticado, redirigir al login
            window.location.href = 'index.html';
        }
    });
    
    // Cerrar sesión con Firebase
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Mostrar estado de carga
            this.innerHTML = '<span class="spinner"></span> Cerrando sesión...';
            this.disabled = true;
            
            firebase.auth().signOut()
                .then(() => {
                    // La redirección se maneja automáticamente con onAuthStateChanged
                })
                .catch((error) => {
                    // Restaurar botón y mostrar error
                    this.innerHTML = '<i class="fas fa-sign-out-alt"></i> Cerrar Sesión';
                    this.disabled = false;
                    showNotification('error', 'Error', 'No se pudo cerrar sesión');
                    console.error('Error al cerrar sesión:', error);
                });
        });
    }
    
    // Cargar datos de clientes desde Firestore
    const loadClients = () => {
        // Mostrar estado de carga
        const tableBody = document.getElementById('clients-table-body');
        if (tableBody) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" class="loading-data">
                        <span class="spinner"></span> Cargando clientes...
                    </td>
                </tr>`;
        }
        
        // Consultar colección de clientes en Firestore
        firebase.firestore().collection('clients')
            .orderBy('registerDate', 'desc')
            .get()
            .then((querySnapshot) => {
                clients = [];
                querySnapshot.forEach((doc) => {
                    clients.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                updateClientsUI();
            })
            .catch((error) => {
                console.error('Error al cargar clientes:', error);
                if (tableBody) {
                    tableBody.innerHTML = `
                        <tr>
                            <td colspan="8" class="error-data">
                                <i class="fas fa-exclamation-circle"></i> Error al cargar los clientes
                            </td>
                        </tr>`;
                }
            });
    };
    
    // Actualizar contadores en el dashboard
    const updateSummary = () => {
        const totalCountElement = document.querySelector('.summary-card:nth-child(1) .summary-count');
        const newCountElement = document.querySelector('.summary-card:nth-child(2) .summary-count');
        const pendingCountElement = document.querySelector('.summary-card:nth-child(3) .summary-count');
        
        if (totalCountElement) {
            totalCountElement.textContent = clients.length;
        }
        
        // Clientes añadidos en los últimos 30 días
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const newClients = clients.filter(client => {
            const clientDate = new Date(client.registerDate);
            return clientDate >= thirtyDaysAgo;
        });
        
        if (newCountElement) {
            newCountElement.textContent = newClients.length;
        }
        
        // Clientes inactivos
        const inactiveClients = clients.filter(client => client.status === 'inactive');
        
        if (pendingCountElement) {
            pendingCountElement.textContent = inactiveClients.length;
        }
    };
    
    // Renderizar tabla de clientes
    const renderClientsTable = () => {
        const tableBody = document.getElementById('clients-table-body');
        if (!tableBody) return;
        
        // Filtrar por estado y fecha si es necesario
        const statusFilter = document.getElementById('status-filter').value;
        const dateFilter = document.getElementById('date-filter').value;
        
        let filteredClients = [...clients];
        
        // Aplicar filtro de estado
        if (statusFilter !== 'all') {
            filteredClients = filteredClients.filter(client => client.status === statusFilter);
        }
        
        // Aplicar filtro de fecha
        if (dateFilter !== 'all') {
            const today = new Date();
            const startDate = new Date();
            
            switch (dateFilter) {
                case 'today':
                    startDate.setHours(0, 0, 0, 0);
                    break;
                case 'week':
                    startDate.setDate(today.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(today.getMonth() - 1);
                    break;
            }
            
            filteredClients = filteredClients.filter(client => {
                const clientDate = new Date(client.registerDate);
                return clientDate >= startDate && clientDate <= today;
            });
        }
        
        // Paginar resultados
        const totalPages = Math.ceil(filteredClients.length / pageSize);
        const startIndex = (currentPage - 1) * pageSize;
        const paginatedClients = filteredClients.slice(startIndex, startIndex + pageSize);
        
        // Actualizar información de paginación
        document.getElementById('current-page').textContent = currentPage;
        document.getElementById('total-pages').textContent = totalPages || 1;
        
        // Habilitar/deshabilitar botones de paginación
        document.getElementById('prev-page').disabled = currentPage <= 1;
        document.getElementById('next-page').disabled = currentPage >= totalPages || totalPages === 0;
        
        // Limpiar tabla
        tableBody.innerHTML = '';
        
        // Si no hay clientes
        if (paginatedClients.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = `<td colspan="8" class="no-data">No hay clientes que coincidan con los filtros seleccionados.</td>`;
            tableBody.appendChild(row);
            return;
        }
        
        // Mostrar clientes
        paginatedClients.forEach(client => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><input type="checkbox" data-id="${client.id}"></td>
                <td>${client.id.substring(0, 8)}...</td>
                <td>${client.name}</td>
                <td>${client.email}</td>
                <td>${client.phone}</td>
                <td>${new Date(client.registerDate).toLocaleDateString()}</td>
                <td>
                    <span class="status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}">
                        ${client.status === 'active' ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>
                    <button class="action-btn edit-btn" data-id="${client.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="action-btn delete-btn" data-id="${client.id}">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
            
            // Agregar eventos a los botones de acciones
            const editBtn = row.querySelector('.edit-btn');
            const deleteBtn = row.querySelector('.delete-btn');
            
            editBtn.addEventListener('click', () => openEditModal(client.id));
            deleteBtn.addEventListener('click', () => openDeleteModal(client.id));
        });
    };
    
    // Actualizar toda la UI del dashboard
    const updateClientsUI = () => {
        updateSummary();
        renderClientsTable();
    };
    
    // Abrir modal para añadir nuevo cliente
    const openAddModal = () => {
        document.getElementById('modal-title').textContent = 'Nuevo Cliente';
        clientForm.reset();
        document.getElementById('client-id').value = '';
        currentClientId = null;
        showElement(overlay);
        showElement(clientModal);
    };
    
    // Abrir modal para editar cliente
    const openEditModal = (clientId) => {
        const client = clients.find(c => c.id === clientId);
        if (!client) return;
        
        document.getElementById('modal-title').textContent = 'Editar Cliente';
        document.getElementById('client-id').value = client.id;
        document.getElementById('client-name').value = client.name;
        document.getElementById('client-email').value = client.email;
        document.getElementById('client-phone').value = client.phone;
        document.getElementById('client-status').value = client.status;
        document.getElementById('client-address').value = client.address || '';
        document.getElementById('client-notes').value = client.notes || '';
        
        currentClientId = client.id;
        showElement(overlay);
        showElement(clientModal);
    };
    
    // Abrir modal para confirmar eliminación
    const openDeleteModal = (clientId) => {
        currentClientId = clientId;
        showElement(overlay);
        showElement(deleteModal);
    };
    
    // Cerrar modales
    const closeModals = () => {
        hideElement(clientModal);
        hideElement(deleteModal);
        hideElement(overlay);
        currentClientId = null;
    };
    
    // Guardar cliente (nuevo o editado) en Firestore
    const saveClient = () => {
        // Validar formulario
        if (!clientForm.checkValidity()) {
            clientForm.reportValidity();
            return;
        }
        
        // Mostrar estado de carga
        const saveButton = document.getElementById('save-client');
        const originalButtonText = saveButton.textContent;
        saveButton.disabled = true;
        saveButton.innerHTML = '<span class="spinner"></span> Guardando...';
        
        // Preparar datos del cliente
        const clientData = {
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            status: document.getElementById('client-status').value,
            address: document.getElementById('client-address').value,
            notes: document.getElementById('client-notes').value
        };
        
        // Referencia a la colección de clientes
        const clientsRef = firebase.firestore().collection('clients');
        
        let saveOperation;
        
        if (currentClientId) {
            // Actualizar cliente existente
            clientData.updatedAt = new Date().toISOString();
            saveOperation = clientsRef.doc(currentClientId).update(clientData);
        } else {
            // Añadir nuevo cliente
            clientData.registerDate = new Date().toISOString();
            saveOperation = clientsRef.add(clientData);
        }
        
        saveOperation
            .then(() => {
                // Operación exitosa
                showNotification('success', 'Éxito', currentClientId ? 'Cliente actualizado correctamente' : 'Cliente añadido correctamente');
                closeModals();
                loadClients(); // Recargar lista de clientes
            })
            .catch((error) => {
                console.error('Error al guardar cliente:', error);
                showNotification('error', 'Error', 'No se pudo guardar el cliente');
            })
            .finally(() => {
                // Restaurar botón
                saveButton.disabled = false;
                saveButton.textContent = originalButtonText;
            });
    };
    
    // Eliminar cliente de Firestore
    const deleteClient = () => {
        if (!currentClientId) return;
        
        // Mostrar estado de carga
        const deleteButton = document.getElementById('confirm-delete');
        const originalButtonText = deleteButton.textContent;
        deleteButton.disabled = true;
        deleteButton.innerHTML = '<span class="spinner"></span> Eliminando...';
        
        // Eliminar documento de Firestore
        firebase.firestore().collection('clients').doc(currentClientId).delete()
            .then(() => {
                showNotification('success', 'Éxito', 'Cliente eliminado correctamente');
                closeModals();
                loadClients(); // Recargar lista de clientes
            })
            .catch((error) => {
                console.error('Error al eliminar cliente:', error);
                showNotification('error', 'Error', 'No se pudo eliminar el cliente');
            })
            .finally(() => {
                // Restaurar botón
                deleteButton.disabled = false;
                deleteButton.textContent = originalButtonText;
            });
    };
    
    // Cambiar página
    const changePage = (direction) => {
        if (direction === 'prev' && currentPage > 1) {
            currentPage--;
        } else if (direction === 'next') {
            const totalPages = Math.ceil(clients.length / pageSize);
            if (currentPage < totalPages) {
                currentPage++;
            }
        }
        renderClientsTable();
    };
    
    // Inicializar eventos
    const initEvents = () => {
        // Evento para añadir nuevo cliente
        if (addClientBtn) {
            addClientBtn.addEventListener('click', openAddModal);
        }
        
        // Eventos para cerrar modales
        closeModalButtons.forEach(button => {
            button.addEventListener('click', closeModals);
        });
        
        // Evento para guardar cliente
        if (saveClientBtn) {
            saveClientBtn.addEventListener('click', saveClient);
        }
        
        // Evento para eliminar cliente
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', deleteClient);
        }
        
        // Eventos de paginación
        document.getElementById('prev-page').addEventListener('click', () => changePage('prev'));
        document.getElementById('next-page').addEventListener('click', () => changePage('next'));
        
        // Eventos de filtrado
        document.getElementById('status-filter').addEventListener('change', () => {
            currentPage = 1;
            renderClientsTable();
        });
        
        document.getElementById('date-filter').addEventListener('change', () => {
            currentPage = 1;
            renderClientsTable();
        });
        
        // Evento para seleccionar todos
        document.getElementById('select-all').addEventListener('change', function() {
            const checkboxes = document.querySelectorAll('#clients-table-body input[type="checkbox"]');
            checkboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Evento de búsqueda
        const searchInput = document.querySelector('.header-search input');
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            
            if (searchTerm.length < 2) {
                // Si el término de búsqueda es muy corto, mostrar todos los clientes
                loadClients();
                return;
            }
            
            // Filtrar clientes en memoria (para búsquedas rápidas)
            const filteredClients = clients.filter(client => 
                client.name.toLowerCase().includes(searchTerm) || 
                client.email.toLowerCase().includes(searchTerm) || 
                client.phone.includes(searchTerm)
            );
            
            // Actualizar solo la tabla manteniendo los clientes originales en memoria
            const tableBody = document.getElementById('clients-table-body');
            if (!tableBody) return;
            
            if (filteredClients.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="8" class="no-data">No se encontraron clientes que coincidan con la búsqueda.</td></tr>`;
                return;
            }
            
            // Actualizar solo la tabla con resultados filtrados
            tableBody.innerHTML = '';
            currentPage = 1;
            
            // Mostrar resultados paginados
            const paginatedClients = filteredClients.slice(0, pageSize);
            
            paginatedClients.forEach(client => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td><input type="checkbox" data-id="${client.id}"></td>
                    <td>${client.id.substring(0, 8)}...</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.phone}</td>
                    <td>${new Date(client.registerDate).toLocaleDateString()}</td>
                    <td>
                        <span class="status-badge ${client.status === 'active' ? 'status-active' : 'status-inactive'}">
                            ${client.status === 'active' ? 'Activo' : 'Inactivo'}
                        </span>
                    </td>
                    <td>
                        <button class="action-btn edit-btn" data-id="${client.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete-btn" data-id="${client.id}">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                    </td>
                `;
                tableBody.appendChild(row);
                
                // Agregar eventos a los botones de acciones
                const editBtn = row.querySelector('.edit-btn');
                const deleteBtn = row.querySelector('.delete-btn');
                
                editBtn.addEventListener('click', () => openEditModal(client.id));
                deleteBtn.addEventListener('click', () => openDeleteModal(client.id));
            });
            
            // Actualizar paginación
            document.getElementById('current-page').textContent = 1;
            document.getElementById('total-pages').textContent = Math.ceil(filteredClients.length / pageSize) || 1;
            document.getElementById('prev-page').disabled = true;
            document.getElementById('next-page').disabled = filteredClients.length <= pageSize;
        });
    };
    
    // Inicializar eventos (no es necesario llamar a loadClients aquí, se maneja en onAuthStateChanged)
    initEvents();
}
