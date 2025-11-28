# Guia Definitivo de Configuração da API do Google Gemini (React + Vite)

Este documento contém a configuração **comprovada e testada** para integrar a API do Google Gemini em aplicações React + Vite + TypeScript, evitando erros comuns de biblioteca, modelos e variáveis de ambiente.

## 📋 Índice
- [1. Estrutura de Arquivos](#1-estrutura-de-arquivos)
- [2. Variáveis de Ambiente (.env.local)](#2-variáveis-de-ambiente-envlocal)
- [3. Configuração do Vite (vite.config.ts)](#3-configuração-do-vite-viteconfigts)
- [4. Package.json - Dependências](#4-packagejson---dependências)
- [5. Serviço Gemini (geminiService.ts)](#5-serviço-gemini-geminiservicets)
- [6. Modelos Disponíveis e Erros Comuns](#6-modelos-disponíveis-e-erros-comuns)

---

## 1. Estrutura de Arquivos

```
projeto/
├── .env.local                    # Variáveis de ambiente (NUNCA commitar)
├── vite.config.ts                # Configuração do Vite
├── package.json                  # Dependências (@google/generative-ai)
└── services/
    └── geminiService.ts          # Lógica de chamada da API
```

---

## 2. Variáveis de Ambiente (.env.local)

### ✅ Configuração Correta

Crie o arquivo `.env.local` na raiz do projeto. Use o prefixo `VITE_` para que o Vite exponha a variável automaticamente.

```dotenv
VITE_GEMINI_API_KEY=SUA_CHAVE_API_DO_GEMINI_AQUI
```

---

## 3. Configuração do Vite (vite.config.ts)

Não é necessário nenhuma configuração especial no `vite.config.ts` se você usar o prefixo `VITE_` no `.env.local`.

```typescript
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      }
    }
  };
});
```

---

## 4. Package.json - Dependências

Use a biblioteca **`@google/generative-ai`** (SDK Client-Side), que é a recomendada para aplicações React/Vite rodando no navegador. A biblioteca `@google/genai` é focada em Node.js e pode causar erros de "process is not defined" ou tela branca no navegador.

```bash
npm install @google/generative-ai
```

**Versões testadas:**
- `@google/generative-ai`: `^0.21.0` (ou superior)
- `vite`: `^6.2.0`
- `react`: `^19.2.0`

---

## 5. Serviço Gemini (geminiService.ts)

### ✅ Implementação Correta

```typescript
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

// 1. Leitura da API Key via import.meta.env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set.");
}

// 2. Inicialização do Cliente
const genAI = new GoogleGenerativeAI(apiKey);

// 3. Definição de Schema (Opcional, para JSON estruturado)
const mySchema = {
  type: SchemaType.OBJECT,
  properties: {
    result: { type: SchemaType.STRING }
  }
};

export const generateContent = async (prompt: string) => {
  try {
    // 4. Configuração do Modelo
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash', // Modelo estável e rápido
      generationConfig: {
        responseMimeType: "application/json", // Se usar schema
        responseSchema: mySchema,             // Se usar schema
        temperature: 0.2,
      }
    });

    // 5. Chamada da API
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    
    if (!jsonText) throw new Error("No response from AI");
    
    return JSON.parse(jsonText);

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
```

---

## 6. Modelos Disponíveis e Erros Comuns

### ⚠️ Erro 404 (Not Found)
Significa que o **nome do modelo está incorreto** ou não está disponível na sua região/conta.

**Modelos Testados e Funcionando (Nov 2025):**
- `gemini-2.0-flash` (Recomendado: Rápido e Estável)
- `gemini-1.5-flash` (Pode dar 404 em algumas contas novas)
- `gemini-1.5-pro` (Mais inteligente, mas limites menores)

### ⚠️ Erro 429 (Resource Exhausted)
Significa que você atingiu o **limite de requisições (Quota)**.
- **Solução:** Aguarde alguns segundos (ex: 30s) e tente novamente.
- O modelo `gemini-2.0-flash` geralmente tem limites mais generosos que os modelos `pro`.

### ⚠️ Tela Branca / Erro "process is not defined"
Isso acontece se você usar a biblioteca `@google/genai` (Node.js) no navegador sem polyfills.
**Solução:** Use sempre `@google/generative-ai` para projetos React/Vite.

---

## 🎯 Resumo para Copiar e Colar

1. Instale: `npm install @google/generative-ai`
2. Configure `.env.local`: `VITE_GEMINI_API_KEY=...`
3. Use `import.meta.env.VITE_GEMINI_API_KEY` no código.
4. Use `gemini-2.0-flash` no seu serviço.
