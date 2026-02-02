
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import styles from './index.css?inline';

const STYLE_ID = 'serh-chat-widget-styles';
const FA_ID = 'serh-chat-widget-fa';

if (!document.getElementById(STYLE_ID)) {
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = styles;
  document.head.appendChild(style);
}

if (!document.getElementById(FA_ID)) {
  const link = document.createElement('link');
  link.id = FA_ID;
  link.rel = 'stylesheet';
  link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
  document.head.appendChild(link);
}

// Criar container se não existir
let container = document.getElementById('serh-chat-widget');
if (!container) {
  container = document.createElement('div');
  container.id = 'serh-chat-widget';
  document.body.appendChild(container);
}

const widgetWidth = container.getAttribute('data-width') || '480px';
const widgetHeight = container.getAttribute('data-height') || '700px';

const root = ReactDOM.createRoot(container);
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
