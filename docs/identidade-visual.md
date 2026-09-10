# Identidade visual — Clínicas Próximas

## Direção

A nova interface segue uma direção de **navegação de saúde calma e confiável**: superfícies claras, turquesa como sinal de ação e confiança, carvão para leitura, verde para verificação e detalhes quentes apenas para avaliações.

A referência visual enviada pelo usuário foi usada como inspiração de linguagem, não como fonte de conteúdo. O projeto não copia nomes, pessoas, avaliações, métricas ou imagens da referência.

## Sistema visual

| Elemento | Decisão |
| --- | --- |
| Cor principal | Turquesa em `--primary`, usada em CTAs, links, foco e elementos de navegação |
| Confirmação | Verde esmeralda para clínicas verificadas e estados de sucesso |
| Avaliação | Âmbar reservado para estrelas e sinais de decisão |
| Texto | Carvão azulado para títulos e cinza azulado para apoio |
| Tipografia | Sora para títulos e DM Sans para texto de interface |
| Superfícies | Cartões brancos, bordas sutis e sombras suaves |
| Forma | Raios médios/grandes para sensação acolhedora, sem perder estrutura |
| Acessibilidade | Foco visível, labels para busca, semântica de navegação e respeito a redução de movimento |

## Arquivos principais

- `client/src/index.css`: tokens globais, tipografia, fundo da aplicação, superfícies e acessibilidade.
- `client/index.html`: idioma, título, descrição e fontes da aplicação.
- `client/src/pages/Home.tsx`: header, hero, busca, mapa, lista de clínicas e seção de fluxo.
- `client/src/components/Map.tsx`: carregamento do Google Maps e fallback visual quando o mapa não está disponível.
- `client/src/lib/clinicSearch.ts`: busca simples por nome, sem filtros adicionais.
- `client/src/lib/clinicSearch.test.ts`: testes da busca por nome.

## Como personalizar

Para mudar a identidade sem reescrever as páginas, comece pelos valores de `:root` em `client/src/index.css`, especialmente `--primary`, `--foreground`, `--background`, `--border` e `--radius`. Para mudar o estilo dos títulos, altere as fontes carregadas em `client/index.html` e as famílias definidas no `body` e nos headings.

A homepage continua a consumir dados pelas procedures tRPC existentes. A nova identidade é visual e não altera o schema, as rotas, as permissões ou os dados persistidos.

## Fallback do mapa

Se o script do Google Maps falhar ou estiver indisponível, `MapView` apresenta uma mensagem visual e a lista de clínicas continua utilizável. Isso evita que uma integração externa indisponível bloqueie a tarefa principal do visitante.


## Funcionalidades adicionadas após a identidade visual

A página `/appointments` apresenta o histórico privado do paciente, com estados de carregamento, erro e vazio. O cabeçalho da homepage apresenta o CTA **Meus agendamentos** para utilizadores autenticados. O fluxo OAuth aceita um caminho de retorno seguro, preservando o acesso à página solicitada depois do login.

No dashboard administrativo, o componente `PhotoUploader` permite selecionar JPEG, PNG ou WebP até 5 MB. O backend valida o administrador da clínica, envia o ficheiro para o storage configurado, guarda apenas o `photoUrl` na tabela `clinics` e atualiza o preview após o refetch. O preview inválido regressa ao estado de seleção, sem mostrar imagem quebrada.

Os testes automatizados cobrem a busca por nome, o parsing do state OAuth, a autorização do upload e as validações de MIME e tamanho. A suíte atual foi executada com 31 testes aprovados; o build apresenta apenas o aviso não bloqueante de chunk JavaScript acima de 500 kB.
