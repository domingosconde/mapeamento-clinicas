# Mapeamento de Clínicas - MVP v2.0

Um sistema web elegante e polido para mapeamento e descoberta de clínicas médicas. Pacientes podem explorar clínicas através de um mapa interativo, filtrar por especialidade e deixar avaliações. Clínicas podem gerenciar suas informações e responder aos comentários.

## Funcionalidades Principais

### Para Pacientes
- **Mapa Interativo** - Visualize clínicas em um mapa com marcadores clicáveis
- **Busca e Filtros** - Busque por nome ou filtre por especialidade médica
- **Perfis Detalhados** - Veja informações completas, horários, contato e especialidades
- **Avaliações** - Deixe avaliações de 1-5 estrelas e comentários
- **Autenticação** - Login seguro via Manus OAuth

### Para Clínicas (Admin)
- **Dashboard Administrativo** - Gerencie sua clínica em um painel centralizado
- **Atualizar Informações** - Edite dados, endereço, horários e contato
- **Gerenciar Especialidades** - Adicione ou remova especialidades oferecidas
- **Responder Comentários** - Interaja com pacientes respondendo seus reviews
- **Visualizar Avaliações** - Acompanhe o rating médio e feedback

## Quick Start

### Requisitos
- Node.js 22+
- pnpm 10+
- MySQL 8+

### Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd mapeamento-clinicas

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# Executar migrações
pnpm db:push

# (Opcional) Seed com dados de demonstração
pnpm db:seed

# Iniciar servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`

##  Estrutura do Projeto

```
mapeamento-clinicas/
├── client/                  # Frontend React
│   └── src/
│       ├── pages/          # Páginas (Home, ClinicDetail, AdminDashboard)
│       ├── components/     # Componentes reutilizáveis
│       └── lib/            # Utilitários e configurações
├── server/                  # Backend Express + tRPC
│   ├── routers.ts          # Procedures tRPC
│   ├── db.ts               # Query helpers
│   └── seed.ts             # Script de seed de dados
├── drizzle/                # Banco de dados
│   └── schema.ts           # Definição de tabelas
├── shared/                 # Código compartilhado
└── package.json
```

##  Banco de Dados

O projeto usa MySQL com as seguintes tabelas:

- **users** - Usuários (pacientes e admins)
- **clinics** - Informações das clínicas
- **specialties** - Especialidades médicas
- **clinicSpecialties** - Relação clínicas-especialidades
- **ratings** - Avaliações de pacientes
- **comments** - Comentários e reviews
- **clinicResponses** - Respostas de clínicas aos comentários

##  Testes

```bash
# Executar todos os testes
pnpm test

# Testes incluem:
# - Autenticação (logout)
# - Operações de clínicas (list, search, getById, etc)
# - Ratings e comentários
# - Operações administrativas
```

**Status:** 22 testes passando 

## Design

- **Framework UI:** Tailwind CSS 4 + shadcn/ui
- **Tema:** Claro com cores sofisticadas (azul e cinza)
- **Responsivo:** Mobile-first, otimizado para todos os dispositivos
- **Componentes:** Reutilizáveis e acessíveis

## API (tRPC)

### Procedures Públicas

```typescript
// Clinics
clinics.list()                          // Listar todas
clinics.getById({ id })                 // Obter por ID
clinics.search({ query })               // Buscar por nome
clinics.bySpecialty({ specialtyId })    // Filtrar por especialidade
clinics.getSpecialties({ clinicId })    // Obter especialidades

// Specialties
specialties.list()                       // Listar todas

// Ratings
ratings.getByClinic({ clinicId })       // Obter avaliações

// Comments
comments.getByClinic({ clinicId })      // Obter comentários
comments.getResponsesForClinic({ clinicId })  // Obter respostas
```

### Procedures Protegidas (Autenticado)

```typescript
// Ratings
ratings.create({ clinicId, score })     // Criar avaliação
ratings.getUserRating({ clinicId })     // Obter avaliação do usuário

// Comments
comments.create({ clinicId, text })     // Criar comentário

// Auth
auth.me()                                // Obter usuário atual
auth.logout()                            // Fazer logout
```

### Procedures Admin

```typescript
// Clinics
clinics.getMyClinic()                    // Obter clínica do admin
clinics.update({ id, ...data })          // Atualizar informações
clinics.addSpecialty({ clinicId, specialtyId })      // Adicionar especialidade
clinics.removeSpecialty({ clinicId, specialtyId })   // Remover especialidade

// Comments
comments.reply({ commentId, text })     // Responder comentário
```

## Autenticação

O projeto usa **Manus OAuth** para autenticação segura. Usuários podem:
- Fazer login como paciente
- Deixar avaliações e comentários
- Admins de clínicas gerenciam suas informações

## Dados de Demonstração

Para popular o banco com dados de teste:

```bash
pnpm db:seed
```

Isso criará:
- 3 clínicas de exemplo
- 8 especialidades
- Avaliações e comentários de exemplo

## Desenvolvimento

```bash
# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format

# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

## Variáveis de Ambiente

```env
DATABASE_URL=mysql://user:password@localhost:3306/clinicas
JWT_SECRET=seu-secret-aqui
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im/login
```

## Deploy

O projeto está pronto para deploy em plataformas como:
- Vercel
- Railway
- Render
- Manus (recomendado)

## Documentação Adicional

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura detalhada
- [todo.md](./todo.md) - Rastreamento de funcionalidades

##  Contribuindo

Melhorias e sugestões são bem-vindas! Abra uma issue ou pull request.

## 📄 Licença

MIT

## Próximos Passos

- Upload de fotos de clínicas
- Ordenação por distância com geolocalização
- Sistema de moderação automática
- Notificações em tempo real
- Agendamento de consultas integrado
- API pública para terceiros

---

**Desenvolvido com ❤️ usando React, Express, tRPC e Tailwind CSS**
