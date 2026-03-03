# MyDebts — Frontend

> Angular SPA for MyDebts, a debt tracking application that helps users manage and track debts between individuals.

🚀 **Live App:** https://mydebts.netlify.app

---

## Tech Stack

| Category       | Technology                        |
| -------------- | --------------------------------- |
| Framework      | Angular 20 (Standalone, Zoneless) |
| Language       | TypeScript                        |
| UI Library     | Angular Material                  |
| Styling        | SCSS + BEM                        |
| Testing        | Vitest                            |
| Bot Protection | Cloudflare Turnstile              |
| HTTP           | Angular HttpClient                |
| State          | Angular Signals                   |

---

## Features

- 🔐 JWT authentication with route guards
- 💳 Full debt CRUD — create, view, edit, delete debts
- ✅ Mark debts as paid / delete all paid debts
- 🔴 Automatic overdue status tracking
- 🤖 Cloudflare Turnstile bot protection on auth forms
- 🌙 Light / Dark theme toggle
- 📱 Fully responsive design
- 📧 Password reset flow via email

---

## Getting Started

### Prerequisites

- Node.js 20+
- Angular CLI 20+

### Installation

```bash
git clone https://github.com/HugoVS26/mydebts-frontend.git
cd mydebts-frontend
npm install
cp src/environments/environment.example.ts src/environments/environment.ts
```

### Environment Variables

Update `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000',
  turnstileSiteKey: 'your_turnstile_site_key',
};
```

### Running Locally

```bash
npm start  # http://localhost:4200
```

---

## Testing

```bash
npm test
```

Tests use **Vitest** with Angular's testing utilities.

---

## Architecture

- **Standalone components** — no NgModules
- **Zoneless** — Angular Signals for reactivity
- **OnPush change detection** — optimized rendering
- **Smart/dumb component pattern** — separation of concerns
- **Functional guards** — protecting authenticated routes
- **Feature-based folder structure** — scalable organization

---

## Scripts

| Script           | Description              |
| ---------------- | ------------------------ |
| `npm start`      | Start development server |
| `npm run build`  | Build for production     |
| `npm test`       | Run test suite           |
| `npm run lint`   | Run ESLint               |
| `npm run format` | Format with Prettier     |

---

## Deployment

Deployed on **Netlify** (free tier).

- Build command: `ng build`
- Publish directory: `dist/mydebts-frontend/browser`
- SPA routing: `public/_redirects`
