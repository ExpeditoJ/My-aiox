# [TASK] Neural Spawner Protocol (Mind-to-Muscle)

Este protocolo define como o **Cérebro/Mente (Antigravity)** deve delegar tarefas pesadas ou paralelas para o **Músculo (OpenClaude)**.

## 🧠 Intencionalidade da Mente

Use este protocolo quando:

- A tarefa for demorada (> 2 min).
- For necessária execução paralela (ex: rodar testes enquanto planeja a próxima story).
- A tarefa for de automação externa (Discord, Web Scraping profundo).
- O hardware local (GTX 1650) precisar de foco exclusivo no motor Gemma/Ollama sem bloquear a interface de chat.

## 🦾 Fluxo de Execução (Spawn)

1. **Identificação**: Determine qual agente do AIOX é o melhor para a tarefa (`@dev`, `@qa`, `@architect`).
2. **Payload**: Formate a instrução de forma clara e autocontida.
3. **Disparo**: Utilize a ferramenta `spawn_muscle` com a instrução e o ID do agente.
4. **Handoff**: O músculo deve registrar o resultado no Obsidian Vault ou via `antigravity-bridge`.

## 📋 Modelo de Comando

```javascript
spawn_muscle({
  instruction:
    "Analise a estabilidade do modpack Minecraft 1.20.1 buscando conflitos entre os 116 mods e gere um relatório em 'My Games/Auditoria-Mods.md'",
  agent: 'qa',
});
```

## 🔄 Monitoramento

- Verifique o status via `list_active_muscles`.
- Revise os logs gerados em `.aiox-core/local/muscle-{timestamp}.log`.
- Se a tarefa falhar, tente novamente com `thinking: medium`.

---

_Protocolo v1.0 — Synkra AIOX_
