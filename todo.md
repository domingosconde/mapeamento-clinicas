# Mapeamento de Clínicas - TODO

## Fase 1: Análise e Planejamento
- [x] Analisar documento de requisitos
- [x] Inicializar projeto web com scaffold web-db-user
- [x] Definir esquema de banco de dados
- [x] Criar arquivo de planejamento de arquitetura

## Fase 2: Banco de Dados
- [x] Criar tabelas: clinics, specialties, clinic_specialties, ratings, comments
- [x] Configurar relacionamentos e índices
- [x] Executar migrações SQL

## Fase 3: Autenticação
- [x] Implementar sistema de autenticação de pacientes (via Manus OAuth)
- [x] Implementar sistema de autenticação de clínicas (admin)
- [x] Criar procedures tRPC para login/logout/registro
- [x] Adicionar testes para autenticação

## Fase 4: Homepage e Mapa
- [x] Criar layout da homepage com design elegante
- [x] Integrar Google Maps API com componente Map.tsx
- [x] Implementar busca por nome de clínica
- [x] Implementar filtro por especialidade
- [ ] Implementar ordenação por distância (requer geolocalização do usuário)
- [ ] Criar popup de marcador com informações básicas (requer integração com dados)
- [x] Adicionar testes para funcionalidades de busca

## Fase 5: Perfis de Clínicas
- [x] Criar página de perfil detalhado da clínica
- [x] Exibir endereço completo, especialidades, horários
- [x] Exibir contato (telefone e email)
- [x] Implementar sistema de avaliações (ratings)
- [x] Implementar sistema de comentários
- [x] Permitir que usuários autenticados deixem avaliações
- [ ] Adicionar testes para perfil de clínica (componente ClinicDetail)

## Fase 6: Área Administrativa de Clínicas
- [x] Criar dashboard para clínicas
- [ ] Permitir atualização de informações da clínica (requer mutation backend)
- [ ] Implementar upload de fotos (requer storagePut e backend)
- [ ] Implementar resposta a avaliações (requer UI e mutation)
- [ ] Criar sistema de validação de conteúdo (requer moderação)
- [ ] Adicionar testes para área administrativa (componente AdminDashboard)

## Fase 7: Testes, Polimento e Entrega
- [x] Implementar busca de especialidades por clínica
- [x] Exibir especialidades no perfil da clínica
- [x] Adicionar link para dashboard administrativo
- [x] Executar testes unitários (22 testes passando)
- [ ] Executar testes de integração end-to-end
- [ ] Otimizar performance (lazy loading, caching)
- [ ] Validar design responsivo em múltiplos dispositivos
- [x] Criar checkpoint final
- [ ] Entregar projeto ao usuário com instruções

## Status do MVP

**Funcionalidades Concluídas e Testadas:**
- Sistema de autenticação via Manus OAuth
- Listagem e busca de clínicas
- Filtro por especialidade
- Página de perfil detalhado com especialidades
- Sistema de avaliações e comentários
- Dashboard administrativo básico
- 22 testes unitários passando

**Funcionalidades em Desenvolvimento:**
- Ordenação por distância (requer geolocalização)
- Marcadores interativos no mapa
- Atualização de informações da clínica
- Upload de fotos
- Respostas a comentários
- Moderação de conteúdo

## Recursos Implementados

### Backend (tRPC Procedures)
- clinics.list - Listar todas as clínicas
- clinics.getById - Obter detalhes de uma clínica
- clinics.search - Buscar clínicas por nome
- clinics.bySpecialty - Filtrar clínicas por especialidade
- clinics.getSpecialties - Obter especialidades de uma clínica
- specialties.list - Listar todas as especialidades
- ratings.getByClinic - Obter avaliações de uma clínica
- ratings.create - Criar nova avaliação (protegido)
- comments.getByClinic - Obter comentários de uma clínica
- comments.create - Criar novo comentário (protegido)
- auth.me - Obter usuário autenticado
- auth.logout - Fazer logout

### Frontend (Páginas)
- Home - Homepage com mapa interativo, busca e filtros
- ClinicDetail - Perfil detalhado da clínica com avaliações e comentários
- AdminDashboard - Painel administrativo para clínicas

### Banco de Dados
- users - Usuários (pacientes e admins)
- clinics - Informações das clínicas
- specialties - Especialidades médicas
- clinicSpecialties - Relação clínicas-especialidades
- ratings - Avaliações de pacientes
- comments - Comentários e reviews
- clinicResponses - Respostas de clínicas aos comentários

### Testes (22 testes passando)
- Testes de autenticação (logout)
- Testes de clinics (list, search, getById, getSpecialties, bySpecialty)
- Testes de ratings (create, validation)
- Testes de comments (create, validation)
- Testes de operações administrativas

## Design e UX
- Design elegante com Tailwind CSS 4
- Tema claro com cores sofisticadas
- Layout responsivo para mobile, tablet e desktop
- Componentes reutilizáveis com shadcn/ui
- Navegação intuitiva entre páginas
- Feedback visual com loading states e mensagens
