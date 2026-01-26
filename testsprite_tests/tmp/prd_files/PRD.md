# PRD - Portal de Agendamento CDU

## 📋 Informações do Documento

| Campo | Valor |
|-------|-------|
| **Produto** | Portal de Agendamento CDU |
| **Versão** | 1.0.0 |
| **Data de Criação** | Janeiro 2026 |
| **Organização** | Unimed Bauru - Centro de Diagnóstico |
| **Última Atualização** | 25/01/2026 |

---

## 🎯 Visão Geral do Produto

### Propósito

O **Portal de Agendamento CDU** é um sistema web interno desenvolvido para otimizar e centralizar a gestão de agendamentos e informações operacionais da equipe do Centro de Diagnóstico Unimed (CDU). O portal visa eliminar a dependência de planilhas dispersas, documentos físicos e comunicação fragmentada, proporcionando uma plataforma única, segura e eficiente para o gerenciamento de todas as atividades relacionadas ao agendamento de exames médicos.

### Problema que Resolve

**Desafios Atuais:**
- Informações críticas dispersas em múltiplos documentos e planilhas
- Dificuldade em localizar rapidamente dados de exames, profissionais e procedimentos
- Falta de padronização nos scripts de atendimento
- Comunicação ineficiente entre setores
- Ausência de controle de versão e histórico de alterações
- Risco de perda de informações importantes
- Tempo excessivo gasto na busca de informações durante atendimentos

**Solução Proposta:**
Um portal web centralizado que:
- Consolida todas as informações em um único local acessível
- Oferece busca global instantânea em todos os dados
- Padroniza processos e scripts de atendimento
- Facilita a comunicação entre equipes
- Mantém histórico e versionamento de dados
- Garante segurança e controle de acesso por perfis
- Reduz drasticamente o tempo de resposta ao cliente

### Público-Alvo

**Usuários Primários:**
1. **Atendentes de Agendamento** (Recepcionistas)
   - Realizam agendamentos de exames
   - Consultam informações de procedimentos
   - Utilizam scripts padronizados
   - Verificam disponibilidade de profissionais

2. **Coordenadores/Supervisores**
   - Gerenciam equipes e setores
   - Atualizam informações de exames e valores
   - Configuram regras de agendamento
   - Monitoram métricas e desempenho

3. **Administradores do Sistema**
   - Gerenciam usuários e permissões
   - Realizam migrações de dados
   - Configuram integrações
   - Mantém a infraestrutura

**Usuários Secundários:**
- Profissionais de saúde (consulta de informações)
- Gestores (visualização de relatórios e métricas)

---

## 🎨 Identidade Visual

### Paleta de Cores

O portal utiliza a identidade visual da Unimed:

| Cor | Código | Uso |
|-----|--------|-----|
| **Verde Unimed Principal** | `#10605B` | Elementos principais, botões primários, cabeçalho |
| **Verde Escuro** | `#0D4D49` | Hover states, elementos de destaque |
| **Verde Claro** | `#E8F5F4` | Backgrounds sutis, cards |
| **Branco** | `#FFFFFF` | Backgrounds principais, textos em fundos escuros |
| **Cinza Claro** | `#F5F5F5` | Backgrounds secundários |
| **Cinza Médio** | `#9CA3AF` | Textos secundários, bordas |
| **Cinza Escuro** | `#374151` | Textos principais |

### Tipografia

- **Fonte Principal**: System UI (Inter, Roboto, Segoe UI)
- **Tamanhos**: Escala responsiva de 12px a 32px
- **Pesos**: Regular (400), Medium (500), Semibold (600), Bold (700)

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

#### Frontend
- **Framework**: React 18.3.1 + TypeScript 5.8.3
- **Build Tool**: Vite 7.3.1
- **Estilização**: Tailwind CSS 3.4.17
- **Componentes UI**: Shadcn UI (Radix UI)
- **Roteamento**: React Router DOM 6.30.1
- **Gerenciamento de Estado**: React Context API
- **Validação**: Zod 4.1.12
- **Formulários**: React Hook Form 7.61.1

#### Backend & Infraestrutura
- **BaaS**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Storage**: Supabase Storage (para anexos)
- **Hospedagem**: Vercel
- **Versionamento**: Git

#### Bibliotecas Auxiliares
- **Drag & Drop**: @dnd-kit
- **Gráficos**: Recharts 2.15.4
- **Datas**: date-fns 3.6.0
- **Ícones**: Lucide React 0.462.0
- **Notificações**: Sonner 1.7.4
- **Excel**: XLSX 0.18.5

### Arquitetura de Dados

#### Modelo de Dados Principal

```typescript
// Categorias e Scripts
Category {
  id: string
  name: string
  color: string
  order?: number
}

ScriptItem {
  id: string
  title: string
  content: string
  order?: number
}

// Exames
ExamItem {
  id: string
  title: string
  location: string[]
  additionalInfo: string
  schedulingRules: string
  valueTableCode?: string
}

ExamDetail {
  examId: string
  observations: string
  preparation: string
  withAnesthesia: boolean
  anesthesiaInstructions?: string
}

// Contatos
ContactPoint {
  id: string
  setor: string
  local: string
  ramal: string
  telefone: string
  whatsapp: string
  description?: string
}

ContactGroup {
  id: string
  name: string
  points: ContactPoint[]
}

// Profissionais
Professional {
  id: string
  name: string
  gender: 'masculino' | 'feminino'
  specialty: string
  ageRange: string
  fittings: {
    allowed: boolean
    max: number
    details: string
  }
  generalObs: string
  performedExams: ExamDetail[]
}

// Tabela de Valores
ValueTableItem {
  id: string
  codigo: string
  nome: string
  info: string
  honorario: number
  exame_cartao: number
  material_min: number
  material_max: number
  honorarios_diferenciados: DiferenciatedFee[]
}

DiferenciatedFee {
  id: string
  profissional: string
  valor: number
  genero: 'masculino' | 'feminino'
}

// Consultórios
Office {
  id: string
  name: string
  ramal: string
  schedule: string
  specialties: string[]
  attendants: OfficeAttendant[]
  professionals: OfficeProfessional[]
  procedures: string[]
  categories: OfficeCategory[]
  items: Record<string, OfficeItem[]>
}

// Anotações/Regras
InfoTag {
  id: string
  name: string
  color: string
  order?: number
  user_id?: string
}

InfoItem {
  id: string
  title: string
  content: string
  tagId: string
  date: string
  attachments: Attachment[]
  info?: string
  user_id?: string
}

// Recados
RecadoCategory {
  id: string
  title: string
  description: string
  destinationType: 'attendant' | 'group'
  groupName?: string
  attendants?: { id: string; name: string; chatNick: string }[]
}

RecadoItem {
  id: string
  title: string
  content: string
  fields: string[]
}
```

#### Estrutura do Banco de Dados (Supabase)

**Tabelas Principais:**
1. `profiles` - Perfis de usuários
2. `categories` - Categorias de scripts
3. `scripts` - Scripts de atendimento
4. `exams` - Exames disponíveis
5. `exam_details` - Detalhes de preparação de exames
6. `contact_groups` - Grupos de contatos
7. `contact_points` - Pontos de contato individuais
8. `professionals` - Profissionais de saúde
9. `value_table` - Tabela de valores e honorários
10. `differentiated_fees` - Honorários diferenciados
11. `offices` - Consultórios
12. `office_attendants` - Atendentes de consultórios
13. `office_professionals` - Profissionais de consultórios
14. `office_categories` - Categorias de informações de consultórios
15. `office_items` - Itens de informações de consultórios
16. `info_tags` - Tags de anotações
17. `info_items` - Anotações e regras
18. `recado_categories` - Categorias de recados
19. `recado_items` - Recados

**Segurança:**
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas de acesso baseadas em `user_id`
- Triggers automáticos para auditoria

---

## 🎯 Funcionalidades Principais

### 1. Dashboard

**Objetivo:** Fornecer uma visão geral rápida das atividades do dia e métricas importantes.

**Funcionalidades:**
- **Resumo de Alocações Confirmadas**
  - Exames agendados por período (manhã/tarde)
  - Médicos alocados por turno
  - Total de procedimentos do dia
  
- **Tarefas Pendentes**
  - Lista de tarefas por setor
  - Filtro por setor ativo do usuário
  - Contador de tarefas não concluídas

- **Recados Recentes**
  - Últimos recados publicados
  - Filtro por destinatário
  - Notificações de novos recados

- **Mensagens Personalizadas**
  - Saudações baseadas no horário
  - Mensagens contextuais por perfil de usuário

**Regras de Negócio:**
- Dashboard é personalizado por perfil (recepcionista vs. coordenador)
- Dados são filtrados pelo setor ativo do usuário
- Atualização em tempo real via Supabase Realtime

### 2. Scripts de Atendimento

**Objetivo:** Padronizar e agilizar o atendimento telefônico com scripts pré-definidos.

**Funcionalidades:**
- **Gestão de Categorias**
  - Criar, editar e excluir categorias
  - Definir cores para identificação visual
  - Ordenação customizada via drag & drop

- **Gestão de Scripts**
  - Criar scripts com título e conteúdo
  - Organizar por categoria
  - Ordenação customizada dentro de cada categoria
  - Copiar script com um clique

- **Busca e Filtros**
  - Busca por palavra-chave
  - Filtro por categoria
  - Busca global integrada

**Regras de Negócio:**
- Scripts são compartilhados entre todos os usuários
- Apenas coordenadores podem criar/editar categorias
- Atendentes podem criar scripts em categorias existentes
- Ao clicar em um script, o conteúdo é copiado automaticamente

### 3. Exames

**Objetivo:** Centralizar informações sobre exames, preparações e regras de agendamento.

**Funcionalidades:**
- **Cadastro de Exames**
  - Nome do exame
  - Locais de realização (seleção múltipla)
  - Informações adicionais
  - Regras de agendamento
  - Código na tabela de valores (vinculação)

- **Detalhes de Preparação**
  - Observações gerais
  - Instruções de preparo
  - Indicação de anestesia
  - Instruções específicas para anestesia

- **Regras de Agendamento**
  - Indicações de profissionais
  - Restrições por gênero
  - Preferências de médicos

- **Modal de Detalhes**
  - Visualização completa ao clicar no exame
  - Edição rápida de informações
  - Histórico de alterações

**Regras de Negócio:**
- Exames podem ter múltiplos locais de realização
- Vinculação automática com tabela de valores via código
- Regras de agendamento são aplicadas automaticamente
- Informações de preparo são obrigatórias para exames com anestesia

### 4. Contatos

**Objetivo:** Organizar e facilitar o acesso a contatos de setores e departamentos.

**Funcionalidades:**
- **Grupos de Contatos**
  - Organização por setor/departamento
  - Nome do grupo
  - Múltiplos pontos de contato por grupo

- **Pontos de Contato**
  - Nome do setor/ponto
  - Local físico
  - Ramal
  - Telefone
  - WhatsApp
  - Descrição/notas

- **Visualização**
  - Cards expansíveis por grupo
  - Ícones para cada tipo de contato
  - Click-to-call e click-to-WhatsApp

**Regras de Negócio:**
- Grupos podem ter múltiplos pontos de contato
- Campos de telefone e WhatsApp são formatados automaticamente
- Busca global inclui todos os campos de contato

### 5. Tabela de Valores

**Objetivo:** Gerenciar valores de exames, honorários médicos e materiais.

**Funcionalidades:**
- **Cadastro de Valores**
  - Código do exame
  - Nome do procedimento
  - Informações adicionais
  - Honorário médico padrão
  - Valor do exame/cartão
  - Material mínimo e máximo

- **Honorários Diferenciados**
  - Valores específicos por profissional
  - Diferenciação por gênero
  - Múltiplos honorários por exame

- **Importação de Excel**
  - Upload de planilha Excel
  - Mapeamento automático de colunas
  - Validação de dados
  - Atualização em lote
  - Feedback de erros e sucessos

- **Cálculos Automáticos**
  - Total por exame
  - Somatórios de honorários
  - Valores mínimos e máximos

**Regras de Negócio:**
- Códigos de exames devem ser únicos
- Honorários diferenciados sobrescrevem o padrão
- Importação de Excel valida formatos monetários
- Apenas coordenadores podem importar/editar valores

### 6. Profissionais

**Objetivo:** Gerenciar informações de profissionais de saúde e suas especialidades.

**Funcionalidades:**
- **Cadastro de Profissionais**
  - Nome completo
  - Gênero
  - Especialidade
  - Faixa etária atendida
  - Aceita encaixes (sim/não, máximo, detalhes)
  - Observações gerais

- **Exames Realizados**
  - Lista de exames que o profissional realiza
  - Observações específicas por exame
  - Instruções de preparo
  - Indicação de anestesia

- **Modal de Detalhes**
  - Visualização completa do perfil
  - Edição de informações
  - Histórico de atualizações

**Regras de Negócio:**
- Profissionais podem realizar múltiplos exames
- Informações de encaixe são opcionais
- Vinculação automática com regras de agendamento
- Filtro por especialidade e disponibilidade

### 7. Consultórios

**Objetivo:** Centralizar informações sobre consultórios, horários e procedimentos.

**Funcionalidades:**
- **Cadastro de Consultórios**
  - Nome do consultório
  - Ramal
  - Horário de funcionamento
  - Especialidades atendidas
  - Procedimentos realizados

- **Atendentes**
  - Nome
  - Usuário/login
  - Turno de trabalho

- **Profissionais Atuantes**
  - Nome do profissional
  - Especialidade
  - Descrição de atuação

- **Informações Categorizadas**
  - Categorias customizadas
  - Itens por categoria
  - Conteúdo detalhado
  - Informações adicionais

**Regras de Negócio:**
- Consultórios podem ter múltiplos atendentes e profissionais
- Categorias de informações são específicas por consultório
- Horários são em formato de texto livre
- Busca global inclui todos os dados do consultório

### 8. Anotações e Estomaterapia

**Objetivo:** Gerenciar regras, procedimentos e anotações importantes.

**Funcionalidades:**
- **Tags de Organização**
  - Criar tags customizadas
  - Definir cores
  - Ordenação customizada
  - Tags privadas (por usuário)

- **Itens de Informação**
  - Título
  - Conteúdo (suporte a markdown)
  - Tag de categorização
  - Data de criação/atualização
  - Informações adicionais
  - Anexos (arquivos)

- **Anexos**
  - Upload de múltiplos arquivos
  - Suporte a imagens, PDFs, documentos
  - Visualização inline
  - Download de arquivos

- **Privacidade**
  - Anotações públicas (todos veem)
  - Anotações privadas (apenas o criador)

**Regras de Negócio:**
- Tags privadas só aparecem para o criador
- Itens privados são filtrados por `user_id`
- Anexos são armazenados no Supabase Storage
- Suporte a formatação rica no conteúdo

### 9. Recados

**Objetivo:** Facilitar a comunicação entre equipes e setores.

**Funcionalidades:**
- **Categorias de Recados**
  - Título da categoria
  - Descrição
  - Tipo de destinatário (atendente ou grupo)
  - Nome do grupo ou lista de atendentes

- **Criação de Recados**
  - Título
  - Conteúdo
  - Campos customizados
  - Categoria/destinatário

- **Visualização**
  - Lista de recados por categoria
  - Filtro por destinatário
  - Ordenação por data

**Regras de Negócio:**
- Recados podem ser direcionados a atendentes específicos ou grupos
- Filtro automático por setor do usuário
- Notificações de novos recados
- Histórico completo de recados

### 10. Usuários (Admin)

**Objetivo:** Gerenciar usuários, permissões e setores.

**Funcionalidades:**
- **Gestão de Usuários**
  - Listar todos os usuários
  - Visualizar perfis
  - Editar informações
  - Ativar/desativar usuários

- **Perfis e Permissões**
  - Definir role (admin/user)
  - Atribuir setores
  - Configurar permissões específicas

- **Setores**
  - Criar setores
  - Atribuir usuários
  - Definir responsáveis

**Regras de Negócio:**
- Apenas administradores podem acessar
- Usuários podem ter múltiplos setores
- Setor ativo é selecionado pelo usuário
- Permissões são aplicadas em tempo real

### 11. Busca Global

**Objetivo:** Permitir busca instantânea em todos os dados do portal.

**Funcionalidades:**
- **Busca Unificada**
  - Campo de busca no header
  - Atalho de teclado (Cmd/Ctrl + K)
  - Busca em tempo real

- **Escopo de Busca**
  - Scripts
  - Exames
  - Contatos
  - Profissionais
  - Consultórios
  - Anotações
  - Recados
  - Tabela de valores

- **Resultados**
  - Agrupados por tipo
  - Destaque de termos encontrados
  - Navegação direta ao item
  - Preview de conteúdo

**Regras de Negócio:**
- Busca é case-insensitive
- Respeita permissões de privacidade
- Resultados limitados a 50 por categoria
- Ordenação por relevância

### 12. Migração de Dados

**Objetivo:** Permitir importação/exportação de dados em massa.

**Funcionalidades:**
- **Exportação**
  - Exportar todos os dados em JSON
  - Download automático
  - Backup completo

- **Importação**
  - Upload de arquivo JSON
  - Validação de estrutura
  - Opção de limpar dados existentes
  - Sincronização com Supabase

- **Sincronização**
  - Migração de localStorage para Supabase
  - Sincronização bidirecional
  - Resolução de conflitos

**Regras de Negócio:**
- Apenas administradores podem migrar dados
- Importação substitui dados existentes se solicitado
- Validação de integridade antes de importar
- Backup automático antes de operações destrutivas

---

## 🔐 Autenticação e Segurança

### Sistema de Autenticação

**Provedor:** Supabase Auth

**Fluxos Suportados:**
1. **Login**
   - Email e senha
   - Validação de credenciais
   - Geração de token JWT
   - Redirecionamento ao dashboard

2. **Cadastro**
   - Email e senha
   - Confirmação de email (opcional)
   - Criação de perfil automática
   - Atribuição de role padrão (user)

3. **Recuperação de Senha**
   - Solicitação via email
   - Link de redefinição
   - Atualização de senha
   - Confirmação de sucesso

4. **Atualização de Senha**
   - Usuário autenticado pode alterar senha
   - Validação de senha atual
   - Confirmação de nova senha

### Controle de Acesso

**Roles:**
- `admin` - Acesso total ao sistema
- `user` - Acesso padrão (atendente/recepcionista)

**Permissões por Role:**

| Funcionalidade | User | Admin |
|----------------|------|-------|
| Dashboard | ✅ | ✅ |
| Scripts (visualizar) | ✅ | ✅ |
| Scripts (criar/editar) | ✅ | ✅ |
| Categorias (criar/editar) | ❌ | ✅ |
| Exames (visualizar) | ✅ | ✅ |
| Exames (criar/editar) | ❌ | ✅ |
| Contatos (visualizar) | ✅ | ✅ |
| Contatos (criar/editar) | ❌ | ✅ |
| Tabela de Valores (visualizar) | ✅ | ✅ |
| Tabela de Valores (editar) | ❌ | ✅ |
| Importar Excel | ❌ | ✅ |
| Profissionais (visualizar) | ✅ | ✅ |
| Profissionais (criar/editar) | ❌ | ✅ |
| Consultórios (visualizar) | ✅ | ✅ |
| Consultórios (criar/editar) | ❌ | ✅ |
| Anotações (criar/editar próprias) | ✅ | ✅ |
| Anotações (editar todas) | ❌ | ✅ |
| Recados (visualizar) | ✅ | ✅ |
| Recados (criar) | ✅ | ✅ |
| Usuários | ❌ | ✅ |
| Migração de Dados | ❌ | ✅ |

### Row Level Security (RLS)

**Políticas Implementadas:**

1. **Dados Públicos** (scripts, exames, contatos, etc.)
   - SELECT: Todos os usuários autenticados
   - INSERT/UPDATE/DELETE: Apenas admins

2. **Dados Privados** (anotações privadas)
   - SELECT: Apenas o criador (`user_id = auth.uid()`)
   - INSERT: Usuário autenticado
   - UPDATE/DELETE: Apenas o criador

3. **Perfis de Usuário**
   - SELECT: Próprio perfil ou admin
   - UPDATE: Próprio perfil (campos limitados) ou admin

### Segurança de Dados

**Medidas Implementadas:**
- HTTPS obrigatório (Vercel)
- Tokens JWT com expiração
- Sanitização de inputs
- Validação com Zod
- Proteção contra SQL Injection (Supabase)
- Proteção contra XSS (React)
- CORS configurado
- Rate limiting (Supabase)

---

## 🎨 Interface do Usuário

### Princípios de Design

1. **Clareza e Simplicidade**
   - Interface limpa e organizada
   - Hierarquia visual clara
   - Ações óbvias e intuitivas

2. **Consistência**
   - Padrões visuais uniformes
   - Comportamentos previsíveis
   - Terminologia consistente

3. **Eficiência**
   - Acesso rápido a informações
   - Atalhos de teclado
   - Busca global sempre disponível

4. **Feedback Visual**
   - Confirmações de ações
   - Estados de loading
   - Mensagens de erro claras

5. **Responsividade**
   - Adaptação a diferentes tamanhos de tela
   - Mobile-friendly
   - Touch-friendly

### Componentes Principais

#### Header
- Logo Unimed
- Busca global (Cmd/Ctrl + K)
- Notificações
- Perfil do usuário
- Seletor de setor
- Logout

#### Sidebar
- Navegação principal
- Ícones + labels
- Indicador de página ativa
- Colapsável em mobile

#### Content Area
- Título da página
- Breadcrumbs (quando aplicável)
- Ações principais (botões)
- Conteúdo principal
- Footer

#### Modais
- Overlay escuro
- Centralizado
- Largura máxima consistente (max-w-4xl)
- Botões de ação no footer
- Fechar com ESC ou clique fora

#### Cards
- Sombra sutil
- Bordas arredondadas
- Hover states
- Ações contextuais

#### Formulários
- Labels claros
- Validação em tempo real
- Mensagens de erro inline
- Botões de ação destacados

### Responsividade

**Breakpoints:**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Adaptações:**
- Sidebar colapsável em mobile
- Tabelas com scroll horizontal
- Cards em grid responsivo
- Modais em fullscreen em mobile

---

## 📊 Métricas e Analytics

### Métricas de Uso

**Dashboard:**
- Número de acessos diários
- Usuários ativos
- Tempo médio de sessão
- Páginas mais acessadas

**Funcionalidades:**
- Scripts mais copiados
- Exames mais consultados
- Buscas mais frequentes
- Profissionais mais visualizados

### Métricas de Performance

**Core Web Vitals:**
- LCP (Largest Contentful Paint) < 2.5s
- FID (First Input Delay) < 100ms
- CLS (Cumulative Layout Shift) < 0.1

**Outras Métricas:**
- Tempo de carregamento inicial
- Tempo de resposta da busca
- Tempo de sincronização com Supabase

---

## 🚀 Roadmap e Evolução

### Versão Atual (1.0.0)

✅ **Funcionalidades Implementadas:**
- Autenticação completa
- Dashboard com métricas
- Gestão de Scripts
- Gestão de Exames
- Gestão de Contatos
- Tabela de Valores com importação Excel
- Gestão de Profissionais
- Gestão de Consultórios
- Anotações e Estomaterapia
- Sistema de Recados
- Busca Global
- Migração de Dados
- Integração completa com Supabase

### Próximas Versões

#### Versão 1.1.0 (Q1 2026)
- [ ] Notificações em tempo real (Supabase Realtime)
- [ ] Sistema de tarefas com atribuição
- [ ] Calendário de agendamentos
- [ ] Relatórios e dashboards avançados
- [ ] Exportação de relatórios em PDF

#### Versão 1.2.0 (Q2 2026)
- [ ] Integração com sistema de agendamento externo
- [ ] API REST para integrações
- [ ] Aplicativo mobile (React Native)
- [ ] Sistema de chat interno
- [ ] Auditoria completa de ações

#### Versão 2.0.0 (Q3 2026)
- [ ] IA para sugestão de scripts
- [ ] Análise preditiva de demanda
- [ ] Automação de agendamentos
- [ ] Integração com WhatsApp Business
- [ ] Dashboard executivo com BI

---

## 🧪 Testes e Qualidade

### Estratégia de Testes

**Testes Manuais:**
- Testes de usabilidade
- Testes de aceitação
- Testes exploratórios

**Testes Automatizados (Planejado):**
- Testes unitários (Jest + React Testing Library)
- Testes de integração
- Testes E2E (Playwright)

### Critérios de Qualidade

**Funcionalidade:**
- ✅ Todas as funcionalidades principais implementadas
- ✅ Fluxos críticos testados
- ✅ Tratamento de erros robusto

**Performance:**
- ✅ Carregamento inicial < 3s
- ✅ Busca global < 500ms
- ✅ Sincronização Supabase < 1s

**Segurança:**
- ✅ Autenticação funcionando
- ✅ RLS configurado
- ✅ Validação de inputs

**UX:**
- ✅ Interface intuitiva
- ✅ Feedback visual adequado
- ✅ Responsividade completa

---

## 📚 Documentação

### Documentação Técnica

**Disponível:**
- README.md - Guia de início rápido
- AI_RULES.md - Regras para desenvolvimento com IA
- INSTRUCOES-USO-OFFLINE.md - Uso offline do portal
- Comentários inline no código
- TypeScript types documentados

**Planejado:**
- Wiki completo
- Guia de contribuição
- Documentação de API
- Diagramas de arquitetura

### Documentação de Usuário

**Disponível:**
- LEIA-ME.txt - Instruções básicas
- Tooltips na interface
- Mensagens de ajuda contextuais

**Planejado:**
- Manual do usuário completo
- Vídeos tutoriais
- FAQ
- Base de conhecimento

---

## 🔄 Processo de Deploy

### Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com credenciais Supabase

# Executar em desenvolvimento
npm run dev
```

### Ambiente de Produção

**Plataforma:** Vercel

**Processo:**
1. Push para branch `main` no GitHub
2. Vercel detecta mudanças automaticamente
3. Build é executado (`npm run build`)
4. Deploy automático
5. URL de produção atualizada

**Variáveis de Ambiente (Vercel):**
- `VITE_SUPABASE_PROJECT_ID`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_URL`

### Rollback

Em caso de problemas:
1. Acessar Vercel Dashboard
2. Selecionar deployment anterior
3. Promover para produção
4. Ou reverter commit no Git

---

## 🤝 Stakeholders

### Equipe de Desenvolvimento

**Desenvolvedor Principal:**
- Desenvolvimento frontend
- Integração com Supabase
- Manutenção e evolução

**Suporte Técnico:**
- Infraestrutura (Vercel + Supabase)
- Monitoramento
- Resolução de incidentes

### Equipe de Negócio

**Coordenação CDU:**
- Definição de requisitos
- Validação de funcionalidades
- Treinamento de usuários

**Usuários Finais:**
- Atendentes de agendamento
- Recepcionistas
- Supervisores

---

## 📞 Suporte e Manutenção

### Canais de Suporte

**Interno:**
- Email: suporte-portal@unimed.com.br
- Chat interno (planejado)
- Sistema de tickets (planejado)

### SLA (Service Level Agreement)

**Disponibilidade:**
- Uptime: 99.5%
- Horário de suporte: 8h às 18h (dias úteis)

**Tempo de Resposta:**
- Crítico: 1 hora
- Alto: 4 horas
- Médio: 1 dia útil
- Baixo: 3 dias úteis

### Manutenção

**Preventiva:**
- Backup diário automático (Supabase)
- Atualização de dependências mensal
- Revisão de segurança trimestral

**Corretiva:**
- Hotfixes conforme necessário
- Patches de segurança imediatos

---

## 📄 Licença e Propriedade

**Proprietário:** Unimed Bauru - Centro de Diagnóstico

**Licença:** Uso interno exclusivo

**Copyright:** © 2026 Unimed Bauru

---

## 📝 Histórico de Versões do Documento

| Versão | Data | Autor | Alterações |
|--------|------|-------|------------|
| 1.0.0 | 25/01/2026 | Equipe de Desenvolvimento | Criação inicial do PRD |

---

## 🎯 Conclusão

O **Portal de Agendamento CDU** representa uma solução completa e moderna para a gestão de agendamentos e informações operacionais do Centro de Diagnóstico Unimed. Com uma arquitetura robusta, interface intuitiva e funcionalidades abrangentes, o portal está preparado para atender às necessidades atuais e futuras da equipe de agendamento.

**Principais Diferenciais:**
- ✅ Centralização de informações
- ✅ Busca global instantânea
- ✅ Interface moderna e responsiva
- ✅ Segurança e controle de acesso
- ✅ Integração completa com Supabase
- ✅ Escalabilidade e performance
- ✅ Facilidade de uso e manutenção

**Próximos Passos:**
1. Treinamento completo da equipe
2. Migração de dados legados
3. Monitoramento de uso e feedback
4. Implementação de melhorias contínuas
5. Expansão de funcionalidades conforme roadmap

---

**Desenvolvido com 💚 para a Equipe de Agendamento CDU**
