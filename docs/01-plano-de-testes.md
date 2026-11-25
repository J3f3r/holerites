# Plano de Testes: Sistema de Consulta de Holerites

| Campo | Valor |
|---|---|
| Projeto | Sistema de Consulta de Holerites (API REST + site) |
| Versão do documento | 1.1 |
| Data | 25/11/2026 |
| Responsável | [Jeferson de Souza Martins] |
| Versão da aplicação | 1.0.0 (branch `feature/consulta-holerites`) |

### Histórico de revisões
| Versão | Mudança |
|---|---|
| 1.0 | Versão inicial |
| 1.1 | Inclusão da heurística VADER para API; revisão das técnicas, mantendo só as necessárias para este software; registro das técnicas avaliadas e não adotadas |

## 1. Objetivo
Verificar se a aplicação cumpre suas duas funcionalidades (**Login** e **Consulta de Holerites**) e suas cinco regras de negócio, com atenção especial ao **isolamento dos dados financeiros** entre funcionários.

## 2. Escopo

### 2.1 Dentro do escopo
- Login por e-mail e senha (`POST /api/auth/login`) e a tela de login.
- Consulta do holerite mais recente (`GET /api/payslips/latest`).
- Listagem de holerites publicados (`GET /api/payslips`) e o seletor de competência no site.
- Proteção por token (JWT) e logout.
- Documentação Swagger (`/api-docs` e `/api-docs.yaml`).
- Carga e desempenho dos endpoints de consulta.

### 2.2 Fora do escopo
- Cadastro ou edição de funcionários, publicação de holerites, férias, benefícios e folha de pagamento (a aplicação não possui essas funcionalidades).
- Testes de segurança avançados (pentest) e testes de compatibilidade com muitos navegadores.
- Persistência de dados: o banco é em memória e recriado a cada inicialização.

## 3. Itens a testar e rastreabilidade

| ID | Requisito / regra de negócio |
|---|---|
| RF-01 | Login do funcionário |
| RF-02 | Consulta de holerites |
| RN-01 | Apenas funcionários autenticados acessam o sistema e consultam holerites |
| RN-02 | O funcionário vê exclusivamente os próprios holerites |
| RN-03 | Ao acessar, vê o holerite mais atual (competência mais recente, última versão disponibilizada) |
| RN-04 | Somente holerites publicados são visíveis |
| RN-05 | Sem holerites disponibilizados: mensagem informativa, sem erro e sem dados de terceiros |

## 4. Estratégia e técnicas de teste

### 4.1 Técnicas adotadas e justificativa

| Técnica / abordagem | Onde é aplicada | Por que é necessária aqui |
|---|---|---|
| **Análise de condições de teste** | Derivar condições de cada RF e RN (etapa 2) | Base de toda a rastreabilidade: cada caso nasce de uma condição |
| **Partição de equivalência** | Entradas do login: e-mail e senha válidos, inválidos, vazios, com formato incorreto e com tipo errado | O login tem muitas entradas possíveis; as classes evitam testar uma a uma |
| **Análise do valor limite** | Apenas na **quantidade de holerites publicados** (0, 1, 2 ou mais) | Há fronteiras reais: 0 aciona a mensagem de RN-05 e passar de 1 para 2 faz o seletor de competência aparecer no site. Não se aplica a campos numéricos de entrada, porque o sistema não tem nenhum |
| **Tabela de decisão** | Combinação de status (publicado ou rascunho), versão e competência para definir qual holerite é exibido | RN-03 e RN-04 se combinam; a tabela garante que nenhuma combinação fique sem teste |
| **Casos de teste em Gherkin** | Documentação dos cenários (`Dado / Quando / Então`) | Deixa a regra legível e serve de base direta para os testes automatizados |
| **Checking** | Executar os casos escritos e comparar com o resultado esperado | Confirma o que já se sabe sobre o sistema (regressão) |
| **Teste exploratório** | Sessões com missão e tempo definidos (ver 4.2 e 4.3) | Encontra problemas que os casos escritos não previram, com custo baixo |
| **Heurística VADER** | Roteiro do teste exploratório da **API REST** (ver 4.2) | A aplicação é uma API REST; a heurística garante cobertura sistemática de verbos, autorização, dados, erros e responsividade |
| **Automação** | 1 teste de API, 1 teste Web e 1 teste de performance (etapas 6, 7 e 8) | Cobre o que tem maior risco e é repetível |

### 4.2 Heurística VADER aplicada à API

| Letra | Pilar | O que será explorado nesta API |
|---|---|---|
| **V** | Verbos | Uso correto de `POST` no login e `GET` nas consultas; resposta quando o verbo é trocado (por exemplo, `PUT` ou `DELETE` em `/api/payslips`) |
| **A** | Autorização | Acesso sem token, token malformado, token adulterado, token expirado; garantia de que um token só retorna dados do próprio funcionário (RN-01 e RN-02) |
| **D** | Dados | Estrutura e tipos da resposta (competência `AAAA-MM`, valores numéricos); ausência de dados internos ou de terceiros (hash de senha, ids, outro funcionário); entrada do login com tipos errados, vazia ou com espaços |
| **E** | Erros | Código de status adequado a cada falha (400, 401, 404); mensagens claras e sem detalhes internos; corpo JSON inválido; rota inexistente |
| **R** | Responsividade | Tempo de resposta dos endpoints; comportamento com várias requisições simultâneas (alimenta o teste de performance) |

### 4.3 Roteiro do teste exploratório Web
Sessão com missão e tempo limitado, que explora: dados digitados no login (vazios, longos, com espaços); fluxo (recarregar, voltar com o navegador, abrir duas abas, acessar após o logout); estado da sessão (token removido ou expirado); funcionário sem holerites, com um e com vários; teclado (Tab e Enter) e tela estreita.

### 4.4 Técnicas avaliadas e não adotadas

| Técnica | Motivo |
|---|---|
| Teste ad hoc como atividade separada | O teste exploratório estruturado já cobre a investigação livre, com missão e registro. Um segundo modo sem roteiro traria pouco ganho em uma aplicação de duas funcionalidades |
| Valor limite em campos de entrada | O sistema não possui campos numéricos nem regras de tamanho para validar |
| Jira, Selenium e Cypress | Não são necessários: os bugs ficam em Markdown e a automação Web usa uma ferramenta mais simples |

Ambas as decisões serão reavaliadas na versão com backend em Java e novas funcionalidades.

## 5. Critérios

### 5.1 Entrada (para começar a executar)
- Aplicação inicia com `npm start` e responde em `http://localhost:3000`.
- Dados de teste carregados (3 funcionários, ver README).
- Casos de teste escritos e revisados.

### 5.2 Saída (para considerar o ciclo concluído)
- 100% dos casos planejados executados.
- Todos os bugs encontrados registrados com evidência.
- Nenhum bug **crítico** (vazamento de dados entre funcionários, acesso sem login) em aberto.
- Automações executadas pelo menos uma vez, com resultado registrado.

### 5.3 Classificação de severidade dos bugs
| Severidade | Descrição |
|---|---|
| Crítica | Vaza dado de outro funcionário, permite acesso sem autenticação, ou derruba a aplicação |
| Alta | Regra de negócio violada (por exemplo, mostra rascunho ou versão errada) |
| Média | Funcionalidade com comportamento incorreto, mas com alternativa |
| Baixa | Problema visual, texto ou usabilidade sem impacto funcional |

## 6. Ambiente de teste

| Item | Detalhe |
|---|---|
| Sistema operacional | Windows 10/11 |
| Runtime | Node.js 18+ |
| Banco | MongoDB em memória (`mongodb-memory-server`) |
| Navegador | Google Chrome (versão atual) |
| URLs | Site `http://localhost:3000`; Swagger `/api-docs`; YAML `/api-docs.yaml` |
| Ferramentas | Swagger UI e DevTools do navegador (exploração manual); Node test runner (API); Playwright (Web); autocannon ou k6 (performance) |

### 6.1 Dados de teste (senha de todos: `Senha@123`)

| Funcionário | E-mail | Situação dos holerites | Resultado esperado em RN-03/04/05 |
|---|---|---|---|
| Ana Souza | ana@empresa.com | 09/2026 v1 pub.; 10/2026 v1 e v2 pub.; 11/2026 v1 rascunho | Exibe 10/2026 **v2** |
| Bruno Lima | bruno@empresa.com | 09/2026 v1 pub. e v2 rascunho; 10/2026 v1 pub.; 11/2026 v1 rascunho | Exibe 10/2026 v1; em 09/2026 aparece a v1 |
| Carla Mendes | carla@empresa.com | 10/2026 e 11/2026 somente rascunho | Mensagem informativa |

## 7. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Vazamento de holerite entre funcionários | Crítico | Casos específicos de isolamento (RN-02) em API, Web e exploratório |
| Dados recriados a cada reinício | Médio | Os dados de teste são sempre os mesmos; reiniciar a aplicação antes de cada ciclo |
| Prazo curto (2 dias) | Alto | Priorizar RN-01, RN-02 e RN-04 (risco mais alto) |
| Primeira execução do Mongo lenta no Windows | Baixo | Timeout de 60s configurado em `server.js` |
| Pouca experiência com as ferramentas | Médio | Usar ferramentas simples e executar uma etapa por vez |

## 8. Cronograma (2 dias)

| Dia | Atividade | Entregável |
|---|---|---|
| Dia 1, manhã | Plano, análise e modelagem | `01-plano-de-testes.md`, `02-analise-e-modelagem.md` |
| Dia 1, tarde | Casos de teste e execução (checking e teste exploratório, com VADER na API) | `03-casos-de-teste.md`, `04-execucao-e-resultados.md` |
| Dia 1, final | Reports de bugs | `05-bugs/` |
| Dia 2, manhã | Automação de API e Web | `tests/api/`, `tests/web/` |
| Dia 2, tarde | Automação de performance e relatório final | `tests/performance/`, `06-relatorio-final.md` |

## 9. Entregáveis

| Arquivo | Conteúdo |
|---|---|
| `docs/01-plano-de-testes.md` | Este documento |
| `docs/02-analise-e-modelagem.md` | Condições de teste, partição de equivalência, valor limite (quantidade de holerites), tabela de decisão |
| `docs/03-casos-de-teste.md` e `docs/features/*.feature` | Casos de teste em Gherkin |
| `docs/04-execucao-e-resultados.md` | Resultado de cada caso e das sessões exploratórias |
| `docs/05-bugs/BUG-XXX.md` | Um report por defeito |
| `tests/api`, `tests/web`, `tests/performance` | Automações |
| `docs/06-relatorio-final.md` | Resumo, métricas e conclusões |

## 10. Papéis e responsabilidades
Projeto individual: o responsável acumula os papéis de analista de testes, executor e autor dos relatórios. A aplicação foi desenvolvida com apoio de IA, e os testes são executados pelo responsável. Os resultados registrados refletem somente o que foi de fato executado e observado.

## 11. Evolução prevista
A aplicação será reescrita com backend em Java e novas funcionalidades. Este plano será revisado nessa ocasião, e os casos e automações serão reaproveitados como base de regressão.