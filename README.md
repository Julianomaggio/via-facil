# VIA FÁCIL — Caronas & Entregas

MVP funcional com frontend responsivo e API Node.js. Os dados ficam em `data/db.json`, sem necessidade de instalar PostgreSQL nesta primeira entrega.

## Requisitos

- Node.js 20 ou superior
- VS Code (recomendado)

## Executar no Windows

1. Extraia o ZIP.
2. Abra a pasta `via-facil-entrega` no VS Code.
3. Abra **Terminal > Novo Terminal**.
4. Execute:

```powershell
npm install
npm start
```

5. Abra exatamente:

```text
http://127.0.0.1:5173
```

Não use o botão **Go Live**. O próprio Node serve o site e a API.

## Contas de demonstração

Administrador:
- E-mail: `admin@viafacil.com`
- Senha: `admin123`

Motorista:
- E-mail: `motorista@viafacil.com`
- Senha: `motorista123`

## Funcionalidades

- Cadastro e login com JWT
- Busca e publicação de caronas
- Reserva e cancelamento com controle de vagas
- Solicitação e rastreamento de entregas
- Histórico do usuário
- Painel administrativo com indicadores
- Identidade visual oficial da VIA FÁCIL
- Layout responsivo

## Observação

Esta entrega é um MVP local. Antes de publicar para clientes reais, altere `JWT_SECRET`, migre os dados para PostgreSQL, adicione recuperação de senha, pagamentos, mapas, notificações e políticas de privacidade.
