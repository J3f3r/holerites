# Execução e Resultados dos Testes

| Campo | Valor |
|---|---|
| Documento | 04 de 06 |
| Versão | 0.9 (parcial: aguarda a reexecução dos casos pendentes) |
| Data | 26/11/2026 |
| Executor | [Seu nome] |
| Referências | `03-casos-de-teste.md`, `04-roteiro-de-execucao.md` |

## 1. Como foi executado
- **Execução manual guiada** pelo roteiro: API com `curl` no Git Bash (saídas gravadas em `docs/evidencias/*.txt`), Swagger no navegador (prints em `.png`).
- **Primeira rodada:** casos de documentação, login, autorização, consulta e VADER.
- **Segunda rodada:** refeita com tokens renovados e saídas gravadas em arquivo. Parte dos comandos gravou somente o cabeçalho, com a saída vazia. A causa provável é que as variáveis de token (`$ANA`, `$BRUNO`, `$CARLA`) e `$P` não foram expandidas dentro do subshell da função usada para gravar os arquivos. Esses casos ficaram **Bloqueados** e são reexecutados pelos scripts automatizados (seção 5).
- Os casos Web não foram executados manualmente; ficam para o script Playwright.
- Este documento registra **apenas o que foi observado**. Nenhum resultado dos casos pendentes foi presumido.

## 2. Ambiente
Windows (Git Bash), Node.js [versão], Google Chrome [versão], aplicação v1.0.0 na branch `feature/consulta-holerites`, banco MongoDB em memória com a massa original (3 funcionários).

## 3. Resumo (54 itens do roteiro)

| Status | Quantidade |
|---|---|
| Aprovado | 30 |
| Reprovado (gera bug) | 5 itens, que correspondem a 3 bugs |
| Bloqueado (reexecução pendente) | 15 |
| Não executável | 2 (CT-CON-10 e CT-API-07) |
| Sessões exploratórias pendentes | 2 (EXP-API e EXP-WEB) |

**Defeitos encontrados:** BUG-001 (Baixa), BUG-002 (Média) e BUG-003 (Baixa). Nenhum crítico ou de alta severidade. Detalhes em `05-bugs/`.

## 4. Resultados por caso

| Caso | Resultado obtido | Status | Evidência |
|---|---|---|---|
| CT-DOC-01 | Swagger UI carregou em `/api-docs/` ("API de Consulta de Holerites") com os 3 endpoints | Aprovado | `CT-DOC-01.png` |
| CT-DOC-02 | `/api-docs.yaml` começa com `openapi: 3.0.3`, com `info` e título corretos | Aprovado | `CT-DOC-02.png` |
| CT-LOG-01 (Ana) | 200, token e `employee` Ana Souza (1001) | Aprovado | `image_52c4bb.png` |
| CT-LOG-01 (Bruno) | 200, token e `employee` Bruno Lima (1002) | Aprovado | `CT-LOG-01.png` |
| CT-LOG-01 (Carla) | 200, token e `employee` Carla Mendes (1003) | Aprovado | `CT-LOG-01.png` |
| CT-LOG-02 | **Observação (a confirmar):** 200 e token; o e-mail com maiúsculas e espaços é aceito (normalizado) | Aprovado | `CT-LOG-02.png` |
| CT-LOG-03 | 401, "E-mail ou senha inválidos." | Aprovado | `CT-LOG-03.png` |
| CT-LOG-04 | 401, "E-mail ou senha inválidos." | Aprovado | `CT-LOG-04.png` |
| CT-LOG-05 | 401, "E-mail ou senha inválidos." | Aprovado | `CT-LOG-05.png` |
| CT-LOG-06 | 401, mesma mensagem, sem token | Aprovado | `CT-LOG-06.png` |
| CT-LOG-07 | 401, "E-mail ou senha inválidos." | Aprovado | `CT-LOG-07.png` |
| CT-LOG-08 | 401, mesma mensagem, sem token | Aprovado | `CT-LOG-08.png` |
| CT-LOG-09 | 401, mesma mensagem, sem token | Aprovado | `CT-LOG-09.png` |
| CT-LOG-10 | 400, "Informe e-mail e senha." | Aprovado | `CT-LOG-10.txt` |
| CT-LOG-11 | 400, "Informe e-mail e senha." | Aprovado | `CT-LOG-11.txt` |
| CT-LOG-12 (e-mail número) | 400, "Informe e-mail e senha." | Aprovado | `CT-LOG-12-email-num.txt` |
| CT-LOG-12 (senha número) | 400, "Informe e-mail e senha." | Aprovado | `CT-LOG-12-senha-num.txt` |
| CT-LOG-12 (e-mail objeto) | 400, "Informe e-mail e senha." (a tentativa com objeto `{"$ne": null}` foi rejeitada) | Aprovado | `CT-LOG-12-email-obj.txt` |
| CT-LOG-13 | CT-LOG-03 e CT-LOG-07 retornaram o mesmo status (401) e a mesma mensagem | Aprovado | `CT-LOG-13.txt` |
| CT-LOG-14 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-AUT-01 (latest) | 401, "Autenticação necessária." | Aprovado | `CT-AUT-01-latest.txt` |
| CT-AUT-01 (lista) | 401, "Autenticação necessária." | Aprovado | `CT-AUT-01-lista.txt` |
| CT-AUT-02 (3 exemplos) | `Bearer` vazio e `Basic`: 401 "Autenticação necessária."; `Bearer abc123`: 401 "Sessão inválida ou expirada. Faça login novamente." | Aprovado | `CT-AUT-02-*.txt` |
| CT-AUT-03 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-AUT-03.txt` |
| CT-AUT-04 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-AUT-04.txt` |
| CT-AUT-05 | Ana: líquidos 5745 (2026-10, v2) e 5395 (2026-09, v1). Bruno: 6806 (2026-10, v1) e 6806 (2026-09, v1). Sem troca de dados | Aprovado | `CT-AUT-05.txt` |
| CT-AUT-06 | 200 nas duas rotas; o JSON contém `"_id"` nos itens de `earnings` e `deductions` | **Reprovado: BUG-001** | `CT-AUT-06.txt` |
| CT-AUT-07 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-AUT-08 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-AUT-09 | Saída sem corpo na rodada final; em rodada anterior (prints) retornou apenas dados da Ana (5745 e 5395) | Bloqueado (reexecutar com `api.test.js`) | `CT-AUT-09.txt` |
| CT-CON-01 (Ana) | 2026-10, versão 2, `netPay` 5745, `publishedAt` 2026-11-05 | Aprovado | `CT-CON-01.txt` |
| CT-CON-01 (Bruno) | 2026-10, versão 1, `netPay` 6806, `publishedAt` 2026-11-05 | Aprovado | `CT-CON-01.txt` |
| CT-CON-02 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-CON-02.txt` |
| CT-CON-03 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-CON-03.txt` |
| CT-CON-04 | Arquivo de saída vazio (a saída do CT-AUT-05 é consistente, mas o caso precisa ser reexecutado) | Bloqueado (reexecutar com `api.test.js`) | `CT-CON-04.txt` |
| CT-CON-05 | Arquivo de saída vazio (a saída do CT-AUT-05 é consistente, mas o caso precisa ser reexecutado) | Bloqueado (reexecutar com `api.test.js`) | `CT-CON-05.txt` |
| CT-CON-06 | Listas de Ana (2026-10 v2 e 2026-09 v1) e Bruno (2026-10 v1 e 2026-09 v1) sem a competência 2026-11 | Aprovado | `CT-CON-06.txt` |
| CT-CON-07 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-CON-07.txt` |
| CT-CON-08 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-CON-09 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-CON-10 | Sem massa de dados com exatamente 1 holerite publicado | Não executável | n/a |
| CT-CON-11 | Não executado manualmente | Bloqueado (Web: reexecutar com `web.spec.js`) | n/a |
| CT-API-01 (PUT) | 404, "Recurso não encontrado." (esperado ideal: 405) | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-01 (DELETE) | 404, "Recurso não encontrado." | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-01 (POST em /latest) | 404, "Recurso não encontrado." | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-02 | **Observação (a confirmar):** GET em `/api/auth/login` retornou 404; mesmo comportamento do BUG-003 | Aprovado (com observação) | `CT-API-02.txt` |
| CT-API-03 | 500, "Erro interno." (esperado: 400) | **Reprovado: BUG-002** | `CT-API-03.txt` |
| CT-API-04 | 404, "Recurso não encontrado." | Aprovado | `CT-API-04.txt` |
| CT-API-05 | 400, "Informe e-mail e senha." | Aprovado | `CT-API-05.txt` |
| CT-API-06 | Arquivo de saída vazio | Bloqueado (reexecutar com `api.test.js`) | `CT-API-06.txt` |
| CT-API-07 | Delegado à automação de performance | Não executável (manual) | n/a |
| CT-API-08 | 20 requisições com status 200; menor tempo 0,164 s e maior 0,286 s | Aprovado | `CT-API-08.txt` |
| EXP-API | Sessão exploratória ainda não realizada | Pendente | n/a |
| EXP-WEB | Sessão exploratória ainda não realizada | Pendente | n/a |

## 5. Pendências e como resolvê-las
Os 15 casos bloqueados são reexecutados por dois scripts, com a aplicação rodando (`npm start`):

| Script | Casos que reexecuta | Comando |
|---|---|---|
| `tests/api/api.test.js` | CT-AUT-03, CT-AUT-04, CT-AUT-09, CT-CON-02, 03, 04, 05, 07 e CT-API-06 (além de repetir os já aprovados) | `node --test --test-reporter=spec tests/api/ \| tee docs/evidencias/resultado-api.txt` |
| `tests/web/web.spec.js` | CT-LOG-14, CT-AUT-07, CT-AUT-08, CT-CON-08, CT-CON-09, CT-CON-11 (além de CT-CON-01 e CT-CON-02 na Web) | `npx playwright test` |

Depois das duas execuções, este documento é atualizado para a versão 1.0 com os resultados reais. Falta também realizar as duas sessões exploratórias (EXP-API e EXP-WEB).

## 6. Observações
- Os resultados "a confirmar" (CT-LOG-02, CT-API-01 e CT-API-02) foram tratados como observações: o e-mail é normalizado (aceito) e o verbo não suportado retorna 404.
- O print do CT-LOG-01 (Ana) está com nome automático (`image_52c4bb.png`); renomear para `CT-LOG-01-ana.png`.
- Dois fatos positivos de segurança observados: as tentativas de injeção com objeto no campo e-mail foram rejeitadas (400) e a mensagem de erro do login é idêntica para e-mail inexistente e senha errada.
