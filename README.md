# Ranking de Players — Major Cachoeirense

Site mobile-first para ranking de quantidade variável de players.

## Antes de publicar

1. Edite `assets/players.js` e coloque a lista oficial.
2. Publique via GitHub + Cloudflare Pages (recomendado porque o projeto possui uma Pages Function).
3. Configure no Cloudflare as variáveis secretas:
   - `RESEND_API_KEY`
   - `EMAIL_TO`
   - `EMAIL_FROM`
4. Faça um voto de teste.

## Publicação recomendada para leigo

O projeto usa uma pasta `/functions`. O upload "drag and drop" do painel do Cloudflare Pages não compila essa pasta. Por isso, publique conectando um repositório GitHub ao Cloudflare Pages, ou use Wrangler.

## Configuração do Cloudflare Pages

Para este projeto estático:
- Build command: `exit 0`
- Build output directory: `/`

O Cloudflare Pages Functions reconhece `functions/api/submit.js` como a rota `/api/submit`.

## E-mail

O código usa Resend. Crie uma conta, gere uma API key e configure as variáveis no Cloudflare.

Para produção, verifique seu domínio no Resend e use um remetente do seu domínio.

## Próximo upgrade

Adicionar Cloudflare D1 para guardar todas as votações, permitindo painel administrativo e ranking geral automático.
