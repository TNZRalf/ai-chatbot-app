const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Node.js backend proxy
  app.use(
    ['/api', '/auth', '/cv'],
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );

  // FastAPI backend proxy
  app.use(
    '/parse',
    createProxyMiddleware({
      target: 'http://localhost:8000',
      changeOrigin: true,
    })
  );
};
