# Casos de Teste: Sistema de Consulta de Holerites

| Campo | Valor |
|---|---|
| Documento | 03 de 06 |
| Versão | 1.0 |
| Data | 25/11/2026 |
| Responsável | [Jeferson de Souza Martins] |

## 1. Objetivo
Documentar os casos de teste derivados das condições do `02-analise-e-modelagem.md`, escritos em Gherkin (`Dado / Quando / Então`). Os cenários estão em `docs/features/` e este documento é o índice, com prioridade, canal de execução e candidatos à automação.

## 2. Como ler os casos
- **Arquivos `.feature`:** servem como documentação executável *por pessoas*. Não há Cucumber neste projeto; a execução (etapa 4) é manual e a automação (etapas 6 a 8) usa outras ferramentas, tomando os cenários como roteiro.
- **Esquema do Cenário:** um mesmo cenário repetido com uma tabela de exemplos (por exemplo, os três funcionários). Conta como **um** caso, com um resultado por linha de exemplo registrado na execução.
- **Tags:** `@CT-...` (id do caso), `@CND-..` (condição de teste), `@RF-/@RN-` (requisito), `@api` e `@web` (canal), `@prioridade-*`, `@automatizar-*` (candidato à automação), `@aconfirmar` (o requisito não define o esperado) e `@lacuna-de-massa` (não executável com os dados atuais).
- **Resultados esperados:** vêm do oráculo da seção 2 do `02-analise-e-modelagem.md`.

## 3. Resumo
| Item | Quantidade |
|---|---|
| Casos de teste | 44 |
| Prioridade alta | 20 |
| Prioridade média | 20 |
| Prioridade baixa | 4 |
| Candidatos à automação | 4 casos (2 de API, 1 de Web e 1 de performance), que formam as 3 automações exigidas |
| Com resultado esperado a confirmar | 3 |
| Não executáveis com a massa atual | 1 |

## 4. Índice dos casos
| ID | Título | Condições | Prioridade | Canal | Automação | Observação | Status |
|---|---|---|---|---|---|---|---|
| CT-LOG-01 | Login com credenciais válidas | CND-01 | Alta | API e Web | API | - | Não executado |
| CT-LOG-02 | Login com e-mail em maiúsculas e com espaços nas bordas | CND-01 | Média | API | - | Resultado esperado a confirmar | Não executado |
| CT-LOG-03 | Login com senha incorreta | CND-02 | Alta | API | - | - | Não executado |
| CT-LOG-04 | Login com a senha correta em caixa diferente | CND-02 | Média | API | - | - | Não executado |
| CT-LOG-05 | Login com a senha correta seguida de espaço | CND-02 | Média | API | - | - | Não executado |
| CT-LOG-06 | Login com senha vazia | CND-03 | Média | API e Web | - | - | Não executado |
| CT-LOG-07 | Login com e-mail não cadastrado | CND-02 | Alta | API | - | - | Não executado |
| CT-LOG-08 | Login com e-mail em formato inválido | CND-02 | Média | API e Web | - | - | Não executado |
| CT-LOG-09 | Login com e-mail vazio | CND-03 | Média | API e Web | - | - | Não executado |
| CT-LOG-10 | Login sem o campo senha | CND-03 | Média | API | - | - | Não executado |
| CT-LOG-11 | Login sem o campo e-mail | CND-03 | Média | API | - | - | Não executado |
| CT-LOG-12 | Login com campos de tipo incorreto | CND-03 | Alta | API | - | - | Não executado |
| CT-LOG-13 | A mensagem de erro não revela se o e-mail existe | CND-04 | Alta | API | - | - | Não executado |
| CT-LOG-14 | A tela informa o erro e permanece no login | CND-02 | Média | Web | - | - | Não executado |
| CT-AUT-01 | Consulta sem token | CND-05 | Alta | API | - | - | Não executado |
| CT-AUT-02 | Consulta com token malformado | CND-05 | Alta | API | - | - | Não executado |
| CT-AUT-03 | Consulta com token adulterado | CND-05 | Alta | API | - | - | Não executado |
| CT-AUT-04 | Consulta com token expirado | CND-05 | Média | API | - | - | Não executado |
| CT-AUT-05 | O token de um funcionário retorna somente os dados dele | CND-07 | Alta | API | API | - | Não executado |
| CT-AUT-06 | A resposta não expõe dados internos | CND-08 | Alta | API | - | - | Não executado |
| CT-AUT-07 | Acesso à tela de holerites sem login | CND-06 | Alta | Web | - | - | Não executado |
| CT-AUT-08 | Logout encerra a sessão | CND-06 | Média | Web | - | - | Não executado |
| CT-AUT-09 | Tentativa de forçar outro funcionário por parâmetro | CND-07 | Alta | API | - | - | Não executado |
| CT-CON-01 | Ao entrar, o funcionário vê o holerite mais atual | CND-09, CND-10, CND-15 | Alta | API e Web | Web | - | Não executado |
| CT-CON-02 | Os valores do holerite conferem com os dados do funcionário | CND-15 | Alta | API e Web | - | - | Não executado |
| CT-CON-03 | Funcionário sem holerites publicados recebe mensagem informativa | CND-13 | Alta | API e Web | - | - | Não executado |
| CT-CON-04 | Lista de Ana mostra a última versão de cada competência publicada | CND-10, CND-12 | Alta | API | - | - | Não executado |
| CT-CON-05 | Versão em rascunho não substitui a versão publicada | CND-11 | Alta | API | - | - | Não executado |
| CT-CON-06 | Competência com apenas rascunhos não aparece | CND-12 | Alta | API e Web | - | - | Não executado |
| CT-CON-07 | Lista de funcionário sem holerites publicados | CND-13 | Média | API | - | - | Não executado |
| CT-CON-08 | Seletor de competência com duas competências publicadas | CND-14 | Alta | Web | - | - | Não executado |
| CT-CON-09 | Seletor oculto quando não há holerites | CND-14 | Média | Web | - | - | Não executado |
| CT-CON-10 | Seletor oculto com exatamente um holerite publicado | CND-14 | Média | Web | - | Lacuna de massa de dados | Não executado |
| CT-CON-11 | Navegação por teclado no site | CND-09 | Média | Web | - | - | Não executado |
| CT-API-01 | Verbo diferente do previsto nas rotas de consulta | CND-16 | Média | API | - | Resultado esperado a confirmar | Não executado |
| CT-API-02 | Login com verbo GET | CND-16 | Baixa | API | - | Resultado esperado a confirmar | Não executado |
| CT-API-03 | Corpo JSON malformado no login | CND-17 | Alta | API | - | - | Não executado |
| CT-API-04 | Rota inexistente | CND-17 | Média | API | - | - | Não executado |
| CT-API-05 | Login sem corpo na requisição | CND-17 | Média | API | - | - | Não executado |
| CT-API-06 | Estrutura e tipos dos dados do holerite | CND-08, CND-15 | Média | API | - | - | Não executado |
| CT-API-07 | Tempo de resposta com usuários simultâneos | CND-18 | Média | API | Performance | - | Não executado |
| CT-API-08 | Login repetido em sequência | CND-18 | Baixa | API | - | - | Não executado |
| CT-DOC-01 | Swagger UI carrega | - | Baixa | Web | - | - | Não executado |
| CT-DOC-02 | Especificação YAML é renderizada | - | Baixa | API | - | - | Não executado |

O status será atualizado na etapa 4 (`04-execucao-e-resultados.md`) para Aprovado, Reprovado, Bloqueado ou Não executável.

## 5. Arquivos
| Arquivo | Conteúdo |
|---|---|
| `features/01-login.feature` | Login (CT-LOG) |
| `features/02-autorizacao.feature` | Autorização e isolamento dos dados (CT-AUT) |
| `features/03-consulta-holerites.feature` | Consulta de holerites (CT-CON) |
| `features/04-api-vader.feature` | Exploração da API com VADER (CT-API) |
| `features/05-documentacao.feature` | Swagger e YAML (CT-DOC) |

## 6. Cobertura das condições
Todas as condições CND-01 a CND-19 possuem ao menos um caso, exceto o limite de 1 holerite publicado (CND-14), que tem o caso CT-CON-10 escrito mas sem massa de dados para executá-lo.

## 7. Candidatos à automação
Escolhidos pelo risco (RN-02, a proteção dos dados) e pela repetibilidade:

| Tipo | Caso | Motivo |
|---|---|---|
| API | CT-LOG-01 e CT-AUT-05 | Login válido e isolamento dos dados entre funcionários: o maior risco do sistema |
| Web | CT-CON-01 | Fluxo completo de ponta a ponta: login e exibição do holerite mais atual |
| Performance | CT-API-07 | Responsividade da consulta com usuários simultâneos |
