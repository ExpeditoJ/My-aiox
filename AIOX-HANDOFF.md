# Bem-vindo ao AIOX: Seu Ecossistema de Inteligência Artificial 🚀

Este sistema foi configurado sob medida para o seu hardware e fluxo de trabalho. O **AIOX** não é apenas um chat, é uma arquitetura local e em nuvem que permite você programar, planejar e criar usando agentes especialistas, garantindo 100% de estabilidade e segurança para a sua máquina.

## 1. Como Iniciar o seu Assistente
Sempre que precisar codar ou de assistência, abra o seu terminal (PowerShell ou VS Code) na pasta do projeto e digite:
```powershell
.\aiox.bat
```
*(Ele vai ligar os motores invisivelmente em segundo plano e a interface `OpenClaude` vai surgir pra você).*

## 2. A Mágica do "Gaming Mode" (Zero Lags) 🎮
Um dos seus maiores problemas com IAs rodando direto no PC seria o consumo da sua Placa de Vídeo (Sua GTX 1650 de 4GB). Nós configuramos um **Sensor Passivo**:
- Ao abrir o `aiox.bat`, a CPU acorda a IA nativamente para te ajudar com códigos na velocidade da luz sem te cobrar 1 centavo.
- Quando você fecha o terminal (ou digita `/exit`), **um comando secreto caça e encerra perfeitamente todos os processos do motor**.
- Você pode fechar a janela e abrir o seu jogo favorito. A sua Placa de Vídeo e RAM estarão 100% livres, sem fantasmas rodando ocultos no Windows.

## 3. O Modo Local vs. O Modo "Cérebro Pesado" 🧠
Sua máquina foi calibrada com o **Qwen 2.5 Coder 3B**. Ele é extremamente rápido, roda direto na sua placa, mas seu QI é mais "direto ao ponto". Ideal para refatorações curtas e tirar dúvidas.

Se você precisar que o AIOX leia **projetos gigantestas** ou use raciocínio profundo de arquitetura (orquestração de múltiplos arquivos complexos), seu PC não aguenta fisicamente essa carga.
**Como Ativar a Nuvem ("O Mestre"):**
1. Abra o arquivo `.aiox-core/local/api-pool.json`
2. Encontre o bloco `"gemini"` ou `"openrouter"` e mude o campo `"priority"` dele para `0`.
3. Mude a prioridade do `"ollama-local"` para `10`.

Pronto! Agora quando o `aiox.bat` abrir, a "Muralha de Roteamento" vai ignorar seu PC e rodar cálculos de milhões de tokens nos super-servidores do Google ou OpenRouter. Se todos falharem em cascata, ele nunca deixará você travar, rotacionando a rede em milissegundos.

## Comandos Rápidos Essenciais no Terminal AIOX:
- `hello`: Inicia a conversa com a IA.
- `/help`: Mostra atalhos nativos da ferramenta.
- `/model`: Permite forçar uso global da IA principal (se na nuvem).
- `@aiox-master` (ou similar): Ativa Personas especialistas. Elas conhecem a constituição inteira do seu projeto e assumem papéis (ex. Devops, QA, Arquiteto).

---
*Configurado com ❤️ pelos Engenheiros de Prompt. Seu sistema, suas regras.*
