# LLM Wiki Agent

Este documento define como o agente deve manter a wiki Markdown do projeto Sorteador Times.

## Estrutura

- `raw/`: fontes brutas e imutaveis. O agente pode ler, mas nao deve editar fontes existentes.
- `wiki/`: paginas Markdown geradas e mantidas pelo agente.
- `wiki/index.md`: catalogo navegavel da wiki.
- `wiki/log.md`: historico append-only de ingests, consultas e revisoes.
- `wiki/templates/`: modelos para paginas novas.

## Regra central

A wiki e um artefato persistente e cumulativo. O agente deve integrar conhecimento novo ao material existente, nao apenas criar resumos isolados.

## Workflow: ingest de fonte

1. Localizar a fonte em `raw/`.
2. Ler a fonte integralmente ou por secoes, conforme o tamanho.
3. Criar uma pagina de fonte usando `wiki/templates/source.md`.
4. Atualizar paginas existentes afetadas, como entidades, conceitos, decisoes ou mapas de implementacao.
5. Criar novas paginas quando um conceito, entidade ou decisao merecer acompanhamento proprio.
6. Atualizar `wiki/index.md`.
7. Adicionar entrada no topo de `wiki/log.md`.

## Workflow: consulta

1. Ler `wiki/index.md` primeiro.
2. Abrir as paginas relevantes.
3. Responder com base na wiki e citar as paginas usadas quando fizer sentido.
4. Se a resposta produzir uma sintese reutilizavel, criar ou atualizar uma pagina em `wiki/`.
5. Registrar a consulta em `wiki/log.md` quando ela mudar a wiki ou gerar uma decisao.

## Workflow: lint da wiki

Verificar periodicamente:

- Paginas orfas ou sem links de entrada.
- Conceitos mencionados sem pagina propria.
- Contradicoes entre paginas.
- Decisoes antigas superadas por decisoes novas.
- `index.md` desatualizado.
- Paginas sem frontmatter ou com metadados incompletos.
- Lacunas de conhecimento que exigem nova fonte, pesquisa ou decisao do usuario.

## Convencoes de pagina

- Usar Markdown compativel com Obsidian.
- Usar links internos no formato `[[nome-da-pagina]]`.
- Usar YAML frontmatter em paginas novas.
- Preferir nomes de arquivo em kebab-case, ASCII, sem espacos.
- Manter fontes citadas nas paginas derivadas.
- Separar fato, inferencia e decisao.

## Convencoes para `index.md`

Cada pagina listada deve ter:

- Link interno.
- Resumo de uma linha.
- Categoria adequada.

Categorias iniciais:

- Visao geral
- Fontes
- Entidades
- Conceitos
- Analises
- Manutencao

## Convencoes para `log.md`

Adicionar entradas novas no topo da secao "Entradas".

Formato:

```md
## [YYYY-MM-DD] tipo | Titulo

- Alteracao ou evento.
- Paginas afetadas.
```

Tipos sugeridos:

- `setup`
- `ingest`
- `query`
- `lint`
- `decision`
- `implementation`

## Adaptacao ao Sorteador Times

A wiki deve acompanhar especialmente:

- Regras de dominio dos jogos.
- Modelagem Prisma.
- Decisoes sobre grupos, jogadores, partidas e historico.
- Componentes e padroes de UI.
- Rotas e fluxos implementados.
- Lacunas entre requisitos e codigo existente.
- Decisoes de deploy.

Quando a tarefa envolver UI/UX, tambem consultar `docs/UI_UX_AGENT.md` se existir.

## Relacao com o codigo

A wiki nao substitui testes, schema, migrations ou documentacao tecnica do codigo. Ela serve como memoria de contexto, decisoes e sinteses.

Sempre que uma implementacao relevante mudar o comportamento do sistema, atualizar:

- `wiki/implementation-map.md`
- `wiki/project-decisions.md`, se uma decisao foi tomada
- `wiki/index.md`, se paginas novas forem criadas
- `wiki/log.md`

