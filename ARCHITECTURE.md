# Arquitetura - Mapeamento de Clínicas

## Visão Geral

O sistema de mapeamento de clínicas é uma plataforma web elegante e polida que permite pacientes descobrir, explorar e avaliar clínicas médicas através de uma experiência centrada em mapa interativo.

## Stack Tecnológico

| Camada | Tecnologia | Descrição |
|--------|-----------|-----------|
| Frontend | React 19 + Tailwind CSS 4 | Interface responsiva e elegante |
| Backend | Express 4 + tRPC 11 | API type-safe com procedures |
| Banco de Dados | MySQL | Armazenamento relacional |
| Mapas | Google Maps API | Mapa interativo com marcadores |
| Autenticação | Manus OAuth | Sistema de login integrado |
| Hospedagem | Manus | Plataforma de hospedagem integrada |

## Modelo de Dados

### Tabelas Principais

**users** - Usuários do sistema (pacientes e administradores de clínicas)
- id (PK)
- openId (Manus OAuth identifier)
- name, email, loginMethod
- role (user | admin)
- timestamps

**clinics** - Informações das clínicas
- id (PK)
- name, description, address, city, state, zipCode
- latitude, longitude (para geolocalização)
- phone, email, website
- openingHours (JSON)
- photoUrl
- adminUserId (FK → users)
- averageRating, totalRatings
- isVerified
- timestamps

**specialties** - Especialidades médicas
- id (PK)
- name (unique)
- description
- timestamps

**clinicSpecialties** - Relação muitos-para-muitos entre clínicas e especialidades
- id (PK)
- clinicId (FK → clinics)
- specialtyId (FK → specialties)

**ratings** - Avaliações de pacientes
- id (PK)
- clinicId (FK → clinics)
- userId (FK → users)
- score (1-5)
- timestamps

**comments** - Comentários/reviews de pacientes
- id (PK)
- clinicId (FK → clinics)
- userId (FK → users)
- text
- isApproved
- timestamps

**clinicResponses** - Respostas de clínicas aos comentários
- id (PK)
- commentId (FK → comments)
- clinicId (FK → clinics)
- text
- timestamps

## Fluxos Principais

### 1. Descoberta de Clínicas (Pacientes)

1. Usuário acessa homepage
2. Visualiza mapa interativo com todas as clínicas
3. Busca por nome ou filtra por especialidade
4. Clica em marcador ou clínica na lista
5. Visualiza perfil detalhado com avaliações

### 2. Autenticação

**Pacientes:**
- Clicam em "Entrar"
- Redirecionados para Manus OAuth
- Retornam com sessão autenticada
- Podem deixar avaliações e comentários

**Clínicas (Admin):**
- Fazem login como admin
- Acessam dashboard administrativo
- Gerenciam informações da clínica
- Respondem a comentários

### 3. Gestão de Clínicas (Admin)

1. Admin acessa área administrativa
2. Atualiza informações da clínica
3. Adiciona/remove especialidades
4. Faz upload de fotos
5. Responde a avaliações e comentários

## Estrutura de Pastas

```
mapeamento-clinicas/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas principais
│   │   │   ├── Home.tsx      # Homepage com mapa
│   │   │   ├── ClinicDetail.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   └── ...
│   │   ├── components/       # Componentes reutilizáveis
│   │   │   ├── Map.tsx       # Google Maps wrapper
│   │   │   ├── DashboardLayout.tsx
│   │   │   └── ...
│   │   ├── lib/
│   │   │   └── trpc.ts       # Cliente tRPC
│   │   ├── App.tsx           # Roteamento
│   │   └── index.css         # Estilos globais
│   └── public/               # Arquivos estáticos
├── server/                    # Backend Express
│   ├── routers.ts            # Procedures tRPC
│   ├── db.ts                 # Query helpers
│   ├── storage.ts            # S3 helpers
│   └── _core/                # Framework plumbing
├── drizzle/                   # ORM e migrações
│   ├── schema.ts             # Definição de tabelas
│   └── migrations/           # Arquivos SQL
├── shared/                    # Código compartilhado
└── package.json
```

## Procedures tRPC

### Clinics Router
- `clinics.list` - Lista todas as clínicas
- `clinics.getById` - Obtém detalhes de uma clínica
- `clinics.search` - Busca por nome
- `clinics.bySpecialty` - Filtra por especialidade

### Specialties Router
- `specialties.list` - Lista todas as especialidades

### Ratings Router
- `ratings.getByClinic` - Obtém avaliações de uma clínica
- `ratings.getUserRating` - Obtém avaliação do usuário autenticado

### Comments Router
- `comments.getByClinic` - Obtém comentários de uma clínica

## Autenticação e Autorização

- **Public Procedures:** Qualquer um pode acessar (listar clínicas, ver detalhes)
- **Protected Procedures:** Apenas usuários autenticados (deixar avaliações, comentários)
- **Admin Procedures:** Apenas admins de clínicas (atualizar informações, responder comentários)

## Design e UX

### Princípios de Design
- **Elegância:** Design limpo, sofisticado e polido
- **Responsividade:** Funciona perfeitamente em desktop, tablet e mobile
- **Acessibilidade:** Cores contrastantes, navegação clara, foco visível
- **Performance:** Carregamento rápido, otimização de imagens

### Paleta de Cores
- Primária: Azul (#2563EB)
- Secundária: Cinza (#64748B)
- Fundo: Branco/Cinza claro (#F8FAFC)
- Acentos: Amarelo para ratings (#FBBF24)

### Tipografia
- Headings: Font-family system
- Body: Font-family system
- Tamanhos: Escala harmônica (12px, 14px, 16px, 18px, 20px, 24px, 32px, 40px)

## Segurança

- Senhas gerenciadas pelo Manus OAuth
- Validação de entrada em todos os procedures
- Sanitização de conteúdo de comentários
- Rate limiting em endpoints críticos
- HTTPS obrigatório

## Performance

- Lazy loading de imagens
- Caching de dados de clínicas
- Índices no banco de dados para buscas rápidas
- Compressão de assets
- CDN para distribuição de conteúdo

## Próximos Passos

1. Implementar procedures para criar/atualizar clínicas
2. Criar página de perfil detalhado de clínica
3. Implementar dashboard administrativo
4. Adicionar sistema de upload de fotos
5. Implementar filtros avançados e busca por localização
6. Adicionar notificações em tempo real
7. Implementar testes automatizados
