# Reports de Bugs

| ID | Título | Severidade | Status | Caso de origem |
|---|---|---|---|---|
| [BUG-001](BUG-001.md) | A API expõe o campo interno `_id` nos itens de proventos e descontos | Baixa | Aberto | CT-AUT-06 |
| [BUG-002](BUG-002.md) | JSON malformado no login retorna 500 em vez de 400 | Média | Aberto | CT-API-03 |
| [BUG-003](BUG-003.md) | Verbo HTTP não suportado retorna 404 em vez de 405 | Baixa | Aberto | CT-API-01 e CT-API-02 |
| [BUG-004](BUG-004.md) | O login degrada fortemente com 10 usuários simultâneos (latência média de 1,9 s) | Média | Aberto | Teste de performance (CT-API-07, cenário informativo) |
| [BUG-005](BUG-005.md) | Corpo da requisição acima do limite retorna 500 em vez de 413 | Média | Aberto | EXP-API |
| [BUG-006](BUG-006.md) | A tela exibe "Failed to fetch" em inglês quando não há conexão | Baixa | Aberto | EXP-WEB |
| [BUG-007](BUG-007.md) | A API expõe o cabeçalho `X-Powered-By: Express` | Baixa | Aberto | EXP-API |
| [BUG-008](BUG-008.md) | O prefixo `bearer` em minúsculas é rejeitado com 401 | Baixa | Aberto | EXP-API |

**Resumo:** 8 bugs (3 de severidade Média e 5 Baixa). Nenhum crítico ou de alta severidade. O BUG-002 e o BUG-005 têm a mesma causa provável (o tratador de erros ignora o status do erro) e podem ser corrigidos juntos.

## Observações (não são defeitos confirmados)
| ID | Título | Situação |
|---|---|---|
| [OBS-001](OBS-001.md) | O token continua válido na API depois de clicar em "Sair" no site | Decisão de design pendente |

Escala de severidade: ver seção 5.3 do `01-plano-de-testes.md`.
