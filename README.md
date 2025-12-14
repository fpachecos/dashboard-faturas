# Dashboard de Faturas

Aplicação web para análise e classificação de lançamentos de faturas de cartão de crédito.

## Funcionalidades

- 📊 **Dashboard por Categoria**: Visualização de gastos por categoria com gráficos
- 📋 **Dados Brutos**: Tabela editável com todos os lançamentos
- 📈 **Fixo vs Variável**: Comparação entre gastos fixos e variáveis
- 🔍 **Filtros Avançados**: Filtre por categoria, data, valor e data da fatura
- 📤 **Importação de CSV**: Importe novas faturas no formato CSV
- 🤖 **Classificação Automática**: IA classifica automaticamente os lançamentos ao importar

## Tecnologias

- **Next.js 14**: Framework React
- **TypeScript**: Tipagem estática
- **Tailwind CSS**: Estilização
- **Recharts**: Gráficos e visualizações
- **PapaParse**: Parser de CSV
- **JSON Files**: Persistência de dados

## Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## Estrutura do Projeto

```
dashboard-faturas/
├── pages/
│   ├── api/              # API Routes
│   ├── index.tsx         # Dashboard por categoria
│   ├── raw-data.tsx      # Dados brutos
│   └── fixed-variable.tsx # Fixo vs Variável
├── components/           # Componentes React
├── lib/                  # Utilitários e lógica (Supabase)
├── types/                # Definições TypeScript
├── supabase/             # Schema SQL e documentação
└── app-expo/             # App Expo para iOS/Android
```

## Formato do CSV

O CSV deve ter o seguinte formato (separado por `;`):

```
Data;Estabelecimento;Portador;Valor;Parcela
01/10/2025;ESTABELECIMENTO;NOME;R$ 100,00;-
```

O nome do arquivo deve seguir o padrão: `FaturaYYYY-MM-DD.csv` (ex: `Fatura2025-10-20.csv`)

## Deploy

### 1. Deploy da Aplicação Web no Vercel

Primeiro, faça o deploy da aplicação web Next.js no Vercel:

1. Faça push do código para um repositório Git (GitHub, GitLab, etc.)
2. Acesse [Vercel](https://vercel.com)
3. Importe o repositório
4. Configure as variáveis de ambiente (se necessário)
5. Deploy automático!

**Persistência de Dados com Supabase**: 
- A aplicação usa **Supabase** como banco de dados PostgreSQL
- Funciona perfeitamente no Vercel e em qualquer ambiente
- Plano gratuito generoso do Supabase (500MB de banco de dados)
- Veja a seção "Configuração do Supabase" abaixo para setup

### 2. Build e Deploy como App iOS com Expo

A aplicação inclui um app Expo que funciona como um wrapper nativo, carregando a aplicação web via WebView. Isso permite publicar no App Store enquanto mantém a aplicação web como base.

#### Pré-requisitos

1. **Conta Expo**: Crie uma conta gratuita em [expo.dev](https://expo.dev)
2. **EAS CLI**: Instale o EAS CLI globalmente:
   ```bash
   npm install -g eas-cli
   ```
3. **Apple Developer Account**: Para publicar no App Store, você precisa de uma conta Apple Developer ($99/ano)

#### Configuração Inicial

1. **Navegue para a pasta do app Expo**:
   ```bash
   cd app-expo
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Faça login no Expo**:
   ```bash
   eas login
   ```

4. **Configure o projeto EAS**:
   ```bash
   eas build:configure
   ```

5. **Crie o projeto no EAS e obtenha o Project ID**:
   ```bash
   eas project:init
   ```
   
   Após executar este comando, o EAS fornecerá um Project ID (UUID). 
   Atualize o campo `extra.eas.projectId` no arquivo `app-expo/app.json` com o UUID fornecido.
   
   Ou você pode verificar o Project ID atual com:
   ```bash
   eas project:info
   ```

6. **Configure a URL da aplicação web**:
   
   Crie um arquivo `.env` na pasta `app-expo`:
   ```bash
   EXPO_PUBLIC_WEB_APP_URL=https://sua-app.vercel.app
   ```
   
   Ou atualize diretamente no arquivo `app-expo/app/index.tsx` a constante `WEB_APP_URL`.

7. **Atualize o bundle identifier** (obrigatório):
   
   Edite `app-expo/app.json` e altere o `bundleIdentifier` para um identificador único baseado no seu nome ou organização:
   ```json
   "ios": {
     "bundleIdentifier": "com.seunome.dashboardfaturas"
   },
   "android": {
     "package": "com.seunome.dashboardfaturas"
   }
   ```
   
   **Importante**: O bundle identifier deve ser único e seguir o formato reverse domain (ex: `com.seunome.appname`). 
   Se o identificador já estiver em uso por outro desenvolvedor, você precisará escolher outro.

#### Criar Assets do App

Crie os seguintes arquivos na pasta `app-expo/assets/`:

- **icon.png**: Ícone do app (1024x1024px)
- **splash.png**: Tela de splash (1284x2778px para iPhone)
- **adaptive-icon.png**: Ícone adaptativo para Android (1024x1024px)
- **favicon.png**: Favicon para web (48x48px)

Você pode usar ferramentas online como [App Icon Generator](https://www.appicon.co/) para gerar todos os tamanhos necessários.

#### Resolver Problemas do App Store Connect

Antes de fazer o build, você precisa resolver alguns problemas no App Store Connect:

1. **Revisar e aceitar o acordo de licença atualizado**:
   - Acesse: https://developer.apple.com/account
   - Faça login com sua conta de Account Holder
   - Revise e aceite o Apple Developer Program License Agreement atualizado

2. **Fornecer informações de Trader Status (DSA - Digital Services Act)**:
   - Acesse: https://appstoreconnect.apple.com
   - Vá em **Users and Access** > **Compliance Information**
   - Forneça seu trader status conforme exigido pelo Digital Services Act da UE
   - Mais informações: https://developer.apple.com/help/app-store-connect/manage-compliance-information/manage-european-union-digital-services-act-compliance-information

3. **Verificar se o Bundle Identifier está disponível**:
   - Se o bundle identifier `com.dashboardfaturas.app` já estiver em uso, você precisará usar um diferente
   - O formato recomendado é: `com.seunome.appname`
   - Exemplo: `com.fpachecosouza.dashboardfaturas`
   - Atualize o `bundleIdentifier` no arquivo `app-expo/app.json`

#### Atualizar Dependências (Importante!)

Antes de fazer o build, certifique-se de que está usando o Expo SDK 52 ou superior, que suporta Xcode 16 e iOS 18 SDK (requerido pela Apple a partir de abril de 2025):

```bash
cd app-expo
npm install --legacy-peer-deps
```

**Nota**: Se você encontrar erros de conflito de dependências (ERESOLVE), use a flag `--legacy-peer-deps` para resolver.

Se necessário, atualize manualmente no `package.json`:
- `expo`: `~52.0.0` ou superior
- `react-native`: `0.76.5` ou superior

**IMPORTANTE**: O `eas.json` está configurado para usar Xcode 16.0. Se você receber um erro sobre SDK version (iOS 17.5), significa que o build foi feito antes dessa atualização. Você precisa fazer um **novo build** com as configurações atualizadas:

```bash
cd app-expo
eas build --platform ios --profile preview --clear-cache
```

O flag `--clear-cache` garante que um novo build será feito com as configurações atualizadas.

#### Build para iOS

1. **Build de desenvolvimento** (para testar no simulador):
   ```bash
   eas build --platform ios --profile development
   ```

2. **Build de preview** (para testar em dispositivo físico via TestFlight):
   ```bash
   eas build --platform ios --profile preview --clear-cache
   ```

3. **Build de produção** (para publicar na App Store):
   ```bash
   eas build --platform ios --profile production --clear-cache
   ```

**Nota Importante**: A partir de 24 de abril de 2025, a Apple requer que todos os apps sejam compilados com Xcode 16 ou superior usando o iOS 18 SDK. O Expo SDK 52+ já inclui suporte para isso.

**⚠️ IMPORTANTE: Erro "SDK version issue. This app was built with the iOS 17.5 SDK"**

Este erro significa que você está tentando enviar um build antigo que foi feito com iOS 17.5 SDK. **Você NÃO pode enviar este build** - ele será sempre rejeitado pela Apple.

**Solução obrigatória:**

1. **Verifique se está usando Expo SDK 52+**:
   ```bash
   cd app-expo
   cat package.json | grep '"expo"'
   ```
   Deve mostrar: `"expo": "~52.0.0"` ou superior

2. **Faça um NOVO build** (obrigatório):
   ```bash
   cd app-expo
   eas build --platform ios --profile preview --clear-cache
   ```
   
   O flag `--clear-cache` é **essencial** para garantir que o build use Xcode 16

3. **Aguarde o build completar** (10-30 minutos):
   - Acompanhe o progresso com: `eas build:list`
   - Você receberá uma notificação quando estiver pronto

4. **Envie o NOVO build para TestFlight**:
   ```bash
   eas submit --platform ios --latest
   ```

**Por que isso acontece?**
- O build que você está tentando enviar foi feito ANTES da atualização para Expo SDK 52
- Mesmo tendo atualizado o código, o build antigo ainda existe e foi feito com iOS 17.5 SDK
- A Apple rejeita qualquer build feito com iOS 17.5 SDK ou anterior
- **Você DEVE fazer um novo build** - não há como "corrigir" um build antigo

**Nota**: Se você ainda encontrar erros relacionados ao bundle identifier, tente usar um identificador mais único baseado no seu nome ou organização.

#### Testar o App

1. **No simulador iOS** (após build de desenvolvimento):
   ```bash
   eas build:run -p ios
   ```

2. **No dispositivo físico**:
   - Instale o app [Expo Go](https://apps.apple.com/app/expo-go/id982107779) no seu iPhone
   - Escaneie o QR code que aparece após o build
   - Ou use TestFlight para builds de preview/produção

#### Enviar para TestFlight

O TestFlight permite testar o app em dispositivos físicos antes de publicar na App Store. Siga estes passos:

1. **Fazer build de preview ou produção** (OBRIGATÓRIO usar --clear-cache):
   ```bash
   # Build de preview (recomendado para TestFlight)
   cd app-expo
   eas build --platform ios --profile preview --clear-cache
   
   # Ou build de produção
   eas build --platform ios --profile production --clear-cache
   ```
   
   **⚠️ IMPORTANTE**: Sempre use `--clear-cache` para garantir que o build use Xcode 16/iOS 18 SDK

2. **Aguardar o build completar**:
   - O build será processado na nuvem (pode levar 10-30 minutos)
   - Você receberá uma notificação quando estiver pronto
   - Ou acompanhe o progresso com: `eas build:list`

3. **Enviar automaticamente para TestFlight**:
   ```bash
   eas submit --platform ios --latest
   ```
   
   Este comando irá:
   - Usar o build mais recente
   - Fazer upload para o App Store Connect
   - Processar automaticamente para TestFlight

4. **Ou enviar manualmente**:
   - Acesse o [dashboard do Expo](https://expo.dev)
   - Vá em seu projeto > Builds
   - Clique no build iOS concluído
   - Clique em "Submit to App Store"
   - Siga as instruções na tela

5. **Acessar o TestFlight**:
   - Após o processamento (pode levar alguns minutos), acesse [App Store Connect](https://appstoreconnect.apple.com)
   - Vá em **My Apps** > Seu App > **TestFlight**
   - O build aparecerá na seção "iOS Builds"
   - Adicione testadores internos ou externos conforme necessário

6. **Adicionar testadores**:
   - **Testadores Internos**: Membros da sua equipe (até 100 pessoas)
     - Vá em **TestFlight** > **Internal Testing**
     - Adicione os emails dos testadores
   - **Testadores Externos**: Qualquer pessoa (até 10.000 pessoas, mas requer revisão da Apple)
     - Vá em **TestFlight** > **External Testing**
     - Crie um grupo de teste e adicione testadores
     - A primeira versão externa precisa ser revisada pela Apple (pode levar 24-48h)

**Nota**: Para builds de preview, você pode testar diretamente instalando o app no dispositivo físico sem precisar do TestFlight. O TestFlight é mais útil para builds de produção ou quando você quer distribuir para várias pessoas.

#### Publicar na App Store

1. **Submeter o app**:
   ```bash
   eas submit --platform ios --latest
   ```

2. **Ou faça manualmente**:
   - Após o build, baixe o arquivo `.ipa` do dashboard do Expo
   - Use o [App Store Connect](https://appstoreconnect.apple.com) para fazer upload
   - Complete as informações do app (descrição, screenshots, etc.)
   - Submeta para revisão

#### Comandos Úteis

```bash
# Ver status dos builds
eas build:list

# Ver logs de um build
eas build:view [BUILD_ID]

# Atualizar o app sem nova build (Over-the-Air)
eas update --branch production --message "Atualização automática"

# Ver informações do projeto
eas project:info
```

#### Estrutura do Projeto Expo

```
app-expo/
├── app/
│   ├── _layout.tsx    # Layout raiz do app
│   └── index.tsx      # Tela principal (WebView)
├── assets/            # Ícones e imagens
├── app.json           # Configuração do Expo
├── eas.json           # Configuração do EAS Build
├── package.json       # Dependências
└── tsconfig.json      # Configuração TypeScript
```

#### Notas Importantes

- **WebView**: O app usa WebView para carregar a aplicação web. Certifique-se de que a URL está acessível publicamente.
- **Performance**: Para melhor performance, considere implementar cache offline ou uma versão nativa completa no futuro.
- **Atualizações**: Você pode atualizar o conteúdo do app sem nova build usando EAS Update (Over-the-Air updates).
- **Custo**: O plano gratuito do Expo permite builds ilimitados, mas com algumas limitações. Para produção, considere o plano Production.

### Configuração do Supabase

A aplicação usa Supabase para persistência de dados. Siga estes passos:

#### 1. Criar Projeto no Supabase

1. Acesse [Supabase](https://supabase.com) e crie uma conta gratuita
2. Crie um novo projeto
3. Anote a **URL do projeto** e a **anon key** (disponíveis em Settings > API)

#### 2. Configurar o Banco de Dados

1. No dashboard do Supabase, vá em **SQL Editor**
2. Execute o script SQL em `supabase/schema.sql`:
   - Copie o conteúdo do arquivo
   - Cole no SQL Editor
   - Execute (Run)

Isso criará as tabelas `transactions` e `categories` com os índices necessários.

#### 3. Configurar Variáveis de Ambiente

**Localmente:**
1. Crie um arquivo `.env.local` na raiz do projeto:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key_aqui
   ```

**No Vercel:**
1. Acesse seu projeto no [Vercel Dashboard](https://vercel.com)
2. Vá em **Settings > Environment Variables**
3. Adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL do seu projeto Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Sua anon key do Supabase
4. Faça um novo deploy

#### 4. Verificar Funcionamento

Após configurar, a aplicação automaticamente:
- ✅ Usará Supabase para armazenar transações e categorias
- ✅ Funcionará no Vercel sem problemas de sistema de arquivos
- ✅ Terá persistência real de dados

**Nota**: Se as variáveis de ambiente não estiverem configuradas, a aplicação retornará arrays vazios (modo fallback).

## Melhorias Futuras

- [ ] Integração com banco de dados (Vercel KV ou PostgreSQL)
- [ ] Autenticação de usuários
- [ ] Exportação de relatórios em PDF
- [ ] Classificação mais precisa com IA (OpenAI API)
- [ ] Suporte a múltiplas contas/cartões

## Licença

MIT

