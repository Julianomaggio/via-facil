# VIA FÁCIL — Caronas & Entregas

Aplicação responsiva com API Node.js e persistência PostgreSQL em produção. Sem `DATABASE_URL`, o desenvolvimento local continua usando `data/db.json`.

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
- Busca e publicação de percursos com paradas intermediárias
- Conversa entre passageiro e motorista antes da reserva
- Solicitação de reserva por trecho, com aceite ou recusa do motorista
- Controle de vagas após confirmação e cancelamento
- Publicação combinada para passageiros, entregas ou ambos
- Solicitação de entrega entre quaisquer pontos válidos do percurso
- Histórico do usuário
- Painel administrativo com indicadores
- Identidade visual oficial da VIA FÁCIL
- Layout responsivo

## Configuração de produção no Render

Crie um PostgreSQL no mesmo workspace e região do serviço web. No serviço `via-facil`, configure:

- `NODE_ENV=production`
- `DATABASE_URL`: Internal Database URL fornecida pelo PostgreSQL do Render
- `JWT_SECRET`: valor aleatório longo e exclusivo
- `ADMIN_EMAIL`: e-mail inicial do administrador
- `ADMIN_PASSWORD`: senha inicial forte, com pelo menos 8 caracteres
- `ADMIN_NAME`: nome do administrador (opcional)

Na primeira inicialização, a aplicação cria a tabela necessária e cadastra o administrador definido pelas variáveis. As contas demonstrativas só são criadas no desenvolvimento local.

## Observação

Antes de abrir o serviço ao público, adicione recuperação de senha, confirmação de e-mail/telefone, pagamentos, mapas, notificações, backups e políticas de privacidade/LGPD.
