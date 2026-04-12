# Guia de Configuração AIOX Local-First 🚀

Este guia explica como o AIOX gerencia a Inteligência Artificial no seu PC e como você pode ajustar as configurações para o seu hardware (como sua GTX 1650 de 4GB).

## 1. O Conceito: Local-First c/ Cloud Failover

O AIOX prioriza rodar tudo no seu PC usando o **Ollama**. Isso garante privacidade, velocidade e custo zero. Se a tarefa for pesada demais (muitos arquivos), ele rotaciona automaticamente para a nuvem.

## 2. Gaming Mode (Proteção de VRAM) 🎮

Nós configuramos um sistema de **limpeza agressiva**.

- Quando você inicia o AIOX, o motor acorda.
- Quando você fecha o terminal ou digita `/exit`, o comando `taskkill` caça todos os processos do Ollama.
- **Resultado:** Sua Placa de Vídeo fica 100% livre para jogos instantaneamente.

## 3. Calibrando o "Hybrid Router" ⚡

O arquivo `scripts/api-pool-proxy.js` decide quando usar a nuvem. Atualmente está calibrado para **60KB**.

- **Hardware c/ 4GB VRAM:** Mantenha entre 30KB e 60KB.
- **Hardware c/ 8GB+ VRAM:** Pode subir para 100KB+.

Para alterar, edite a linha:

```javascript
if (raw.length > 60000 && p.provider === 'ollama') {
```

## 4. Gerenciando Modelos

Você pode alternar os modelos no arquivo `.aiox-core/local/api-pool.json`.

- **Recomendado para GTX 1650:** `qwen2.5-coder:3b` (Equilíbrio perfeito).
- **Para codificação complexa (mais lento):** `qwen2.5-coder:7b`.

## 5. Comandos de Diagnóstico

No seu terminal AIOX, você pode usar:

- `aiox status`: Mostra a saúde do motor local, VRAM e pool de APIs.
- `ollama list`: Lista quais cérebros estão baixados no seu PC.
- `aiox voice --local`: (Se disponível) Inicia o modo de voz usando o motor local.

## 6. Suporte a Voz Local (Microfone) 🎤

O AIOX agora suporta o uso do microfone 100% local.
Para ativar, você precisa de um servidor Whisper compatível com a API do OpenAI rodando localmente.

### Como configurar:

1. **Instale um Servidor Whisper:** Recomendamos o `faster-whisper-server` ou similar.
2. **Configure o Proxy:** No seu terminal, defina as variáveis de ambiente:
   ```bash
   set AIOX_VOICE_LOCAL=true
   set VOICE_STREAM_BASE_URL=http://localhost:3100/v1/audio/transcriptions
   ```
3. **Hardware (VRAM):** O Whisper (modelo `base` ou `small`) consome cerca de 1GB a 2GB de VRAM. Monitore o uso se estiver rodando o LLM ao mesmo tempo em uma GTX 1650.

---

_AIOX Master Framework — Orquestrando o futuro local._
