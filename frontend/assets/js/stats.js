/**
 * Módulo de estadísticas para el Sistema de Gestión de Reclutas
 */

// Referencias a gráficos
let estadoChart = null;
let tendenciaChart = null;

/**
 * Cargar y mostrar estadísticas
 * @returns {Promise<void>}
 */
async function loadDashboardStats() {
  try {
    const statsContainer = document.getElementById('estadisticas-section');
    if (!statsContainer) return;
    
    // Mostrar indicador de carga
    const statsCards = document.querySelectorAll('.stat-card .stat-number');
    statsCards.forEach(card => {
      card.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    });
    
    // Mostrar carga en gráficos
    const chartContainers = document.querySelectorAll('.chart-card');
    chartContainers.forEach(container => {
      container.innerHTML += '<div class="chart-loading"><i class="fas fa-spinner fa-spin"></i> Cargando gráfico...</div>';
    });
    
    // Obtener estadísticas
    const response = await api.stats.getDashboard();
    const stats = response.data;
    
    // Actualizar estadísticas en la interfaz
    updateStatsCards(stats.totales);
    
    // Generar gráficos
    if (stats.distribucion && stats.distribucion.reclutasPorEstado) {
      generatePieChart('reclutas-por-estado-chart', stats.distribucion.reclutasPorEstado);
    }
    
    if (stats.tendencias && stats.tendencias.reclutas) {
      generateLineChart('tendencia-reclutas-chart', stats.tendencias.reclutas);
    }
    
    // Eliminar indicadores de carga
    document.querySelectorAll('.chart-loading').forEach(el => el.remove());
  } catch (error) {
    showNotification('Error al cargar estadísticas: ' + error.message, 'error');
    
    // Limpiar indicadores de carga
    document.querySelectorAll('.chart-loading').forEach(el => el.remove());
    
    // Mostrar error en gráficos
    document.querySelectorAll('.chart-card').forEach(container => {
      const canvas = container.querySelector('canvas');
      if (!canvas) {
        container.innerHTML += '<div class="chart-error">Error al cargar datos</div>';
      }
    });
  }
}

/**
 * Actualizar tarjetas de estadísticas
 * @param {Object} totales - Datos de totales
 */
function updateStatsCards(totales) {
  if (!totales) return;
  
  // Actualizar total de reclutas
  const totalReclutasCard = document.querySelector('.stat-card:nth-child(1) .stat-number');
  if (totalReclutasCard) {
    totalReclutasCard.textContent = totales.reclutas || 0;
  }
  
  // Actualizar reclutas activos (asumiendo que tenemos el desglose)
  const reclutasActivosCard = document.querySelector('.stat-card:nth-child(2) .stat-number');
  if (reclutasActivosCard) {
    reclutasActivosCard.textContent = totales.reclutasActivos || 0;
  }
  
  // Actualizar en proceso
  const enProcesoCard = document.querySelector('.stat-card:nth-child(3) .stat-number');
  if (enProcesoCard) {
    enProcesoCard.textContent = totales.reclutasEnProceso || 0;
  }
  
  // Actualizar entrevistas pendientes
  const entrevistasPendientesCard = document.querySelector('.stat-card:nth-child(4) .stat-number');
  if (entrevistasPendientesCard) {
    entrevistasPendientesCard.textContent = totales.entrevistasPendientes || 0;
  }
  
  // Actualizar mensajes de crecimiento
  const growthElements = document.querySelectorAll('.stat-growth');
  if (growthElements && growthElements.length > 0 && totales.cambioPorcentaje !== undefined) {
    const isPositive = totales.cambioPorcentaje >= 0;
    const growthText = `<i class="fas fa-arrow-${isPositive ? 'up' : 'down'}"></i> ${Math.abs(totales.cambioPorcentaje)}% este mes`;
    
    growthElements[0].innerHTML = growthText;
    growthElements[0].className = `stat-growth ${isPositive ? 'positive' : 'negative'}`;
  }
}

/**
 * Generar gráfico circular para reclutas por estado
 * @param {string} containerId - ID del contenedor
 * @param {Array} data - Datos para el gráfico
 */
function generatePieChart(containerId, data) {
  const canvas = document.getElementById(containerId);
  if (!canvas) return;
  
  // Limpiar gráfico anterior si existe
  if (estadoChart) {
    estadoChart.destroy();
  }
  
  // Preparar datos
  const labels = data.map(item => item.nombre);
  const values = data.map(item => item.valor);
  
  // Colores para cada estado
  const colors = {
    'Activo': '#28a745',
    'En proceso': '#ffc107',
    'Rechazado': '#dc3545'
  };
  
  const backgroundColors = data.map(item => colors[item.nombre] || '#6c757d');
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  estadoChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: backgroundColors,
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: document.body.classList.contains('dark-mode') ? '#e9ecef' : '#333'
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const value = context.raw;
              const percentage = Math.round((value / total) * 100);
              return `${context.label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

/**
 * Generar gráfico de línea para tendencia de reclutas
 * @param {string} containerId - ID del contenedor
 * @param {Array} data - Datos para el gráfico
 */
function generateLineChart(containerId, data) {
  const canvas = document.getElementById(containerId);
  if (!canvas) return;
  
  // Limpiar gráfico anterior si existe
  if (tendenciaChart) {
    tendenciaChart.destroy();
  }
  
  // Preparar datos
  const labels = data.map(item => item.mes);
  const values = data.map(item => item.cantidad);
  
  // Configuración de colores
  const textColor = document.body.classList.contains('dark-mode') ? '#e9ecef' : '#333';
  const lineColor = '#007bff';
  const areaColor = 'rgba(0, 123, 255, 0.1)';
  
  // Crear gráfico
  const ctx = canvas.getContext('2d');
  tendenciaChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Nuevos reclutas',
        data: values,
        borderColor: lineColor,
        backgroundColor: areaColor,
        borderWidth: 2,
        tension: 0.1,
        fill: true
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: textColor
          },
          grid: {
            color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            color: textColor
          },
          grid: {
            color: document.body.classList.contains('dark-mode') ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  });
}

/**
 * Actualizar gráficos cuando cambia el tema
 */
function updateChartsTheme() {
  // Actualizar gráficos cuando se cambia el tema
  if (estadoChart || tendenciaChart) {
    loadDashboardStats();
  }
}

/**
 * Cargar estadísticas detalladas de reclutas
 * @returns {Promise<void>}
 */
async function loadReclutasStats() {
  try {
    // Implementar para mostrar estadísticas más detalladas de reclutas
    // Por ejemplo: reclutas por puesto, eficiencia del proceso, etc.
    showNotification('Estadísticas detalladas no implementadas', 'info');
  } catch (error) {
    showNotification('Error al cargar estadísticas: ' + error.message, 'error');
  }
}

/**
 * Cargar estadísticas detalladas de entrevistas
 * @returns {Promise<void>}
 */
async function loadEntrevistasStats() {
  try {
    // Implementar para mostrar estadísticas más detalladas de entrevistas
    // Por ejemplo: entrevistas por tipo, por resultado, etc.
    showNotification('Estadísticas detalladas no implementadas', 'info');
  } catch (error) {
    showNotification('Error al cargar estadísticas: ' + error.message, 'error');
  }
}

/**
 * Inicializar eventos de estadísticas
 */
function initStatsEvents() {
  // Escuchar cambios de tema para actualizar gráficos
  document.addEventListener('themeChanged', updateChartsTheme);
  
  // Implementar otros eventos específicos de estadísticas
}

// Exportar funciones para uso global
window.stats = {
  loadDashboardStats,
  generatePieChart,
  generateLineChart,
  updateChartsTheme,
  loadReclutasStats,
  loadEntrevistasStats,
  initStatsEvents
};