# Roteiro de Execução de Testes

| Campo | Valor |
|---|---|
| Documento | 04 (roteiro que gera o `04-execucao-e-resultados.md`) |
| Versão | 1.0 |
| Data | 25/11/2026 |
| Executor | [Seu nome] |
| Referências | `03-casos-de-teste.md` e `features/*.feature` |

## 1. Como usar este roteiro
Execute os blocos na ordem. Em cada caso, rode o comando (ou faça o passo na tela), compare com o **Esperado** e anote o resultado na tabela da seção 9. Depois envie a tabela preenchida e as evidências para a escrita do `04-execucao-e-resultados.md` e dos reports de bug.

**Regras de registro**
- **Status permitidos:** `Aprovado` (igual ao esperado), `Reprovado` (diferente do esperado), `Bloqueado` (não deu para executar) e `Não executável`.
- **Casos "a confirmar"** (CT-LOG-02, CT-API-01 e CT-API-02): não há resultado esperado no requisito. Anote **exatamente o que aconteceu** (status e mensagem), sem julgar.
- **Resultado obtido:** escreva o que viu de fato (status e trecho da mensagem), mesmo quando aprovado.
- **Reprovado:** guarde a evidência (a saída do terminal ou um print) para virar report de bug.

## 2. Preparação

1. Pare a aplicação (`Ctrl+C`) e inicie de novo com `npm start`, para partir da massa de dados original.
2. Confirme no terminal as 3 linhas de URL e abra `http://localhost:3000`.
3. Crie a pasta `docs/evidencias/` para os prints. Nome dos arquivos: `CT-XXX-NN.png` (por exemplo, `CT-LOG-14.png`).
4. Abra **um segundo terminal Git Bash** na pasta do projeto, para os comandos de API, e **deixe o primeiro rodando a aplicação**.
5. Cole estas funções auxiliares no segundo terminal:

```bash
# req: mostra a resposta e o status HTTP
req() { curl -s -w "\n[status %{http_code}]\n" "$@"; }

# login: devolve só o token (senha padrão Senha@123)
login() { curl -s -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d "{\"email\":\"$1\",\"password\":\"Senha@123\"}" | node -pe "JSON.parse(require('fs').readFileSync(0)).token"; }

# pp: formata JSON para leitura
pp() { node -e "console.log(JSON.stringify(JSON.parse(require('fs').readFileSync(0,'utf8').split('\n[status')[0]),null,1))"; }

ANA=$(login ana@empresa.com); BRUNO=$(login bruno@empresa.com); CARLA=$(login carla@empresa.com)
echo "${#ANA} ${#BRUNO} ${#CARLA}"    # os três números devem ser maiores que 100
```

Para guardar a saída de um caso como evidência, acrescente `| tee -a docs/evidencias/api-saidas.txt` ao final do comando.

## 3. Bloco A: Documentação (CT-DOC)

| Caso | Passo | Esperado |
|---|---|---|
| CT-DOC-01 | Abrir `http://localhost:3000/api-docs` no navegador | Swagger UI com os endpoints de login e holerites. Tirar print |
| CT-DOC-02 | `req localhost:3000/api-docs.yaml \| head -5` | Status 200 e primeira linha `openapi: 3.0.3` |

## 4. Bloco B: Login pela API (CT-LOG)

Todos usam `POST /api/auth/login`.

```bash
L='localhost:3000/api/auth/login'; H='Content-Type: application/json'
```

| Caso | Comando | Esperado |
|---|---|---|
| CT-LOG-01 (3 exemplos) | `req -X POST $L -H "$H" -d '{"email":"ana@empresa.com","password":"Senha@123"}'` (repetir com `bruno@` e `carla@`) | 200, `token` e o nome do funcionário |
| CT-LOG-02 | `req -X POST $L -H "$H" -d '{"email":" ANA@Empresa.com ","password":"Senha@123"}'` | **A confirmar.** Anotar o status |
| CT-LOG-03 | `req -X POST $L -H "$H" -d '{"email":"ana@empresa.com","password":"Errada@1"}'` | 401, "E-mail ou senha inválidos." |
| CT-LOG-04 | mesmo, com `"password":"senha@123"` | 401 |
| CT-LOG-05 | mesmo, com `"password":"Senha@123 "` (espaço no final) | 401 |
| CT-LOG-06 | mesmo, com `"password":""` | Negado, sem token |
| CT-LOG-07 | `"email":"joao@empresa.com","password":"Senha@123"` | 401, "E-mail ou senha inválidos." |
| CT-LOG-08 | `"email":"ana.empresa.com","password":"Senha@123"` | Negado, sem token |
| CT-LOG-09 | `"email":"","password":"Senha@123"` | Negado |
| CT-LOG-10 | `-d '{"email":"ana@empresa.com"}'` | 400, "Informe e-mail e senha." |
| CT-LOG-11 | `-d '{"password":"Senha@123"}'` | 400 |
| CT-LOG-12 (3 exemplos) | `-d '{"email":123,"password":"Senha@123"}'`; `-d '{"email":"ana@empresa.com","password":123}'`; `-d '{"email":{"$ne":null},"password":"Senha@123"}'` | 400 nos três, sem token |
| CT-LOG-13 | Comparar a resposta de CT-LOG-03 com a de CT-LOG-07 | Mesmo status e mesma mensagem |

## 5. Bloco C: Autorização e isolamento (CT-AUT, parte API)

```bash
P='localhost:3000/api/payslips'
```

| Caso | Comando | Esperado |
|---|---|---|
| CT-AUT-01 (2 exemplos) | `req $P/latest` e `req $P` | 401, "Autenticação necessária." |
| CT-AUT-02 (3 exemplos) | `req $P -H "Authorization: Bearer"`; `... "Authorization: Bearer abc123"`; `... "Authorization: Basic YW5hOjEyMw=="` | 401 nos três |
| CT-AUT-03 | Adulterar o meio da assinatura: `N=${#ANA}; P2=$((N-10)); C=${ANA:$P2:1}; [ "$C" = "A" ] && R=B \|\| R=A; BAD="${ANA:0:$P2}$R${ANA:$((P2+1))}"` e depois `req $P -H "Authorization: Bearer $BAD"` | 401 |
| CT-AUT-04 | Gerar token vencido: `EXP=$(node -e "console.log(require('jsonwebtoken').sign({sub:'507f1f77bcf86cd799439011'},'segredo-apenas-para-desenvolvimento',{expiresIn:-10}))")` e `req $P -H "Authorization: Bearer $EXP"` | 401, orienta novo login |
| CT-AUT-05 | `req $P -H "Authorization: Bearer $ANA" \| pp` e o mesmo com `$BRUNO` | Ana: líquidos 5745 e 5395. Bruno: 6806 e 6806. Nenhum valor trocado |
| CT-AUT-06 | `req $P -H "Authorization: Bearer $ANA" \| grep -E "_id\|employeeId\|passwordHash\|status"` (e o mesmo em `/latest`) | **Nenhuma linha** de saída |
| CT-AUT-09 | `req "$P?employeeId=qualquer-id" -H "Authorization: Bearer $ANA" \| pp` | Somente os dados da Ana (5745 e 5395) |

## 6. Bloco D: Consulta pela API (CT-CON, parte API)

| Caso | Comando | Esperado |
|---|---|---|
| CT-CON-01 | `req $P/latest -H "Authorization: Bearer $ANA" \| pp` e o mesmo com `$BRUNO` | Ana: 2026-10, `version` 2, `netPay` 5745. Bruno: 2026-10, `version` 1, `netPay` 6806 |
| CT-CON-02 | Saída de Ana em `/latest` | `earnings` somam 6850 (6500 e 350); `deductions` 1105 (585 e 520); `netPay` 5745; `publishedAt` em 2026-11-05 |
| CT-CON-03 | `req $P/latest -H "Authorization: Bearer $CARLA" \| pp` | Status 200, `payslip` nulo e mensagem "Você ainda não possui holerites disponibilizados." |
| CT-CON-04 | `req $P -H "Authorization: Bearer $ANA" \| pp` | 2 itens: 2026-10 versão 2 e depois 2026-09 versão 1 |
| CT-CON-05 | `req $P -H "Authorization: Bearer $BRUNO" \| pp` | 2026-09 na **versão 1** (a v2 é rascunho) e 2026-10 versão 1 |
| CT-CON-06 | Verificar nas listas de CT-CON-04 e CT-CON-05 | Nenhuma competência 2026-11 |
| CT-CON-07 | `req $P -H "Authorization: Bearer $CARLA" \| pp` | Status 200, `payslips` vazio e mensagem informativa |

## 7. Bloco E: Exploração da API com VADER (CT-API)

| Caso | Comando | Esperado |
|---|---|---|
| CT-API-01 (3 exemplos) | `req -X PUT $P -H "Authorization: Bearer $ANA"`; `req -X DELETE $P -H "Authorization: Bearer $ANA"`; `req -X POST $P/latest -H "Authorization: Bearer $ANA"` | **A confirmar.** Anotar o status (esperado ideal: 405). Verificar que nada foi alterado |
| CT-API-02 | `req localhost:3000/api/auth/login` | **A confirmar.** Anotar o status |
| CT-API-03 | `req -X POST $L -H "$H" -d '{"email": "ana@empresa.com",'` | **Atenção:** esperado 400 e mensagem sem detalhes internos. Anotar o status e o corpo |
| CT-API-04 | `req localhost:3000/api/rota-inexistente` | 404, "Recurso não encontrado." |
| CT-API-05 | `req -X POST $L` (sem corpo) | 400, "Informe e-mail e senha." |
| CT-API-06 | `req $P/latest -H "Authorization: Bearer $ANA" \| pp` | `competence` no formato AAAA-MM; `version` inteiro; números em `amount`, `grossPay`, `totalDeductions`, `netPay`; `netPay` = `grossPay` − `totalDeductions` |
| CT-API-07 | Não executar manualmente | **Delegado** à automação de performance (etapa 8) |
| CT-API-08 | `for i in $(seq 20); do curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" -X POST $L -H "$H" -d '{"email":"ana@empresa.com","password":"Senha@123"}'; done` | 20 linhas com status 200. Anotar o menor e o maior tempo |

## 8. Bloco F: Web (navegador)

Use o Chrome em `http://localhost:3000` e deixe o DevTools aberto (F12, aba Network). Tire **um print por caso**.

| Caso | Passos | Esperado |
|---|---|---|
| CT-AUT-07 | Aba anônima, abrir o site | Tela de login; nenhum holerite |
| CT-LOG-01 (Web) | Entrar como Ana | Holerite exibido, com o nome Ana Souza |
| CT-LOG-14 | Entrar com `ana@empresa.com` e senha `Errada@1` | Mensagem "E-mail ou senha inválidos." e continua no login |
| CT-LOG-06 (Web) | E-mail da Ana e senha em branco | Negado, mensagem de erro |
| CT-LOG-08 (Web) | E-mail `ana.empresa.com` e senha correta | Negado, mensagem de erro |
| CT-LOG-09 (Web) | E-mail em branco e senha correta | Negado, mensagem de erro |
| CT-CON-01 (Web) | Entrar como Ana, depois como Bruno | Ana: Outubro de 2026, versão 2, líquido R$ 5.745,00. Bruno: Outubro de 2026, versão 1, R$ 6.806,00 |
| CT-CON-02 (Web) | Conferir os valores na tela da Ana | Proventos, descontos e líquido conforme o esperado de CT-CON-02 e data de publicação 05/11/2026 |
| CT-CON-03 (Web) | Entrar como Carla | Mensagem informativa, sem erro e sem seletor |
| CT-CON-06 (Web) | Abrir o seletor da Ana e do Bruno | Nenhuma opção "Novembro de 2026" |
| CT-CON-08 | Entrar como Ana; abrir o seletor; escolher "Setembro de 2026" | Seletor com 2 opções; mostra versão 1 e líquido R$ 5.395,00 |
| CT-CON-09 | Conferir a tela da Carla | Seletor não aparece |
| CT-CON-10 | Não executável | Sem massa com exatamente 1 holerite |
| CT-CON-11 | Login usando só Tab e Enter | Login e holerite exibido sem usar o mouse |
| CT-AUT-08 | Logado, clicar em **Sair**; depois pressionar F5 | Tela de login nos dois momentos |

## 9. Sessões exploratórias
Faça depois dos blocos anteriores. Cada sessão tem **30 minutos** com cronômetro. Anote **o que fez, o que observou e o que estranhou**, mesmo que não seja um bug.

| Sessão | Missão | Roteiro (heurística) |
|---|---|---|
| EXP-API | Explorar a API além dos casos escritos | VADER: **V**erbos (outros verbos e rotas), **A**utorização (token de outra origem, cabeçalho em minúsculas), **D**ados (campos extras, valores nulos), **E**rros (corpo enorme, caracteres especiais, JSON com tipos estranhos), **R**esponsividade (tempo percebido) |
| EXP-WEB | Explorar o site tentando fazer algo inesperado | Dados (e-mails longos, espaços, caracteres especiais); fluxo (recarregar, duas abas, botão voltar); estado (limpar o storage pelo DevTools em Application > Session Storage e recarregar; trocar de usuário sem sair); interface (tela estreita no modo celular, modo escuro, zoom 200%) |

Para cada sessão, use este modelo de nota:

```
Sessão: EXP-___   Data/hora início:___   Fim:___
O que explorei:
O que observei (fatos):
Possíveis problemas (com passos para reproduzir):
Dúvidas / ideias para novos casos:
```

## 10. Tabela de resultados (preencher e enviar)

| Caso | Resultado obtido (status e trecho) | Status | Evidência |
|---|---|---|---|
| CT-DOC-01 | | | |
| CT-DOC-02 | | | |
| CT-LOG-01 (Ana) | | | |
| CT-LOG-01 (Bruno) | | | |
| CT-LOG-01 (Carla) | | | |
| CT-LOG-02 | | | |
| CT-LOG-03 | | | |
| CT-LOG-04 | | | |
| CT-LOG-05 | | | |
| CT-LOG-06 | | | |
| CT-LOG-07 | | | |
| CT-LOG-08 | | | |
| CT-LOG-09 | | | |
| CT-LOG-10 | | | |
| CT-LOG-11 | | | |
| CT-LOG-12 (e-mail número) | | | |
| CT-LOG-12 (senha número) | | | |
| CT-LOG-12 (e-mail objeto) | | | |
| CT-LOG-13 | | | |
| CT-LOG-14 | | | |
| CT-AUT-01 (latest) | | | |
| CT-AUT-01 (lista) | | | |
| CT-AUT-02 (3 exemplos) | | | |
| CT-AUT-03 | | | |
| CT-AUT-04 | | | |
| CT-AUT-05 | | | |
| CT-AUT-06 | | | |
| CT-AUT-07 | | | |
| CT-AUT-08 | | | |
| CT-AUT-09 | | | |
| CT-CON-01 (Ana) | | | |
| CT-CON-01 (Bruno) | | | |
| CT-CON-02 | | | |
| CT-CON-03 | | | |
| CT-CON-04 | | | |
| CT-CON-05 | | | |
| CT-CON-06 | | | |
| CT-CON-07 | | | |
| CT-CON-08 | | | |
| CT-CON-09 | | | |
| CT-CON-10 | | Não executável | n/a |
| CT-CON-11 | | | |
| CT-API-01 (PUT) | | | |
| CT-API-01 (DELETE) | | | |
| CT-API-01 (POST em /latest) | | | |
| CT-API-02 | | | |
| CT-API-03 | | | |
| CT-API-04 | | | |
| CT-API-05 | | | |
| CT-API-06 | | | |
| CT-API-07 | Delegado à automação | | n/a |
| CT-API-08 | | | |
| EXP-API | (anexar as notas) | | |
| EXP-WEB | (anexar as notas) | | |

## 11. O que me enviar
1. A **tabela da seção 10** preenchida (pode colar o texto aqui no chat).
2. As **saídas do terminal** dos casos reprovados ou de comportamento estranho (principalmente CT-API-01, CT-API-03 e qualquer item "a confirmar").
3. As **notas das duas sessões exploratórias**.
4. Os **prints** só dos casos reprovados ou estranhos. Os demais ficam na pasta `docs/evidencias/` do seu repositório.

Com isso eu escrevo o `04-execucao-e-resultados.md` e os reports de bug (`05-bugs/`), sempre baseados apenas no que você observou.