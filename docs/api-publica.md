# API pública

A aplicação disponibiliza uma API HTTP versionada para integrações de terceiros.

## Endpoints

- `GET /api/public/v1/clinics`
- `GET /api/public/v1/clinics?search=nome`
- `GET /api/public/v1/clinics/:id`

A resposta segue o formato `{ "data": ..., "meta": ... }`. Apenas dados públicos da clínica são expostos; informações administrativas e de pacientes nunca são retornadas.

## Autenticação e limite

- Em desenvolvimento, a API funciona sem chave para facilitar a apresentação.
- Em produção, defina `PUBLIC_API_KEY` e envie o valor no header `X-API-Key`.
- Cada chave/IP pode fazer até 60 pedidos por janela de 60 segundos. Ao exceder, a API responde `429` com `Retry-After: 60`.

## Email de agendamentos

Para ativar confirmação e atualização por email, configure no ambiente do servidor:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=utilizador
SMTP_PASSWORD=segredo
SMTP_FROM=Clinicas Proximas <noreply@example.com>
```

Sem essas variáveis, o sistema continua a funcionar e mantém as notificações operacionais internas, mas não tenta enviar email.
