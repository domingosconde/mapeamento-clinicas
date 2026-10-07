# Clínicas Próximas — app nativa

Cliente Expo/React Native separado da aplicação web. A primeira versão permite pesquisar clínicas públicas, abrir o perfil, consultar verificação/avaliação e contactar por telefone ou email.

## Executar

```bash
cd mobile
pnpm install
EXPO_PUBLIC_API_BASE_URL=https://clinicamap-eyatarvw.manus.space pnpm start
```

Use o QR code no Expo Go ou os comandos `pnpm android` / `pnpm ios`.

## API

O cliente consome somente:

- `GET /api/public/v1/clinics`
- `GET /api/public/v1/clinics?search=nome`
- `GET /api/public/v1/clinics/:id`

Para apontar para outra publicação, defina `EXPO_PUBLIC_API_BASE_URL`. O mobile não guarda segredos nem acessa dados administrativos.

## Próximas extensões

Autenticação OAuth, histórico privado e agendamento podem ser adicionados como módulos seguintes; o cliente público atual não cria ou altera dados.
