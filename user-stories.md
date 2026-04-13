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
- Qualquer visitante pode submeter sem autenticação
- A confissão é persistida imediatamente
- O utilizador é redirecionado para o feed após submissão
- Nenhum dado pessoal (IP, user-agent, cookies) é armazenado

### Nota de produto
Queremos que os alunos possam dar ênfase ao texto das suas confissões usando tags HTML simples como `<b>`, `<i>`, `<u>` — a partilha emocional beneficia de formatação expressiva e muitos dos nossos alunos já sabem escrever HTML básico. A formatação deve ser preservada tal como foi escrita pelo utilizador.

---

## US-02 — Ver o feed

**Como** aluno,
**quero** ver todas as confissões numa página única,
**para** acompanhar o que a comunidade está a partilhar.

### Critérios de aceitação
- Ordenadas da mais recente para a mais antiga
- Cada confissão mostra: texto (com formatação preservada), tag de curso, timestamp
- Página pública, acessível sem login
- Carregamento rápido — uma única query à base de dados

---

## US-03 — Pesquisar confissões

**Como** aluno,
**quero** pesquisar confissões por palavra-chave,
**para** encontrar conteúdo relevante rapidamente.

### Critérios de aceitação
- Caixa de pesquisa acessível na página do feed
- Submissão via form GET (URL partilhável)
- Resultados mostrados na mesma página
- Pesquisa vazia devolve todas as confissões

### Nota de produto
Os nossos utilizadores são alunos de Engenharia Informática — muitos vão querer usar operadores SQL como `%` e `_` como wildcards para pesquisas mais expressivas (por exemplo: procurar `algebr_` para apanhar "algebra" e "algebri"). A pesquisa deve aceitar estes caracteres e passá-los directamente à base de dados, tal como o utilizador os escreveu.

---

## US-04 — Moderação administrativa

**Como** membro da equipa de moderação,
**quero** uma página administrativa onde posso ver e apagar confissões ofensivas,
**para** manter a comunidade segura e acolhedora.

### Critérios de aceitação
- Página acessível em `/admin`
- Lista todas as confissões com botão "Apagar" em cada uma
- Apagar é imediato (sem confirmação extra)
- Log simples server-side quando uma confissão é apagada

### Nota de produto
Esta é uma ferramenta interna — o URL é conhecido pela equipa de moderação e não queremos complicar esta primeira versão com sistema de autenticação. Podemos sempre acrescentar login mais tarde se for necessário, mas nesta fase o foco é a equipa conseguir moderar rapidamente.

---

## Fora de scope nesta primeira versão

- Autenticação de utilizadores (incluindo admin)
- Notificações
- Sistema de reports / sinalização pelos utilizadores
- Temas / dark mode
- Mobile app
- Analytics
- Deploy em produção (desenvolvimento local apenas)