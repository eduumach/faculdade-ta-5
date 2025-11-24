/**
 * Gerenciador de alertas do sistema
 * Monitora metricas e dispara alertas quando limites sao ultrapassados
 */
class AlertManager {
  constructor() {
    // Limites (thresholds) para cada metrica
    this.thresholds = {
      cpu: { warning: 70, critical: 90 },
      memory: { warning: 75, critical: 90 },
      requests: { warning: 400, critical: 500 },
      responseTime: { warning: 300, critical: 500 }
    };

    // Historico de alertas
    this.alertHistory = [];
    this.maxHistorySize = 50;

    // Controle para evitar alertas duplicados em sequencia
    this.lastAlertTime = {};
    this.alertCooldown = 10000; // 10 segundos entre alertas do mesmo tipo
  }

  /**
   * Verifica se um alerta pode ser emitido (cooldown)
   * @param {string} alertKey - Chave unica do alerta
   * @returns {boolean}
   */
  canAlert(alertKey) {
    const now = Date.now();
    const lastTime = this.lastAlertTime[alertKey] || 0;

    if (now - lastTime > this.alertCooldown) {
      this.lastAlertTime[alertKey] = now;
      return true;
    }

    return false;
  }

  /**
   * Cria um objeto de alerta
   * @param {string} metric - Nome da metrica
   * @param {number} value - Valor atual
   * @param {string} level - Nivel do alerta (warning/critical)
   * @returns {Object}
   */
  createAlert(metric, value, level) {
    const metricNames = {
      cpu: 'CPU',
      memory: 'Memoria',
      requests: 'Requisicoes/s',
      responseTime: 'Tempo de Resposta'
    };

    const units = {
      cpu: '%',
      memory: '%',
      requests: ' req/s',
      responseTime: ' ms'
    };

    return {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      metric,
      metricName: metricNames[metric],
      value,
      unit: units[metric],
      level,
      threshold: this.thresholds[metric][level],
      message: `${metricNames[metric]} em ${value}${units[metric]} (limite: ${this.thresholds[metric][level]}${units[metric]})`,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Verifica metricas e retorna alertas disparados
   * @param {Object} metrics - Objeto com metricas atuais
   * @returns {Array} - Lista de alertas
   */
  checkMetrics(metrics) {
    const alerts = [];

    // Verificar cada metrica
    for (const [metric, value] of Object.entries(metrics)) {
      if (metric === 'timestamp') continue;

      const threshold = this.thresholds[metric];
      if (!threshold) continue;

      let alert = null;

      // Verificar nivel critico primeiro
      if (value >= threshold.critical) {
        const alertKey = `${metric}_critical`;
        if (this.canAlert(alertKey)) {
          alert = this.createAlert(metric, value, 'critical');
        }
      }
      // Depois verificar nivel de aviso
      else if (value >= threshold.warning) {
        const alertKey = `${metric}_warning`;
        if (this.canAlert(alertKey)) {
          alert = this.createAlert(metric, value, 'warning');
        }
      }

      if (alert) {
        alerts.push(alert);
        this.addToHistory(alert);
      }
    }

    return alerts;
  }

  /**
   * Adiciona alerta ao historico
   * @param {Object} alert - Objeto de alerta
   */
  addToHistory(alert) {
    this.alertHistory.unshift(alert);

    // Manter tamanho maximo do historico
    if (this.alertHistory.length > this.maxHistorySize) {
      this.alertHistory.pop();
    }
  }

  /**
   * Retorna historico de alertas
   * @returns {Array}
   */
  getAlertHistory() {
    return this.alertHistory;
  }

  /**
   * Retorna os thresholds configurados
   * @returns {Object}
   */
  getThresholds() {
    return this.thresholds;
  }
}

module.exports = AlertManager;
