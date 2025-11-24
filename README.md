# Dashboard de Monitoramento de Sistemas em Tempo Real

Sistema de observabilidade simulado para monitoramento de metricas de servidores em tempo real, utilizando Socket.io para comunicacao bidirecional.

## Descricao

Este projeto implementa um dashboard web completo que simula o monitoramento de servidores, apresentando metricas de desempenho que se atualizam automaticamente. O sistema suporta multiplos usuarios conectados simultaneamente, todos visualizando os mesmos dados em tempo real.

### Funcionalidades

- **Metricas em Tempo Real**: CPU, Memoria, Requisicoes/s e Tempo de Resposta
- **Graficos Dinamicos**: Visualizacao com Chart.js que atualiza automaticamente
- **Sistema de Alertas**: Notificacoes visuais quando metricas ultrapassam limites
- **Streaming de Logs**: Logs simulados com diferentes niveis (info, warning, error)
- **Multiplos Usuarios**: Suporte a conexoes simultaneas com contador de usuarios online

## Tecnologias Utilizadas

- **Backend**
  - Node.js
  - Express.js
  - Socket.io

- **Frontend**
  - HTML5
  - CSS3
  - JavaScript (ES6+)
  - Chart.js
  - Socket.io Client

## Estrutura do Projeto

```
faculdade-ta-5/
├── public/
│   ├── css/
│   │   └── styles.css        # Estilos do dashboard
│   ├── js/
│   │   ├── app.js            # Logica principal do frontend
│   │   └── charts.js         # Configuracao dos graficos
│   └── index.html            # Pagina principal
├── src/
│   ├── services/
│   │   ├── AlertManager.js   # Gerenciador de alertas
│   │   ├── LogGenerator.js   # Gerador de logs simulados
│   │   └── MetricsGenerator.js # Gerador de metricas
│   └── server.js             # Servidor principal
├── .gitignore
├── package.json
└── README.md
```

## Instrucoes de Instalacao

### Pre-requisitos

- Node.js (versao 14 ou superior)
- npm (gerenciador de pacotes do Node.js)

### Passos

1. Clone o repositorio:
```bash
git clone https://github.com/seu-usuario/faculdade-ta-5.git
cd faculdade-ta-5
```

2. Instale as dependencias:
```bash
npm install
```

3. Inicie o servidor:
```bash
npm start
```

4. Acesse no navegador:
```
http://localhost:3000
```

### Modo Desenvolvimento

Para executar com hot-reload (Node.js 18+):
```bash
npm run dev
```

## Funcionamento

### Geracao de Metricas

O sistema gera metricas simuladas a cada 2 segundos com valores realisticos:

| Metrica | Faixa Normal | Aviso | Critico |
|---------|--------------|-------|---------|
| CPU | 10-85% | >= 70% | >= 90% |
| Memoria | 30-80% | >= 75% | >= 90% |
| Requisicoes/s | 50-300 | >= 400 | >= 500 |
| Tempo Resposta | 50-250ms | >= 300ms | >= 500ms |

### Sistema de Alertas

- **Warning (Aviso)**: Borda amarela no card, notificacao toast
- **Critical (Critico)**: Borda vermelha, animacao de shake, notificacao toast

### Eventos Socket.io

| Evento | Direcao | Descricao |
|--------|---------|-----------|
| `metrics:update` | Server -> Client | Novas metricas geradas |
| `metrics:history` | Server -> Client | Historico inicial de metricas |
| `alert:new` | Server -> Client | Novo alerta disparado |
| `alerts:history` | Server -> Client | Historico de alertas |
| `log:new` | Server -> Client | Novo log gerado |
| `users:count` | Server -> Client | Numero de usuarios conectados |

## Screenshots

### Dashboard Principal
O dashboard apresenta:
- Cards com metricas atuais e barras de progresso
- Graficos de linha para CPU/Memoria e Requisicoes/Tempo de Resposta
- Painel de alertas recentes
- Stream de logs em tempo real
- Contador de usuarios online

### Alertas
Quando uma metrica ultrapassa o limite:
- O card correspondente muda de cor
- Uma notificacao toast aparece no canto superior direito
- O alerta e adicionado ao historico

## Demonstracao

Para testar multiplos usuarios:
1. Abra o dashboard em varias abas/navegadores
2. Observe o contador de usuarios aumentar
3. Todas as abas receberao os mesmos dados em tempo real

## Autor

Desenvolvido para a disciplina de Programacao Web - Atividade Pratica 05

## Licenca

MIT
