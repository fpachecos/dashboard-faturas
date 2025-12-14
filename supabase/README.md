# Setup do Supabase

Este guia explica como configurar o Supabase para a aplicação Dashboard de Faturas.

## ⚠️ IMPORTANTE: Autenticação de Usuários

A aplicação agora requer autenticação de usuários. Cada usuário só pode ver e modificar suas próprias transações. Certifique-se de:

1. Executar o schema SQL atualizado que inclui `user_id` nas tabelas
2. Habilitar autenticação no Supabase Dashboard
3. Configurar as políticas de RLS (Row Level Security) que já estão no schema

## Passo 1: Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha:
   - **Name**: dashboard-faturas (ou outro nome)
   - **Database Password**: Escolha uma senha forte
   - **Region**: Escolha a região mais próxima
5. Aguarde alguns minutos enquanto o projeto é criado

## Passo 2: Executar o Schema SQL

1. No dashboard do Supabase, vá em **SQL Editor** (ícone de banco de dados no menu lateral)
2. Clique em **New Query**
3. Abra o arquivo `schema.sql` deste diretório
4. Copie todo o conteúdo
5. Cole no editor SQL do Supabase
6. Clique em **Run** (ou pressione Cmd/Ctrl + Enter)

Isso criará:
- **Schema `faturas`**: Um schema dedicado para organizar as tabelas
- Tabela `faturas.transactions` com todos os campos necessários
- Tabela `faturas.categories` com as categorias padrão
- Índices para melhor performance
- Triggers para atualizar `updated_at` automaticamente
- Permissões adequadas para acesso via API

**Nota**: Todas as tabelas são criadas no schema `faturas` para melhor organização.

## Passo 3: Obter Credenciais

1. No dashboard do Supabase, vá em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Você verá:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Uma chave longa começando com `eyJ...`

Anote essas duas informações.

## Passo 4: Configurar Variáveis de Ambiente

### Localmente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Importante**: Não commite este arquivo! Ele já está no `.gitignore`.

### No Vercel

1. Acesse [Vercel Dashboard](https://vercel.com)
2. Vá no seu projeto
3. Clique em **Settings** > **Environment Variables**
4. Adicione:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: A URL do seu projeto Supabase
   - **Environments**: Production, Preview, Development (marque todos)
5. Clique em **Add**
6. Repita para `NEXT_PUBLIC_SUPABASE_ANON_KEY`
7. Faça um novo deploy

## Passo 5: Verificar

Após configurar:

1. Inicie a aplicação localmente: `npm run dev`
2. Acesse `http://localhost:3000`
3. Tente importar um CSV
4. Verifique no Supabase:
   - Vá em **Table Editor**
   - Você deve ver a tabela `transactions` com os dados importados
   - A tabela `categories` deve ter as 13 categorias padrão

## Estrutura das Tabelas

Todas as tabelas estão no schema `faturas`:
- `faturas.transactions`
- `faturas.categories`

### faturas.transactions

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT (PK) | ID único da transação |
| user_id | UUID (FK) | ID do usuário (referência a auth.users) |
| date | TEXT | Data da transação (DD/MM/YYYY) |
| establishment | TEXT | Nome do estabelecimento |
| cardholder | TEXT | Nome do portador |
| value | NUMERIC | Valor da transação |
| installment | TEXT | Informação de parcela |
| invoice_date | TEXT | Data da fatura (YYYY-MM-DD) |
| category | TEXT | ID da categoria (FK) |
| type | TEXT | Tipo: 'Fixo' ou 'Variável' |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

### faturas.categories

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | TEXT (PK) | ID único da categoria |
| user_id | UUID (FK) | ID do usuário (referência a auth.users, pode ser NULL) |
| name | TEXT | Nome da categoria |
| color | TEXT | Cor em hexadecimal |
| created_at | TIMESTAMP | Data de criação |
| updated_at | TIMESTAMP | Data de atualização |

## Segurança (RLS - Row Level Security)

**O RLS está HABILITADO por padrão** nas tabelas `faturas.transactions` e `faturas.categories`. Isso garante que cada usuário só possa acessar seus próprios dados.

As políticas de RLS já estão definidas no schema e garantem:
- Usuários só podem ver suas próprias transações e categorias
- Usuários só podem criar transações e categorias para si mesmos
- Usuários só podem atualizar/excluir suas próprias transações e categorias

## Habilitar Autenticação no Supabase

1. No dashboard do Supabase, vá em **Authentication** > **Providers**
2. Certifique-se de que **Email** está habilitado
3. Configure as opções de autenticação conforme necessário:
   - **Enable email confirmations**: Recomendado para produção
   - **Enable email change confirmations**: Recomendado para produção
4. Salve as alterações

Agora os usuários podem se cadastrar e fazer login na aplicação!

## Troubleshooting

### Erro: "Supabase not configured"
- Verifique se as variáveis de ambiente estão configuradas
- Reinicie o servidor após adicionar variáveis

### Erro: "relation does not exist"
- Execute o schema SQL novamente
- Verifique se as tabelas foram criadas no Table Editor

### Dados não aparecem
- Verifique a conexão com Supabase
- Veja os logs no console do navegador
- Verifique as Network requests no DevTools

## Recursos

- [Documentação Supabase](https://supabase.com/docs)
- [Supabase Dashboard](https://app.supabase.com)
- [Guia de SQL do Supabase](https://supabase.com/docs/guides/database)

