/**
 * Gerador de logs simulados do sistema
 * Simula diferentes tipos de logs: info, warning, error
 */
class LogGenerator {
  constructor() {
    // Templates de mensagens de log
    this.templates = {
      info: [
        { message: 'Requisicao GET /api/users completada', endpoint: '/api/users' },
        { message: 'Requisicao POST /api/auth/login processada', endpoint: '/api/auth/login' },
        { message: 'Cache atualizado com sucesso', endpoint: 'cache' },
        { message: 'Conexao com banco de dados estabelecida', endpoint: 'database' },
        { message: 'Requisicao GET /api/products completada', endpoint: '/api/products' },
        { message: 'Sessao de usuario iniciada', endpoint: 'session' },
        { message: 'Arquivo estatico servido: bundle.js', endpoint: 'static' },
        { message: 'Health check executado com sucesso', endpoint: '/health' },
        { message: 'Requisicao GET /api/orders completada', endpoint: '/api/orders' },
        { message: 'WebSocket: cliente conectado', endpoint: 'websocket' }
      ],
      warning: [
        { message: 'Tempo de resposta elevado em /api/search', endpoint: '/api/search' },
        { message: 'Taxa de requisicoes acima do esperado', endpoint: 'rate-limiter' },
        { message: 'Pool de conexoes do banco proximo do limite', endpoint: 'database' },
        { message: 'Cache miss para chave frequente', endpoint: 'cache' },
        { message: 'Retry necessario para servico externo', endpoint: 'external-api' },
        { message: 'Memoria heap acima de 70%', endpoint: 'memory' },
        { message: 'Certificado SSL expira em 30 dias', endpoint: 'ssl' },
        { message: 'Requisicao lenta detectada: 2.5s', endpoint: 'performance' }
      ],
      error: [
        { message: 'Falha na autenticacao: token invalido', endpoint: '/api/auth' },
        { message: 'Timeout na conexao com servico externo', endpoint: 'external-api' },
        { message: 'Erro 500: Excecao nao tratada em /api/payment', endpoint: '/api/payment' },
        { message: 'Falha ao gravar no banco de dados', endpoint: 'database' },
        { message: 'Rate limit excedido para IP 192.168.1.100', endpoint: 'rate-limiter' },
        { message: 'Erro de validacao: campo email invalido', endpoint: '/api/users' },
        { message: 'Conexao WebSocket perdida inesperadamente', endpoint: 'websocket' },
        { message: 'Falha ao processar fila de mensagens', endpoint: 'queue' }
      ]
    };

    // Probabilidades de cada tipo de log
    this.probabilities = {
      info: 0.7,      // 70% info
      warning: 0.2,   // 20% warning
      error: 0.1      // 10% error
    };
  }

  /**
   * Seleciona o tipo de log baseado nas probabilidades
   * @returns {string} - Tipo do log
   */
  selectType() {
    const rand = Math.random();

    if (rand < this.probabilities.error) {
      return 'error';
    } else if (rand < this.probabilities.error + this.probabilities.warning) {
      return 'warning';
    }

    return 'info';
  }

  /**
   * Gera um codigo de status HTTP baseado no tipo de log
   * @param {string} type - Tipo do log
   * @returns {number}
   */
  generateStatusCode(type) {
    switch (type) {
      case 'error':
        return [400, 401, 403, 404, 500, 502, 503][Math.floor(Math.random() * 7)];
      case 'warning':
        return [200, 201, 204, 301, 302][Math.floor(Math.random() * 5)];
      default:
        return [200, 201, 204][Math.floor(Math.random() * 3)];
    }
  }

  /**
   * Gera um tempo de resposta simulado
   * @param {string} type - Tipo do log
   * @returns {number}
   */
  generateResponseTime(type) {
    switch (type) {
      case 'error':
        return Math.round(Math.random() * 3000 + 500);
      case 'warning':
        return Math.round(Math.random() * 1500 + 300);
      default:
        return Math.round(Math.random() * 200 + 20);
    }
  }

  /**
   * Gera um log completo
   * @returns {Object} - Objeto de log
   */
  generate() {
    const type = this.selectType();
    const templates = this.templates[type];
    const template = templates[Math.floor(Math.random() * templates.length)];

    return {
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      type,
      message: template.message,
      endpoint: template.endpoint,
      statusCode: this.generateStatusCode(type),
      responseTime: this.generateResponseTime(type),
      timestamp: new Date().toISOString(),
      ip: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    };
  }
}

module.exports = LogGenerator;
