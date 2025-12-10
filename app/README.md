# Projeto React + Vite + Tailwind CSS + shadcn/ui

## 📋 Tecnologias Utilizadas

### **Core Framework & Build Tools**
- **React** `^19.2.0` - Biblioteca JavaScript para construção de interfaces
- **React DOM** `^19.2.0` - Renderização React para navegadores
- **Vite** `^7.2.4` - Build tool e dev server rápido
- **TypeScript** `~5.9.3` - Superset do JavaScript com tipagem estática

### **Estilização**
- **Tailwind CSS** `^3.4.18` - Framework CSS utility-first
- **tailwindcss-animate** `^1.0.7` - Animações para Tailwind
- **PostCSS** `^8.5.6` - Processador CSS
- **Autoprefixer** `^10.4.22` - Adiciona prefixos CSS automaticamente

### **UI Components**
- **shadcn/ui** - Sistema de componentes baseado em Radix UI
- **@radix-ui/react-label** `^2.1.8` - Componente Label acessível
- **@radix-ui/react-slot** `^1.2.4` - Utilitário para composição de componentes
- **lucide-react** `^0.556.0` - Biblioteca de ícones

### **Utilitários**
- **clsx** `^2.1.1` - Utilitário para construir strings de className
- **tailwind-merge** `^3.4.0` - Mescla classes Tailwind inteligentemente
- **class-variance-authority** `^0.7.1` - Gerencia variantes de componentes

### **Desenvolvimento & Qualidade**
- **ESLint** `^9.39.1` - Linter para JavaScript/TypeScript
- **TypeScript ESLint** `^8.46.4` - Regras ESLint para TypeScript
- **@vitejs/plugin-react** `^5.1.1` - Plugin Vite para React

### **Type Definitions**
- **@types/node** `^24.10.1` - Tipos TypeScript para Node.js
- **@types/react** `^19.2.5` - Tipos TypeScript para React
- **@types/react-dom** `^19.2.3` - Tipos TypeScript para React DOM

## 🚀 Como Instalar em Outras Máquinas

### **Pré-requisitos**

Antes de começar, certifique-se de ter instalado:

1. **Node.js** (versão 18 ou superior)
   - Baixe em: https://nodejs.org/
   - Verifique a instalação: `node --version`
   - Verifique o npm: `npm --version`

2. **Git** (opcional, para clonar repositórios)
   - Baixe em: https://git-scm.com/

### **Passo a Passo de Instalação**

#### **1. Obter o Código do Projeto**

**Opção A: Via Git (se o projeto estiver em um repositório)**
```bash
git clone [URL_DO_REPOSITORIO]
cd teste-PIBIC4/app
```

**Opção B: Copiar os arquivos manualmente**
- Copie toda a pasta `app` para a nova máquina
- Navegue até a pasta no terminal

#### **2. Instalar Dependências**

No diretório `app`, execute:

```bash
npm install
```

Este comando irá:
- Ler o arquivo `package.json`
- Baixar e instalar todas as dependências listadas
- Criar a pasta `node_modules` com todas as bibliotecas

**Tempo estimado:** 2-5 minutos (dependendo da conexão)

#### **3. Verificar Instalação**

Após a instalação, verifique se tudo está correto:

```bash
npm run dev
```

Se tudo estiver OK, você verá algo como:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Acesse `http://localhost:5173/` no navegador para ver a aplicação.

### **Comandos Disponíveis**

```bash
# Desenvolvimento (inicia servidor local)
npm run dev

# Build para produção
npm run build

# Preview do build de produção
npm run preview

# Verificar código com ESLint
npm run lint
```

## 📁 Estrutura do Projeto

```
app/
├── public/              # Arquivos estáticos
├── src/
│   ├── components/     # Componentes React
│   │   ├── ui/        # Componentes shadcn/ui
│   │   └── login-form.tsx
│   ├── pages/         # Páginas da aplicação
│   │   └── LoginPage.tsx
│   ├── lib/           # Utilitários
│   │   └── utils.ts
│   ├── App.tsx        # Componente principal
│   ├── main.tsx       # Ponto de entrada
│   └── index.css      # Estilos globais e tema
├── components.json     # Configuração shadcn/ui
├── tailwind.config.js  # Configuração Tailwind
├── vite.config.ts      # Configuração Vite
├── tsconfig.json       # Configuração TypeScript
└── package.json        # Dependências do projeto
```

## 🔧 Configurações Importantes

### **Alias de Importação**
O projeto usa o alias `@/` para importar de `src/`:
```typescript
import { LoginForm } from "@/components/login-form"
```

### **Tema**
O tema está configurado em `src/index.css` usando variáveis CSS.
Suporta modo claro e escuro (adicione a classe `dark` no elemento raiz).

### **shadcn/ui**
Componentes podem ser adicionados com:
```bash
npx shadcn@latest add [nome-do-componente]
```

## ⚠️ Solução de Problemas Comuns

### **Erro: "Cannot find module"**
```bash
# Limpe o cache e reinstale
rm -rf node_modules package-lock.json
npm install
```

### **Erro: "Port already in use"**
```bash
# Use outra porta
npm run dev -- --port 3000
```

### **Erro de tipos TypeScript**
```bash
# Reinstale os tipos
npm install --save-dev @types/react @types/react-dom @types/node
```

### **Problemas com permissões (Linux/Mac)**
```bash
# Use sudo se necessário (não recomendado)
# Ou configure npm para não usar sudo:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

## 📦 Versões Específicas

Para garantir compatibilidade, as versões estão fixadas no `package.json`:
- Node.js: **18+** (recomendado: 20 LTS)
- npm: **9+** (vem com Node.js)

## 🔄 Atualizar Dependências

```bash
# Verificar dependências desatualizadas
npm outdated

# Atualizar dependências (cuidado: pode quebrar compatibilidade)
npm update
```

## 📝 Notas Adicionais

- O projeto usa **ES Modules** (`"type": "module"`)
- TypeScript está configurado com modo **strict**
- ESLint está configurado para React
- O build de produção gera arquivos otimizados em `dist/`

## 🆘 Precisa de Ajuda?

1. Verifique se todas as versões do Node.js e npm estão corretas
2. Certifique-se de estar na pasta `app` ao executar comandos
3. Verifique se não há erros no console do terminal
4. Tente limpar o cache: `npm cache clean --force`
