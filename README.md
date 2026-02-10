# Avaliação IFB – React + Vite + Tailwind (shadcn-style)

Projeto em React + Vite configurado com Tailwind CSS 4 e componentes no estilo **shadcn/ui** (utilizando `class-variance-authority`, `tailwind-merge`, etc.).

Este guia explica como rodar o projeto em **qualquer computador**.

---

## Requisitos

- **Node.js** (versão LTS recomendada)  
  Você pode conferir se está instalado com:

```bash
node -v
npm -v
```

---

## Como rodar o projeto pela primeira vez

1. **Clonar ou copiar o projeto**
   - Se estiver usando Git:
     ```bash
     git clone <url-do-repositorio>
     cd "avaliacao IFB"
     ```
   - Ou copie a pasta `avaliacao IFB` para o outro computador (não é necessário copiar `node_modules`).

2. **Instalar as dependências**

   Dentro da pasta `avaliacao IFB`:

   ```bash
   npm install
   ```

   Isso usa `package.json` e `package-lock.json` para instalar as mesmas versões de bibliotecas (React, Vite, Tailwind, shadcn-utils, etc.).

3. **Rodar em modo desenvolvimento**

   Ainda dentro de `avaliacao IFB`:

   ```bash
   npm run dev
   ```

   Em seguida, abra no navegador o endereço mostrado no terminal (geralmente `http://localhost:5173`).

---

## Build de produção (opcional)

Para gerar os arquivos otimizados de produção:

```bash
npm run build
```

Para pré-visualizar a build:

```bash
npm run preview
```

---

## Tecnologias principais

- **React** + **TypeScript**
- **Vite**
- **Tailwind CSS 4**
- Utilitários no estilo **shadcn/ui**:
  - `class-variance-authority`
  - `clsx`
  - `tailwind-merge`
  - `tailwindcss-animate`
  - `@radix-ui/react-slot`
  - `lucide-react`


