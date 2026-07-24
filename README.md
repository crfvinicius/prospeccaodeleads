# Prospecção de Leads

Sistema de prospecção automática de leads com CRM em kanban e contato automatizado via WhatsApp.

## Funcionalidades

- **Busca automática de leads** via Google Places API, com filtros de localidade, nicho, quantidade, avaliação mínima no Google, presença de site e presença no WhatsApp.
- **Upload de leads** a partir de planilha `.xlsx` ou tabela em Markdown.
- **CRM em kanban** para acompanhar o funil (Novo → Contatado → Respondeu → Negociando → Fechado/Perdido), com leads arrastáveis entre colunas.
- **Contato automático via WhatsApp** (Baileys), com pareamento por QR Code e histórico de mensagens por lead.
- **Campanhas em massa no WhatsApp**: seleção de leads por estágio/nicho/localidade, mensagem personalizável (`{{nome}}`, `{{nicho}}`, `{{localidade}}`) e envio sequencial com intervalo aleatório configurável entre mensagens, com pausa/retomada/cancelamento.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS
- PostgreSQL + Prisma 7
- Google Places API (busca de leads)
- Baileys (`@whiskeysockets/baileys`) para automação de WhatsApp

## Configuração local

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure o `.env` (copie de `.env.example`):

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL`: string de conexão do PostgreSQL.
   - `GOOGLE_PLACES_API_KEY`: chave da Google Places API (necessária para a busca automática de leads).
   - `WHATSAPP_SESSION_DIR`: pasta onde a sessão do WhatsApp é persistida (padrão `./.whatsapp-session`).

3. Rode as migrações do Prisma:

   ```bash
   npx prisma migrate dev
   ```

4. Suba o servidor de desenvolvimento:

   ```bash
   npm run dev
   ```

   Acesse [http://localhost:3000](http://localhost:3000).

## Conectando o WhatsApp

Acesse `/whatsapp`, clique em **Conectar** e escaneie o QR Code com o WhatsApp do número que fará os contatos (mesmo fluxo do WhatsApp Web). Essa automação usa uma biblioteca não-oficial (Baileys) — não é a API oficial da Meta, então **respeite volumes moderados de envio** para reduzir o risco de o número ser bloqueado pelo WhatsApp.

## Campanhas em massa

Em `/campanhas`, filtre os leads por estágio/nicho/localidade, escreva a mensagem (com placeholders opcionais `{{nome}}`, `{{nicho}}`, `{{localidade}}`) e defina o intervalo mínimo/máximo em segundos entre cada envio. A campanha roda em background no processo do servidor (por isso precisa de um processo persistente — não funciona em ambientes serverless como Vercel) e pode ser pausada, retomada ou cancelada a qualquer momento em `/campanhas`.

## Deploy (Cloudflare Containers)

A aplicação roda como um Cloudflare Container (Docker, com processo persistente — necessário para manter a conexão do WhatsApp viva) atrás de um Worker de roteamento. O banco Postgres é externo (ex: [Neon](https://neon.tech), plano grátis).

**Importante:** containers da Cloudflare não garantem disco persistente entre reinicializações — a sessão pareada do WhatsApp pode se perder de vez em quando e pedir para escanear o QR Code de novo. Se isso for um problema recorrente, considere um VPS tradicional.

### Configuração única

1. Crie um banco em [neon.tech](https://neon.tech) e copie a connection string.
2. No Cloudflare, gere um **API Token** (dashboard → My Profile → API Tokens → Create Token, com permissão de editar Workers/Containers) e anote o **Account ID** (barra lateral direita do dashboard).
3. No GitHub, em **Settings → Secrets and variables → Actions**, cadastre:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
   - `DATABASE_URL` (a connection string do Neon)
   - `GOOGLE_PLACES_API_KEY`

### Deploy automático

O workflow `.github/workflows/deploy.yml` builda a imagem Docker e publica no Cloudflare a cada push na branch `main` (ou manualmente via **Actions → Deploy → Run workflow**). Ele também sincroniza os secrets `DATABASE_URL` e `GOOGLE_PLACES_API_KEY` no Worker a cada execução.

### Deploy manual (requer Docker local)

```bash
npx wrangler login
npm run deploy
```

## Estrutura

```
src/
  app/            # páginas e rotas de API (App Router)
  components/     # componentes de UI (kanban, formulários, conexão WhatsApp)
  lib/            # regras de negócio (Prisma, Google Places, import de leads, WhatsApp)
prisma/
  schema.prisma   # modelos: Lead, SearchQuery, Message, Campaign, CampaignLead
worker/
  index.ts        # Worker do Cloudflare que roteia requisições para o container
Dockerfile        # imagem de produção da aplicação
wrangler.jsonc    # configuração do deploy no Cloudflare Containers
```
