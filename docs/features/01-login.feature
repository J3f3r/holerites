# language: pt
@RF-01 @RN-01
Funcionalidade: Login do funcionário
  Como funcionário da empresa
  Quero entrar com meu e-mail e senha
  Para consultar meus holerites

  Contexto:
    Dado que a aplicação está em execução com os dados de teste
    E que a senha de todos os funcionários de teste é "Senha@123"

  @CT-LOG-01 @CND-01 @prioridade-alta @api @web @automatizar-api
  Esquema do Cenário: Login com credenciais válidas
    Quando o funcionário informa o e-mail "<email>" e a senha "Senha@123"
    Então o acesso é concedido
    E o sistema identifica o funcionário como "<nome>"

    Exemplos:
      | email            | nome         |
      | ana@empresa.com  | Ana Souza    |
      | bruno@empresa.com| Bruno Lima   |
      | carla@empresa.com| Carla Mendes |

  @CT-LOG-02 @CND-01 @prioridade-media @api @aconfirmar
  Cenário: Login com e-mail em maiúsculas e com espaços nas bordas
    Quando o funcionário informa o e-mail " ANA@Empresa.com " e a senha "Senha@123"
    Então o comportamento observado é registrado (acesso concedido ou negado)

  @CT-LOG-03 @CND-02 @prioridade-alta @api
  Cenário: Login com senha incorreta
    Quando o funcionário informa o e-mail "ana@empresa.com" e a senha "Errada@1"
    Então o acesso é negado com status 401
    E a mensagem "E-mail ou senha inválidos." é exibida

  @CT-LOG-04 @CND-02 @prioridade-media @api
  Cenário: Login com a senha correta em caixa diferente
    Quando o funcionário informa o e-mail "ana@empresa.com" e a senha "senha@123"
    Então o acesso é negado com status 401

  @CT-LOG-05 @CND-02 @prioridade-media @api
  Cenário: Login com a senha correta seguida de espaço
    Quando o funcionário informa o e-mail "ana@empresa.com" e a senha "Senha@123 "
    Então o acesso é negado com status 401

  @CT-LOG-06 @CND-03 @prioridade-media @api @web
  Cenário: Login com senha vazia
    Quando o funcionário informa o e-mail "ana@empresa.com" e a senha ""
    Então o acesso é negado
    E nenhum token é emitido

  @CT-LOG-07 @CND-02 @prioridade-alta @api
  Cenário: Login com e-mail não cadastrado
    Quando o funcionário informa o e-mail "joao@empresa.com" e a senha "Senha@123"
    Então o acesso é negado com status 401
    E a mensagem "E-mail ou senha inválidos." é exibida

  @CT-LOG-08 @CND-02 @prioridade-media @api @web
  Cenário: Login com e-mail em formato inválido
    Quando o funcionário informa o e-mail "ana.empresa.com" e a senha "Senha@123"
    Então o acesso é negado
    E nenhum token é emitido

  @CT-LOG-09 @CND-03 @prioridade-media @api @web
  Cenário: Login com e-mail vazio
    Quando o funcionário informa o e-mail "" e a senha "Senha@123"
    Então o acesso é negado

  @CT-LOG-10 @CND-03 @prioridade-media @api
  Cenário: Login sem o campo senha
    Quando a requisição de login é enviada somente com o e-mail "ana@empresa.com"
    Então a requisição é rejeitada com status 400
    E a mensagem "Informe e-mail e senha." é exibida

  @CT-LOG-11 @CND-03 @prioridade-media @api
  Cenário: Login sem o campo e-mail
    Quando a requisição de login é enviada somente com a senha "Senha@123"
    Então a requisição é rejeitada com status 400

  @CT-LOG-12 @CND-03 @prioridade-alta @api
  Esquema do Cenário: Login com campos de tipo incorreto
    Quando a requisição de login é enviada com e-mail <email> e senha <senha>
    Então a requisição é rejeitada com status 400
    E nenhum token é emitido

    Exemplos:
      | email              | senha       |
      | 123                | "Senha@123" |
      | "ana@empresa.com"  | 123         |
      | {"$ne": null}      | "Senha@123" |

  @CT-LOG-13 @CND-04 @prioridade-alta @api
  Cenário: A mensagem de erro não revela se o e-mail existe
    Dado que o funcionário tenta entrar com "ana@empresa.com" e a senha "Errada@1"
    E que outro funcionário tenta entrar com "joao@empresa.com" e a senha "Senha@123"
    Então as duas respostas têm o mesmo status e a mesma mensagem

  @CT-LOG-14 @CND-02 @prioridade-media @web
  Cenário: A tela informa o erro e permanece no login
    Dado que o funcionário está na tela de login
    Quando informa o e-mail "ana@empresa.com" e a senha "Errada@1" e clica em "Entrar"
    Então a mensagem "E-mail ou senha inválidos." é exibida
    E a tela de login continua visível
