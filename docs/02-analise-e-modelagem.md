# Análise e Modelagem de Testes: Sistema de Consulta de Holerites

| Campo | Valor |
|---|---|
| Documento | 02 de 06 (segue o `01-plano-de-testes.md`, v1.1) |
| Versão | 1.0 |
| Data | 25/11/2026 |
| Responsável | [Jeferson de Souza Martins] |

## 1. Objetivo
Transformar os requisitos (RF-01, RF-02 e RN-01 a RN-05) em **condições de teste** e modelar os dados de entrada com as técnicas definidas no plano: partição de equivalência, análise do valor limite e tabela de decisão. Cada condição receberá casos de teste Gherkin na etapa 3.

## 2. Resultado esperado (oráculo) para os dados de teste
O resultado esperado de cada caso é conferido com a tabela abaixo. Os valores vêm da massa de dados descrita no README. Senha de todos: `Senha@123`.

| Funcionário | Competência exibida ao entrar | Versão | Publicado em | Proventos | Descontos | Líquido |
|---|---|---|---|---|---|---|
| Ana Souza | 10/2026 | **v2** | 05/11/2026 | R$ 6.850,00 (salário base 6.500,00 e ajuste retroativo 350,00) | R$ 1.105,00 (INSS 585,00 e IRRF 520,00) | **R$ 5.745,00** |
| Ana Souza | 09/2026 (seletor) | v1 | 05/10/2026 | R$ 6.500,00 | R$ 1.105,00 | R$ 5.395,00 |
| Bruno Lima | 10/2026 | v1 | 05/11/2026 | R$ 8.200,00 | R$ 1.394,00 (INSS 738,00 e IRRF 656,00) | **R$ 6.806,00** |
| Bruno Lima | 09/2026 (seletor) | v1 | 05/10/2026 | R$ 8.200,00 | R$ 1.394,00 | R$ 6.806,00 |
| Carla Mendes | nenhuma | n/a | n/a | n/a | n/a | n/a (mensagem informativa) |

Mensagem esperada na ausência de holerites: **"Você ainda não possui holerites disponibilizados."**

## 3. Condições de teste

| ID | Condição de teste | Requisito | Técnica |
|---|---|---|---|
| CND-01 | Login com credenciais válidas concede acesso e devolve um token | RF-01, RN-01 | Partição de equivalência |
| CND-02 | Login com e-mail ou senha inválidos é negado, com mensagem clara | RF-01, RN-01 | Partição de equivalência |
| CND-03 | Login com campos vazios, ausentes ou de tipo incorreto é rejeitado | RF-01, RN-01 | Partição de equivalência |
| CND-04 | A mensagem de erro do login não revela se o e-mail existe | RN-01 | Partição de equivalência |
| CND-05 | Consulta sem token, com token malformado, adulterado ou expirado é negada | RN-01 | Tabela de decisão (estado do token) |
| CND-06 | A tela de consulta só é acessível após o login; após o logout, volta ao login | RN-01 | Checking e exploratório |
| CND-07 | O token de um funcionário retorna somente os holerites dele | RN-02 | Tabela de decisão (estado do token) |
| CND-08 | A resposta não contém dados de outro funcionário nem dados internos (hash de senha, ids) | RN-02 | Exploratório (VADER: Dados) |
| CND-09 | Ao entrar, exibe a competência mais recente com holerite publicado | RN-03 | Tabela de decisão (publicação) |
| CND-10 | Em uma competência com várias versões publicadas, exibe a de maior versão | RN-03 | Tabela de decisão (publicação) |
| CND-11 | Em uma competência cuja maior versão é rascunho, exibe a maior versão publicada | RN-03, RN-04 | Tabela de decisão (publicação) |
| CND-12 | Competência que só tem rascunhos não aparece | RN-04 | Tabela de decisão (publicação) |
| CND-13 | Funcionário sem nenhum holerite publicado recebe mensagem informativa, sem erro | RN-05 | Valor limite (0 holerites) |
| CND-14 | O seletor de competência aparece apenas quando há 2 ou mais competências publicadas | RF-02 | Valor limite (quantidade) |
| CND-15 | Os valores exibidos (proventos, descontos, líquido) conferem com os dados do funcionário | RF-02 | Checking |
| CND-16 | Verbos e rotas: cada endpoint responde corretamente ao verbo previsto e trata os demais | RF-01, RF-02 | Exploratório (VADER: Verbos) |
| CND-17 | Erros da API usam o código de status adequado, sem expor detalhes internos | RF-01, RF-02 | Exploratório (VADER: Erros) |
| CND-18 | Tempo de resposta e comportamento sob várias requisições simultâneas | RF-01, RF-02 | Exploratório (VADER: Responsividade) e automação |
| CND-19 | A documentação Swagger carrega e o YAML é renderizado | Escopo do projeto | Checking |

## 4. Partição de equivalência: login (CND-01 a CND-04)

### 4.1 Campo e-mail
| Classe | Descrição | Exemplo | Válida? | Resultado esperado |
|---|---|---|---|---|
| E1 | Cadastrado | `ana@empresa.com` | Sim | Segue para a validação da senha |
| E2 | Cadastrado, com maiúsculas ou espaços nas bordas | ` ANA@Empresa.com ` | Sim* | Segue para a validação da senha |
| E3 | Formato válido, não cadastrado | `joao@empresa.com` | Não | Acesso negado (401), mensagem genérica |
| E4 | Formato inválido | `ana.empresa.com` | Não | Acesso negado, sem acesso |
| E5 | Vazio | `""` | Não | Acesso negado |
| E6 | Campo ausente | (não enviado) | Não | Rejeitado (400) |
| E7 | Tipo incorreto | `123` ou `{"$ne": null}` | Não | Rejeitado (400) |

\* O requisito não define se o e-mail diferencia maiúsculas e espaços. O comportamento observado será registrado na execução como **"a confirmar"**.

### 4.2 Campo senha
| Classe | Descrição | Exemplo | Válida? | Resultado esperado |
|---|---|---|---|---|
| S1 | Correta | `Senha@123` | Sim | Acesso concedido (com e-mail válido) |
| S2 | Incorreta | `Errada@1` | Não | Acesso negado (401), mensagem genérica |
| S3 | Correta com caixa diferente | `senha@123` | Não | Acesso negado |
| S4 | Correta com espaço no final | `Senha@123 ` | Não | Acesso negado |
| S5 | Vazia | `""` | Não | Acesso negado |
| S6 | Campo ausente | (não enviado) | Não | Rejeitado (400) |
| S7 | Tipo incorreto | `123` | Não | Rejeitado (400) |

### 4.3 Combinações selecionadas
Em vez de testar todas as combinações, cada classe inválida é testada uma vez com a outra entrada válida, mais o caso feliz.

| # | E-mail | Senha | Cobre | Resultado esperado |
|---|---|---|---|---|
| L1 | E1 | S1 | Caso feliz | 200, token e dados do funcionário |
| L2 | E2 | S1 | E2 | 200 ou 401 (a confirmar) |
| L3 | E1 | S2 | S2 | 401 |
| L4 | E1 | S3 | S3 | 401 |
| L5 | E1 | S4 | S4 | 401 |
| L6 | E1 | S5 | S5 | Acesso negado |
| L7 | E1 | S6 | S6 | 400 |
| L8 | E1 | S7 | S7 | 400 |
| L9 | E3 | S1 | E3 | 401, mesma mensagem de L3 (CND-04) |
| L10 | E4 | S1 | E4 | Acesso negado |
| L11 | E5 | S1 | E5 | Acesso negado |
| L12 | E6 | S1 | E6 | 400 |
| L13 | E7 | S1 | E7 | 400 |

## 5. Análise do valor limite: quantidade de holerites publicados (CND-13 e CND-14)
Limites aplicados à quantidade de competências com holerite publicado de um funcionário.

| Quantidade | Comportamento esperado | Massa de dados | Situação |
|---|---|---|---|
| **0** (limite inferior) | Mensagem informativa, seletor oculto, sem erro | Carla | Coberto |
| **1** (limite) | Exibe o holerite, seletor oculto | Nenhum funcionário da massa | **Lacuna de cobertura** |
| **2** (primeiro valor com seletor) | Exibe o mais recente, seletor visível com 2 opções | Ana e Bruno | Coberto |
| 3 ou mais | Seletor visível, ordem da mais recente para a mais antiga | Nenhum funcionário da massa | Não coberto |

**Lacuna registrada:** a massa de dados fixa (3 funcionários, conforme o escopo do projeto) não possui o valor 1. Para cobri-lo seria preciso alterar temporariamente o `seed.js` no ambiente local, sem commitar. A decisão fica para a execução: cobrir localmente ou deixar a lacuna registrada no relatório final.

**Versões dentro da competência** (limite análogo):

| Situação | Massa | Esperado |
|---|---|---|
| Só a versão 1 | Ana 09/2026, Bruno 10/2026 | Exibe v1 |
| Versão 1 e 2 publicadas | Ana 10/2026 | Exibe v2 |
| Versão 1 publicada e versão 2 rascunho | Bruno 09/2026 | Exibe v1 |

## 6. Tabelas de decisão

### 6.1 Estado do token (CND-05 e CND-07)
| Regra | Token enviado | Assinatura válida | Expirado | Resultado esperado |
|---|---|---|---|---|
| T1 | Não enviado | n/a | n/a | 401, mensagem "Autenticação necessária." |
| T2 | Malformado (não é Bearer ou não é JWT) | n/a | n/a | 401 |
| T3 | Adulterado (assinatura alterada) | Não | n/a | 401 |
| T4 | Válido de outro momento, vencido | Sim | Sim | 401, orienta novo login |
| T5 | Válido e dentro do prazo | Sim | Não | 200, **somente** dados do dono do token |

### 6.2 Seleção do holerite por competência (CND-09 a CND-12)
Para cada competência do funcionário:

| Regra | Existe versão publicada? | A maior versão está publicada? | Resultado para a competência |
|---|---|---|---|
| D1 | Não (só rascunhos) | n/a | Não aparece |
| D2 | Sim | Sim | Exibe a maior versão |
| D3 | Sim | Não (a maior é rascunho) | Exibe a maior versão **publicada** |

### 6.3 Seleção do holerite exibido ao entrar (CND-09 e CND-13)
| Regra | Há competência com holerite visível? | Resultado esperado |
|---|---|---|
| H1 | Sim | Exibe o da **competência mais recente** (conforme 6.2) |
| H2 | Não | Mensagem informativa, sem erro e sem dados de terceiros |

### 6.4 Cobertura das regras pela massa de dados
| Regra | Onde ocorre |
|---|---|
| D1 | Ana 11/2026, Bruno 11/2026, Carla 10/2026 e 11/2026 |
| D2 | Ana 09/2026 (v1), Ana 10/2026 (v2), Bruno 10/2026 (v1) |
| D3 | Bruno 09/2026 (v2 rascunho, exibe v1) |
| H1 | Ana (10/2026 v2) e Bruno (10/2026 v1) |
| H2 | Carla |

Todas as regras das tabelas de decisão têm pelo menos uma ocorrência na massa de dados.

## 7. Matriz de rastreabilidade

| Requisito | Condições | Técnicas |
|---|---|---|
| RF-01 (Login) | CND-01 a CND-04, CND-16 a CND-18 | Partição de equivalência, exploratório (VADER) |
| RF-02 (Consulta) | CND-14, CND-15, CND-16 a CND-18 | Valor limite, checking, exploratório (VADER) |
| RN-01 | CND-01 a CND-06 | Partição, tabela de decisão (token) |
| RN-02 | CND-07, CND-08 | Tabela de decisão (token), exploratório |
| RN-03 | CND-09, CND-10, CND-11 | Tabela de decisão (seleção) |
| RN-04 | CND-11, CND-12 | Tabela de decisão (seleção) |
| RN-05 | CND-13 | Valor limite (0 holerites) |

## 8. Pontos a observar na execução
Itens em que o requisito não define o resultado esperado. O comportamento será registrado na etapa 4 e, se divergir de uma boa prática, vira report de bug:

- E-mail com maiúsculas ou espaços (L2).
- Código de status para e-mail com formato inválido, vazio ou senha vazia (L6, L10, L11).
- Resposta a corpo JSON malformado e a verbo diferente do previsto (CND-16 e CND-17).

## 9. Próxima etapa
Escrever os casos de teste em Gherkin (`03-casos-de-teste.md` e `features/*.feature`), um ou mais cenários por condição.