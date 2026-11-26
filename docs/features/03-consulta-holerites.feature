# language: pt
@RF-02
Funcionalidade: Consulta de holerites
  Como funcionário autenticado
  Quero ver meu holerite mais atual e os anteriores publicados
  Para acompanhar meus rendimentos e descontos

  Contexto:
    Dado que a aplicação está em execução com os dados de teste

  @CT-CON-01 @CND-09 @CND-10 @CND-15 @RN-03 @prioridade-alta @api @web @automatizar-web
  Esquema do Cenário: Ao entrar, o funcionário vê o holerite mais atual
    Dado que "<funcionario>" fez login
    Quando consulta o holerite mais recente
    Então a competência exibida é "<competencia>" na versão <versao>
    E o líquido a receber é "<liquido>"

    Exemplos:
      | funcionario | competencia | versao | liquido      |
      | Ana Souza   | 10/2026     | 2      | R$ 5.745,00  |
      | Bruno Lima  | 10/2026     | 1      | R$ 6.806,00  |

  @CT-CON-02 @CND-15 @RN-03 @prioridade-alta @api @web
  Cenário: Os valores do holerite conferem com os dados do funcionário
    Dado que Ana fez login
    Quando consulta o holerite mais recente
    Então os proventos somam R$ 6.850,00 (salário base 6.500,00 e ajuste retroativo 350,00)
    E os descontos somam R$ 1.105,00 (INSS 585,00 e IRRF 520,00)
    E o líquido a receber é R$ 5.745,00
    E a data de publicação é 05/11/2026

  @CT-CON-03 @CND-13 @RN-05 @prioridade-alta @api @web
  Cenário: Funcionário sem holerites publicados recebe mensagem informativa
    Dado que Carla fez login
    Quando consulta o holerite mais recente
    Então a mensagem "Você ainda não possui holerites disponibilizados." é exibida
    E nenhum erro é exibido
    E nenhum dado de outro funcionário é exibido

  @CT-CON-04 @CND-10 @CND-12 @RN-03 @RN-04 @prioridade-alta @api
  Cenário: Lista de Ana mostra a última versão de cada competência publicada
    Dado que Ana fez login
    Quando consulta a lista de holerites
    Então a lista tem 2 itens, da competência mais recente para a mais antiga
    E o primeiro é 10/2026 versão 2
    E o segundo é 09/2026 versão 1

  @CT-CON-05 @CND-11 @RN-04 @prioridade-alta @api
  Cenário: Versão em rascunho não substitui a versão publicada
    Dado que Bruno fez login
    Quando consulta a lista de holerites
    Então a competência 09/2026 é exibida na versão 1
    E a versão 2 de 09/2026 (rascunho) não aparece

  @CT-CON-06 @CND-12 @RN-04 @prioridade-alta @api @web
  Cenário: Competência com apenas rascunhos não aparece
    Dado que Ana e Bruno fizeram login, cada um com seu token
    Quando consultam a lista de holerites
    Então a competência 11/2026 não aparece para nenhum dos dois

  @CT-CON-07 @CND-13 @RN-05 @prioridade-media @api
  Cenário: Lista de funcionário sem holerites publicados
    Dado que Carla fez login
    Quando consulta a lista de holerites
    Então a lista está vazia
    E a mensagem "Você ainda não possui holerites disponibilizados." é retornada
    E o status é 200

  @CT-CON-08 @CND-14 @prioridade-alta @web
  Cenário: Seletor de competência com duas competências publicadas
    Dado que Ana fez login
    Então o seletor de competência é exibido com 2 opções
    Quando seleciona "Setembro de 2026"
    Então o holerite exibido é 09/2026 versão 1 com líquido de R$ 5.395,00

  @CT-CON-09 @CND-14 @prioridade-media @web
  Cenário: Seletor oculto quando não há holerites
    Dado que Carla fez login
    Então o seletor de competência não é exibido

  @CT-CON-10 @CND-14 @prioridade-media @web @lacuna-de-massa
  Cenário: Seletor oculto com exatamente um holerite publicado
    Dado um funcionário com exatamente uma competência publicada
    Quando faz login
    Então o holerite é exibido
    E o seletor de competência não é exibido
    # Não executável com a massa atual (ver 02-analise-e-modelagem.md, seção 5)

  @CT-CON-11 @CND-09 @prioridade-media @web
  Cenário: Navegação por teclado no site
    Dado que o funcionário está na tela de login
    Quando preenche os campos usando Tab e envia com Enter
    Então o login é realizado e o holerite é exibido
