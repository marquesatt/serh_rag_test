
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Criar container se não existir
let container = document.getElementById('serh-chat-widget');
if (!container) {
  container = document.createElement('div');
  container.id = 'serh-chat-widget';
  document.body.appendChild(container);
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expor função global para controle externo (opcional)
(window as any).SERHChat = {
  show: () => container?.style.setProperty('display', 'block'),
  hide: () => container?.style.setProperty('display', 'none'),
};
