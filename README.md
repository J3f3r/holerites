# Sistema de Consulta de Holerites

## O que é esta aplicação
API REST + site para que funcionários de uma empresa consultem **seus próprios holerites**.
Possui apenas duas funcionalidades: **Login** e **Consulta de holerites**. Projeto de portfólio, feito para servir
de objeto de testes em uma etapa posterior (por isso **não há automação de testes** neste repositório).

Stack: Node.js, Express, Mongoose, `mongodb-memory-server` (banco em memória), JWT, Swagger UI.

## Como instalar
Requisitos: Node.js 18+ e internet na primeira execução (o `mongodb-memory-server` baixa o binário do MongoDB uma vez).

```bash
npm install
```

## Como executar
```bash
npm start
# porta diferente: PORT=4000 npm start
```
O banco é criado e populado a cada inicialização; ao parar a aplicação, os dados são descartados.

## URLs importantes
| O quê | URL |
|---|---|
| Site | http://localhost:3000 |
| Swagger UI | http://localhost:3000/api-docs |
| Especificação YAML (renderizada) | http://localhost:3000/api-docs.yaml |
| `POST` login | http://localhost:3000/api/auth/login |
| `GET` holerite mais recente | http://localhost:3000/api/payslips/latest |
| `GET` holerites publicados | http://localhost:3000/api/payslips |

A especificação está em [`openapi.yaml`](openapi.yaml). No Swagger UI, use **Authorize** com o token retornado pelo login.

## Dados de teste
Senha de todos: `Senha@123`

| Funcionário | E-mail | Holerites no banco | O que o funcionário enxerga |
|---|---|---|---|
| Ana Souza (1001) | ana@empresa.com | 09/2026 v1 pub.; 10/2026 v1 e v2 pub.; 11/2026 v1 rascunho | **10/2026 v2** (mais recente), e 09/2026 no histórico |
| Bruno Lima (1002) | bruno@empresa.com | 09/2026 v1 pub. e v2 rascunho; 10/2026 v1 pub.; 11/2026 v1 rascunho | **10/2026 v1**; em 09/2026 aparece a v1 (a v2 não está publicada) |
| Carla Mendes (1003) | carla@empresa.com | 10/2026 e 11/2026, ambos rascunho | Mensagem informativa, sem erro |

## Regras de negócio
1. Apenas funcionários autenticados acessam o sistema e consultam holerites.
2. O funcionário vê exclusivamente os próprios holerites. A API usa só o id contido no token (nenhum endpoint aceita id de funcionário).
3. Ao acessar, é exibido o holerite mais atual: competência mais recente e, nela, a última versão publicada.
4. Somente holerites **publicados** são visíveis; em elaboração (rascunho) nunca aparecem.
5. Sem holerites publicados, o sistema mostra a mensagem "Você ainda não possui holerites disponibilizados.", sem erro e sem dados de terceiros.

## Segurança (escopo de portfólio)
Senhas com hash (bcrypt) e JWT de 1h. Defina `JWT_SECRET` em ambientes reais.
