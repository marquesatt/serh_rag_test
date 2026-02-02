# 📦 Como Fazer Deploy do Widget SERH

## 1️⃣ Build do Projeto

Execute o build para gerar os arquivos de produção:

```bash
npm run build
```

Isso vai gerar a pasta `dist/` com:
- `serh-widget.js` - O JavaScript do widget
- `serh-widget.css` - O CSS do widget
- Outros assets necessários

## 2️⃣ Hospedar os Arquivos

Você tem algumas opções:

### Opção A: No mesmo servidor PHP
1. Copie a pasta `dist/` para dentro do seu projeto PHP
2. Exemplo: coloque em `/public/chat/` ou `/assets/serh-widget/`

### Opção B: CDN/Servidor Separado
1. Faça upload da pasta `dist/` para um servidor de arquivos estáticos
2. Ou use um CDN como Cloudflare, AWS S3, etc.

## 3️⃣ Integrar no PHP

Adicione estas linhas em qualquer página PHP (antes do `</body>`):

```html
<!-- Font Awesome (necessário para os ícones) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Widget SERH -->
<link rel="stylesheet" href="/caminho/para/dist/serh-widget.css">
<script type="module" src="/caminho/para/dist/serh-widget.js"></script>
```

**Ajuste os caminhos conforme onde você hospedou os arquivos!**

## 4️⃣ Pronto! 🎉

O widget vai aparecer automaticamente como um botão flutuante no canto inferior direito de qualquer página que incluir esses scripts.

## ⚙️ Configurações Opcionais

### Controle Programático (JavaScript)

```javascript
// Mostrar o widget
window.SERHChat.show();

// Esconder o widget
window.SERHChat.hide();
```

### Personalização de Estilo

Você pode sobrescrever estilos no seu CSS:

```css
/* Mudar posição do botão */
#serh-chat-widget button {
    bottom: 20px !important;
    right: 20px !important;
}

/* Mudar cor do botão */
#serh-chat-widget button {
    background-color: #your-color !important;
}
```

## 🔒 Segurança da API Key

⚠️ **IMPORTANTE**: A API key está exposta no frontend!

Para produção, você DEVE criar uma API intermediária em PHP:

1. Crie um endpoint PHP que chama a API do Gemini
2. Configure a API key no servidor (variável de ambiente)
3. Modifique o `geminiService.ts` para chamar seu endpoint PHP

Exemplo:
```php
<?php
// api/chat.php
$apiKey = getenv('GEMINI_API_KEY'); // Variável de ambiente
$message = json_decode(file_get_contents('php://input'), true);

// Fazer chamada para API do Gemini com $apiKey
// Retornar resposta
?>
```

## 🧪 Testar Localmente

Para testar antes do deploy:

```bash
npm run dev
```

Abra `http://localhost:3000/exemplo-php.html`

## 📝 Checklist de Deploy

- [ ] Executar `npm run build`
- [ ] Upload dos arquivos da pasta `dist/`
- [ ] Adicionar Font Awesome no PHP
- [ ] Adicionar links para `serh-widget.css` e `serh-widget.js`
- [ ] Testar em ambiente de homologação
- [ ] Implementar API intermediária (segurança)
- [ ] Deploy em produção

## 🆘 Problemas Comuns

**Widget não aparece:**
- Verifique se os caminhos dos arquivos estão corretos
- Abra o Console do navegador (F12) e veja se há erros
- Confirme que o Font Awesome está carregado

**Chat não responde:**
- Verifique se a API key está configurada no `.env`
- Veja os erros no Console (F12)
- Implemente a API intermediária para produção

**Conflitos de CSS:**
- O widget usa classes isoladas, mas pode ter conflitos
- Use `!important` para forçar estilos se necessário
