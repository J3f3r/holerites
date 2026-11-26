# language: pt
@RN-01 @RN-02
Funcionalidade: Autorização e isolamento dos dados
  Como empresa
  Quero que somente funcionários autenticados vejam apenas os próprios holerites
  Para proteger os dados financeiros de cada pessoa

  Contexto:
    Dado que a aplicação está em execução com os dados de teste

  @CT-AUT-01 @CND-05 @prioridade-alta @api
  Esquema do Cenário: Consulta sem token
    Quando é feita uma requisição GET para "<rota>" sem token
    Então a requisição é negada com status 401
    E a mensagem "Autenticação necessária." é exibida

    Exemplos:
      | rota                |
      | /api/payslips/latest|
      | /api/payslips       |

  @CT-AUT-02 @CND-05 @prioridade-alta @api
  Esquema do Cenário: Consulta com token malformado
    Quando é feita uma requisição GET para "/api/payslips" com o cabeçalho Authorization "<cabecalho>"
    Então a requisição é negada com status 401

    Exemplos:
      | cabecalho        |
      | Bearer           |
      | Bearer abc123    |
      | Basic YW5hOjEyMw==|

  @CT-AUT-03 @CND-05 @prioridade-alta @api
  Cenário: Consulta com token adulterado
    Dado que Ana fez login e recebeu um token
    E que o último trecho (assinatura) do token foi alterado
    Quando é feita uma requisição GET para "/api/payslips" com esse token
    Então a requisição é negada com status 401

  @CT-AUT-04 @CND-05 @prioridade-media @api
  Cenário: Consulta com token expirado
    Dado um token assinado com a chave da aplicação cujo prazo de validade já venceu
    Quando é feita uma requisição GET para "/api/payslips" com esse token
    Então a requisição é negada com status 401
    E a mensagem orienta fazer login novamente

  @CT-AUT-05 @CND-07 @prioridade-alta @api @automatizar-api
  Cenário: O token de um funcionário retorna somente os dados dele
    Dado que Ana e Bruno fizeram login e receberam seus tokens
    Quando cada um consulta "/api/payslips" com o próprio token
    Então a lista de Ana contém somente líquidos de R$ 5.745,00 e R$ 5.395,00
    E a lista de Bruno contém somente líquidos de R$ 6.806,00 e R$ 6.806,00
    E nenhuma lista contém dados da outra pessoa

  @CT-AUT-06 @CND-08 @prioridade-alta @api
  Cenário: A resposta não expõe dados internos
    Dado que Ana fez login
    Quando consulta "/api/payslips/latest" e "/api/payslips"
    Então as respostas não contêm os campos "_id", "employeeId", "passwordHash" ou "status"
    E a resposta do login não contém "passwordHash"

  @CT-AUT-07 @CND-06 @prioridade-alta @web
  Cenário: Acesso à tela de holerites sem login
    Dado que não há sessão ativa no navegador
    Quando o funcionário abre "http://localhost:3000"
    Então a tela de login é exibida
    E nenhum holerite é exibido

  @CT-AUT-08 @CND-06 @prioridade-media @web
  Cenário: Logout encerra a sessão
    Dado que Ana está logada e vendo seu holerite
    Quando clica em "Sair"
    Então a tela de login é exibida
    E ao recarregar a página a tela de login continua sendo exibida

  @CT-AUT-09 @CND-07 @prioridade-alta @api
  Cenário: Tentativa de forçar outro funcionário por parâmetro
    Dado que Ana fez login
    Quando consulta "/api/payslips?employeeId=<id-de-outro-funcionario>" com o token dela
    Então a resposta contém somente holerites de Ana
