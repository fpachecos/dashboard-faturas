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
├── lib/                  # Utilitários e lógica
├── types/                # Definições TypeScript
└── data/                 # Arquivos JSON (persistência)
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

**Importante sobre persistência no Vercel**: 
- O sistema de arquivos do Vercel é somente leitura durante o runtime
- Para produção, recomenda-se usar Vercel KV (Redis) ou outro banco de dados
- Para desenvolvimento/testes, os arquivos JSON funcionam localmente
- Para uma solução rápida e gratuita, você pode usar Vercel KV (plano gratuito disponível)

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

5. **Configure a URL da aplicação web**:
   
   Crie um arquivo `.env` na pasta `app-expo`:
   ```bash
   EXPO_PUBLIC_WEB_APP_URL=https://sua-app.vercel.app
   ```
   
   Ou atualize diretamente no arquivo `app-expo/app/index.tsx` a constante `WEB_APP_URL`.

6. **Atualize o bundle identifier** (opcional):
   
   Edite `app-expo/app.json` e altere o `bundleIdentifier` para um identificador único:
   ```json
   "ios": {
     "bundleIdentifier": "com.seunome.dashboardfaturas"
   }
   ```

#### Criar Assets do App

Crie os seguintes arquivos na pasta `app-expo/assets/`:

- **icon.png**: Ícone do app (1024x1024px)
- **splash.png**: Tela de splash (1284x2778px para iPhone)
- **adaptive-icon.png**: Ícone adaptativo para Android (1024x1024px)
- **favicon.png**: Favicon para web (48x48px)

Você pode usar ferramentas online como [App Icon Generator](https://www.appicon.co/) para gerar todos os tamanhos necessários.

#### Build para iOS

1. **Build de desenvolvimento** (para testar no simulador):
   ```bash
   eas build --platform ios --profile development
   ```

2. **Build de preview** (para testar em dispositivo físico via TestFlight):
   ```bash
   eas build --platform ios --profile preview
   ```

3. **Build de produção** (para publicar na App Store):
   ```bash
   eas build --platform ios --profile production
   ```

#### Testar o App

1. **No simulador iOS** (após build de desenvolvimento):
   ```bash
   eas build:run -p ios
   ```

2. **No dispositivo físico**:
   - Instale o app [Expo Go](https://apps.apple.com/app/expo-go/id982107779) no seu iPhone
   - Escaneie o QR code que aparece após o build
   - Ou use TestFlight para builds de preview/produção

#### Publicar na App Store

1. **Submeter o app**:
   ```bash
   eas submit --platform ios
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

### Usando Vercel KV (Opcional)

Para usar Vercel KV em produção:

1. Instale o pacote: `npm install @vercel/kv`
2. Configure no Vercel Dashboard: Storage > Create > KV
3. Atualize `lib/data.ts` para usar KV ao invés de arquivos
4. Adicione `KV_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN` como variáveis de ambiente

## Melhorias Futuras

- [ ] Integração com banco de dados (Vercel KV ou PostgreSQL)
- [ ] Autenticação de usuários
- [ ] Exportação de relatórios em PDF
- [ ] Classificação mais precisa com IA (OpenAI API)
- [ ] Suporte a múltiplas contas/cartões

## Licença

MIT

