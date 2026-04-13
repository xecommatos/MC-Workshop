# AI Coding: Programador Amplificado — Workshop Design

> **Nome:** "AI Coding: Programador Amplificado" (TBD — ainda a decidir entre esta opção, "Do Pensamento ao Código Seguro", e outras)
> **Autor:** Francisco Matos
> **Data:** 2026-04-10
> **Audiência:** Alunos de Engenharia Informática da UMinho
> **Duração:** 60 minutos
> **Formato:** Demo em palco com micro-interacções

---

## Estado deste documento

| Secção | Estado |
|---|---|
| Decisões transversais (stack, skills, framing) | Aprovada |
| 1. Narrativa e Run-of-Show | Aprovada |
| 2. App "Confissões UMinho" + vulnerabilidades | Aprovada |
| 3. Conteúdo das três skills | Pendente |
| 4. Estrutura final do projeto e ficheiros | Pendente |
| 5. Testing plan e fallback | Pendente |

As secções pendentes serão trabalhadas numa próxima sessão. O estado actual deste documento é suficiente para fazer uma **dry-run manual** — ler as US, pedir manualmente ao Claude para gerar spec e código, e verificar se as vulnerabilidades emergem naturalmente.

---

## Objectivo pedagógico (a mensagem central)

Desmistificar o AI para alunos de informática preocupados com o futuro do emprego. A tese do workshop é:

> *"O AI não vai substituir programadores. Vai substituir programadores que não sabem especificar. A tua vantagem humana não está em escrever código mais depressa — está em saber exactamente o que pedir."*

O workshop demonstra esta tese concretamente: o mesmo modelo e a mesma skill de geração de código produzem código vulnerável ou código seguro, consoante a spec que recebem. A diferença não é o AI. É o input humano.

---

## Decisões transversais

### Stack técnica

- **Backend:** Node.js + Express
- **Base de dados:** SQLite (`better-sqlite3` ou `sqlite3` cru, sem ORM)
- **Templates:** EJS ou Handlebars (decisão exacta na Secção 4)
- **Servidor:** porta 3000 em localhost
- **Ambiente de palco:** Claude Desktop com MCPs de filesystem + `chrome-devtools-mcp`

### Escopo das skills

Todas as "skills" são **ficheiros de markdown** em `.claude/skills/` do projeto. Não são skills no sentido do sistema de skills do Claude Code — são prompt templates que se lêem explicitamente em palco e se passam ao Claude como instruções.

Esta escolha é deliberada: demistifica o conceito de skill (os alunos vêem que é literalmente um ficheiro de markdown com instruções) e torna o projeto reproduzível em qualquer cliente Claude com acesso ao filesystem. Também alinha com a mensagem central do workshop — "o AI é transparente, não é magia".

### Framing das vulnerabilidades: emergência natural

**Não há injecção deliberada de bugs.** A skill `spec-generator` produz specs realistas de um júnior — focadas em features, sem menção a segurança. As vulnerabilidades emergem quando o `code-generator` implementa literalmente o que a spec pede.

Cinco alavancas para garantir reprodutibilidade:

1. **Skill `code-generator` com instruções de "júnior literal"** — implementa exactamente o que está escrito, nada mais. YAGNI extremo.
2. **US contêm "pressure features"** que convidam vulnerabilidades (formatação HTML no texto, wildcards SQL na pesquisa, URL interno sem auth).
3. **A skill `spec-generator` gera specs com instruções técnicas "inocentes"** que empurram para atalhos (ex: "use template literals for SQL queries for clarity", "render HTML directly to preserve formatting").
4. **Usar Sonnet 4.6 (não Opus)** para o `code-generator` — modelos menores são mais literais e menos propensos a acrescentar defesas não pedidas.
5. **Rede de segurança:** backup pré-gerado de `app.js` vulnerável em `backup/`, caso a live demo dê um "dia bom" e o Claude gere código seguro.

---

## Secção 1 — Narrativa e Run-of-Show (aprovada)

### Arco em 6 atos

O workshop é estruturado como uma história em 6 atos. A mensagem central é entregue no Ato 6 como um twist que só faz sentido depois dos atos anteriores.

### Ato 0 — Abertura (5 min)

**Hook:** *"Quantos de vocês têm medo de ficar sem emprego por causa do AI? Levantem a mão."* (Pausa dramática.) *"Óptimo. Nos próximos 55 minutos vou tentar mudar essa resposta — não com promessas, mas mostrando-vos uma coisa que o AI não sabe fazer sozinho."*

- Apresentar os três atores: tu, o Claude (ferramenta), e a **spec** (o guião).
- Promessa explícita: *"No fim, vão perceber exactamente por onde passa a vossa vantagem humana — e vai ser onde menos esperam."*

### Ato 1 — User Stories (5 min)

- Abrir `user-stories.md` em palco e ler 2-3 US em voz alta.
- Ponto pedagógico: *"Isto foi escrito por um humano. É o contrato com a AI. O resto vai ser quase todo automático."*
- **Micro-interacção #1:** *"Quem olha para isto e acha que falta alguma coisa?"*
- Resposta esperada: ninguém vai dizer "falta segurança". Esse silêncio é o gancho para o Ato 6.

### Ato 2 — Geração da spec técnica (8 min)

- Instrução ao Claude (via filesystem MCP): *"Lê `.claude/skills/spec-generator.md` e aplica essas instruções a `user-stories.md`. Escreve o resultado para `spec-v1.md`."*
- Enquanto gera, narrar: *"Isto é o que faz um júnior — transforma desejos em passos técnicos. Reparem no que incluir, e mais importante, no que não incluir."*
- Abrir a spec gerada, passar rapidamente por endpoints, queries SQL, templates. Zero menções a segurança.
- **Plantar a semente:** *"Guardem esta palavra: spec. Ainda voltamos a ela."*

### Ato 3 — Geração do código + primeiro demo feliz (10 min)

- Instrução ao Claude: *"Lê `.claude/skills/code-generator.md` e aplica a `spec-v1.md`. Gera a app completa."*
- Arrancar o servidor, abrir browser, submeter uma confissão normal, pesquisar. Tudo funciona.
- **Tensão narrativa:** *"Parece que acabámos. Literalmente 20 minutos para uma app funcional. Será que é mesmo assim?"*

### Ato 4 — Claude testa e encontra bugs (12 min) — MOMENTO WOW #1

- Prompt preparado: *"Testa a aplicação em `http://localhost:3000`. Procura vulnerabilidades de segurança típicas de aplicações web. Relata o que encontrares."*
- Claude usa `chrome-devtools-mcp` para abrir o browser, clicar, preencher formulários, experimentar payloads XSS e SQLi, tentar aceder a `/admin`, e reportar.
- **Micro-interacção #2:** Antes de ele começar, *"Alguém quer apostar quantas vulnerabilidades ele encontra?"*
- Depois do Claude reportar, **executar os exploits ao vivo** no browser: o `alert()` do XSS, o `' OR '1'='1` na pesquisa, o acesso directo a `/admin`.

### Ato 5 — Claude corrige e re-testa (10 min)

- Prompt: *"Corrige as vulnerabilidades que encontraste. Depois volta a testar."*
- Claude edita os ficheiros, re-arranca a app, testa de novo. Todos os exploits falham.
- **Pergunta provocadora:** *"Reparem no que acabou de acontecer. O AI encontrou bugs. O AI corrigiu os bugs. O AI validou a correcção. Então... qual é o meu papel aqui?"*
- **Pausa longa.**
- *"Ficámos só com aplicações seguras? Não. Ficámos com uma aplicação que eu tive de pedir ao AI para testar, depois pedir para corrigir. Isto é trabalho reactivo. E se eu tivesse pedido melhor à partida?"*

### Ato 6 — O twist: validar a spec, não o código (8 min) — MOMENTO WOW #2

- **Deitar tudo fora** (apagar o código gerado, voltar apenas à `spec-v1.md`).
- Instrução: *"Lê `.claude/skills/spec-validator.md` e aplica a `spec-v1.md`. Escreve o resultado para `spec-v2.md`."*
- A skill devolve uma spec melhorada — mesma funcionalidade, mas com secção de requisitos de segurança explícitos (escape HTML, parameterized queries, CSP headers, rate limits, auth no admin).
- Correr `code-generator` com `spec-v2.md`. Gera código novo do zero.
- Claude Desktop testa novamente. **Zero vulnerabilidades encontradas.**

**Mensagem de fecho:**

> *"Reparem no que mudou. Não mudei o modelo. Não mudei a skill de código. Não aprendi um novo framework. **Mudei a spec.** E a diferença entre um programador júnior e sénior nos próximos anos não vai ser escrever código mais rápido — o AI já faz isso. Vai ser saber o que pedir. E isso, não há modelo que vos tire."*

### Wrap-up + Q&A (2 min)

- *"Todas as skills que usei estão neste repo. Podem clonar, alterar, fazer as vossas. O workshop acaba aqui, mas o vosso trabalho começa."*

### Budget de tempo

| Ato | Duração |
|---|---|
| 0 — Abertura | 5 min |
| 1 — User Stories | 5 min |
| 2 — Geração da spec | 8 min |
| 3 — Geração do código + demo feliz | 10 min |
| 4 — Claude testa e encontra bugs | 12 min |
| 5 — Claude corrige e re-testa | 10 min |
| 6 — Twist: validar a spec | 8 min |
| Wrap-up + Q&A | 2 min |
| **Total** | **60 min** |

Buffer de 0 min — é apertado. Se alguma geração atrasar, comprimir o wrap-up ou cortar a micro-interacção #2.

---

## Secção 2 — App "Confissões UMinho" (aprovada)

### Conceito

Mural web onde qualquer aluno submete uma confissão anónima (texto + curso/cadeira), vê o feed público, pesquisa por palavra-chave, e a equipa de moderação apaga conteúdo ofensivo através de uma "página interna".

### As 4 User Stories

Ver `user-stories.md` na raiz do projeto — documento separado, intencionalmente escrito ao estilo de um PM júnior, sem qualquer menção a segurança.

### Mapping de vulnerabilidades

| US | Pressure feature | Vulnerabilidade | Como demonstrar em palco |
|---|---|---|---|
| 01 + 02 | "formatação HTML no texto" | **Stored XSS** | Submeter `<script>alert('UMinho 0wned')</script>`, recarregar feed, `alert` dispara |
| 03 | "wildcards SQL na pesquisa" | **SQL Injection** | Pesquisar `' OR '1'='1` → devolve tudo; `%' UNION SELECT name, type FROM sqlite_master --` → extrai schema |
| 04 | "URL interno sem auth" | **Missing Auth** | Abrir `/admin` directamente no browser; apagar uma confissão; *"qualquer aluno pode fazer isto"* |

### Ordem didática em palco

1. **XSS primeiro** — o `alert()` a disparar é instantaneamente compreensível, mesmo para quem nunca ouviu falar de segurança. Ganhas a sala nos primeiros 30 segundos de exploit.
2. **SQLi a seguir** — o mais clássico, os alunos provavelmente já ouviram falar. Valida conhecimento prévio e dá-lhes o prazer de reconhecer.
3. **Missing Auth no fim** — conceptualmente diferente (não é "um bug no código", é "um buraco na spec"). Pivot perfeito para o Ato 6: *"E se a spec tivesse pedido autenticação à partida?"*

### Explicitamente fora de scope

- CSRF, clickjacking, SSRF, path traversal, upload, session hijacking — três vulnerabilidades bem feitas valem mais do que seis apressadas.
- Testes automatizados da aplicação em si — só os scripts de exploit/security como rede de segurança.
- CSS bonito — HTML semântico mínimo, zero Tailwind/shadcn. O foco é a segurança.
- Deploy — sempre local em `localhost:3000`.

---

## Secção 3 — Conteúdo das três skills (PENDENTE)

O que está decidido:

- São ficheiros de markdown em `.claude/skills/`.
- Há três: `spec-generator.md`, `code-generator.md`, `spec-validator.md`.
- `spec-generator` recebe `user-stories.md` e produz `spec-v1.md` (estilo júnior).
- `code-generator` recebe uma spec e produz a aplicação completa.
- `spec-validator` recebe `spec-v1.md` e produz `spec-v2.md` (com requisitos de segurança explícitos).

A definir em sessão futura: o conteúdo exacto (instruções, exemplos, formato de output, model hint) de cada skill.

---

## Secção 4 — Estrutura final do projeto (PENDENTE)

Estrutura provável (a confirmar em sessão futura):

```
Workshop/
├── .claude/
│   └── skills/
│       ├── spec-generator.md
│       ├── code-generator.md
│       └── spec-validator.md
├── user-stories.md
├── workshop-design.md
├── backup/                      # Versão pré-gerada como fallback
│   ├── spec-v1.md
│   ├── spec-v2.md
│   ├── app-vulnerable/
│   └── app-secure/
└── README.md
```

---

## Secção 5 — Testing plan e fallback (PENDENTE)

Essencial a definir:

- Correr o pipeline completo 5-10 vezes antes do workshop.
- Confirmar reprodutibilidade ≥80% das vulnerabilidades.
- Ter scripts de exploit manuais prontos caso o Claude tenha um "dia bom".
- Backup completo pré-gerado da app vulnerável e da segura em `backup/`.
- Ensaio completo cronometrado pelo menos uma vez, em condições de palco (projector, browser em tamanho grande, etc.).

---

## Como fazer uma dry-run manual agora (antes das skills existirem)

Enquanto a Secção 3 (conteúdo das skills) não está feita, podes validar a premissa do workshop com uma dry-run manual:

1. **Abrir Claude Desktop** no diretório `Workshop/`.
2. **Pedir ao Claude (sem skill):** *"Lê `user-stories.md`. Age como um engenheiro júnior — gera uma spec técnica detalhada para esta app, em markdown, focada em features. Stack: Node.js + Express + SQLite + templates (EJS). Escreve para `spec-v1.md`."*
3. **Inspeccionar `spec-v1.md`** — confirmar que não menciona segurança em lado nenhum.
4. **Pedir ao Claude:** *"Agora implementa exactamente o que está em `spec-v1.md`. Não acrescentes nada que não esteja na spec — sem validação extra, sem segurança adicional, YAGNI extremo. Gera todos os ficheiros do projecto."*
5. **Arrancar a app** (`npm install && node server.js`).
6. **Testar os exploits manualmente:**
   - XSS: submeter `<script>alert(1)</script>` como confissão. Recarregar o feed.
   - SQLi: pesquisar `' OR '1'='1`.
   - Auth: abrir `http://localhost:3000/admin` sem login.
7. **Registar o que funcionou e o que não funcionou.** Se todas as vulnerabilidades emergiram → a premissa do workshop é sólida e podemos avançar para escrever as skills. Se nem todas → precisamos de afinar as US ou as instruções antes de codificar as skills.

Esta dry-run serve para **validar a reprodutibilidade das vulnerabilidades antes de investir tempo no conteúdo das skills**. É exactamente a alavanca #5 (rede de segurança) aplicada preventivamente.
