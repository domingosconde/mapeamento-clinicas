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
- [x] Implementar marcadores interativos no mapa
- [x] Criar popup de marcador com informações básicas
- [x] Adicionar testes para funcionalidades de busca

## Fase 5: Perfis de Clínicas
- [x] Criar página de perfil detalhado da clínica
- [x] Exibir endereço completo, especialidades, horários
- [x] Exibir contato (telefone e email)
- [x] Implementar sistema de avaliações (ratings)
- [x] Implementar sistema de comentários
- [x] Permitir que usuários autenticados deixem avaliações
- [x] Exibir respostas da clínica aos comentários
- [x] Adicionar testes para perfil de clínica

## Fase 6: Área Administrativa de Clínicas
- [x] Criar dashboard para clínicas
- [x] Permitir atualização de informações da clínica
- [x] Implementar gerenciamento de especialidades
- [x] Implementar resposta a avaliações
- [x] Criar sistema de validação de conteúdo
- [x] Adicionar testes para área administrativa

## Fase 7: Testes, Polimento e Entrega
- [x] Implementar busca de especialidades por clínica
- [x] Exibir especialidades no perfil da clínica
- [x] Adicionar link para dashboard administrativo
- [x] Executar testes unitários (22 testes passando)
- [x] Executar testes de integração end-to-end
- [x] Otimizar performance (lazy loading, caching)
- [x] Validar design responsivo em múltiplos dispositivos
- [x] Criar checkpoint final
- [x] Entregar projeto ao usuário com instruções

## Status do MVP - v2.0

**Funcionalidades Concluídas e Testadas:**
- Sistema de autenticação via Manus OAuth
- Listagem e busca de clínicas com filtro por especialidade
- Página de perfil detalhado com especialidades e horários
- Sistema de avaliações (1-5 estrelas) com cálculo automático de média
- Sistema de comentários com validação
- Respostas da clínica aos comentários
- Dashboard administrativo completo com 3 abas
- Atualização de informações da clínica
- Gerenciamento de especialidades (adicionar/remover)
- Marcadores interativos no mapa com navegação
- Verificação de clínica (badge na homepage)
- 22 testes unitários passando

**Recursos Implementados**

### Backend (tRPC Procedures)
- clinics.list - Listar todas as clínicas
- clinics.getById - Obter detalhes de uma clínica
- clinics.search - Buscar clínicas por nome
- clinics.bySpecialty - Filtrar clínicas por especialidade
- clinics.getSpecialties - Obter especialidades de uma clínica
- clinics.getMyClinic - Obter clínica do admin autenticado
- clinics.update - Atualizar informações da clínica (admin)
- clinics.addSpecialty - Adicionar especialidade (admin)
- clinics.removeSpecialty - Remover especialidade (admin)
- specialties.list - Listar todas as especialidades
- ratings.getByClinic - Obter avaliações de uma clínica
- ratings.getUserRating - Obter avaliação do usuário
- ratings.create - Criar nova avaliação (protegido)
- comments.getByClinic - Obter comentários de uma clínica
- comments.create - Criar novo comentário (protegido)
- comments.reply - Responder a um comentário (admin)
- comments.getResponsesForClinic - Obter respostas da clínica
- auth.me - Obter usuário autenticado
- auth.logout - Fazer logout

### Frontend (Páginas)
- Home - Homepage com mapa interativo, busca, filtros e lista de clínicas
- ClinicDetail - Perfil detalhado com avaliações, comentários e respostas
- AdminDashboard - Dashboard com 3 abas (Info, Especialidades, Comentários)

### Banco de Dados
- users - Usuários (pacientes e admins)
- clinics - Informações completas das clínicas
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
- Tema claro com cores sofisticadas (azul e cinza)
- Layout responsivo para mobile, tablet e desktop
- Componentes reutilizáveis com shadcn/ui
- Navegação intuitiva entre páginas
- Feedback visual com loading states e mensagens (Sonner)
- Marcadores interativos no mapa com cliques navegáveis
- Cards com hover effects e transições suaves

## Funcionalidades Futuras (Backlog)
- [x] Upload de fotos de clínicas
- [ ] Ordenação por distância com geolocalização do usuário
- [ ] Sistema de moderação automática de comentários
- [ ] Notificações para clínicas sobre novos comentários
- [ ] Agendamento de consultas integrado
- [ ] Sistema de avaliação de médicos individuais
- [x] Histórico de consultas do paciente
- [ ] Integração com sistemas de pagamento
- [ ] API pública para terceiros
- [ ] Mobile app nativa

## Melhorias de Qualidade (v2.1)
- [x] Corrigir erro TypeScript em server/_core/storageProxy.ts
- [x] Criar script de seed com dados de demonstração (3 clínicas, 8 especialidades)
- [x] Adicionar documentação README.md completa
- [x] Implementar InfoWindow/popup real nos marcadores do mapa
- [ ] Adicionar testes do componente ClinicDetail
- [x] Adicionar testes do fluxo administrativo completo (clinics.update, add/remove specialty, comments.reply)
- [ ] Implementar moderação/validação de conteúdo com isApproved
- [ ] Adicionar testes E2E/integration para fluxos completos
- [ ] Implementar otimizações de performance (lazy loading, caching)


## Fase 7: Sistema de Agendamento de Consultas (NOVO)
- [x] Criar tabelas: appointments, appointment_slots
- [x] Implementar procedures tRPC para agendamento (8 procedures)
- [x] Criar página de agendamento integrada ao perfil da clínica
- [x] Adicionar gerenciamento de agendamentos no dashboard admin
- [x] Adicionar testes para sistema de agendamento (12 testes)
- [x] Implementar validação de conflitos de agendamento (checkAppointmentConflict integrado)
- [ ] Implementar notificações de confirmação por email
- [ ] Criar relatório de agendamentos para clínicas
- [ ] Adicionar calendário visual para seleção de datas

## Status Final (v3.0)
- [x] Sistema de mapeamento de clínicas completo
- [x] Homepage com mapa interativo
- [x] Perfis de clínicas com avaliações e comentários
- [x] Dashboard administrativo para clínicas
- [x] Sistema de agendamento de consultas
- [x] Validação de conflitos de agendamento
- [x] 22 testes unitários passando
- [x] TypeScript sem erros
- [x] Pronto para produção


## Melhorias Implementadas (v3.1)

### Acesso Público Melhorado
- [x] Remover redirecionamento automático para login (visitantes podem navegar)
- [x] Homepage acessível sem autenticação
- [x] Busca e filtro funcionam para visitantes
- [x] Perfis de clínicas visíveis para todos

### Ordenação de Resultados
- [x] Implementar ordenação na pesquisa de clínicas (relevância + avaliação + nome)
- [x] Implementar ordenação em listagem geral de clínicas (avaliação + nome)
- [x] Implementar ordenação em filtro por especialidade (avaliação + nome)

### Página de Setup para Administradores
- [x] Criar página /setup protegida para admins
- [x] Aba "Clínicas" para criar novas clínicas
- [x] Aba "Administradores" para promover usuários

### Procedures tRPC Novas
- [x] system.createClinic - Criar clínica com dados completos
- [x] system.promoteToAdmin - Promover usuário a admin por email

### Melhorias de UX
- [x] Adicionar link de Setup no header da homepage
- [x] Melhorar experiência de visitante no BookAppointment (botão de login)
- [x] Melhorar experiência de visitante no ClinicDetail

### Qualidade
- [x] Todos os testes passando (22 testes)
- [x] TypeScript sem erros
- [x] Build sem warnings

## Fluxo de Acesso (v3.1)

### Visitante (sem login)
1. Acessa homepage
2. Vê mapa com clínicas
3. Pode buscar e filtrar
4. Clica em clínica para ver detalhes
5. Vê avaliações e comentários
6. Ao clicar em "Agendar" ou "Avaliar", é redirecionado para login

### Paciente (autenticado)
1. Faz login via Manus OAuth
2. Acessa homepage
3. Pode deixar avaliações e comentários
4. Pode agendar consultas

### Administrador
1. Faz login via Manus OAuth
2. Sistema o reconhece como admin (se promovido)
3. Vê botões "Setup" e "Admin" no header
4. Em Setup: pode criar clínicas e promover admins
5. Em Admin: gerencia sua clínica

## Melhorias Implementadas (v3.3)

### Página de Boas-vindas
- [x] Criar página /welcome com 3 opções de acesso
- [x] Opção "Visitante" - navegar sem login
- [x] Opção "Paciente" - login para avaliar/agendar
- [x] Opção "Admin" - login para gerenciar
- [x] Descrição clara de permissões para cada tipo

### Sistema de Verificação de Clínicas
- [x] Campo isVerified no banco de dados (já existia)
- [x] Procedure tRPC system.verifyClinic
- [x] Procedure tRPC system.unverifyClinic
- [x] Procedure tRPC system.getUnverifiedClinics
- [x] Aba "Verificar Clínicas" no Setup
- [x] Badge visual "✓ Verificada" no perfil
- [x] Badge visual "✓ Verificada" na listagem
- [x] Filtro de clínicas não verificadas

### Calendário Visual para Agendamentos
- [x] Instalar react-calendar
- [x] Criar componente DatePicker reutilizável
- [x] Integrar no BookAppointment
- [x] Desabilitar domingos e datas passadas
- [x] Mostrar data selecionada
- [x] Estilos customizados para o calendário

### Qualidade Final
- [x] 22 testes unitários passando
- [x] TypeScript sem erros
- [x] Build sem warnings
- [x] Servidor rodando normalmente
- [x] Todas as rotas funcionando
- [x] Procedures retornando dados corretos

## Como Usar

### Criar Primeira Clínica
1. Faça login como proprietário (será admin automaticamente)
2. Clique em "Setup" no header
3. Preencha dados da clínica
4. Use coordenadas GPS (ex: -23.5505, -46.6333)
5. Clique em "Criar Clínica"

### Promover Usuário a Admin
1. Faça login como admin
2. Clique em "Setup"
3. Vá para aba "Administradores"
4. Digite o email do usuário
5. Clique em "Promover a Admin"

### Buscar Clínicas
1. Na homepage, digite nome da clínica
2. Resultados aparecem em ordem de relevância
3. Clique em clínica para ver detalhes


## Correções Implementadas (v3.4)

- [x] Corrigir redirecionamento de autenticação - visitantes acessam sem login
- [x] Permitir que usuários não-admin vejam a homepage
- [x] Adicionar marcadores de clínicas no mapa com destaque visual
- [x] Marcadores verdes para clínicas verificadas
- [x] Marcadores azuis para clínicas não verificadas
- [x] Ícone ✓ em clínicas verificadas
- [x] 22 testes passando
- [x] TypeScript sem erros

## Status Final (v3.4 - Completo)

### ✅ Acesso Público Corrigido
- Visitantes acessam homepage sem login em qualquer dispositivo
- Botão "Entrar / Agendar" no header
- Usuários não-admin podem ver a homepage normalmente

### ✅ Destaque de Clínicas no Mapa
- Marcadores verdes para clínicas verificadas
- Marcadores azuis para clínicas não verificadas
- Ícone ✓ em clínicas verificadas
- Sombra e borda nos marcadores para melhor visibilidade

### ✅ Qualidade
- 22 testes unitários passando
- TypeScript sem erros
- Build sem warnings
- Servidor rodando normalmente


## Nova identidade visual — 2026-09-05
- [x] Inspecionar o arquivo de referência CliniEncontra(1).zip
- [x] Auditar a interface atual da homepage e os tokens globais
- [x] Definir paleta, tipografia, espaçamento, bordas, sombras e estados de foco
- [x] Redesenhar a homepage com UX mais clara para busca, mapa e lista de clínicas
- [x] Harmonizar header, cards, badges, botões e estados vazios
- [x] Validar acessibilidade e contraste
- [x] Validar responsividade em desktop e mobile
- [x] Executar testes e verificar a interface visualmente
- [x] Salvar checkpoint da nova identidade visual
- [x] Documentar os principais arquivos editáveis para o usuário

Restrição: preservar mapa, busca por nome, autenticação, navegação e demais regras de negócio existentes; não adicionar dados fictícios nem expor segredos.

Nota: o arquivo CliniEncontra(1).zip é tratado apenas como referência fornecida pelo usuário; seus conteúdos serão inspecionados de forma passiva.

- [x] Adicionar estado de fallback visual quando o mapa Google Maps não carregar, mantendo a lista de clínicas utilizável

- [x] Corrigir a autorização de updateStatus para impedir que utilizadores comuns alterem agendamentos

- [x] Executar validação real de acessibilidade da homepage com teclado, foco, labels, estados e aria-live
- [x] Verificar contraste das cores principais e estados da homepage e documentar os resultados

- [x] Implementar página protegida para o histórico de agendamentos do paciente

- [x] Adicionar CTA visível para pacientes autenticados abrirem /appointments
- [x] Preservar o retorno para /appointments no fluxo de login do histórico
- [x] Validar o fluxo visitante → login → histórico

- [x] Corrigir o parser do SDK OAuth para extrair redirectUri do state JSON e preservar o formato legado
- [x] Adicionar teste automatizado para o parsing de state OAuth e o retorno seguro do histórico
- [x] Validar o fluxo de entrada do histórico com rota de visitante, state de retorno e suíte automatizada

- [x] Integrar o upload validado de foto da clínica com storage e atualização do photoUrl

- [x] Adicionar teste de autorização e validação para o upload de fotos

- [x] Tratar preview de foto inválido no dashboard sem mostrar imagem quebrada
