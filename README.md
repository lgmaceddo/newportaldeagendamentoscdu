# Portal de Agendamento CDU

Sistema de gerenciamento para a equipe de agendamento do Centro de Diagnóstico Unimed.

## 🚀 Deploy na Vercel

### Pré-requisitos

1. Conta na [Vercel](https://vercel.com)
2. Projeto Supabase configurado
3. Repositório Git (GitHub, GitLab ou Bitbucket)

### Passos para Deploy

#### 1. Instalar Vercel CLI (Opcional)

```bash
npm install -g vercel
```

#### 2. Deploy via Vercel Dashboard (Recomendado)

1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Add New Project"
3. Importe seu repositório do GitHub
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_PROJECT_ID`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_URL`
5. Clique em "Deploy"

#### 3. Deploy via CLI

```bash
# Login na Vercel
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### Configurar Variáveis de Ambiente na Vercel

1. Acesse seu projeto na Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione as seguintes variáveis:

| Nome | Valor | Ambiente |
|------|-------|----------|
| `VITE_SUPABASE_PROJECT_ID` | Seu Project ID | Production, Preview, Development |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Sua Publishable Key | Production, Preview, Development |
| `VITE_SUPABASE_URL` | https://seu-projeto.supabase.co | Production, Preview, Development |

### 📝 Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env.local` e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

Edite `.env.local` com suas credenciais do Supabase:

```env
VITE_SUPABASE_PROJECT_ID=mxbejtzeakbfsqzdnbag
VITE_SUPABASE_PUBLISHABLE_KEY=sua_publishable_key_aqui
VITE_SUPABASE_URL=https://mxbejtzeakbfsqzdnbag.supabase.co
```

## 🛠️ Desenvolvimento Local

### Instalar Dependências

```bash
npm install
```

### Executar em Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

## 📦 Tecnologias

- **React** + **TypeScript**
- **Vite** - Build tool
- **Supabase** - Backend e autenticação
- **Tailwind CSS** - Estilização
- **Shadcn UI** - Componentes
- **React Router** - Navegação
- **Zod** - Validação

## 🔐 Autenticação

O sistema usa Supabase Auth com:
- Login/Cadastro com email e senha
- Recuperação de senha
- Sistema de roles (admin/user)
- Row Level Security (RLS)

## 📊 Banco de Dados

Todas as tabelas estão configuradas no Supabase com:
- 18 tabelas principais
- RLS habilitado
- Triggers automáticos
- Migrações versionadas

## 🎨 Funcionalidades

- ✅ Dashboard com métricas
- ✅ Gestão de Scripts
- ✅ Gestão de Exames
- ✅ Gestão de Contatos
- ✅ Tabela de Valores
- ✅ Consultórios
- ✅ Profissionais
- ✅ Anotações e Estomaterapia
- ✅ Recados
- ✅ Sistema de busca global
- ✅ Migração de dados via JSON

## 📄 Licença

© 2026 Unimed Bauru - Centro de Diagnóstico

---

**Desenvolvido para a Equipe de Agendamento CDU** 💚
