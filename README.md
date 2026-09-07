# WhatsApp RPG AI

Projeto inicial de um servidor Node.js para um RPG conectado ao WhatsApp.

## Estrutura

- `src/server.js` - servidor HTTP
- `src/whatsapp.js` - conexão do WhatsApp
- `public/index.html` - painel para gerar código de pareamento
- `data/world.json` - dados iniciais do mundo
- `auth/` - sessão do WhatsApp; NÃO deve ser enviada ao GitHub

## Deploy

Comandos:

```bash
npm install
npm start
```

A porta é definida pela variável `PORT` fornecida pelo serviço de hospedagem.

## Importante

A pasta `auth/` contém credenciais da sessão do WhatsApp e está no `.gitignore`.

Não publique o conteúdo dela no GitHub.
