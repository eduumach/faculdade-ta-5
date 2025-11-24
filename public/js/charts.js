/**
 * Configuracao e gerenciamento dos graficos Chart.js
 */

// Configuracao global do Chart.js
Chart.defaults.color = '#94a3b8';
Chart.defaults.borderColor = '#475569';
Chart.defaults.font.family = "'Segoe UI', system-ui, sans-serif";

// Grafico de CPU e Memoria
let cpuMemoryChart = null;

// Grafico de Requisicoes e Tempo de Resposta
let requestsChart = null;

/**
 * Inicializa os graficos
 */
function initCharts() {
  initCpuMemoryChart();
  initRequestsChart();
}

/**
 * Inicializa o grafico de CPU e Memoria
 */
function initCpuMemoryChart() {
  const ctx = document.getElementById('cpuMemoryChart').getContext('2d');

  cpuMemoryChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'CPU (%)',
          data: [],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        },
        {
          label: 'Memoria (%)',
          data: [],
          borderColor: '#a855f7',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: '#475569',
          borderWidth: 1,
          padding: 12,
          displayColors: true,
          callbacks: {
            label: function(context) {
              return `${context.dataset.label}: ${context.parsed.y}%`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            maxTicksLimit: 10
          }
        },
        y: {
          min: 0,
          max: 100,
          grid: {
            color: 'rgba(71, 85, 105, 0.5)'
          },
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      animation: {
        duration: 500
      }
    }
  });

  // Ajustar altura do container
  document.getElementById('cpuMemoryChart').parentElement.style.height = '250px';
}

/**
 * Inicializa o grafico de Requisicoes e Tempo de Resposta
 */
function initRequestsChart() {
  const ctx = document.getElementById('requestsChart').getContext('2d');

  requestsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: 'Requisicoes/s',
          data: [],
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: 'y'
        },
        {
          label: 'Tempo Resposta (ms)',
          data: [],
          borderColor: '#eab308',
          backgroundColor: 'rgba(234, 179, 8, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        intersect: false,
        mode: 'index'
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 20
          }
        },
        tooltip: {
          backgroundColor: '#1e293b',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: '#475569',
          borderWidth: 1,
          padding: 12,
          displayColors: true
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            maxRotation: 0,
            maxTicksLimit: 10
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          min: 0,
          grid: {
            color: 'rgba(71, 85, 105, 0.5)'
          },
          ticks: {
            callback: function(value) {
              return value + ' req/s';
            }
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          min: 0,
          grid: {
            drawOnChartArea: false
          },
          ticks: {
            callback: function(value) {
              return value + ' ms';
            }
          }
        }
      },
      animation: {
        duration: 500
      }
    }
  });

  // Ajustar altura do container
  document.getElementById('requestsChart').parentElement.style.height = '250px';
}

/**
 * Atualiza os graficos com novos dados
 * @param {Object} history - Historico de metricas
 */
function updateCharts(history) {
  if (!cpuMemoryChart || !requestsChart) return;

  // Atualizar grafico de CPU e Memoria
  cpuMemoryChart.data.labels = history.timestamps;
  cpuMemoryChart.data.datasets[0].data = history.cpu;
  cpuMemoryChart.data.datasets[1].data = history.memory;
  cpuMemoryChart.update('none');

  // Atualizar grafico de Requisicoes
  requestsChart.data.labels = history.timestamps;
  requestsChart.data.datasets[0].data = history.requests;
  requestsChart.data.datasets[1].data = history.responseTime;
  requestsChart.update('none');
}

/**
 * Adiciona um novo ponto aos graficos
 * @param {Object} metrics - Metricas atuais
 */
function addDataPoint(metrics) {
  if (!cpuMemoryChart || !requestsChart) return;

  const timestamp = new Date().toLocaleTimeString('pt-BR');
  const maxPoints = 30;

  // Atualizar grafico de CPU e Memoria
  cpuMemoryChart.data.labels.push(timestamp);
  cpuMemoryChart.data.datasets[0].data.push(metrics.cpu);
  cpuMemoryChart.data.datasets[1].data.push(metrics.memory);

  if (cpuMemoryChart.data.labels.length > maxPoints) {
    cpuMemoryChart.data.labels.shift();
    cpuMemoryChart.data.datasets[0].data.shift();
    cpuMemoryChart.data.datasets[1].data.shift();
  }

  cpuMemoryChart.update('none');

  // Atualizar grafico de Requisicoes
  requestsChart.data.labels.push(timestamp);
  requestsChart.data.datasets[0].data.push(metrics.requests);
  requestsChart.data.datasets[1].data.push(metrics.responseTime);

  if (requestsChart.data.labels.length > maxPoints) {
    requestsChart.data.labels.shift();
    requestsChart.data.datasets[0].data.shift();
    requestsChart.data.datasets[1].data.shift();
  }

  requestsChart.update('none');
}
