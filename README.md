<h1 align="center">API Mercado Livre — Frontend</h1>

<p align="center">
  <strong>Painel do vendedor para gerenciar anúncios no Mercado Livre</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/React_Router-7-CA4245?logo=reactrouter&logoColor=white" alt="React Router" />
</p>

---

## Sobre o frontend

- SPA com rotas protegidas (dashboard) e rotas públicas (login, cadastro)
- Comunicação com a API via `fetch` com `credentials: 'include'` (cookie JWT HttpOnly)
- Fluxo OAuth: redireciona ao ML e retorna em `/auth/ml/callback`
- Painel **Meus anúncios**: listagem, busca, filtros em modal, criar/editar/inativar/reativar/excluir e importar do ML

## Pré-requisitos

- Node.js 18+
- Backend rodando (veja [README do backend](../API-Mercado-Livre-Back/README.md))
- Conta Mercado Livre conectada pelo painel após login

## Configuração do ambiente (`.env`)

```bash
cp .env.example .env
```

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `VITE_API_URL` | **Sim** | URL do backend **sem barra no final**. Ex.: `http://localhost:3000` |

Exemplo para desenvolvimento local:

```env
VITE_API_URL=http://localhost:3000
```

Em produção, use a URL pública da API (ex.: `https://sua-api.railway.app`).

> Variáveis `VITE_*` são embutidas no build. Altere o `.env` e rode `npm run build` de novo ao publicar.

## Instalação e execução

```bash
npm install
npm run dev
```

O Vite sobe em `http://localhost:5173` (porta padrão).

### Outros scripts

| Comando | Descrição |
|---------|-----------|
| `npm run build` | Gera pasta `dist/` para produção |
| `npm run preview` | Pré-visualiza o build localmente |
| `npm run lint` | ESLint |

## Fluxo de uso (desenvolvimento)

1. Suba o **backend** (`npm run start:dev` na pasta `API-Mercado-Livre-Back`)
2. Suba o **front** (`npm run dev` nesta pasta)
3. Acesse `http://localhost:5173`, crie uma conta ou faça login
4. Conecte a conta Mercado Livre (botão no dashboard)
5. Importe ou crie anúncios; use **Filtros** ao lado da busca para refinar a listagem

O redirect OAuth no app ML deve ser:

```text
http://localhost:5173/auth/ml/callback
```

(idêntico a `ML_REDIRECT_URI` no `.env` do backend)

## Estrutura de pastas

```text
src/
├── pages/              # Login, cadastro, dashboard, callback ML
├── components/         # Painel de produtos, modais, filtros
├── context/            # AuthProvider (sessão / cookie)
├── lib/                # Cliente API (api.ts, items-api.ts)
└── types/              # Tipos TypeScript (Item, filtros)
```

## Integração com a API

- Base URL: `import.meta.env.VITE_API_URL`
- Erros HTTP viram `ApiError` com `message` legível (mensagens do NestJS)
- Todas as requisições autenticadas usam cookie; não é necessário enviar `Authorization` manualmente

## Produção

1. Defina `VITE_API_URL` para a API em produção
2. `npm run build`
3. Publique o conteúdo de `dist/` (Vercel, Netlify, etc.)
4. No backend, configure `CORS_ORIGIN` com a URL exata deste front (HTTPS)
5. Se front e API estiverem em domínios diferentes, o backend precisa de `COOKIE_CROSS_SITE=true` e HTTPS nos dois lados
