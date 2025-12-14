# Guia de Setup - App Expo

## Passo a Passo Completo

### 1. Preparação

Certifique-se de que:
- ✅ A aplicação web Next.js está deployada no Vercel
- ✅ Você tem uma conta no [Expo](https://expo.dev)
- ✅ Você tem Node.js instalado (v18 ou superior)

### 2. Instalação

```bash
cd app-expo
npm install
```

### 3. Configuração

1. **Configure a URL da aplicação web**:

   Crie um arquivo `.env`:
   ```bash
   EXPO_PUBLIC_WEB_APP_URL=https://sua-app.vercel.app
   ```

2. **Personalize o app.json**:

   - Altere `bundleIdentifier` para um identificador único
   - Atualize `name` e `slug` se desejar
   - Configure ícones e splash screen

### 4. Criar Assets

Você precisa criar os seguintes arquivos em `app-expo/assets/`:

- **icon.png** (1024x1024px) - Ícone principal
- **splash.png** (1284x2778px) - Tela de splash
- **adaptive-icon.png** (1024x1024px) - Para Android
- **favicon.png** (48x48px) - Para web

**Ferramentas úteis**:
- [App Icon Generator](https://www.appicon.co/)
- [Figma](https://figma.com)
- [Canva](https://canva.com)

### 5. Testar Localmente

```bash
# Inicie o servidor de desenvolvimento
npm start

# Escaneie o QR code com:
# - Expo Go (iOS/Android) para testar no dispositivo
# - Ou pressione 'i' para abrir no simulador iOS
# - Ou pressione 'a' para abrir no emulador Android
```

### 6. Build para iOS

#### Primeira vez:

1. **Login no Expo**:
   ```bash
   eas login
   ```

2. **Configure o projeto**:
   ```bash
   eas build:configure
   ```

3. **Crie um projeto EAS**:
   ```bash
   eas init
   ```

#### Builds:

```bash
# Build de desenvolvimento (simulador)
eas build --platform ios --profile development

# Build de preview (TestFlight)
eas build --platform ios --profile preview

# Build de produção (App Store)
eas build --platform ios --profile production
```

### 7. Publicar na App Store

#### Opção 1: Via EAS Submit (Recomendado)

```bash
eas submit --platform ios
```

Isso irá:
- Fazer upload do build para o App Store Connect
- Criar/atualizar o app automaticamente

#### Opção 2: Manual

1. Acesse [App Store Connect](https://appstoreconnect.apple.com)
2. Crie um novo app (se ainda não existir)
3. Faça upload do arquivo `.ipa` baixado do Expo
4. Complete as informações:
   - Descrição
   - Screenshots
   - Categoria
   - Preço
5. Submeta para revisão

### 8. Atualizações Over-the-Air (OTA)

Você pode atualizar o conteúdo do app sem fazer nova build:

```bash
eas update --branch production --message "Correção de bugs"
```

Isso atualiza apenas o conteúdo WebView, não requer nova submissão à App Store.

## Troubleshooting

### Erro: "No bundle identifier found"
- Verifique se o `bundleIdentifier` está configurado no `app.json`

### Erro: "Build failed"
- Verifique os logs: `eas build:view [BUILD_ID]`
- Certifique-se de que todos os assets estão presentes

### App não carrega a URL
- Verifique se `EXPO_PUBLIC_WEB_APP_URL` está configurado corretamente
- Teste a URL no navegador primeiro
- Verifique se a URL está acessível publicamente

### Build demora muito
- Builds de iOS podem levar 10-20 minutos
- Use `eas build:list` para verificar o status

## Recursos Adicionais

- [Documentação Expo](https://docs.expo.dev)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com)
- [Expo Discord](https://chat.expo.dev) - Comunidade para ajuda

