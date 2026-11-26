# language: pt
@CND-19
Funcionalidade: Documentação da API

  Contexto:
    Dado que a aplicação está em execução

  @CT-DOC-01 @prioridade-baixa @web
  Cenário: Swagger UI carrega
    Quando o usuário abre "http://localhost:3000/api-docs"
    Então a interface do Swagger é exibida
    E os endpoints de login e de holerites estão listados

  @CT-DOC-02 @prioridade-baixa @api
  Cenário: Especificação YAML é renderizada
    Quando é feita uma requisição GET para "/api-docs.yaml"
    Então o status é 200
    E o conteúdo é um YAML que começa com a versão "openapi: 3.0.3"
