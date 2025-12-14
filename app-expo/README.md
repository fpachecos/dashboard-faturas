# Dashboard Faturas - App Expo

App iOS/Android criado com Expo que carrega a aplicação web Dashboard Faturas via WebView.

## Estrutura

Este app é um wrapper nativo que carrega a aplicação web Next.js hospedada no Vercel.

## Configuração Rápida

1. Instale as dependências:
```bash
npm install
```

2. Configure a URL da aplicação web:
```bash
# Crie um arquivo .env
echo "EXPO_PUBLIC_WEB_APP_URL=https://sua-app.vercel.app" > .env
```

3. Inicie o desenvolvimento:
```bash
npm start
```

## Build e Deploy

Veja as instruções completas no README.md principal na raiz do projeto.

## Recursos

- ✅ WebView otimizado para carregar a aplicação web
- ✅ Indicador de carregamento
- ✅ Tratamento de erros de conexão
- ✅ Suporte para iOS e Android
- ✅ Pronto para publicação na App Store e Google Play

