# Índice de Documentação de Padrões do AIOX

**Versão:** 2.1.0
**Última Atualização:** 2025-12-09
**Status:** Referência Oficial

---

## 📋 Guia de Início Rápido

### Para Novos Contribuidores

1. **Comece Aqui:** Leia [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md) - Guia completo do framework
2. **Criação de Stories:** Siga [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md)
3. **Quality Gates:** Compreenda [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md)

### Para Usuários Existentes

- **Migração v2.0 → v4.0.4:** Veja a seção "O que há de novo" em [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md)
- **Mudanças de Arquitetura:** Revise [ARCHITECTURE-INDEX.md](../../docs/architecture/ARCHITECTURE-INDEX.md)

---

## 📚 Padrões por Categoria

### Padrões Core do Framework (Atual v4.2)

| Documento                                                                        | Descrição                               | Status                | Versão |
| -------------------------------------------------------------------------------- | --------------------------------------- | --------------------- | ------ |
| [AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md](./AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md)     | **Guia completo do framework v4.2**     | ✅ Atual              | 2.1.0  |
| [QUALITY-GATES-SPECIFICATION.md](./QUALITY-GATES-SPECIFICATION.md)               | Sistema de quality gates em 3 camadas   | ✅ Atual              | 2.1.0  |
| [STORY-TEMPLATE-V2-SPECIFICATION.md](./STORY-TEMPLATE-V2-SPECIFICATION.md)       | Especificação do template de story v2.0 | ✅ Atual              | 2.0.0  |
| [TASK-FORMAT-SPECIFICATION-V1.md](./TASK-FORMAT-SPECIFICATION-V1.md)             | Formato Task-First de arquitetura       | ✅ Atual              | 1.0.0  |
| [EXECUTOR-DECISION-TREE.md](./EXECUTOR-DECISION-TREE.md)                         | Roteamento Humano/Worker/Agente/Clone   | ✅ Atual              | 1.0.0  |
| [OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md](./OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md) | Documentação do modelo de negócios      | ⚠️ Requer Atualização | 2.0.0  |

### Padrões de Agente

| Documento                                                                      | Descrição                          | Status   | Versão |
| ------------------------------------------------------------------------------ | ---------------------------------- | -------- | ------ |
| [AGENT-PERSONALIZATION-STANDARD-V1.md](./AGENT-PERSONALIZATION-STANDARD-V1.md) | Sistema de personalidade de agente | ✅ Atual | 1.0.0  |

### Visual e Branding

| Documento                                                                        | Descrição                  | Status   | Versão |
| -------------------------------------------------------------------------------- | -------------------------- | -------- | ------ |
| [AIOX-COLOR-PALETTE-V2.1.md](./AIOX-COLOR-PALETTE-V2.1.md)                       | Sistema completo de cores  | ✅ Atual | 2.1.0  |
| [AIOX-COLOR-PALETTE-QUICK-REFERENCE.md](./AIOX-COLOR-PALETTE-QUICK-REFERENCE.md) | Referência rápida de cores | ✅ Atual | 2.1.0  |

### Documentos Legados (Apenas Referência)

| Documento                                                                  | Descrição                       | Status                 | Substituído Por                     |
| -------------------------------------------------------------------------- | ------------------------------- | ---------------------- | ----------------------------------- |
| [AIOX-LIVRO-DE-OURO.md](./AIOX-LIVRO-DE-OURO.md)                           | Documento base v2.0.0           | ⚠️ Descontinuado       | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.1.md](./AIOX-LIVRO-DE-OURO-V2.1.md)                 | Delta v4.0.4 (parcial)          | ⚠️ Descontinuado       | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md](./AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md) | Resumo v4.0.4                   | ⚠️ Descontinuado       | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md](./AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md) | Planejamento futuro v2.2        | 📋 Rascunho            | N/A                                 |
| [AIOX-FRAMEWORK-MASTER.md](./AIOX-FRAMEWORK-MASTER.md)                     | Documento do framework v2.0.0   | ⚠️ Descontinuado       | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md |
| [V3-ARCHITECTURAL-DECISIONS.md](./V3-ARCHITECTURAL-DECISIONS.md)           | Decisões antigas de arquitetura | 📦 Candidato a Arquivo | Documentos de arquitetura atuais    |

---

## 🔄 O que Mudou na v4.2

### Novos Documentos Criados

| Documento                           | Propósito                     |
| ----------------------------------- | ----------------------------- |
| AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md | Documentação v4.2 consolidada |
| QUALITY-GATES-SPECIFICATION.md      | Quality gates de 3 camadas    |
| STORY-TEMPLATE-V2-SPECIFICATION.md  | Template de story v2.0        |
| STANDARDS-INDEX.md                  | Este documento de navegação   |

### Principais Mudanças de Terminologia

| Termo Antigo  | Novo Termo         | Documentos Afetados      |
| ------------- | ------------------ | ------------------------ |
| Squad         | **Squad**          | Todos os padrões         |
| Squads/       | **squads/**        | Referências de diretório |
| pack.yaml     | **squad.yaml**     | Referências de manifesto |
| @expansion/\* | **@aiox/squad-\*** | Escopo de npm            |
| 16 Agents     | **11 Agents**      | Contagem de agentes      |

### Conceitos Adicionados

| Conceito               | Descrição                                              | Documentado Em                   |
| ---------------------- | ------------------------------------------------------ | -------------------------------- |
| Modular Architecture   | 4 módulos (core, development, product, infrastructure) | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |
| Multi-Repo Strategy    | 3 repositórios públicos + 2 privados                   | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |
| Quality Gates 3 Layers | Automação pré-commit, PR, Revisão Humana               | QUALITY-GATES-SPECIFICATION      |
| Story Template v2.0    | Decisões Inter-Stories, Integração CodeRabbit          | STORY-TEMPLATE-V2-SPECIFICATION  |
| npm Scoping            | @aiox/core, @aiox/squad-\*                             | AIOX-LIVRO-DE-OURO-V2.1-COMPLETE |

---

## 📂 Organização de Documentos

### Estrutura do Diretório de Padrões

```
.aiox-core/docs/standards/
├── STANDARDS-INDEX.md                     # Este arquivo - navegação
│
├── Padrões Atuais v4.2
│   ├── AIOX-LIVRO-DE-OURO-V2.1-COMPLETE.md  # Guia completo v4.2
│   ├── QUALITY-GATES-SPECIFICATION.md       # Quality gates
│   ├── STORY-TEMPLATE-V2-SPECIFICATION.md   # Template de story
│   ├── TASK-FORMAT-SPECIFICATION-V1.md      # Formato de tasks
│   ├── EXECUTOR-DECISION-TREE.md            # Roteamento de executores
│   ├── AGENT-PERSONALIZATION-STANDARD-V1.md # Personalidades de agentes
│   ├── AIOX-COLOR-PALETTE-V2.1.md           # Sistema de cores
│   └── AIOX-COLOR-PALETTE-QUICK-REFERENCE.md
│
├── Legados (Apenas Referência)
│   ├── AIOX-LIVRO-DE-OURO.md              # Base v2.0.0 (descontinuado)
│   ├── AIOX-LIVRO-DE-OURO-V2.1.md         # Delta v4.0.4 (descontinuado)
│   ├── AIOX-LIVRO-DE-OURO-V2.1-SUMMARY.md # Resumo v4.0.4 (descontinuado)
│   ├── AIOX-FRAMEWORK-MASTER.md           # v2.0.0 (descontinuado)
│   └── V3-ARCHITECTURAL-DECISIONS.md      # Candidato a arquivo
│
├── Requer Atualização
│   └── OPEN-SOURCE-VS-SERVICE-DIFFERENCES.md # Atualizar c/ multi-repo
│
└── Planejamento Futuro
    └── AIOX-LIVRO-DE-OURO-V2.2-SUMMARY.md    # Rascunho v2.2
```

---

## 🔗 Documentação Relacionada

### Documentação de Arquitetura

Localizada em `docs/architecture/`:

| Documento                                                                        | Descrição                         |
| -------------------------------------------------------------------------------- | --------------------------------- |
| [ARCHITECTURE-INDEX.md](../../docs/architecture/ARCHITECTURE-INDEX.md)           | Navegação dos docs de arquitetura |
| [high-level-architecture.md](../../docs/architecture/high-level-architecture.md) | Visão geral de alto nível         |
| [module-system.md](../../docs/architecture/module-system.md)                     | Arquitetura de 4 módulos          |
| [multi-repo-strategy.md](../../docs/architecture/multi-repo-strategy.md)         | Guia de multi-repositório         |

### Documentação do Projeto

Localizada em `docs/`:

| Diretório         | Conteúdos                               |
| ----------------- | --------------------------------------- |
| `docs/stories/`   | Stories de desenvolvimento (Sprint 1-6) |
| `docs/epics/`     | Documentos de planejamento de épicos    |
| `docs/decisions/` | Registros de decisões (ADR, PMDR, DBDR) |

---

## 📝 Legenda de Status de Documentos

| Status                 | Significado                         | Ação                   |
| ---------------------- | ----------------------------------- | ---------------------- |
| ✅ Atual               | Atualizado com a v4.2               | Usar como referência   |
| ⚠️ Descontinuado       | Substituído por documento mais novo | Consulte substituto    |
| ⚠️ Requer Atualização  | Conteúdo desatualizado              | Atualização planejada  |
| 📦 Candidato a Arquivo | Deve ser arquivado                  | Mover para \_archived/ |
| 📋 Rascunho            | Trabalho em andamento               | Não é oficial ainda    |

---

## 🚀 Mantendo Padrões

### Quando Atualizar Padrões

1. **Novas features** que alteram o comportamento do framework
2. **Mudanças de terminologia** (como Squad → Squad)
3. **Mudanças de arquitetura** (como arquitetura modular)
4. **Mudanças de processo** (como Quality Gates)

### Processo de Atualização

1. Crie uma story para atualização da documentação
2. Atualize documentos relevantes
3. Atualize o STANDARDS-INDEX.md
4. Atualize o Log de Mudanças em cada documento
5. Rode a validação (verificação de links, verificação de terminologia)

### Comandos de Validação

```bash
# Procurar por links quebrados
find .aiox-core/docs/standards -name "*.md" -exec markdown-link-check {} \;

# Procurar por terminologia descontinuada
grep -r "squad" .aiox-core/docs/standards --include="*.md"
grep -r "Squad" .aiox-core/docs/standards --include="*.md"

# Verificar números de versão
grep -r "v2.0" .aiox-core/docs/standards --include="*.md"
```

---

## 📜 Log de Mudanças

| Data       | Versão | Mudanças                                     | Autor      |
| ---------- | ------ | -------------------------------------------- | ---------- |
| 2025-12-09 | 2.1.0  | Criação inicial do STANDARDS-INDEX para v4.2 | @dev (Dex) |

---

**Última Atualização:** 2025-12-09
**Versão:** 2.1.0
**Mantenedor:** @po (Pax)
