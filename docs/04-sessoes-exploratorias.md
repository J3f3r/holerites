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
- **Data/hora:** 27/11/2026 | **Início:** 16:12 | **Fim:** 20:51 (bloco inicial 16:12–16:30 e complementos com token 20:46–20:51) | **Versão testada:** 1.0.0

### Notas da sessão
| Hora | O que fiz (comando) | O que observei (status e trecho) | Estranho? (S/N) |
|------|---------------------|----------------------------------|-----------------|
| 16:12 | `curl -i -X HEAD http://localhost:3000/api/payslips/latest` | Status `401 Unauthorized` (sem corpo, comportamento esperado para `HEAD` sem token; cabeçalho `X-Powered-By: Express`) | N |
| 16:12 | `curl -i -X OPTIONS http://localhost:3000/api/payslips/latest` | Status `404 Not Found` (`{"message":"Recurso não encontrado."}`) em vez de listar métodos permitidos (`200`/`204` com `Allow`) | S |
| 16:12 | `curl -i http://localhost:3000/api/payslips/latest/` e `/API/payslips/latest` | Ambos retornaram `401 Unauthorized` (`{"message":"Autenticação necessária."}`), passando pela validação de rota normalmente | N |
| 16:14 | `curl -i -H "Authorization: bearer $TOKEN" .../latest` e consultas com `?competence=2026-10` e `?employeeId=outro` (com `$TOKEN` vazio no shell) | Status `401 Unauthorized` (`{"message":"Autenticação necessária."}`) por ausência de `$TOKEN` no shell (inconclusivo quanto ao prefixo/parâmetros até repetir com token válido) | Inconclusivo |
| 16:17 | `curl -i http://localhost:3000/api/auth/login` (GET sem método POST) | Status `404 Not Found` (`{"message":"Recurso não encontrado."}`) em vez de `405 Method Not Allowed` (evidência adicional para `BUG-003`) | S |
| 16:17 | `POST /api/auth/login` com `"admin":true` e e-mail com `+` (`usuario+teste@exemplo.com`) | Status `401 Unauthorized` (`{"message":"E-mail ou senha inválidos."}`), sem quebrar nem revelar detalhes internos | N |
| 16:21 | `POST /api/auth/login` com `Content-Type: text/plain` (`email=ana&password=123`) | Status `400 Bad Request` (`{"message":"Informe e-mail e senha."}`) | N |
| 16:21 | `POST /api/auth/login` com corpo grande (~200 KB no campo `email`) | Status `500 Internal Server Error` (`{"message":"Erro interno."}`) — rejeição de payload pelo parser do Express caindo no handler genérico `500` em vez de `413` | S |
| 16:21 | Loop de 10 requisições `GET /api/payslips/latest` em sequência (sem token) | Todas retornaram `401` entre `0.002280s` e `0.008670s`, sem falhas de conexão | N |
| 16:30 | `curl -i -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/payslips/latest` (com `$TOKEN` vazio no shell) | Status `401 Unauthorized` (`{"message":"Autenticação necessária."}`) por falta de token ativo na variável `$TOKEN` | Inconclusivo |
| 20:46 | `curl -i -H "Authorization: bearer $TOKEN" http://localhost:3000/api/payslips/latest` (com `$TOKEN` válido da Ana) | Status `401 Unauthorized` (`{"message":"Autenticação necessária."}`); prefixo `bearer` em minúsculas não é aceito | N |
| 20:46 | `curl -i -H "Authorization: Bearer $TOKEN" ".../latest?competence=2026-10"` e `".../latest?employeeId=outro"` | Ambos retornaram `200 OK` com o holerite da Ana (`competence: "2026-10"`, `netPay: 5745`), sem vazar dados de outro funcionário | N |
| 20:51 | Cliquei em `Sair` no site e rodei `curl -i -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/payslips/latest` | Status `200 OK` com o holerite da Ana (`netPay: 5745`); o JWT continua aceito na API após logout na interface | S |

### Problemas encontrados
| # | Descrição | Passos para reproduzir | Severidade sugerida | Vira BUG-00X? |
|---|-----------|------------------------|---------------------|---------------|
| 1 | Payload acima de 100 KB no login retorna `500 Internal Server Error` em vez de `413 Payload Too Large` | 1. Enviar `POST /api/auth/login` com `Content-Type: application/json` e campo `email` com ~200 KB.<br>2. Observar resposta `500` com `{"message":"Erro interno."}`. | Média | Sim (`BUG-005`) |
| 2 | `OPTIONS /api/payslips/latest` e `GET /api/auth/login` retornam `404 Not Found` em vez de `405 Method Not Allowed` | 1. Executar `curl -i -X OPTIONS http://localhost:3000/api/payslips/latest` ou `curl -i http://localhost:3000/api/auth/login`.<br>2. Observar status `404` (`{"message":"Recurso não encontrado."}`). | Baixa | Não (evidência complementar ao `BUG-003`) |
| 3 | Cabeçalho `X-Powered-By: Express` exposto nas respostas da API | 1. Consultar qualquer endpoint com `curl -i`.<br>2. Verificar o cabeçalho `X-Powered-By: Express`. | Baixa | Sim (`BUG-007`) |
| 4 | Token JWT permanece válido na API mesmo após clicar em `Sair` no frontend | 1. Autenticar como Ana, copiar o token e clicar em `Sair` na interface.<br>2. Chamar `GET /api/payslips/latest` com `Authorization: Bearer <token>` e observar `200 OK`. | Baixa / Média | Registrar como observação / melhoria de revogação de sessão |

### Conclusão da sessão (3 linhas)
- **Cobertura (o que explorei):** verbos `HEAD` e `OPTIONS`, variações de URL, prefixo `bearer` minúsculo com token válido, parâmetros extras/?employeeId, reuso do token pós-logout, `Content-Type: text/plain`, payload de ~200 KB no login e rajada de 10 requisições seguidas.
- **Riscos que ainda vejo:** payload grande (`>100 KB`) caindo em `500 Erro interno`, exposição do cabeçalho `X-Powered-By: Express` e ausência de revogação do token JWT no servidor após logout na interface.
- **Confiança na API (baixa/média/alta) e por quê:** **Média-alta** — respostas rápidas (`2–8 ms`), sem vazamento de stack trace, bloqueio efetivo sem token e isolamento de dados confirmados com token válido.

---

## Sessão EXP-WEB
- **Missão:** explorar o site tentando fazer coisas inesperadas, procurando falhas de fluxo, de estado da sessão e de usabilidade.
- **Heurísticas:** dados, fluxo, estado, interface (plano de testes, seção 4.3).
- **Data/hora:** 27/11/2026 | **Início:** 16:35 | **Fim:** 21:07 (bloco inicial 16:35–17:35 e complementos 20:51–21:07) | **Navegador:** Chrome (DevTools em português)

### Notas da sessão
| Hora | O que fiz | O que observei | Estranho? (S/N) | Print |
|------|-----------|----------------|-----------------|-------|
| 17:10 | Aba `Rede` em `Off-line`; preenchi `ana@empresa.com` e senha e cliquei em `Entrar` | Falha na requisição `fetch` exibindo a mensagem em inglês `Failed to fetch` na tela | S | `evidencias/exploratorias/exp-web-offline-failed-to-fetch.png` |
| 17:20 | Logado como Ana; em `Aplicativo` → `Armazenamento da sessão` → `http://localhost:3000`, alterei o valor para `123abc` e apertei `F5` | Antes do `F5`, exibia o holerite de Ana (`Outubro de 2026`); após o `F5`, redirecionou para a tela de login (`Meus holerites`) | N | `evidencias/exploratorias/exp-web-session-storage-f5.png` |
| 17:25 | Ativei modo responsivo no DevTools (`375` px) e depois apliquei zoom de `200%` | Em `375` px o formulário se ajustou; em `200%` (`345 x 251`) os elementos ampliaram com rolagem sem sobreposição visível | N | `evidencias/exploratorias/exp-web-responsivo-375-zoom200.png` |
| 17:28 | Digitei `<script>alert(1)</script>` no campo E-mail e tentei entrar | Nenhum `alert(1)` executou; exibiu `E-mail ou senha inválidos.` | N | `evidencias/exploratorias/exp-web-xss-alert.png` |
| 17:30 | Abri duas abas logadas (Bruno Lima em uma e Ana Souza em outra) e dei `F5` na aba da Ana | Sessões isoladas: Bruno manteve seu holerite (`R$ 6.806,00`) e Ana manteve o dela (`R$ 5.745,00`) após `F5` | N | `evidencias/exploratorias/exp-web-duas-abas-isoladas.png` |
| 17:33 | Cliquei em `Sair` e usei o botão Voltar (`←`) do navegador | Permaneceu na tela de login (`Meus holerites`), sem retornar ao holerite | N | `evidencias/exploratorias/exp-web-logout-voltar.png` |
| 17:35 | Derrubei o servidor (`Ctrl+C`) e tentei fazer login com `ana@empresa.com` | Requisição falhou e exibiu `Failed to fetch` em inglês | S | `evidencias/exploratorias/exp-web-servidor-parado.png` |
| 20:51 | Navegação por teclado na tela de login (`Tab` até o campo E-mail) | Campo `E-mail` exibiu indicação visual de foco | N | `evidencias/exploratorias/exp-web-foco-login.png` |
| 21:02–21:04 | Em `Aplicativo` → `Armazenamento da sessão`, apaguei a chave `emp` e abri o seletor de `Competência` sem `F5` | Seletor abriu (`Outubro de 2026` / `Setembro de 2026`) sem redirecionar de imediato nem gerar erro no `Console` | N | `evidencias/exploratorias/exp-web-storage-sem-f5.png` |
| 21:05–21:07 | Com o servidor encerrado no terminal, abri o seletor de `Competência` e selecionei `Setembro de 2026` | Alterou para `Setembro de 2026` (`Versão 1 · publicado em 05/10/2026`) a partir dos dados já carregados na tela | N | `evidencias/exploratorias/exp-web-competencia-offline-servidor.png` |

### Problemas encontrados
| # | Descrição | Passos para reproduzir | Severidade sugerida | Vira BUG-00X? |
|---|-----------|------------------------|---------------------|---------------|
| 1 | Mensagem de erro de rede em inglês (`Failed to fetch`) exibida ao usuário quando offline ou com servidor parado no login | 1. Acessar a tela de login.<br>2. Colocar a rede em `Off-line` no DevTools (ou parar o servidor) e clicar em `Entrar`.<br>3. Observar `Failed to fetch` na tela. | Baixa | Sim (`BUG-006`) |

### Conclusão da sessão (3 linhas)
- **Cobertura (o que explorei):** comportamento offline e com servidor desligado no login, alteração e exclusão de chave no armazenamento da sessão (com e sem `F5`), troca de competência com servidor parado, responsivo `375 px` e zoom `200%`, `<script>alert(1)</script>`, duas abas simultâneas, botão Voltar após `Sair` e foco por teclado.
- **Riscos que ainda vejo:** mensagens de erro de rede em inglês (`Failed to fetch`) expostas na UI e falta de revalidação de sessão no ato de abrir/trocar competência quando o item de sessão é removido sem recarregar a página.
- **Confiança na interface (baixa/média/alta) e por quê:** **Média-alta** — sem execução de script, sessões isoladas entre abas, retorno bloqueado via Voltar após `Sair` e adaptação visual adequada, restando padronizar mensagens de erro de rede em português.