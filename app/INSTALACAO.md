# 🚀 Guia Rápido de Instalação

## Checklist de Instalação

### ✅ Passo 1: Verificar Pré-requisitos

```bash
# Verificar Node.js (precisa ser 18 ou superior)
node --version

# Verificar npm
npm --version
```

**Se não tiver Node.js instalado:**
- Windows/Mac: Baixe em https://nodejs.org/ (recomendado: versão LTS)
- Linux: `sudo apt install nodejs npm` (Ubuntu/Debian)

### ✅ Passo 2: Navegar até a Pasta do Projeto

```bash
cd app
```

### ✅ Passo 3: Instalar Dependências

```bash
npm install
```

**O que acontece:**
- Lê o `package.json`
- Baixa todas as dependências (~240 pacotes)
- Cria a pasta `node_modules`
- Tempo: ~2-5 minutos

### ✅ Passo 4: Iniciar o Servidor de Desenvolvimento

```bash
npm run dev
```

**Resultado esperado:**
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

### ✅ Passo 5: Abrir no Navegador

Acesse: **http://localhost:5173/**

---

## 📋 Lista Completa de Tecnologias

### **Principais**
- ✅ React 19.2.0
- ✅ TypeScript 5.9.3
- ✅ Vite 7.2.4
- ✅ Tailwind CSS 3.4.18
- ✅ shadcn/ui

### **Dependências Principais**
```
react ^19.2.0
react-dom ^19.2.0
@radix-ui/react-label ^2.1.8
@radix-ui/react-slot ^1.2.4
lucide-react ^0.556.0
clsx ^2.1.1
tailwind-merge ^3.4.0
class-variance-authority ^0.7.1
tailwindcss-animate ^1.0.7
```

### **Ferramentas de Desenvolvimento**
```
vite ^7.2.4
typescript ~5.9.3
tailwindcss ^3.4.18
postcss ^8.5.6
autoprefixer ^10.4.22
eslint ^9.39.1
```

---

## 🔧 Comandos Úteis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento |
| `npm run build` | Cria build de produção |
| `npm run preview` | Preview do build de produção |
| `npm run lint` | Verifica erros de código |

---

## ⚠️ Problemas Comuns

### **Erro: "npm não é reconhecido"**
- Instale Node.js: https://nodejs.org/

### **Erro: "Cannot find module"**
```bash
rm -rf node_modules package-lock.json
npm install
```

### **Porta 5173 já em uso**
```bash
npm run dev -- --port 3000
```

### **Erros de permissão (Linux/Mac)**
```bash
# Não use sudo com npm!
# Configure npm para não precisar de sudo:
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

---

## 📦 O que é instalado?

Ao executar `npm install`, são instalados:

- **240+ pacotes** no total
- **~200 MB** de dependências
- Todas as bibliotecas listadas no `package.json`

---

## ✅ Verificação Final

Após instalar, você deve ter:

- ✅ Pasta `node_modules/` criada
- ✅ Arquivo `package-lock.json` atualizado
- ✅ Comando `npm run dev` funcionando
- ✅ Aplicação rodando em http://localhost:5173/

---

## 📞 Precisa de Ajuda?

1. Verifique se está na pasta `app`
2. Verifique a versão do Node.js: `node --version` (precisa ser 18+)
3. Limpe o cache: `npm cache clean --force`
4. Reinstale: `rm -rf node_modules && npm install`

