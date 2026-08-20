# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

// --------------------

Install Prettier

cd back-end
npm install -D prettier

project-root/.prettierrc

npm install -D prettier

and keep one shared config:

project-root/.prettierrc
{
"semi": true,
"singleQuote": false,
"trailingComma": "none"
}

add format scripts in front-end/package.json

{
"scripts": {
"format": "prettier --write ."
}

npm run format

// ----------------------------------

Frontend (React + Vite + TypeScript) — install ESLint

npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh globals

Run frontend lint

npm run lint

Auto-fix:

npm run lint:fix

// -----------------------------------

## Axios & other library

npm install axios react-router-dom
npm install @tanstack/react-query
npm install react-hook-form
npm install zod
npm install clsx

Axios → API communication.
React Router → Routing.
TanStack Query → Caching, pagination, refetching, loading/error states.
React Hook Form → Admin forms.
Zod → Same validation library as your backend, allowing shared validation logic.
clsx → Cleaner conditional CSS class handling.

npm install -D @types/react @types/react-dom

To clean npm cache:

---

npm cache clean --force

---

npm install tailwindcss @tailwindcss/vite

---

npm install lucide-react

## UI - Install libraries

npm install react-icons
npm install clsx
npm install tailwind-merge
npm install framer-motion
npm install date-fns

## Utility for merging Tailwind CSS class names

npm install clsx tailwind-merge

## Shared date formatting helper.

npm install date-fns

## This automatically reads the alias from your TypeScript configuration.

npm install -D vite-tsconfig-paths

## class-variance-authority (CVA)

npm install class-variance-authority

## Header Foundation

src/
│
├── components/
│ └── layout/
│ ├── Header/
│ │ ├── Header.tsx
│ │ ├── Header.types.ts
│ │ ├── Header.module.css
│ │ ├── index.ts
│ │
│ ├── TopBar/
│ │ ├── TopBar.tsx
│ │ ├── index.ts
│ │
│ ├── Logo/
│ │ ├── Logo.tsx
│ │ ├── index.ts
│ │
│ └── HeaderActions/
│ ├── HeaderActions.tsx
│ └── index.ts

## GIT

git remote -v
///////////////
git add vercel.json
git commit -m "fix frontend routing for direct admin routes"
git push
////////////////

## For Vite + React + TypeScript frontend

npm run typecheck

## if the package.json already defines that script:

npm run

## If there is no typecheck script:(recommended for every phase implementation)

npx tsc --noEmit
