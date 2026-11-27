# language: pt
@RF-01 @RF-02 @VADER
Funcionalidade: Exploração da API com a heurística VADER
  Verbos, Autorização (ver 02-autorizacao.feature), Dados, Erros e Responsividade

  Contexto:
    Dado que a aplicação está em execução com os dados de teste

  @CT-API-01 @CND-16 @VADER-V @prioridade-media @api @aconfirmar
  Esquema do Cenário: Verbo diferente do previsto nas rotas de consulta
    Dado que Ana fez login
    Quando é enviada uma requisição <verbo> para "<rota>" com o token dela
    Então a requisição é rejeitada e nenhum dado é alterado
    E o status retornado é registrado (esperado: 405 ou, no mínimo, uma rejeição clara)

    Exemplos:
      | verbo  | rota                 |
      | PUT    | /api/payslips        |
      | DELETE | /api/payslips        |
      | POST   | /api/payslips/latest |

  @CT-API-02 @CND-16 @VADER-V @prioridade-baixa @api @aconfirmar
  Cenário: Login com verbo GET
    Quando é enviada uma requisição GET para "/api/auth/login"
    Então a requisição é rejeitada
    E o status retornado é registrado

  @CT-API-03 @CND-17 @VADER-E @prioridade-alta @api
  Cenário: Corpo JSON malformado no login
    Quando é enviado ao login um corpo com JSON inválido: {"email": "ana@empresa.com",
    Então o status é 400 (erro do cliente)
    E a mensagem não expõe detalhes internos como pilha de erro ou caminhos de arquivo

  @CT-API-04 @CND-17 @VADER-E @prioridade-media @api
  Cenário: Rota inexistente
    Quando é feita uma requisição GET para "/api/rota-inexistente"
    Então o status é 404
    E a resposta é JSON com a mensagem "Recurso não encontrado."

  @CT-API-05 @CND-17 @VADER-E @prioridade-media @api
  Cenário: Login sem corpo na requisição
    Quando é enviada uma requisição POST para "/api/auth/login" sem corpo
    Então o status é 400
    E a mensagem "Informe e-mail e senha." é exibida

  @CT-API-06 @CND-08 @CND-15 @VADER-D @prioridade-media @api
  Cenário: Estrutura e tipos dos dados do holerite
    Dado que Ana fez login
    Quando consulta "/api/payslips/latest"
    Então "competence" segue o formato AAAA-MM
    E "version" é um número inteiro
    E "publishedAt" é uma data válida
    E "earnings" e "deductions" são listas com "description" (texto) e "amount" (número)
    E "grossPay", "totalDeductions" e "netPay" são números
    E "netPay" é igual a "grossPay" menos "totalDeductions"

  @CT-API-07 @CND-18 @VADER-R @prioridade-media @api @automatizar-perf
  Cenário: Tempo de resposta com usuários simultâneos
    Dado que Ana fez login
    Quando 10 conexões simultâneas consultam "/api/payslips/latest" durante 10 segundos
    Então não há respostas com erro
    E a latência do percentil 97,5 é inferior a 500 ms
    # Limite proposto. A ferramenta (autocannon) reporta o percentil 97,5, mais rigoroso que o 95 inicialmente previsto. Ajustar após a primeira medição e registrar o valor final no relatório

  @CT-API-08 @CND-18 @VADER-R @prioridade-baixa @api
  Cenário: Login repetido em sequência
    Quando o login de Ana é feito 20 vezes seguidas
    Então todas as respostas retornam 200
    E o tempo de resposta é registrado
