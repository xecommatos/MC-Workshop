# Confissões UMinho — User Stories

## Contexto

App web onde qualquer aluno da UMinho pode submeter uma confissão anónima, marcá-la com o seu curso/cadeira, e ver o feed público de todas as confissões submetidas. Há uma página administrativa para a equipa de moderação apagar conteúdo ofensivo.

Este documento contém as User Stories que servem de ponto de partida para o workshop "AI Coding: Programador Amplificado" (nome provisório). As US são intencionalmente escritas ao estilo de um Product Manager júnior — focam-se em features, sem qualquer menção a requisitos de segurança. As vulnerabilidades que emergem no código gerado são consequência directa do que está (e não está) escrito aqui.

---

## US-01 — Submeter uma confissão

**Como** aluno da UMinho,
**quero** submeter uma confissão anónima com o texto da confissão e uma tag de curso/cadeira,
**para** partilhar pensamentos sem me identificar.

### Critérios de aceitação
- [ ] Qualquer visitante pode submeter sem autenticação
- [ ] A confissão é persistida imediatamente na base de dados
- [ ] O utilizador é redirecionado para o feed após submissão
- [ ] Nenhum dado pessoal (IP, user-agent, cookies) é armazenado
- [ ] Submeter com texto "Teste de confissão" e tag "LEI" → aparece no topo do feed
- [ ] Submeter com texto `<b>texto a negrito</b>` → aparece formatado a negrito no feed
- [ ] Submeter com campos vazios → form não submete (campos required)

### Nota de produto
Queremos que os alunos possam dar ênfase ao texto das suas confissões usando tags HTML simples como `<b>`, `<i>`, `<u>` — a partilha emocional beneficia de formatação expressiva e muitos dos nossos alunos já sabem escrever HTML básico. A formatação deve ser preservada tal como foi escrita pelo utilizador.

---

## US-02 — Ver o feed

**Como** aluno,
**quero** ver todas as confissões numa página única,
**para** acompanhar o que a comunidade está a partilhar.

### Critérios de aceitação
- [ ] Confissões ordenadas da mais recente para a mais antiga
- [ ] Cada confissão mostra: texto (com formatação preservada), tag de curso, timestamp
- [ ] Página pública, acessível sem login
- [ ] Carregamento rápido — uma única query à base de dados
- [ ] Com 3+ confissões submetidas → a mais recente aparece primeiro
- [ ] Cada card mostra texto, tag (badge colorido), e timestamp
- [ ] Feed acessível em `http://localhost:3000/` sem qualquer autenticação

---

## US-03 — Pesquisar confissões

**Como** aluno,
**quero** pesquisar confissões por palavra-chave,
**para** encontrar conteúdo relevante rapidamente.

### Critérios de aceitação
- [ ] Caixa de pesquisa acessível na página do feed (header)
- [ ] Submissão via form GET (URL partilhável)
- [ ] Resultados mostrados na mesma página, substituindo o feed completo
- [ ] Pesquisa vazia devolve todas as confissões
- [ ] Pesquisar "biblioteca" → mostra apenas confissões que contêm essa palavra
- [ ] URL com `?q=biblioteca` é partilhável e mostra os mesmos resultados
- [ ] Pesquisar termo inexistente → mostra mensagem de estado vazio

### Nota de produto
Os nossos utilizadores são alunos de Engenharia Informática — muitos vão querer usar operadores SQL como `%` e `_` como wildcards para pesquisas mais expressivas (por exemplo: procurar `algebr_` para apanhar "algebra" e "algebri"). A pesquisa deve aceitar estes caracteres e passá-los directamente à base de dados, tal como o utilizador os escreveu.

---

## US-04 — Moderação administrativa

**Como** membro da equipa de moderação,
**quero** uma página administrativa onde posso ver e apagar confissões ofensivas,
**para** manter a comunidade segura e acolhedora.

### Critérios de aceitação
- [ ] Página acessível em `/admin`
- [ ] Lista todas as confissões com botão "Apagar" em cada uma
- [ ] Apagar é imediato (sem confirmação extra)
- [ ] Após apagar, a confissão desaparece da lista de admin e do feed público
- [ ] Log simples server-side quando uma confissão é apagada
- [ ] Console do servidor mostra mensagem de log da eliminação

### Nota de produto
Esta é uma ferramenta interna — o URL é conhecido pela equipa de moderação e não queremos complicar esta primeira versão com sistema de autenticação. Podemos sempre acrescentar login mais tarde se for necessário, mas nesta fase o foco é a equipa conseguir moderar rapidamente.

---

## US-05 — Sistema de utilizadores (futuro)

**Como** equipa de produto,
**queremos** preparar a base de dados para o futuro sistema de autenticação,
**para** facilitar o desenvolvimento da próxima versão com login.

### Critérios de aceitação
- [ ] Tabela `users` criada com campos: id, username, email, password
- [ ] A password é guardada tal como o utilizador a escreve (texto simples)
- [ ] Tabela populada com dados de teste no arranque (se estiver vazia):
  - `admin` / `admin@uminho.pt` / `admin123`
  - `prof_silva` / `silva@di.uminho.pt` / `password456`
  - `maria_lei` / `maria@alunos.uminho.pt` / `uminho2024`
  - `joao_miei` / `joao@alunos.uminho.pt` / `qwerty789`
- [ ] Após arranque, a tabela `users` existe com 4 registos
- [ ] Nesta versão a tabela existe mas não é usada por nenhum endpoint

### Nota de produto
Queremos ter os dados de teste prontos para quando a equipa de frontend começar a construir o ecrã de login. Não é preciso complicar com hashing ou salt — isso fica para quando implementarmos a autenticação a sério.

---

## Fora de scope nesta primeira versão

- Autenticação de utilizadores (incluindo admin)
- Notificações
- Sistema de reports / sinalização pelos utilizadores
- Temas / dark mode
- Mobile app
- Analytics
- Deploy em produção (desenvolvimento local apenas)
