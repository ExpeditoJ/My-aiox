# 🎮 Guia Completo: Mercado de Mods do Minecraft

## De Zero a Negócio — Automação, Outreach & Monetização

> Gerado por Orion (AIOX Master Orchestrator) — Abril 2026

---

# PARTE 1: O MERCADO

## 📊 Entendendo o Mercado

### O Mercado de Modding em Números

| Métrica                               | Valor                         |
| ------------------------------------- | ----------------------------- |
| Tamanho do mercado global de modding  | ~$5.5B/ano (2025)             |
| Crescimento anual                     | ~12-15%                       |
| Mods baixados só no Nexus Mods        | 15+ bilhões (total histórico) |
| CurseForge downloads/mês              | ~800 milhões                  |
| Creators que ganham dinheiro com mods | ~50,000 ativos globalmente    |
| Top modders (Minecraft)               | $10k-$50k/mês                 |

### Os 4 Segmentos de Dinheiro no Minecraft

| Segmento              | Receita Potencial | Investimento Inicial   | Tempo até 1ª receita | Skill principal      |
| --------------------- | ----------------- | ---------------------- | -------------------- | -------------------- |
| Mods individuais      | $100-5k/mês       | $0                     | 1-3 meses            | Java/JavaScript      |
| Modpacks              | $1k-25k/mês       | $0                     | 2-4 meses            | Curadoria + Config   |
| Servidores            | $5k-500k/mês      | $20-100/mês (hosting)  | 1-2 meses            | Sysadmin + Marketing |
| Marketplace (Bedrock) | $100k-1M+/ano     | $0 (precisa aprovação) | 6-12 meses           | Arte + Dev           |

### Jogos com Maior Ecossistema de Mods

| Tier | Jogo                      | Tamanho do mercado                       | Linguagem de Modding       |
| ---- | ------------------------- | ---------------------------------------- | -------------------------- |
| S    | **Minecraft**             | Gigantesco — o maior de todos            | Java, JavaScript (Bedrock) |
| S    | **Skyrim / Fallout**      | Massivo — Nexus Mods domina              | Papyrus, C++ (SKSE)        |
| A    | **GTA V** (FiveM)         | Enorme — servidores RP são indústria     | Lua, C#                    |
| A    | **Garry's Mod**           | Clássico — Workshop gigante              | Lua                        |
| A    | **Cities: Skylines**      | Premium — mods vendem no DLC level       | C#                         |
| A    | **Stardew Valley**        | Comunidade leal e ativa                  | C# (SMAPI)                 |
| B    | **Project Zomboid**       | Crescendo rápido — Build 42 vai explodir | Lua                        |
| B    | **Factorio**              | Nicho mas hardcore e dedicado            | Lua                        |
| B    | **RimWorld**              | Muito ativo, comunidade generosa         | C#                         |
| B    | **Terraria** (tModLoader) | Grande e crescendo                       | C#                         |

### Plataformas de Distribuição

| Plataforma           | Foco                                | Monetização                     |
| -------------------- | ----------------------------------- | ------------------------------- |
| **CurseForge**       | Minecraft, WoW, outros              | Programa de pontos por download |
| **Modrinth**         | Minecraft (alternativa open-source) | Payouts por download            |
| **Nexus Mods**       | Bethesda, gerais                    | Donation Points + Premium       |
| **Steam Workshop**   | Qualquer jogo Steam                 | Limitado                        |
| **Planet Minecraft** | Minecraft exclusivo                 | Ads apenas                      |
| **Patreon / Ko-fi**  | Qualquer                            | Assinatura direta               |
| **GitHub**           | Open source                         | Sponsors apenas                 |

### Cadeia de Valor do Mercado

```
Modder individual
  → Cria mod gratuito
  → Ganha por downloads (CurseForge/Modrinth)
  → Abre Patreon pra early access
  ↓
Modpack Creator
  → Curadoria de 50-200 mods
  → Config + integração + balanceamento
  → Distribui no CurseForge/ATLauncher
  → Ganha por downloads + Patreon
  ↓
Server Owner
  → Usa modpack + customização
  → Cobra VIP/cosmetics dos jogadores
  → Maior receita da cadeia
  ↓
Content Creator (YouTube/Twitch)
  → Joga o modpack/server
  → Monetiza via ads + sponsors
  → Impulsiona downloads → beneficia todos acima
```

### Oportunidades de Mercado em 2026

| Oportunidade                 | Por quê                                          | Potencial  |
| ---------------------------- | ------------------------------------------------ | ---------- |
| **Project Zomboid Build 42** | Multiplayer novo + hype                          | Alto       |
| **Minecraft 1.22+**          | Cada update reseta o mercado de mods             | Alto       |
| **GTA VI + FiveM 2.0**       | Novo GTA = nova febre de RP servers              | Muito Alto |
| **Modpacks com IA**          | Mods que usam GPT/AI para NPCs, quests dinâmicas | Alto       |
| **Palworld modding**         | Comunidade nascendo, pouca competição            | Médio      |
| **Ferramentas para modders** | Tools que facilitam criar mods                   | Médio      |

---

# PARTE 2: ROADMAP DO ZERO AO PRIMEIRO $1,000

## Fase 1 — Fundação (Semana 1-2)

### 1.1 Escolha seu nicho

Não tente ser genérico. Escolha UM foco:

| Nicho                  | Público | Competição | Exemplo                               |
| ---------------------- | ------- | ---------- | ------------------------------------- |
| **Quality of Life**    | Enorme  | Média      | Inventory sorting, minimap, waypoints |
| **Tech/Automação**     | Grande  | Alta       | Máquinas, energy, pipes               |
| **Magic/RPG**          | Grande  | Alta       | Spells, classes, dungeons             |
| **Building/Decoração** | Enorme  | Média      | Blocos decorativos, furniture         |
| **Performance**        | Enorme  | Baixa      | Optimization mods (tipo Sodium)       |
| **Adventure/Dungeons** | Grande  | Média      | Estruturas, mobs, bosses              |
| **Utility/Tools**      | Enorme  | Média      | Dev tools, config editors             |
| **Hardcore/Survival**  | Médio   | Baixa      | Dificuldade, realismo, seasons        |

**Melhor estratégia para iniciantes:** Comece com mods de Quality of Life ou Utility. São os mais baixados, mais fáceis de criar e resolvem problemas reais. A competição é menor do que parece porque muitos mods populares estão abandonados.

### 1.2 Setup Técnico

**Java Edition (Forge/Fabric/NeoForge):**

- JDK 21+ (Java Development Kit)
- IntelliJ IDEA Community (IDE gratuita)
- Minecraft Development Plugin (IntelliJ)
- Git + GitHub (versionamento)
- Gradle (build system — já vem nos templates)

**Escolha o mod loader:**

| Loader                          | Prós                        | Contras                     | Recomendação       |
| ------------------------------- | --------------------------- | --------------------------- | ------------------ |
| **Fabric**                      | Leve, rápido, moderno       | Menor comunidade            | Melhor pra começar |
| **NeoForge**                    | Fork do Forge, futuro       | Ainda estabilizando         | Espere um pouco    |
| **Forge**                       | Maior comunidade, mais mods | Pesado, lento pra atualizar | Legacy             |
| **Multi-loader** (Architectury) | Publica pra todos           | Mais complexo               | Avançado           |

### 1.3 Crie suas contas (todas gratuitas)

- GitHub — Repositório do código (open source = mais confiança)
- CurseForge — Distribuição principal + monetização
- Modrinth — Distribuição secundária + monetização
- Discord — Servidor do seu mod (comunidade)
- Twitter/X — Marketing e networking
- YouTube — Showcases e tutoriais do mod

---

## Fase 2 — Primeiro Mod (Semana 2-4)

### 2.1 O que criar como primeiro mod

**A regra de ouro:** Seu primeiro mod deve resolver um problema que VOCÊ MESMO tem jogando Minecraft. Se te incomoda, incomoda milhares de outros jogadores.

**Ideias comprovadas de alto download:**

| Ideia                                               | Downloads esperados (6 meses) | Dificuldade |
| --------------------------------------------------- | ----------------------------- | ----------- |
| Better death screen (mostra coords, itens perdidos) | 100k-500k                     | Fácil       |
| Auto-replant (replanta colheita automaticamente)    | 200k-1M                       | Fácil       |
| Inventory profiles (salva loadouts)                 | 300k-1M                       | Médio       |
| Mob health bars                                     | 500k-2M                       | Fácil       |
| Better enchantment UI                               | 200k-800k                     | Médio       |
| Chunk loader acessível                              | 300k-1M                       | Médio       |
| Recipe conflict viewer                              | 100k-300k                     | Médio       |
| Server performance monitor                          | 50k-200k                      | Médio       |

### 2.2 Estrutura do projeto

```
meu-mod/
├── src/main/
│   ├── java/com/seuname/meumod/
│   │   ├── MeuMod.java          (entry point)
│   │   ├── config/               (configurações)
│   │   ├── client/               (rendering, UI)
│   │   └── mixin/                (hooks no código vanilla)
│   └── resources/
│       ├── fabric.mod.json       (metadata)
│       ├── assets/               (texturas, lang)
│       └── data/                 (recipes, tags)
├── build.gradle                  (build config)
├── gradle.properties             (versões)
├── README.md                     (documentação)
├── CHANGELOG.md                  (histórico)
└── LICENSE                       (MIT ou LGPL)
```

### 2.3 Publicação

**CurseForge:**

1. Crie o projeto em authors.curseforge.com
2. Preencha: título, descrição (detalhada!), screenshots, icon
3. Upload do .jar
4. Marque as versões do MC compatíveis
5. Escolha a licença

**Modrinth:**

1. Mesmo processo em modrinth.com/dashboard
2. Pode sincronizar releases via GitHub Actions

**Publique nos dois (CurseForge + Modrinth).** CurseForge paga mais por download, Modrinth cresce mais rápido. Não escolha um — use os dois.

---

## Fase 3 — Crescimento (Mês 2-4)

### 3.1 Otimização da página do mod

**Título:**

- Inclua keywords: "Better X", "Enhanced X", "Simple X"
- Ex: "Better Death Screen - Coords, Items & Respawn"

**Descrição — formato ideal:**

```markdown
## O que este mod faz

[GIF animado mostrando o mod em ação — OBRIGATÓRIO]

## Features

- Feature 1 (com screenshot)
- Feature 2 (com screenshot)
- Feature 3

## Compatibilidade

- Fabric 1.20.x, 1.21.x
- Forge (em breve)
- Funciona com: Sodium, Iris, ModMenu

## FAQ

Perguntas frequentes aqui

## Suporte

[Link Discord] | [Link GitHub Issues]
```

**O que faz download disparar:**

- GIF animado como primeira coisa na descrição (90% dos mods não têm)
- Screenshots de alta qualidade com shaders
- Tags corretas no CurseForge
- Changelog a cada update (mostra que é ativo)
- Responder issues rápido no GitHub

### 3.2 Updates frequentes = Algoritmo te favorece

```
Frequência ideal:
- Update a cada 1-2 semanas (mesmo que pequeno)
- Suporte de nova versão do MC em até 48h do lançamento
- CurseForge/Modrinth empurram mods recém-atualizados no ranking
```

---

# PARTE 3: OUTREACH & MARKETING

## Canais de Divulgação (ordenados por impacto)

### 1. Reddit (MAIOR impacto gratuito)

| Subreddit      | Membros | O que postar            |
| -------------- | ------- | ----------------------- |
| r/Minecraft    | 9M+     | Showcase visual do mod  |
| r/feedthebeast | 500k+   | Announcement + features |
| r/fabricmc     | 100k+   | Release post técnico    |
| r/MinecraftMod | 50k+    | WIP posts, betas        |
| r/admincraft   | 100k+   | Se for server-side mod  |

**Template de post que funciona:**

```
Título: "I made a mod that [benefício óbvio] - [nome do mod]"

Corpo:
- GIF/vídeo curto (15-30 seg) mostrando o mod
- 3 bullet points do que faz
- Link de download
- "What features would you want to see?"
```

A pergunta no final é CRUCIAL. Reddit recompensa engagement (comentários). Pedir feedback gera comentários = post sobe no ranking.

### 2. YouTube (Médio-longo prazo)

**Dois tipos de vídeo:**

| Tipo         | Formato                                  | Objetivo                          |
| ------------ | ---------------------------------------- | --------------------------------- |
| **Showcase** | 2-5 min mostrando o mod em ação          | Links na descrição = downloads    |
| **Dev log**  | 5-15 min mostrando o processo de criação | Constrói comunidade de seguidores |

**YouTubers que fazem reviews de mods (contate-os):**

- AsianHalfSquat (~500k subs) — maior reviewer de mods
- ChosenArchitect (~1M) — modpacks
- Direwolf20 (~1M) — tech mods
- Vazkii (criador do Botania) — retweeta mods bons
- SystemZee (~2M) — mods criativos

**Email template para YouTuber:**

```
Subject: New [Fabric/Forge] Mod — [Nome] (Minecraft 1.21)

Hey [nome],

I made [nome do mod] — it [benefício em 1 frase].

Quick highlights:
- [Feature 1]
- [Feature 2]
- [Feature 3]

Here's a 30-second preview: [link do GIF/vídeo]
Download: [CurseForge link]

Would love to hear your thoughts. No pressure for a video,
but if you think your audience would enjoy it, feel free!

Cheers,
[seu nome]
```

### 3. Discord (Comunidade + Retenção)

**Servidores para divulgar:**

| Servidor               | Como usar                        |
| ---------------------- | -------------------------------- |
| Fabric Discord         | Canal #showcase — poste releases |
| Forge Discord          | Canal #mods                      |
| Quilt Discord          | Se suportar Quilt                |
| Minecraft Modding      | Geral                            |
| **Seu próprio server** | Hub central da comunidade        |

**Estrutura do seu Discord:**

```
📢 announcements    — releases e updates
💬 general          — chat geral
🐛 bug-reports      — issues
💡 suggestions      — features pedidas pela comunidade
📸 screenshots      — jogadores mostram usando o mod
🔧 dev-chat         — pra quem quer contribuir
```

### 4. Twitter/X (Networking)

**Quem seguir e interagir:**

- Desenvolvedores de mods populares
- Modpack creators
- MC YouTubers
- @fabricmc, @NeoForged (contas oficiais)

**O que postar:**

- GIFs de desenvolvimento "WIP do novo mod!"
- Screenshots com shaders
- Polls "Qual feature vocês querem?"
- Respostas a outros modders (networking)

**Não postar:** "Download my mod please" (spam), Texto sem imagem (ninguém engaja)

### 5. Inclusão em Modpacks (EXPLOSÃO de downloads)

Esse é o canal #1 de crescimento passivo. Um mod incluído em modpacks populares ganha milhões de downloads sem esforço.

**Como ser incluído:**

1. Torne seu mod compatível com os mods mais usados (JEI, Sodium, etc.)
2. Licença permissiva (MIT) — pack creators evitam mods com licença restritiva
3. Contate pack creators diretamente

**Maiores modpacks para contatar:**

- All The Mods (ATM9, ATM10) — ~5M downloads
- Better Minecraft — ~10M downloads
- RLCraft — ~15M downloads
- Enigmatica — ~3M downloads
- Create: Above & Beyond — ~5M downloads

---

# PARTE 4: MONETIZAÇÃO

## Modelos de Monetização

### 1. Por Downloads (Passivo)

```
CurseForge: ~$3-5 por 1000 downloads
Modrinth:   ~$2-4 por 1000 downloads

Mod popular (1M downloads/mês) = $3,000-5,000/mês passivo
```

### 2. Patreon/Membership (Recorrente)

```
Early access a versões novas
Builds exclusivas
Votação em features
Custom configs

Top modders: 500-5,000 patrons = $2,000-25,000/mês
```

### 3. Server Packs Customizados (Serviço)

```
Modpack montado sob medida para servidores
Inclui: seleção, configs, integração, balanceamento
Preço: $200-2,000 por pack customizado
Manutenção mensal: $50-300/mês
```

### 4. Minecraft Marketplace (Bedrock)

```
Microsoft/Mojang Marketplace para Bedrock Edition
Precisa ser "Minecraft Partner" aprovado
Vende: skins, maps, textures, mashups
Top creators: $100k-$1M+/ano
Barreira de entrada: alta (aprovação + qualidade AAA)
```

### 5. Servidores Monetizados

```
Minecraft Servers: Top networks = $50,000-500,000/mês
Modelo: VIP, cosméticos, ranks, loot boxes
```

### Timeline Realista de Receita

```
Mês 1-2:   $0-50      (construindo, primeiros uploads)
Mês 3-4:   $50-200    (tração orgânica começando)
Mês 5-8:   $200-1000  (se mod for bom + marketing)
Mês 9-12:  $500-3000  (múltiplos mods + Patreon)
Ano 2+:    $1000-10k+ (portfólio + modpack + server)
```

### Multiplicadores de Receita

| Estratégia                   | Multiplicador        |
| ---------------------------- | -------------------- |
| Publicar só CurseForge       | 1x (baseline)        |
| + Modrinth                   | 1.3x                 |
| + Patreon (early access)     | 2-3x                 |
| + Múltiplos mods (portfólio) | 3-5x                 |
| + Modpack próprio            | 5-10x                |
| + Servidor monetizado        | 10-50x               |
| + YouTube dev logs           | 2x (ads + awareness) |

### Como Configurar o Patreon

```
Tier Gratuito: Acesso ao Discord
Tier $3/mês:   Early access (releases 1 semana antes)
Tier $5/mês:   Votar em features + role no Discord
Tier $10/mês:  Configs customizadas + suporte prioritário
Tier $25/mês:  Seu nome nos créditos do mod
```

---

# PARTE 5: ESCALANDO

## Do Primeiro Mod ao Negócio

```
NÍVEL 1: Um mod
    ↓
NÍVEL 2: Portfólio (3-5 mods no mesmo nicho)
    ↓
NÍVEL 3: Modpack próprio usando seus mods como core
    ↓
NÍVEL 4: Servidor oficial do seu modpack
    ↓
NÍVEL 5: Brand (site, merch, YouTube, comunidade)
    ↓
NÍVEL 6: Studio (contrata outros devs, múltiplos projetos)
```

**Exemplos reais de quem fez isso:**

- **Simion** (Create mod) — de 1 mod pra um dos maiores da história
- **Vazkii** (Botania, Quark) — portfólio de mods, agora na Violet Moon
- **CFB Team** (Cobblemon) — de mod pra studio com 15+ devs

---

# PARTE 6: AUTOMAÇÃO DO PIPELINE

## O que pode ser automatizado vs. manual

**Automatizável (80%):**

- Scaffolding do mod
- Build e compile
- Upload CurseForge/Modrinth
- Changelog generation
- GitHub Actions CI/CD
- Discord announcements
- Screenshot automation
- Descrição/copy generation
- Analytics dashboard
- Email outreach (bulk)
- Social media posts
- Version bumping

**Manual (20%):**

- Design da ideia/conceito
- Gameplay testing
- Responder feedback
- Networking genuíno
- Decisões de game design
- Negociações com pack creators

## GitHub Actions CI/CD (Automatização Core)

```yaml
# .github/workflows/mod-release.yml
name: Mod Release Pipeline
on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
      - run: ./gradlew build

  publish-curseforge:
    needs: build
    steps:
      - uses: itsmeow/curseforge-upload@v3
        with:
          token: ${{ secrets.CF_TOKEN }}
          project_id: '123456'
          game_versions: '1.21,1.21.1'
          file_path: build/libs/mod.jar

  publish-modrinth:
    needs: build
    steps:
      - uses: Kir-Antipov/mc-publish@v3
        with:
          modrinth-id: abcdef
          modrinth-token: ${{ secrets.MODRINTH_TOKEN }}

  announce:
    needs: [publish-curseforge, publish-modrinth]
    steps:
      - uses: sarisia/actions-status-discord@v1
        with:
          webhook: ${{ secrets.DISCORD_WEBHOOK }}
          title: 'Nova versão: ${{ github.ref_name }}'
```

**Resultado:** git tag v1.0.0 && git push --tags e TUDO acontece sozinho.

## APIs que Conectam Tudo

| API                   | O que permite                     | Auth             |
| --------------------- | --------------------------------- | ---------------- |
| **CurseForge API**    | Upload, stats, gerenciar projetos | API Key gratuita |
| **Modrinth API**      | Upload, stats, search             | OAuth/Token      |
| **GitHub API**        | Releases, issues, actions         | PAT              |
| **Discord Webhooks**  | Announcements automáticos         | Webhook URL      |
| **Twitter/X API**     | Posts automáticos                 | OAuth 2.0        |
| **Reddit API**        | Posts (com cuidado — anti-spam)   | OAuth 2.0        |
| **SendGrid / Resend** | Emails de outreach                | API Key          |

## Pipeline Automatizado Completo

```
Você escreve código
     ↓
git commit + git push
     ↓ (GitHub Actions dispara)
┌─────────────────────────────────┐
│ 1. Build (Gradle)               │
│ 2. Testes automáticos           │
│ 3. Gera changelog (AI)          │
│ 4. Upload CurseForge            │
│ 5. Upload Modrinth              │
│ 6. Create GitHub Release        │
│ 7. Post Discord (webhook)       │
│ 8. Post Twitter/X (API)         │
│ 9. Email lista de YouTubers     │
│ 10. Atualiza analytics dash     │
└─────────────────────────────────┘
     ↓
Tudo publicado e divulgado — zero cliques
```

## Ferramentas Externas

| Ferramenta                     | O que faz                                    | Preço    |
| ------------------------------ | -------------------------------------------- | -------- |
| **mc-publish** (GitHub Action) | Publica em CF + Modrinth + GitHub de uma vez | Grátis   |
| **Packwiz**                    | Gerencia modpacks como código                | Grátis   |
| **CurseForge Studio**          | Interface visual pra gerenciar mods          | Grátis   |
| **Modstats.org**               | Analytics público de mods                    | Grátis   |
| **Minotaur** (Gradle plugin)   | Upload pra Modrinth via Gradle               | Grátis   |
| **CurseGradle**                | Upload pra CurseForge via Gradle             | Grátis   |
| **n8n / Make**                 | Automação visual (conecta tudo)              | Freemium |
| **Lemlist / Instantly**        | Email outreach automatizado                  | ~$30/mês |

---

# CHECKLIST DE LANÇAMENTO

## Pré-Lançamento

- [ ] Mod funcional e testado no MC mais recente
- [ ] GIF animado de 15-30 segundos
- [ ] 3-5 screenshots com shaders
- [ ] README.md completo no GitHub
- [ ] Ícone do mod (128x128, atrativo)
- [ ] Changelog escrito

## Lançamento

- [ ] Upload CurseForge (descrição completa)
- [ ] Upload Modrinth (pode copiar descrição)
- [ ] Post no Reddit (r/feedthebeast + r/fabricmc)
- [ ] Tweet com GIF
- [ ] Post no Discord Fabric/Forge
- [ ] Anúncio no seu Discord

## Pós-Lançamento (Semana 1)

- [ ] Responder TODOS os comentários e issues
- [ ] Email para 3-5 YouTubers
- [ ] Contatar 2-3 modpack creators
- [ ] Planejar próximo update baseado no feedback

---

_Documento gerado pela plataforma AIOX — Synkra_
_Orion (Master Orchestrator) — abril 2026_
