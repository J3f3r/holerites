// Teste de performance (carga) com autocannon.
// Pré-requisito: aplicação rodando em http://localhost:3000 (npm start) e `npm install -D autocannon`.
// Executar: node tests/performance/carga.js
// Variáveis opcionais: CONNECTIONS (padrão 10), DURATION em segundos (padrão 10), LIMIT_MS (padrão 500), BASE_URL.
const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const CONNECTIONS = Number(process.env.CONNECTIONS || 10);
const DURATION = Number(process.env.DURATION || 10);
const LIMIT_MS = Number(process.env.LIMIT_MS || 500);
const JSON_H = { 'Content-Type': 'application/json' };
const CREDENCIAIS = { email: 'ana@empresa.com', password: 'Senha@123' };

async function obterToken() {
  const r = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: JSON_H, body: JSON.stringify(CREDENCIAIS) });
  if (!r.ok) throw new Error(`Login falhou (${r.status}). A aplicação está rodando com a massa original?`);
  return (await r.json()).token;
}

async function medir(nome, opts, comLimite) {
  console.log(`\n> ${nome}: ${CONNECTIONS} conexões por ${DURATION}s...`);
  const r = await autocannon({ url: BASE + opts.path, method: opts.method || 'GET', headers: opts.headers, body: opts.body, connections: CONNECTIONS, duration: DURATION });
  const res = {
    cenario: nome,
    requisicoes: r.requests.total,
    reqPorSegundo: r.requests.average,
    status2xx: r['2xx'], statusNao2xx: r.non2xx, erros: r.errors, timeouts: r.timeouts,
    latenciaMediaMs: r.latency.average, p50Ms: r.latency.p50, p97_5Ms: r.latency.p97_5, p99Ms: r.latency.p99, maxMs: r.latency.max,
    criterio: comLimite ? `sem erros e p97,5 < ${LIMIT_MS} ms` : 'medição informativa (sem limite)'
  };
  res.aprovado = comLimite
    ? res.erros === 0 && res.timeouts === 0 && res.statusNao2xx === 0 && res.p97_5Ms < LIMIT_MS
    : null;
  return res;
}

(async () => {
  const token = await obterToken();
  const auth = { Authorization: `Bearer ${token}` };
  const resultados = [
    await medir('CT-API-07 GET /api/payslips/latest', { path: '/api/payslips/latest', headers: auth }, true),
    await medir('CT-API-07 GET /api/payslips', { path: '/api/payslips', headers: auth }, true),
    await medir('Informativo: POST /api/auth/login', { path: '/api/auth/login', method: 'POST', headers: JSON_H, body: JSON.stringify(CREDENCIAIS) }, false)
  ];

  console.log('\n===== RESULTADO =====');
  console.table(resultados.map((r) => ({
    cenario: r.cenario, req: r.requisicoes, 'req/s': r.reqPorSegundo, erros: r.erros + r.statusNao2xx + r.timeouts,
    'media ms': r.latenciaMediaMs, 'p50 ms': r.p50Ms, 'p97,5 ms': r.p97_5Ms, 'max ms': r.maxMs,
    veredito: r.aprovado === null ? 'informativo' : r.aprovado ? 'APROVADO' : 'REPROVADO'
  })));

  const dir = path.join('docs', 'evidencias'); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'resultado-performance.json'), JSON.stringify({ data: new Date().toISOString(), conexoes: CONNECTIONS, duracaoS: DURATION, limiteMs: LIMIT_MS, resultados }, null, 2));
  console.log(`Detalhes salvos em ${path.join(dir, 'resultado-performance.json')}`);
  if (resultados.some((r) => r.aprovado === false)) process.exitCode = 1;
})().catch((e) => { console.error(e.message); process.exit(1); });
