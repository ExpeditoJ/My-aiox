# Guia Rápido: AIOX CLI & OpenClaude 🤖

Este documento consolida tudo o que construímos no ambiente de Prompt e Agentes do AIOX. O foco aqui foi criar o terminal de IA mais rápido, impenetrável e com excelente memória inter-sessões.

## 1. 🚀 Como Iniciar

Você não precisa mais decorar caminhos ou parâmetros longos.
Apenas use um dos arquivos da raiz:

- **Se estiver no Prompt/PowerShell**: 
  ```powershell
  .\aiox.ps1
  ```
- **Ou dê dois cliques no arquivo no Windows Explorer**:
  `aiox.bat`

Isso já resolve tudo nos bastidores e te coloca direto com o cursor esperando suas ordens para o Agente OpenClaude.

## 2. ⚡ Motores de API (O "Pool")

Nosso sistema abandonou o uso engessado da OpenAI tradicional e adotou um modelo de Alta Performance & Alta Disponibilidade local.

Tudo é definido no arquivo: `.aiox-core/local/api-pool.json`

### Google Gemini Nato (Modelo Primário)
O Terminal rodará em sua glória nativa de fábrica quando o **Gemini** estiver ajustado como provador principal. Significa zero travamentos e interpretações precisas de comandos *bash* complexos.

### Proxy Shield & Rotação
Se a cota do Gemini morrer ou caso você troque a preferência para a **Groq (LLAMA 3.3)**, **Cerebras** ou **OpenRouter**, não precisaremos reiniciar nada. O arquivo `aiox.bat` ligará automaticamente o roteador fantasma (na Porta 3100) que engolirá o seu prompt, tratará limites de String para economizar tokens *(Shield Mode)* e transmitirá tudo perfeitamente para o motor novo sem que o OpenClaude sequer desconfie.

## 3. 🧠 Persistência Absoluta (AIOX Memory MCP)

O Claude Code original esquece de tudo assim que você dita `/exit`. Nós solucionamos isso!
Existe um servidor em segundo plano rodando o módulo **Model Context Protocol (MCP)** ligado ao OpenClaude. 

Se algo é importante para o seu projeto, mande pra lá!
- **Para guardar:** *"Por favor, armazene usando MCP na memória do projeto a arquitetura que usamos na tela de login."*
- **Para relembrar:** Abra o \aiox.ps1 no dia seguinte e diga: *"Leia a MCP e me lembre o que fizemos ontem".*

Seus dados estarão seguros blindados de vazamentos (ignored pelo Git) no caminho `.aiox-core/local/global-memory.json`.

---
*Happy Hacking!*  👑 AIOX Framework
