const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const MetricsGenerator = require('./services/MetricsGenerator');
const LogGenerator = require('./services/LogGenerator');
const AlertManager = require('./services/AlertManager');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Servir arquivos estaticos
app.use(express.static(path.join(__dirname, '../public')));

// Armazenar usuarios conectados
let connectedUsers = 0;

// Instanciar servicos
const metricsGenerator = new MetricsGenerator();
const logGenerator = new LogGenerator();
const alertManager = new AlertManager();

// Historico de metricas para os graficos
const metricsHistory = {
  cpu: [],
  memory: [],
  requests: [],
  responseTime: [],
  timestamps: []
};

const MAX_HISTORY = 30; // Manter ultimos 30 pontos

// Adicionar metrica ao historico
function addToHistory(metrics) {
  metricsHistory.cpu.push(metrics.cpu);
  metricsHistory.memory.push(metrics.memory);
  metricsHistory.requests.push(metrics.requests);
  metricsHistory.responseTime.push(metrics.responseTime);
  metricsHistory.timestamps.push(new Date().toLocaleTimeString('pt-BR'));

  // Limitar tamanho do historico
  if (metricsHistory.cpu.length > MAX_HISTORY) {
    metricsHistory.cpu.shift();
    metricsHistory.memory.shift();
    metricsHistory.requests.shift();
    metricsHistory.responseTime.shift();
    metricsHistory.timestamps.shift();
  }
}

// Conexao Socket.io
io.on('connection', (socket) => {
  connectedUsers++;
  console.log(`Usuario conectado. Total: ${connectedUsers}`);

  // Notificar todos sobre novo numero de usuarios
  io.emit('users:count', connectedUsers);

  // Enviar historico de metricas para o novo usuario
  socket.emit('metrics:history', metricsHistory);

  // Enviar historico de alertas
  socket.emit('alerts:history', alertManager.getAlertHistory());

  // Tratar desconexao
  socket.on('disconnect', () => {
    connectedUsers--;
    console.log(`Usuario desconectado. Total: ${connectedUsers}`);
    io.emit('users:count', connectedUsers);
  });
});

// Gerar e emitir metricas a cada 2 segundos
setInterval(() => {
  const metrics = metricsGenerator.generate();
  addToHistory(metrics);

  // Verificar alertas
  const alerts = alertManager.checkMetrics(metrics);

  // Emitir metricas para todos os clientes
  io.emit('metrics:update', metrics);

  // Emitir alertas se houver
  if (alerts.length > 0) {
    alerts.forEach(alert => {
      io.emit('alert:new', alert);
    });
  }
}, 2000);

// Gerar e emitir logs a cada 1-3 segundos
function emitLog() {
  const log = logGenerator.generate();
  io.emit('log:new', log);

  // Agendar proximo log com intervalo aleatorio
  const nextInterval = Math.random() * 2000 + 1000; // 1-3 segundos
  setTimeout(emitLog, nextInterval);
}

// Iniciar geracao de logs
setTimeout(emitLog, 1000);

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
