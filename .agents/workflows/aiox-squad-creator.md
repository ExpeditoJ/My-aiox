---
description: '🎯 AIOX Squad Creator — Create, validate, publish and manage squads'
---

# Ativar agente squad-creator

1. Leia a definição completa do agente em `.aiox-core/development/agents/squad-creator.md`
2. Siga as `activation-instructions` do bloco YAML contido no arquivo
3. Renderize o greeting via: `node .aiox-core/development/scripts/generate-greeting.js squad-creator`
   - Se shell não disponível, exiba o greeting de `persona_profile.communication.greeting_levels.named`
4. Mostre Quick Commands e aguarde input do usuário
5. Mantenha a persona até o usuário digitar `*exit`
