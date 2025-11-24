/**
 * Aplicacao principal do Dashboard
 * Gerencia conexao Socket.io e atualizacao da interface
 */

// Conectar ao servidor Socket.io
const socket = io();

// Elementos do DOM
const connectionStatus = document.getElementById('connectionStatus');
const usersCount = document.getElementById('usersCount');
const alertsList = document.getElementById('alertsList');
const logsList = document.getElementById('logsList');
const toastContainer = document.getElementById('toastContainer');

// Elementos de metricas
const metricElements = {
  cpu: {
    value: document.getElementById('cpuValue'),
    bar: document.getElementById('cpuBar'),
    card: document.getElementById('cpuCard')
  },
  memory: {
    value: document.getElementById('memoryValue'),
    bar: document.getElementById('memoryBar'),
    card: document.getElementById('memoryCard')
  },
  requests: {
    value: document.getElementById('requestsValue'),
    bar: document.getElementById('requestsBar'),
    card: document.getElementById('requestsCard')
  },
  responseTime: {
    value: document.getElementById('responseTimeValue'),
    bar: document.getElementById('responseTimeBar'),
    card: document.getElementById('responseTimeCard')
  }
};

// Thresholds para alertas visuais
const thresholds = {
  cpu: { warning: 70, critical: 90, max: 100 },
  memory: { warning: 75, critical: 90, max: 100 },
  requests: { warning: 400, critical: 500, max: 600 },
  responseTime: { warning: 300, critical: 500, max: 600 }
};

// Maximo de logs exibidos
const MAX_LOGS = 100;

// Inicializar graficos quando a pagina carregar
document.addEventListener('DOMContentLoaded', () => {
  initCharts();
});

// === EVENTOS DE CONEXAO ===

socket.on('connect', () => {
  console.log('Conectado ao servidor');
  connectionStatus.classList.add('connected');
  connectionStatus.classList.remove('disconnected');
  connectionStatus.querySelector('.status-text').textContent = 'Conectado';
});

socket.on('disconnect', () => {
  console.log('Desconectado do servidor');
  connectionStatus.classList.remove('connected');
  connectionStatus.classList.add('disconnected');
  connectionStatus.querySelector('.status-text').textContent = 'Desconectado';
});

socket.on('connect_error', () => {
  connectionStatus.classList.remove('connected');
  connectionStatus.classList.add('disconnected');
  connectionStatus.querySelector('.status-text').textContent = 'Erro de conexao';
});

// === EVENTOS DE USUARIOS ===

socket.on('users:count', (count) => {
  usersCount.textContent = count;
});

// === EVENTOS DE METRICAS ===

socket.on('metrics:history', (history) => {
  updateCharts(history);
});

socket.on('metrics:update', (metrics) => {
  updateMetricsDisplay(metrics);
  addDataPoint(metrics);
});

// === EVENTOS DE ALERTAS ===

socket.on('alerts:history', (alerts) => {
  alertsList.innerHTML = '';
  if (alerts.length === 0) {
    alertsList.innerHTML = '<div class="empty-state">Nenhum alerta registrado</div>';
  } else {
    alerts.forEach(alert => addAlertToList(alert, false));
  }
});

socket.on('alert:new', (alert) => {
  addAlertToList(alert, true);
  showToast(alert);
});

// === EVENTOS DE LOGS ===

socket.on('log:new', (log) => {
  addLogToList(log);
});

// === FUNCOES DE ATUALIZACAO ===

/**
 * Atualiza a exibicao das metricas nos cards
 * @param {Object} metrics - Objeto com metricas atuais
 */
function updateMetricsDisplay(metrics) {
  for (const [key, value] of Object.entries(metrics)) {
    if (key === 'timestamp') continue;

    const elements = metricElements[key];
    if (!elements) continue;

    const threshold = thresholds[key];

    // Atualizar valor
    elements.value.textContent = value;

    // Calcular porcentagem para a barra
    const percentage = Math.min((value / threshold.max) * 100, 100);
    elements.bar.style.width = `${percentage}%`;

    // Determinar nivel de alerta
    let level = 'normal';
    if (value >= threshold.critical) {
      level = 'critical';
    } else if (value >= threshold.warning) {
      level = 'warning';
    }

    // Aplicar classes de estilo
    elements.card.classList.remove('warning', 'critical');
    elements.bar.classList.remove('warning', 'critical');

    if (level !== 'normal') {
      elements.card.classList.add(level);
      elements.bar.classList.add(level);
    }
  }
}

/**
 * Adiciona um alerta a lista de alertas
 * @param {Object} alert - Objeto de alerta
 * @param {boolean} prepend - Se deve adicionar no inicio da lista
 */
function addAlertToList(alert, prepend = true) {
  // Remover mensagem de vazio se existir
  const emptyState = alertsList.querySelector('.empty-state');
  if (emptyState) {
    emptyState.remove();
  }

  const alertElement = document.createElement('div');
  alertElement.className = `alert-item ${alert.level}`;

  const iconSvg = alert.level === 'critical'
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

  const time = new Date(alert.timestamp).toLocaleTimeString('pt-BR');

  alertElement.innerHTML = `
    <div class="alert-icon">${iconSvg}</div>
    <div class="alert-content">
      <div class="alert-message">${alert.message}</div>
      <div class="alert-time">${time}</div>
    </div>
  `;

  if (prepend) {
    alertsList.prepend(alertElement);
  } else {
    alertsList.appendChild(alertElement);
  }

  // Limitar numero de alertas exibidos
  while (alertsList.children.length > 20) {
    alertsList.lastChild.remove();
  }
}

/**
 * Adiciona um log a lista de logs
 * @param {Object} log - Objeto de log
 */
function addLogToList(log) {
  const logElement = document.createElement('div');
  logElement.className = 'log-item';

  const time = new Date(log.timestamp).toLocaleTimeString('pt-BR');

  // Determinar classe do status code
  let statusClass = 'success';
  if (log.statusCode >= 400) {
    statusClass = 'error';
  } else if (log.statusCode >= 300) {
    statusClass = 'redirect';
  }

  logElement.innerHTML = `
    <span class="log-time">${time}</span>
    <span class="log-type ${log.type}">${log.type}</span>
    <span class="log-message">${log.message}</span>
    <span class="log-status ${statusClass}">${log.statusCode}</span>
  `;

  logsList.prepend(logElement);

  // Limitar numero de logs
  while (logsList.children.length > MAX_LOGS) {
    logsList.lastChild.remove();
  }
}

/**
 * Exibe uma notificacao toast para alertas
 * @param {Object} alert - Objeto de alerta
 */
function showToast(alert) {
  const toast = document.createElement('div');
  toast.className = `toast ${alert.level}`;

  const iconSvg = alert.level === 'critical'
    ? '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    : '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';

  const title = alert.level === 'critical' ? 'Alerta Critico' : 'Aviso';

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${alert.message}</div>
    </div>
  `;

  toastContainer.appendChild(toast);

  // Remover toast apos animacao
  setTimeout(() => {
    toast.remove();
  }, 5000);
}
