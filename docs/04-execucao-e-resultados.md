# Execução e Resultados dos Testes

| Campo | Valor |
|---|---|
| Documento | 04 de 06 |
| Versão | 1.0 |
| Data | 27/11/2026 (atualizado após as sessões exploratórias) |
| Executor | [Seu nome] |
| Referências | `03-casos-de-teste.md`, `04-roteiro-de-execucao.md` |

## 1. Como foi executado
- **Execução manual guiada** pelo roteiro: API com `curl` no Git Bash (saídas gravadas em `docs/evidencias/*.txt`), Swagger no navegador (prints em `.png`).
- **Primeira rodada:** casos de documentação, login, autorização, consulta e VADER.
- **Segunda rodada:** refeita com tokens renovados e saídas gravadas em arquivo. Parte dos comandos gravou somente o cabeçalho, com a saída vazia. A causa provável é que as variáveis de token (`$ANA`, `$BRUNO`, `$CARLA`) e `$P` não foram expandidas dentro do subshell da função usada para gravar os arquivos. Esses casos ficaram **Bloqueados** e são reexecutados pelos scripts automatizados (seção 5).
- **Terceira rodada (automatizada):** o script `tests/api/api.test.js` foi executado com a aplicação rodando e a massa original: **44 testes, 38 aprovados, 0 falhas, 6 `todo`** (os 6 reproduzem os bugs BUG-001, BUG-002 e BUG-003). Saída em `docs/evidencias/resultado-api.txt`. Todos os casos de API antes bloqueados foram resolvidos nessa rodada.
- **Quarta rodada (Web, automatizada):** o script `tests/web/web.spec.js` foi executado com o Playwright (Chromium) com a aplicação rodando: **13 testes, 13 aprovados**, em 51,8 s. Prints de cada teste em `docs/evidencias/web-resultados/` e relatório em `docs/evidencias/web-report/`. Os casos Web não foram executados manualmente.
- **Quinta rodada (performance, automatizada):** `tests/performance/carga.js` (autocannon), 10 conexões por 10 s em cada cenário. Resultados na seção 6.
- **Sexta rodada (exploratória, manual):** sessões EXP-API e EXP-WEB, registradas em `04-sessoes-exploratorias.md`, com prints em `docs/evidencias/exploratorias/`. Geraram os BUG-005, BUG-006, BUG-007 e BUG-008, a observação OBS-001 e confirmaram o BUG-003 com um verbo novo (`OPTIONS`). Os testes inconclusivos (token vazio) foram repetidos às 20:46 com token válido.
- **Sétima rodada (automatizada completa, 27/11/2026, das 21:37 às 21:41):** API com **48 testes: 39 aprovados, 0 falhas e 9 `todo`** (12,8 s); Web com **14 testes, 14 aprovados** (39,7 s). Incluiu os 5 testes acrescentados após as sessões exploratórias. Resultados na seção 5.1.
- Este documento registra **apenas o que foi observado**. Nenhum resultado dos casos pendentes foi presumido.

## 2. Ambiente
Windows (Git Bash), Node.js [versão], Google Chrome [versão], aplicação v1.0.0 na branch `feature/consulta-holerites`, banco MongoDB em memória com a massa original (3 funcionários).

## 3. Resumo (54 itens do roteiro)

| Status | Quantidade |
|---|---|
| Aprovado | 46 |
| Reprovado (gera bug) | 5 itens, que correspondem a 3 bugs |
| Bloqueado | 0 |
| Não executável | 1 (CT-CON-10) |
| Sessões exploratórias executadas | 2 (EXP-API, cerca de 23 min em dois blocos; EXP-WEB, dois blocos) |

**Defeitos encontrados: 8.** Funcionais e de erro: BUG-001, BUG-002, BUG-003, BUG-005, BUG-006, BUG-007 e BUG-008 (Baixa, exceto BUG-002 e BUG-005, Média). Performance: BUG-004 (Média). Nenhum crítico ou de alta severidade. Origem: 3 da execução dos casos, 1 da performance e 4 das sessões exploratórias (BUG-005 a BUG-008). Há ainda a observação OBS-001 (token válido após Sair). Detalhes em `05-bugs/`.

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
| CT-LOG-14 | Execução automatizada (Playwright): senha inválida exibe "E-mail ou senha inválidos." e a tela de login permanece | Aprovado | `docs/evidencias/web-resultados/` |
| CT-AUT-01 (latest) | 401, "Autenticação necessária." | Aprovado | `CT-AUT-01-latest.txt` |
| CT-AUT-01 (lista) | 401, "Autenticação necessária." | Aprovado | `CT-AUT-01-lista.txt` |
| CT-AUT-02 (3 exemplos) | `Bearer` vazio e `Basic`: 401 "Autenticação necessária."; `Bearer abc123`: 401 "Sessão inválida ou expirada. Faça login novamente." | Aprovado | `CT-AUT-02-*.txt` |
| CT-AUT-03 | Execução automatizada: 401 para token com a assinatura alterada | Aprovado | `resultado-api.txt` |
| CT-AUT-04 | Execução automatizada: 401 para token expirado, com mensagem orientando novo login | Aprovado | `resultado-api.txt` |
| CT-AUT-05 | Ana: líquidos 5745 (2026-10, v2) e 5395 (2026-09, v1). Bruno: 6806 (2026-10, v1) e 6806 (2026-09, v1). Sem troca de dados | Aprovado | `CT-AUT-05.txt` |
| CT-AUT-06 | 200 nas duas rotas; o JSON contém `"_id"` nos itens de `earnings` e `deductions`. Reproduzido na execução automatizada (`/api/payslips/latest`) | **Reprovado: BUG-001** | `CT-AUT-06.txt`, `resultado-api.txt` |
| CT-AUT-07 | Execução automatizada (Playwright): sem sessão a tela de login é exibida e nenhum holerite aparece | Aprovado | `docs/evidencias/web-resultados/` |
| CT-AUT-08 | Execução automatizada (Playwright): após clicar em Sair e recarregar a página, a tela de login continua sendo exibida | Aprovado | `docs/evidencias/web-resultados/` |
| CT-AUT-09 | Execução automatizada: o parâmetro `employeeId` não troca o funcionário; retornou somente os dados da Ana (5745 e 5395) | Aprovado | `resultado-api.txt` |
| CT-CON-01 (Ana) | 2026-10, versão 2, `netPay` 5745, `publishedAt` 2026-11-05 | Aprovado | `CT-CON-01.txt` |
| CT-CON-01 (Bruno) | 2026-10, versão 1, `netPay` 6806, `publishedAt` 2026-11-05 | Aprovado | `CT-CON-01.txt` |
| CT-CON-02 | Execução automatizada: Ana: proventos 6850, descontos 1105, líquido 5745, publicado em 2026-11-05 | Aprovado | `resultado-api.txt` |
| CT-CON-03 | Execução automatizada: Carla: 200, `payslip` nulo e mensagem "Você ainda não possui holerites disponibilizados." | Aprovado | `resultado-api.txt` |
| CT-CON-04 | Execução automatizada: Ana: lista com 2026-10 v2 e depois 2026-09 v1 | Aprovado | `resultado-api.txt` |
| CT-CON-05 | Execução automatizada: Bruno: 2026-10 v1 e 2026-09 v1 (a v2 em rascunho não substituiu a publicada) | Aprovado | `resultado-api.txt` |
| CT-CON-06 | Listas de Ana (2026-10 v2 e 2026-09 v1) e Bruno (2026-10 v1 e 2026-09 v1) sem a competência 2026-11 | Aprovado | `CT-CON-06.txt` |
| CT-CON-07 | Execução automatizada: Carla: 200, lista vazia e mensagem informativa | Aprovado | `resultado-api.txt` |
| CT-CON-08 | Execução automatizada (Playwright): Ana vê o seletor com 2 opções (Outubro e Setembro de 2026); ao escolher setembro, aparece a versão 1 com líquido de R$ 5.395,00 | Aprovado | `docs/evidencias/web-resultados/` |
| CT-CON-09 | Execução automatizada (Playwright): Carla não vê o seletor de competência | Aprovado | `docs/evidencias/web-resultados/` |
| CT-CON-10 | Sem massa de dados com exatamente 1 holerite publicado | Não executável | n/a |
| CT-CON-11 | Execução automatizada (Playwright): login realizado usando somente Tab e Enter | Aprovado | `docs/evidencias/web-resultados/` |
| CT-API-01 (PUT) | 404, "Recurso não encontrado." (esperado ideal: 405; reproduzido na execução automatizada: `404 !== 405`) | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-01 (DELETE) | 404, "Recurso não encontrado." | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-01 (POST em /latest) | 404, "Recurso não encontrado." | **Reprovado: BUG-003** | `CT-API-01.txt` |
| CT-API-02 | **Observação (a confirmar):** GET em `/api/auth/login` retornou 404; mesmo comportamento do BUG-003 | Aprovado (com observação) | `CT-API-02.txt` |
| CT-API-03 | 500, "Erro interno." (esperado: 400). Reproduzido na execução automatizada: `500 !== 400` | **Reprovado: BUG-002** | `CT-API-03.txt`, `resultado-api.txt` |
| CT-API-04 | 404, "Recurso não encontrado." | Aprovado | `CT-API-04.txt` |
| CT-API-05 | 400, "Informe e-mail e senha." | Aprovado | `CT-API-05.txt` |
| CT-API-06 | Execução automatizada: `competence` no formato AAAA-MM, `version` inteiro, `publishedAt` válido, números nos valores e `netPay` = `grossPay` − `totalDeductions` | Aprovado | `resultado-api.txt` |
| CT-API-07 | Execução automatizada (autocannon, 10 conexões por 10 s): `GET /api/payslips/latest` com 0 erros e p97,5 de 84 ms; `GET /api/payslips` com 0 erros e p97,5 de 53 ms. Critério: sem erros e p97,5 < 500 ms | Aprovado | `resultado-performance.json` |
| CT-API-08 | 20 requisições com status 200; manual: menor 0,164 s e maior 0,286 s; automatizado: menor 115 ms e maior 398 ms | Aprovado | `CT-API-08.txt`, `resultado-api.txt` |
| EXP-API | Dois blocos (16:12 às 16:30 e 20:46 às 20:51). `HEAD`, `OPTIONS`, variações de URL, campos extras, `Content-Type`, corpo de 200 KB, rajada de requisições, prefixo `bearer` minúsculo, parâmetros `?competence` e `?employeeId` (isolamento mantido) e reuso do token após Sair. Achados: BUG-005, BUG-007, BUG-008, OBS-001 e `OPTIONS` no BUG-003 | Executada | `04-sessoes-exploratorias.md` |
| EXP-WEB | Dois blocos (16:35 às 17:35 e 20:51 às 21:07). Rede offline e servidor parado, Session Storage alterado e apagado, 375 px e zoom de 200%, `<script>` no e-mail, duas abas, botão Voltar após Sair, foco no login e troca de competência com o servidor parado (funcionou com os dados já carregados). Achado: BUG-006 | Executada | `docs/evidencias/exploratorias/` |

## 5. Resultados da execução Web (Playwright)

| # | Teste | Casos cobertos | Resultado |
|---|---|---|---|
| 1 | Sem sessão exibe a tela de login | CT-AUT-07 | Aprovado |
| 2 | Senha inválida mostra erro e permanece no login | CT-LOG-14 | Aprovado |
| 3 | Senha vazia (Web) | CT-LOG-06 | Aprovado |
| 4 | E-mail em formato inválido (Web) | CT-LOG-08 | Aprovado |
| 5 | E-mail vazio (Web) | CT-LOG-09 | Aprovado |
| 6 | Ana vê o holerite mais atual (fluxo completo) | CT-CON-01 | Aprovado |
| 7 | Bruno vê o holerite mais atual | CT-CON-01 | Aprovado |
| 8 | Valores dos proventos e descontos da Ana | CT-CON-02 | Aprovado |
| 9 | Carla vê a mensagem e não vê o seletor | CT-CON-03, CT-CON-09 | Aprovado |
| 10 | Seletor da Ana: 2 opções, sem novembro, troca para setembro | CT-CON-06, CT-CON-08 | Aprovado |
| 11 | Seletor do Bruno: setembro mostra a v1 (v2 é rascunho) | CT-CON-06 | Aprovado |
| 12 | Login usando somente o teclado | CT-CON-11 | Aprovado |
| 13 | Logout encerra a sessão, inclusive após recarregar | CT-AUT-08 | Aprovado |
| 14 | Sem rede, a tela exibe mensagem em português | EXP-WEB (BUG-006) | Falha esperada: o teste falhou como previsto, reproduzindo o BUG-006 (o Playwright o conta como aprovado) |

Nenhum defeito novo foi encontrado na interface. A tela não exibe os totais de proventos e descontos, apenas as linhas e o líquido; por isso o CT-CON-02 na Web confere as linhas individuais (salário base, ajuste retroativo, INSS e IRRF).

## 5.1 Resultado final da execução de API (27/11/2026)

**48 testes: 39 aprovados, 0 falhas, 9 `todo`**, duração de 12,8 s. Os 9 `todo` são defeitos conhecidos que o teste reproduziu:

| Teste | Resultado obtido | Bug |
|---|---|---|
| CT-AUT-06 | O JSON contém `_id` nos itens de proventos e descontos | BUG-001 |
| CT-API-03 | `500 !== 400` (JSON malformado) | BUG-002 |
| CT-API-01 (PUT, DELETE e POST) e CT-API-02 | `404 !== 405` (4 testes) | BUG-003 |
| EXP-API corpo acima do limite | `500 !== 413` | BUG-005 |
| EXP-API X-Powered-By | `'Express' !== null` | BUG-007 |
| EXP-API prefixo `bearer` minúsculo | `401 !== 200` | BUG-008 |

Os testes de registro também rodaram: o e-mail com maiúsculas e espaços foi aceito (200), e o token copiado antes do logout continuou aceito (200, OBS-001). A sequência de 20 logins levou de 151 ms a 254 ms.

## 6. Resultados da execução de performance (autocannon)

**Configuração:** 10 conexões simultâneas por 10 segundos em cada cenário, com token da Ana. **Critério (CT-API-07):** nenhuma resposta com erro e latência no percentil 97,5 abaixo de 500 ms.

| Cenário | Requisições | Req/s | Erros | Média | p50 | p97,5 | Máx. | Veredito |
|---|---|---|---|---|---|---|---|---|
| `GET /api/payslips/latest` | 2.696 | 269,6 | 0 | 36,7 ms | 31 ms | 84 ms | 370 ms | **Aprovado** |
| `GET /api/payslips` | 3.438 | 343,8 | 0 | 28,6 ms | 26 ms | 53 ms | 128 ms | **Aprovado** |
| `POST /api/auth/login` (informativo) | 48 | 4,8 | 0 | 1.924 ms | 1.861 ms | 2.538 ms | 2.538 ms | Sem limite definido |

**Achado:** as consultas ficaram muito abaixo do limite, mas o login foi cerca de 30 vezes mais lento sob a mesma carga. Registrado como **BUG-004** (risco de desempenho, severidade Média).

**Ressalvas:** a medição foi feita em uma única máquina (cliente e servidor competindo por processador), com uma rodada por cenário. Os números servem como linha de base e não como capacidade de produção.

## 7. Pendências
| Pendência | Como resolver |
|---|---|
| Itens não realizados nas sessões: teclado no seletor, leitor de tela e rolagem horizontal com zoom de 200% | Executar na próxima rodada |
| Lacuna CT-CON-10 (exatamente 1 holerite) | Decidir entre alterar o `seed.js` localmente ou manter a lacuna registrada |
| BUG-004 | Decidir o limite aceitável para o login e, se houver correção, repetir a medição |
| OBS-001 | Decidir entre aceitar o risco ou adotar revogação/validade menor |

## 8. Observações
- Os resultados "a confirmar" (CT-LOG-02, CT-API-01 e CT-API-02) foram tratados como observações: o e-mail é normalizado (aceito) e o verbo não suportado retorna 404.
- O print do CT-LOG-01 (Ana) está com nome automático (`image_52c4bb.png`); renomear para `CT-LOG-01-ana.png`.
- Dois fatos positivos de segurança observados: as tentativas de injeção com objeto no campo e-mail foram rejeitadas (400) e a mensagem de erro do login é idêntica para e-mail inexistente e senha errada.
