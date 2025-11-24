/**
 * Gerador de metricas simuladas do servidor
 * Simula valores realisticos de CPU, memoria, requisicoes e tempo de resposta
 */
class MetricsGenerator {
  constructor() {
    // Valores base para simulacao realistica
    this.baseValues = {
      cpu: 45,
      memory: 60,
      requests: 150,
      responseTime: 120
    };

    // Tendencias atuais (para criar variacao suave)
    this.trends = {
      cpu: 0,
      memory: 0,
      requests: 0,
      responseTime: 0
    };
  }

  /**
   * Gera uma variacao suave para criar valores realisticos
   * @param {string} metric - Nome da metrica
   * @param {number} min - Valor minimo
   * @param {number} max - Valor maximo
   * @returns {number} - Valor gerado
   */
  generateSmooth(metric, min, max) {
    // Atualizar tendencia ocasionalmente
    if (Math.random() < 0.3) {
      this.trends[metric] = (Math.random() - 0.5) * 10;
    }

    // Aplicar tendencia ao valor base
    this.baseValues[metric] += this.trends[metric] + (Math.random() - 0.5) * 5;

    // Manter dentro dos limites
    this.baseValues[metric] = Math.max(min, Math.min(max, this.baseValues[metric]));

    return Math.round(this.baseValues[metric] * 10) / 10;
  }

  /**
   * Simula picos ocasionais de carga
   * @returns {boolean} - Se deve haver um pico
   */
  shouldSpike() {
    return Math.random() < 0.05; // 5% de chance de pico
  }

  /**
   * Gera um conjunto completo de metricas
   * @returns {Object} - Objeto com todas as metricas
   */
  generate() {
    const isSpike = this.shouldSpike();

    let cpu = this.generateSmooth('cpu', 10, 85);
    let memory = this.generateSmooth('memory', 30, 80);
    let requests = this.generateSmooth('requests', 50, 300);
    let responseTime = this.generateSmooth('responseTime', 50, 250);

    // Aplicar pico se necessario
    if (isSpike) {
      cpu = Math.min(98, cpu + Math.random() * 30);
      memory = Math.min(95, memory + Math.random() * 20);
      requests = requests + Math.random() * 200;
      responseTime = responseTime + Math.random() * 300;
    }

    return {
      cpu: Math.round(cpu * 10) / 10,
      memory: Math.round(memory * 10) / 10,
      requests: Math.round(requests),
      responseTime: Math.round(responseTime),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = MetricsGenerator;
