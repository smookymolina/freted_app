// script.js - Código JavaScript compartido para index.html y dashboard.html

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
    
    // Manejar envío del formulario de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('rememberMe').checked;
            
            // Aquí se puede añadir la validación adicional
            if (!email || !password) {
                showError('Por favor complete todos los campos.');
                return;
            }
            
            // Simulación de autenticación (para conectar con el backend)
            // En un caso real, aquí se haría una petición al servidor
            if (email === 'admin@example.com' && password === 'admin123') {
                // Guardar información de sesión
                if (rememberMe) {
                    localStorage.setItem('userEmail', email);
                } else {
                    sessionStorage.setItem('userEmail', email);
                }
                
                // Redireccionar al dashboard
                window.location.href = 'dashboard.html';
            } else {
                showError('Correo electrónico o contraseña incorrectos.');
            }
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
    
    // Mostrar nombre de usuario
    const showUserInfo = () => {
        const userEmail = localStorage.getItem('userEmail') || sessionStorage.getItem('userEmail');
        if (userEmail && userNameElement) {
            userNameElement.textContent = userEmail.split('@')[0];
        } else {
            // Si no hay sesión, redirigir al login
            window.location.href = 'index.html';
        }
    };
    
    // Cerrar sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Limpiar sesión
            localStorage.removeItem('userEmail');
            sessionStorage.removeItem('userEmail');
            localStorage.removeItem('clients');
            
            // Redirigir al login
            window.location.href = 'index.html';
        });
    }
    
    // Cargar datos de clientes (simulado, normalmente sería una petición al servidor)
    const loadClients = () => {
        const savedClients = localStorage.getItem('clients');
        if (savedClients) {
            clients = JSON.parse(savedClients);
        }
        updateClientsUI();
    };
    
    // Guardar clientes en localStorage (simulación)
    const saveClients = () => {
        localStorage.setItem('clients', JSON.stringify(clients));
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
                <td>${client.id}</td>
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
    
    // Generar ID único para nuevos clientes
    const generateId = () => {
        if (clients.length === 0) return 1;
        return Math.max(...clients.map(client => client.id)) + 1;
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
    
    // Guardar cliente (nuevo o editado)
    const saveClient = () => {
        // Validar formulario
        if (!clientForm.checkValidity()) {
            clientForm.reportValidity();
            return;
        }
        
        const clientData = {
            id: currentClientId || generateId(),
            name: document.getElementById('client-name').value,
            email: document.getElementById('client-email').value,
            phone: document.getElementById('client-phone').value,
            status: document.getElementById('client-status').value,
            address: document.getElementById('client-address').value,
            notes: document.getElementById('client-notes').value,
            registerDate: currentClientId ? clients.find(c => c.id === currentClientId).registerDate : new Date().toISOString()
        };
        
        if (currentClientId) {
            // Actualizar cliente existente
            const index = clients.findIndex(c => c.id === currentClientId);
            if (index !== -1) {
                clients[index] = clientData;
            }
        } else {
            // Añadir nuevo cliente
            clients.push(clientData);
        }
        
        saveClients();
        updateClientsUI();
        closeModals();
    };
    
    // Eliminar cliente
    const deleteClient = () => {
        if (currentClientId) {
            clients = clients.filter(c => c.id !== currentClientId);
            saveClients();
            updateClientsUI();
            closeModals();
        }
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
            clients = JSON.parse(localStorage.getItem('clients') || '[]');
            
            if (searchTerm) {
                clients = clients.filter(client => 
                    client.name.toLowerCase().includes(searchTerm) || 
                    client.email.toLowerCase().includes(searchTerm) || 
                    client.phone.includes(searchTerm)
                );
            }
            
            currentPage = 1;
            updateClientsUI();
        });
    };
    
    // Inicializar dashboard
    const initDashboard = () => {
        showUserInfo();
        loadClients();
        initEvents();
    };
    
    // Ejecutar inicialización al cargar
    initDashboard();
}
