# Sessões de Teste Exploratório

| Campo | Valor |
|-------|-------|
| Documento | Anexo do `04-execucao-e-resultados.md` |
| Versão | 1.0 (preenchido após execuções exploratórias) |
| Executor | Jeferson |
| Referência | Plano de testes, seções 4.2 (VADER) e 4.3 |

## Como conduzir
- Teste exploratório é aprender, desenhar e executar testes ao mesmo tempo. Você não segue um roteiro fixo: segue uma missão.
- Tempo: 30 minutos por sessão, com cronômetro. Ao terminar o tempo, pare e escreva as conclusões.
- Reinicie a aplicação (Ctrl+C e npm start) antes de cada sessão, para partir da massa original.
- Registre enquanto faz, com a hora. Anote fatos ("enviei X, recebi Y"), não opiniões.
- O banco de ideias abaixo são perguntas para investigar. Não é checklist, e não sei o resultado de nenhuma delas. Anote o que realmente acontecer.
- Para API, reaproveite as funções `req`, `login` e `pp` do roteiro (seção 2 do `04-roteiro-de-execucao.md`).

---

## Sessão EXP-API
- **Missão:** explorar a API REST além dos casos escritos, procurando comportamentos inesperados em autorização, dados e erros.
- **Heurística:** VADER (Verbos, Autorização, Dados, Erros, Responsividade).
- **Data/hora:** 27/11/2026 | **Início:** 16:12 | **Fim:** 16:30 | **Versão testada:** 1.0.0

### Notas da sessão
| Hora | O que fiz (comando) | O que observei (status e trecho) | Estranho? (S/N) |
|------|---------------------|----------------------------------|-----------------|
| 16:12 | `curl -i -X HEAD http://localhost:3000/api/payslips/latest` | Status `401 Unauthorized` (sem corpo, comportamento esperado para `HEAD` sem token; cabeçalho `X-Powered-By: Express`) | N |
| 16:12 | `curl -i -X OPTIONS http://localhost:3000/api/payslips/latest` | Status `404 Not Found` (`{"message":"Recurso não encontrado."}`) em vez de listar métodos permitidos (`200`/`204` com `Allow`) | S |
| 16:12 | `curl -i http://localhost:3000/api/payslips/latest/` e `/API/payslips/latest` | Ambos retornaram `401 Unauthorized` (`{"message":"Autenticação necessária."}`), passando pela validação de rota normalmente | N |
| 16:14 | `curl -i -H "Authorization: bearer $TOKEN" .../latest` e consultas com `?competence=2026-10` e `?employeeId=outro` (com `$TOKEN` vazio no shell) | Status `401 Unauthorized` (`{"message":"Autenticação necessária."}`) para os 3 comandos, bloqueando acesso sem token válido | N |
| 16:17 | `curl -i http://localhost:3000/api/auth/login` (GET sem método POST) | Status `404 Not Found` (`{"message":"Recurso não encontrado."}`) em vez de `405 Method Not Allowed` (confirma `BUG-003`) | S |
| 16:17 | `POST /api/auth/login` com `"admin":true` e e-mail com `+` (`usuario+teste@exemplo.com`) | Status `401 Unauthorized` (`{"message":"E-mail ou senha inválidos."}`), sem quebrar nem revelar detalhes internos | N |
| 16:21 | `POST /api/auth/login` com `Content-Type: text/plain` (`email=ana&password=123`) | Status `400 Bad Request` (`{"message":"Informe e-mail e senha."}`) | N |
| 16:21 | `POST /api/auth/login` com corpo grande (~200 KB no campo `email`) | Status `500 Internal Server Error` (`{"message":"Erro interno."}`) — o `body-parser` do Express rejeitou o tamanho do payload (`PayloadTooLargeError`, padrão 100 KB) e caiu no handler genérico como `500` em vez de `413` | S |
| 16:21 | Loop de 10 requisições `GET /api/payslips/latest` em sequência (sem token) | Todas retornaram `401` entre `0.002280s` e `0.008670s`, sem falhas de conexão | N |
| 16:30 | `curl -i -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/payslips/latest` (sem `$TOKEN` ativo no shell) | Status `401 Unauthorized` (`{"message":"Autenticação necessária."}`); testes autenticados (`bearer` minúsculo e pós-logout com token ativo) ficaram pendentes por falta de token preenchido no shell | N |

### Problemas encontrados
| # | Descrição | Passos para reproduzir | Severidade sugerida | Vira BUG-00X? |
|---|-----------|------------------------|---------------------|---------------|
| 1 | Payload acima de 100 KB no login retorna `500 Internal Server Error` em vez de `413 Payload Too Large` | 1. Enviar `POST /api/auth/login` com `Content-Type: application/json` e campo `email` contendo 200.000 caracteres (`~200 KB`).<br>2. Observar resposta `500` com `{"message":"Erro interno."}`. | Baixa / Média | Sim (pode virar `BUG-004`, relacionado ao tratamento de erros do Express assim como o `BUG-002`) |
| 2 | `OPTIONS /api/payslips/latest` e `GET /api/auth/login` retornam `404 Not Found` em vez de `405 Method Not Allowed` | 1. Executar `curl -i -X OPTIONS http://localhost:3000/api/payslips/latest` ou `curl -i http://localhost:3000/api/auth/login`.<br>2. Observar status `404` (`{"message":"Recurso não encontrado."}`). | Baixa | Não (já coberto pelo `BUG-003`) |

### Dúvidas e ideias para novos casos
- Repetir com `$TOKEN` válido no shell os testes de prefixo `bearer` em minúsculas e reuso do token após clicar em "Sair" no site.
- Avaliar se vale desabilitar o cabeçalho `X-Powered-By: Express` como boa prática de segurança.

### Conclusão da sessão (3 linhas)
- **Cobertura (o que explorei):** verbos `HEAD` e `OPTIONS`, variações de URL (barra final e maiúsculas), `Content-Type: text/plain`, campos extras, payload de 200 KB no login e rajada de 10 requisições seguidas.
- **Riscos que ainda vejo:** erros nativos do middleware Express (como payload grande `>100 KB` ou JSON inválido) caem em `500 Erro interno` em vez de `413`/`400`, a API expõe `X-Powered-By: Express`, e os cenários com `$TOKEN` autenticado (`bearer` minúsculo e pós-logout) ficaram pendentes por falta de token ativo no shell.
- **Confiança na API (baixa/média/alta) e por quê:** **Média-alta** — a API respondeu rápido (`2–8 ms`), não vazou stack traces nem caminhos de arquivo nos erros e bloqueou acessos sem token, exigindo apenas refinamento do tratamento de erros HTTP e execução dos cenários autenticados pendentes.

---

## Sessão EXP-WEB
- **Missão:** explorar o site tentando fazer coisas inesperadas, procurando falhas de fluxo, de estado da sessão e de usabilidade.
- **Heurísticas:** dados, fluxo, estado, interface (plano de testes, seção 4.3).
- **Data/hora:** 27/11/2026 | **Início:** 16:35 | **Fim:** 17:35 | **Navegador:** Chrome (DevTools em português)

### Notas da sessão
| Hora | O que fiz | O que observei | Estranho? (S/N) | Print |
|------|-----------|----------------|-----------------|-------|
| 17:10 | Aba `Rede` em `Off-line`; preenchi `ana@empresa.com` e senha e cliquei em `Entrar` | Requisição `login` falhou na rede (`fetch`) e a tela exibiu a mensagem em inglês `Failed to fetch` | S | Captura `17:10` |
| 17:20 | Logado como Ana; em `Aplicativo` → `Armazenamento da sessão` → `http://localhost:3000`, alterei o valor para `123abc` e apertei `F5` | Antes do `F5`, a tela mostrava o holerite de Ana (`Outubro de 2026`); após o `F5`, a aplicação redirecionou para a tela de login (`Meus holerites`) | N | Capturas `17:20` |
| 17:25 | Ativei modo responsivo no DevTools (`375` px) e depois apliquei zoom de `200%` | Em `375` px o formulário se ajustou à largura; em `200%` (área útil `345 x 251`) os elementos ampliaram e exigiram rolagem vertical/horizontal sem sobreposição visível | N | Capturas `375` e `200%` |
| 17:28 | Digitei `<script>alert(1)</script>` no campo E-mail e tentei entrar | Nenhum `alert(1)` foi executado; a tela exibiu `E-mail ou senha inválidos.` | N | Captura `<script>alert(1)</script>` |
| 17:30 | Abri duas abas logadas (Bruno Lima em uma e Ana Souza em outra) e dei `F5` na aba da Ana | As sessões não se misturaram: Bruno continuou com seu holerite (`R$ 6.806,00`) e Ana continuou com o dela (`R$ 5.745,00`) após `F5` | N | Capturas Bruno e Ana |
| 17:33 | Cliquei em `Sair` e usei o botão Voltar (`←`) do navegador | Não retornou para a tela de holerite; permaneceu na tela de login (`Meus holerites`) | N | Captura pós-`Sair` e Voltar |
| 17:35 | Derrubei o servidor (`Ctrl+C`) e tentei fazer login com `ana@empresa.com` | Requisição falhou e a tela exibiu `Failed to fetch` em inglês | S | Captura `17:35` |

### Problemas encontrados
| # | Descrição | Passos para reproduzir | Severidade sugerida | Vira BUG-00X? |
|---|-----------|------------------------|---------------------|---------------|
| 1 | Mensagem de erro de rede em inglês (`Failed to fetch`) exibida ao usuário quando offline ou com servidor indisponível | 1. Acessar a tela de login.<br>2. Colocar a rede em `Off-line` no DevTools (ou parar o servidor) e clicar em `Entrar`.<br>3. Observar o texto `Failed to fetch` exibido na interface. | Baixa | Sim (melhoria/tratamento de erro amigável em português no frontend) |

### Dúvidas e ideias para novos casos
- Repetir o teste de apagar o item no `Armazenamento da sessão` e clicar diretamente no seletor de competência antes de dar `F5`, e testar troca de competência com o servidor derrubado já estando dentro do holerite.
- Testar navegação apenas por teclado (`Tab`, `Enter`, setas no seletor de competência) e validar regiões de alerta para leitores de tela.

### Conclusão da sessão (3 linhas)
- **Cobertura (o que explorei):** comportamento offline e com servidor desligado no login, alteração de armazenamento de sessão seguida de `F5`, responsividade em `375 px` e zoom `200%`, entrada `<script>alert(1)</script>`, isolamento entre duas abas com usuários distintos e uso do botão Voltar após `Sair`.
- **Riscos que ainda vejo:** mensagens de erro de rede em inglês (`Failed to fetch`) expostas diretamente na UI e pendência de testar exclusão do storage sem `F5`, troca de competência com servidor fora do ar e navegação exclusiva por teclado.
- **Confiança na interface (baixa/média/alta) e por quê:** **Média-alta** — não houve execução de script no teste de XSS, as sessões de Ana e Bruno permaneceram isoladas entre abas, o botão Voltar após `Sair` não expôs o holerite e a tela se adaptou a `375 px`, restando apenas padronizar mensagens de erro de rede em português.
```[cite: 17, 19, 20]