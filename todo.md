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
- [ ] Adicionar testes para autenticação

## Fase 4: Homepage e Mapa
- [x] Criar layout da homepage com design elegante
- [x] Integrar Google Maps API com componente Map.tsx
- [x] Implementar busca por nome de clínica
- [x] Implementar filtro por especialidade
- [ ] Implementar ordenação por distância
- [ ] Criar popup de marcador com informações básicas
- [ ] Adicionar testes para funcionalidades de busca

## Fase 5: Perfis de Clínicas
- [x] Criar página de perfil detalhado da clínica
- [x] Exibir endereço completo, especialidades, horários
- [x] Exibir contato (telefone e email)
- [x] Implementar sistema de avaliações (ratings)
- [x] Implementar sistema de comentários
- [x] Permitir que usuários autenticados deixem avaliações
- [ ] Adicionar testes para perfil de clínica

## Fase 6: Área Administrativa de Clínicas
- [x] Criar dashboard para clínicas
- [ ] Permitir atualização de informações da clínica
- [ ] Implementar upload de fotos
- [ ] Implementar resposta a avaliações
- [ ] Criar sistema de validação de conteúdo
- [ ] Adicionar testes para área administrativa

## Fase 7: Testes, Polimento e Entrega
- [x] Implementar busca de especialidades por clínica
- [x] Exibir especialidades no perfil da clínica
- [x] Adicionar link para dashboard administrativo
- [ ] Executar testes de integração
- [ ] Otimizar performance
- [ ] Validar design responsivo
- [x] Criar checkpoint final
- [x] Entregar projeto ao usuário
