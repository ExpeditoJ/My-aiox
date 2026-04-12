const fs = require('fs');
const path = require('path');

const OLD_AGENTS_DIR = path.join(__dirname, '..', '.aiox-core', 'development', 'agents');
const OBSIDIAN_PATH = 'C:\\Users\\expea\\OneDrive\\Documentos\\DIto\\AIOX-Neural-Node';
const AGENTS_DIR = path.join(OBSIDIAN_PATH, 'Agents');
const SKILLS_DIR = path.join(OBSIDIAN_PATH, 'Skills');
const OLD_SKILLS_DIR = path.join(__dirname, '..', '.codex', 'skills');

const categories = ['FS', 'Network', 'Data', 'Web', 'Math', 'Crypto', 'OS', 'Regex', 'AI', 'Obsidian', 'React', 'DevOps', 'Security', 'Cloud', 'Design'];
const prefixes = ['analyze', 'process', 'generate', 'read', 'write', 'fetch', 'parse', 'validate', 'sync', 'deploy', 'compile', 'render', 'encrypt'];

let globalSkillList = [];

// Phase 1: Expand Massive Skill Network (3000 total)
function massiveSkillExpansion() {
    console.log('Generating additional 3000 Skills...');
    // Starts from 501
    for (let i = 501; i <= 3500; i++) {
        const category = categories[i % categories.length];
        const prefix = prefixes[i % prefixes.length];
        const skillName = `${prefix}_${category.toLowerCase()}_asset_${i}`;
        globalSkillList.push(skillName);

        const content = `---
type: skill
category: ${category}
id: ${i}
---

# 🧠 Skill: ${skillName}

## Descrição
Expansão profunda. Habilidade gerada em massa para lidar com cenários complexos de **${category}**.

## Código Otimizado
\`\`\`javascript
export async function execute_${skillName}(payload) {
    if (!payload) return { status: 'idle' };
    return {
        status: 'executed',
        data: "Neural operation completed",
        skill_id: ${i}
    };
}
\`\`\`

**Tags:** #${category.toLowerCase()} #aiox-skill
`;
        fs.writeFileSync(path.join(SKILLS_DIR, `${skillName}.md`), content, 'utf8');
    }
    console.log('✅ Generated 3000 new skills.');
}

// Map existing 500 skills to array so we can link them
function loadExistingSkills() {
    console.log('Loading existing skills references...');
    if (fs.existsSync(SKILLS_DIR)) {
        const files = fs.readdirSync(SKILLS_DIR);
        files.forEach(f => {
            if (f.endsWith('.md')) globalSkillList.push(f.replace('.md', ''));
        });
    }
}

// Helper to pull random skills
function getRandomSkills(count) {
    const list = [];
    if (globalSkillList.length === 0) return ['[[Brain_Skill]]'];
    for (let s = 0; s < count; s++) {
        const randomIdx = Math.floor(Math.random() * globalSkillList.length);
        list.push(`[[${globalSkillList[randomIdx]}]]`);
    }
    return list;
}

// Phase 2: Transpile Old AIOX Agents into Obsidian and weave them into the graph
function integrateOldAgents() {
    console.log('Integrating Legacy AIOX Agents...');
    if (fs.existsSync(OLD_AGENTS_DIR)) {
        const files = fs.readdirSync(OLD_AGENTS_DIR);
        
        files.forEach(file => {
            if (!file.endsWith('.md') && !file.endsWith('.yaml')) return;
            const content = fs.readFileSync(path.join(OLD_AGENTS_DIR, file), 'utf8');
            const agentBaseName = file.replace('.md', '').replace('.yaml', '');
            
            // Build the obsidian version with links
            const linkedSkills = getRandomSkills(15).map(s => `- ${s}`).join('\n');
            const linkedAgents = ["[[aiox-master]]", "[[neural]]", "[[dev]]", "[[ux-design-expert]]"].filter(x => !x.includes(agentBaseName));
            
            const obsidianContent = `---
type: legacy-agent
origin: aiox-core
identity: ${agentBaseName}
---

# 🧬 Legacy Agent Integration: ${agentBaseName}

Este documento representa o agente original \`${agentBaseName}\` que foi transportado para a nova Rede Neural Conjunta.

## Córtex Original (Preview)
Aqui reside a memória ancestral do agente no AIOX Local:
\`\`\`yaml
${content.substring(0, 300)}...
\`\`\`

## 🔗 Joint Network (Rede Conjunta)
Para funcionar em conjunto com toda a inteligência artificial, este agente está ligado as seguintes Skills do nosso Banco de Dados Neurais:

### Skills Atribuídas
${linkedSkills}

### Companheiros de Squad Neural
Este agente está dinamicamente linkado a colaborar com:
- ${linkedAgents.join('\n- ')}

*Integration complete. Agent is now alive inside the Graph.*
`;
            fs.writeFileSync(path.join(AGENTS_DIR, `AIOX_Legacy_${agentBaseName}.md`), obsidianContent, 'utf8');
            console.log(`Integrated: ${agentBaseName}`);
        });
    } else {
        console.log("Legacy agents dir not found.");
    }
}

// Phase 3: Create additional 200 Interconnected Agents to form the massive web
function createNetworkAgents() {
    console.log('Generating 200 Linked Agents...');
    
    for (let i = 101; i <= 300; i++) {
        const agentName = `Neural_Node_Entity_X${i}`;
        const linkedSkills = getRandomSkills(8).map(s => `- ${s}`).join('\n');
        
        // Link to legacy agents occasionally
        const linkLegacy = (i % 5 === 0) ? `\n- [[AIOX_Legacy_aiox-master]]\n- [[AIOX_Legacy_dev]]` : '';

        const content = `---
type: network-agent
level: Deep
---

# 👾 Neural Entity: ${agentName}

Este nó serve puramente para sustentar a capacidade de raciocínio da rede conjunta do AIOX.

## Skills Dominadas
${linkedSkills}

## Relacionamentos Principais
- [[Neural_Agent_Architect_001]]
- [[Neural_Agent_QA_002]]${linkLegacy}

*Conector gerado pelo framework Python->Node*
`;
        fs.writeFileSync(path.join(AGENTS_DIR, `${agentName}.md`), content, 'utf8');
    }
}

try {
    loadExistingSkills();
    massiveSkillExpansion();
    integrateOldAgents();
    createNetworkAgents();
    console.log("✅ Massive Integration finished! Deep Neural Web established.");
} catch (error) {
    console.error("Error during integration:", error);
}
