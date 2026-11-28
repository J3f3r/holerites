# Relatório Final de Testes: Sistema de Consulta de Holerites

| Campo | Valor |
|---|---|
| Aplicação | Sistema de Consulta de Holerites v1.0.0 (API REST + site) |
| Período | 25/11/2026 a 27/11/2026 |
| Responsável | Jeferson |
| Documentos relacionados | `01` a `05` em `docs/`, `tests/` |

## 1. Resumo
Foi feito o planejamento, a modelagem, a escrita de 44 casos de teste, a execução manual e automatizada (API, Web e performance) e duas sessões de teste exploratório. **Foram encontrados 8 defeitos: 3 de severidade Média e 5 Baixa. Nenhum crítico ou de alta severidade.** Há ainda uma observação de design (OBS-001). O ponto mais sensível do sistema, o isolamento dos holerites entre funcionários, foi verificado em API e em Web e **não apresentou falha**.

## 2. O que foi feito

| Atividade | Artefato |
|---|---|
| Planejamento (escopo, técnicas, riscos, critérios, cronograma) | `01-plano-de-testes.md` (v1.1) |
| Análise e modelagem: 19 condições de teste, partição de equivalência, valor limite, 3 tabelas de decisão | `02-analise-e-modelagem.md` |
| 44 casos de teste em Gherkin | `03-casos-de-teste.md`, `features/*.feature` |
| Roteiro e registro de execução | `04-roteiro-de-execucao.md`, `04-execucao-e-resultados.md` |
| 2 sessões exploratórias (VADER na API; heurísticas na Web) | `04-sessoes-exploratorias.md` |
| 8 reports de bug e 1 observação | `05-bugs/` |
| Automação de API (Node test runner) | `tests/api/api.test.js` |
| Automação Web (Playwright) | `tests/web/web.spec.js` |
| Automação de performance (autocannon) | `tests/performance/carga.js` |

**Técnicas usadas:** análise de condições de teste, partição de equivalência, valor limite (quantidade de holerites e versões), tabela de decisão, Gherkin, checking, teste exploratório e a heurística VADER. **Avaliadas e não adotadas:** teste ad hoc como atividade separada, valor limite em campos de entrada, Jira, Selenium e Cypress (justificativas no plano).

## 3. Resultados

### 3.1 Casos do roteiro (54 itens)
| Status | Quantidade |
|---|---|
| Aprovado | 46 |
| Reprovado (originaram 3 bugs) | 5 |
| Não executável (CT-CON-10) | 1 |
| Sessões exploratórias executadas | 2 |

### 3.2 Automação (resultados da última execução registrada)
| Automação | Resultado |
|---|---|
| API | 48 testes: 39 aprovados, 0 falhas, 9 `todo` (reproduzem os BUG-001, 002, 003, 005, 007 e 008) |
| Web | 14 testes: 14 aprovados (39,7 s), sendo 1 de falha esperada que reproduz o BUG-006 |
| Performance | `GET /api/payslips/latest`: 0 erros, p97,5 de 84 ms. `GET /api/payslips`: 0 erros, p97,5 de 53 ms. Ambos aprovados no critério de 500 ms |

Os números acima incluem os 5 testes acrescentados após as sessões exploratórias (4 de API e 1 de Web), executados em 27/11/2026. Na Web, o Playwright mostra o teste do BUG-006 com ✗ e o conta como aprovado, porque é uma falha esperada: o teste confirma que o defeito continua presente.

### 3.3 Cobertura dos requisitos
| Requisito | Cobertura | Resultado |
|---|---|---|
| RF-01 Login | Partição de equivalência (13 combinações), API e Web | Aprovado |
| RF-02 Consulta | Valores, seletor, ordem e versão, API e Web | Aprovado |
| RN-01 Autenticação obrigatória | Sem token, malformado, adulterado, expirado; Web sem sessão e logout | Aprovado, com a observação OBS-001 |
| RN-02 Isolamento dos dados | Token de cada funcionário, parâmetro `employeeId` forçado, duas abas com usuários diferentes | Aprovado |
| RN-03 Holerite mais atual | Ana vê 10/2026 v2 e Bruno vê 10/2026 v1 | Aprovado |
| RN-04 Somente publicados | Rascunhos em 09/2026 (Bruno) e 11/2026 não aparecem | Aprovado |
| RN-05 Sem holerites | Carla recebe a mensagem informativa, sem erro (API e Web) | Aprovado |

## 4. Defeitos encontrados

| ID | Título | Severidade | Origem |
|---|---|---|---|
| BUG-001 | A API expõe o campo interno `_id` nos itens de proventos e descontos | Baixa | CT-AUT-06 |
| BUG-002 | JSON malformado no login retorna 500 em vez de 400 | Média | CT-API-03 |
| BUG-003 | Verbo HTTP não suportado retorna 404 em vez de 405 | Baixa | CT-API-01, CT-API-02, EXP-API |
| BUG-004 | O login degrada com 10 usuários simultâneos (média de 1,9 s) | Média | Performance |
| BUG-005 | Corpo acima do limite retorna 500 em vez de 413 | Média | EXP-API |
| BUG-006 | A tela exibe "Failed to fetch" em inglês sem conexão | Baixa | EXP-WEB |
| BUG-007 | A API expõe o cabeçalho `X-Powered-By: Express` | Baixa | EXP-API |
| BUG-008 | O prefixo `bearer` em minúsculas é rejeitado com 401 | Baixa | EXP-API |

**Observação OBS-001:** o token continua válido na API depois de clicar em "Sair" no site (JWT sem revogação, validade de 1 h). Não foi classificada como defeito, por ser uma decisão de arquitetura; a decisão de aceitar ou tratar o risco está pendente.

**Padrões observados:**
- **Tratamento de erros da API:** BUG-002 e BUG-005 têm a mesma causa provável (o tratador de erros ignora o status do erro) e a mesma correção. BUG-003 e BUG-007 também são de acabamento de API.
- **Regras de negócio:** nenhum defeito. Os problemas estão na robustez, na forma de responder a erros e no desempenho do login, não na lógica dos holerites.

## 5. Pontos positivos observados
- A mensagem de erro do login é idêntica para e-mail inexistente e senha errada.
- Tentativa de injeção com objeto no campo e-mail foi rejeitada (400).
- `<script>alert(1)</script>` digitado no e-mail não foi executado.
- As sessões de dois usuários em duas abas não se misturaram, e o botão Voltar após Sair não expôs o holerite.
- Nenhum erro exibiu pilha de erro ou caminho de arquivo.
- Os parâmetros `?employeeId=outro` e `?competence=` não alteraram o resultado: o isolamento se manteve.

## 6. Limitações e lacunas
- **Lacuna de massa de dados:** nenhum funcionário tem exatamente 1 holerite publicado. O caso CT-CON-10 (seletor oculto com 1 holerite) não foi executado.
- **Sessões exploratórias:** ambas foram feitas em dois blocos (EXP-API, cerca de 23 minutos no total). As verificações que ficaram inconclusivas por falta de token no primeiro bloco foram repetidas com token válido. **Não realizados:** navegação por teclado no seletor de competência, teste com leitor de tela e confirmação de rolagem horizontal com zoom de 200%.
- **Performance:** cliente e servidor rodaram na mesma máquina, com uma rodada de 10 s por cenário. Os números são uma linha de base, não a capacidade real. O login foi medido sem limite de aceitação definido.
- **Escopo:** sem testes de segurança avançados, compatibilidade entre navegadores (só Chrome) nem acessibilidade completa (leitor de tela não testado).
- **Ambiente:** os testes rodaram em uma máquina, com o banco em memória (dados recriados a cada início).

## 7. Riscos remanescentes
- Desempenho do login em horário de pico (BUG-004).
- Erros de cliente tratados como falha interna (BUG-002 e BUG-005) distorcem monitoramento.
- Ausência de revogação do token no servidor: o token continua aceito até expirar (1 h), mesmo depois de **Sair** (confirmado na sessão EXP-API e no teste automatizado, OBS-001).

## 8. Recomendações
1. Corrigir o tratador de erros (BUG-002 e BUG-005) em uma só alteração.
2. Traduzir e padronizar as mensagens de rede no site (BUG-006).
3. Medir de novo o login após trocar o hash de senha por uma biblioteca nativa e definir um limite aceitável (BUG-004).
4. Desativar `X-Powered-By` e devolver 405 nos verbos não suportados (BUG-007 e BUG-003).
5. Remover `_id` dos itens do holerite (BUG-001).
6. Incluir na massa de dados um funcionário com 1 holerite publicado, para cobrir o limite.
7. Aceitar o esquema `bearer` sem diferenciar maiúsculas (BUG-008) e decidir sobre a validade e a revogação do token (OBS-001).

## 9. Como foi produzido e o que fica da experiência
A aplicação e os artefatos de teste foram elaborados com apoio de IA; a **execução manual, as sessões exploratórias e a rodada de cada automação foram feitas pelo responsável**, e os resultados registrados refletem somente o que foi observado. Itens não executados ou inconclusivos estão declarados como tais.

**Aprendizados:**
- Registrar o resultado esperado antes de executar (oráculo) evitou discussões do tipo "parece certo".
- A heurística VADER gerou achados que os casos escritos não previam (BUG-005, BUG-007, BUG-008 e OBS-001).
- Automatizar o que já estava bem entendido foi mais rápido que automatizar às cegas.
- Ao medir performance, comparar endpoints sob a mesma carga revelou o problema do login.

## 10. Próximos passos
1. Reexecutar as automações para incluir os 5 testes novos e atualizar o `04`.
2. Reescrever o backend em Java com novas funcionalidades, reaproveitando os casos e as automações como base de regressão.
3. Reavaliar o teste ad hoc, o valor limite em campos de entrada e o uso de ferramentas como Jira na nova versão.
4. Refazer parte dos testes manualmente, com acompanhamento, para consolidar a prática.
5. Oferecer o projeto como apoio a testes em uma ONG da cidade.
