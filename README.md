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
- Mapa interativo dos percursos
- Busca de endereços, cálculo de rota, distância e duração estimada
- Seleção explícita de cidade e estado quando existem locais com o mesmo nome
- Perfil público de cada motorista, reunindo seus percursos disponíveis
- Configuração de foto, título profissional, apresentação, região atendida e meios de pagamento
- Avaliações e comentários de passageiros com reserva confirmada
- Upload e compactação da foto do perfil do motorista
- Painel com a lista de viagens publicadas pelo motorista
- Preços configuráveis para cada trecho possível da rota
- Chave Pix no perfil e geração automática de QR Code e Pix Copia e Cola após a confirmação
- Pagamento combinado diretamente entre passageiro e motorista, sem intermediação financeira da Via Fácil

## Configuração de produção no Render

Crie um PostgreSQL no mesmo workspace e região do serviço web. No serviço `via-facil`, configure:

- `NODE_ENV=production`
- `DATABASE_URL`: Internal Database URL fornecida pelo PostgreSQL do Render
- `JWT_SECRET`: valor aleatório longo e exclusivo
- `ADMIN_EMAIL`: e-mail inicial do administrador
- `ADMIN_PASSWORD`: senha inicial forte, com pelo menos 8 caracteres
- `ADMIN_NAME`: nome do administrador (opcional)
- `MAP_CONTACT_EMAIL`: contato técnico enviado ao serviço de geocodificação
- `GEOCODING_URL`: servidor Nominatim compatível (opcional)
- `ROUTING_URL`: servidor OSRM compatível (opcional)

Na primeira inicialização, a aplicação cria a tabela necessária e cadastra o administrador definido pelas variáveis. As contas demonstrativas só são criadas no desenvolvimento local.

O MVP usa OpenStreetMap/Leaflet, Nominatim e OSRM. Os servidores públicos são adequados somente para validação com baixo volume. Antes de ampliar o número de usuários, configure provedores próprios ou comerciais compatíveis por meio de `GEOCODING_URL` e `ROUTING_URL`.

## Observação

Antes de abrir o serviço ao público, adicione recuperação de senha, confirmação de e-mail/telefone, notificações, backups, termos de uso e políticas de privacidade/LGPD. A integração de assinaturas para os motoristas permanece planejada para uma próxima etapa.
