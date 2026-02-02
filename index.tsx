
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import styles from './index.css?inline';

// Criar container se não existir
let container = document.getElementById('serh-chat-widget');
if (!container) {
  container = document.createElement('div');
  container.id = 'serh-chat-widget';
  document.body.appendChild(container);
}

const widgetWidth = container.getAttribute('data-width') || '480px';
const widgetHeight = container.getAttribute('data-height') || '700px';

const shadowRoot = container.attachShadow({ mode: 'open' });
const mountPoint = document.createElement('div');

const style = document.createElement('style');
style.textContent = styles;

const faLink = document.createElement('link');
faLink.rel = 'stylesheet';
faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';

shadowRoot.appendChild(style);
shadowRoot.appendChild(faLink);
shadowRoot.appendChild(mountPoint);

const root = ReactDOM.createRoot(mountPoint);
root.render(
  <React.StrictMode>
    <App widgetWidth={widgetWidth} widgetHeight={widgetHeight} />
  </React.StrictMode>
);

// Expor função global para controle externo (opcional)
(window as any).SERHChat = {
  show: () => container?.style.setProperty('display', 'block'),
  hide: () => container?.style.setProperty('display', 'none'),
};
