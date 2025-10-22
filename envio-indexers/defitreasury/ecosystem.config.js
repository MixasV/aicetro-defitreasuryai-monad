module.exports = {
  apps: [{
    name: 'envio-indexer',
    cwd: '/root/aicetro-defitreasuryai/envio-indexers/defitreasury',
    script: '/bin/bash',
    args: '-c "source ~/.bashrc && TUI_OFF=true DATABASE_URL=\'postgresql://monad:monad@127.0.0.1:5432/defitreasury_envio\' pnpm start"',
    interpreter: 'none',
    env: {
      TUI_OFF: 'true',
      DATABASE_URL: 'postgresql://monad:monad@127.0.0.1:5433/defitreasury_envio',
      ENVIO_PG_HOST: 'localhost',
      ENVIO_PG_PORT: '5433',
      ENVIO_PG_USER: 'monad',
      ENVIO_PG_PASSWORD: 'monad',
      ENVIO_PG_DATABASE: 'defitreasury_envio',
      ENVIO_GRAPHQL_PORT: '8081',
      ENVIO_GRAPHQL_HOST: '0.0.0.0'
    },
    autorestart: false,
    watch: false,
    max_memory_restart: '500M',
    error_file: '/root/.pm2/logs/envio-indexer-error.log',
    out_file: '/root/.pm2/logs/envio-indexer-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
}
