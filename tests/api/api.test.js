// Testes de API (Node test runner nativo, sem dependências extras).
// Pré-requisito: aplicação rodando em http://localhost:3000 (npm start), com a massa original.
// Executar: node --test --test-reporter=spec tests/api/
// Testes com { todo: 'BUG-xxx' } cobrem defeitos já reportados: aparecem como "todo" e não quebram a execução.
const test = require('node:test');
const assert = require('node:assert/strict');
const jwt = require('jsonwebtoken');

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SECRET = process.env.JWT_SECRET || 'segredo-apenas-para-desenvolvimento';
const PASSWORD = 'Senha@123';
const EMPTY_MSG = 'Você ainda não possui holerites disponibilizados.';

async function call(method, path, { token, headers = {}, json, raw } = {}) {
  const h = { ...headers };
  if (token) h.Authorization = `Bearer ${token}`;
  let body;
  if (json !== undefined) { h['Content-Type'] = 'application/json'; body = JSON.stringify(json); }
  if (raw !== undefined) { h['Content-Type'] = 'application/json'; body = raw; }
  const t0 = performance.now();
  const res = await fetch(BASE + path, { method, headers: h, body });
  const text = await res.text();
  let data = null; try { data = JSON.parse(text); } catch { /* corpo não JSON */ }
  return { status: res.status, text, data, ms: performance.now() - t0 };
}
const login = (email, password = PASSWORD) => call('POST', '/api/auth/login', { json: { email, password } });
const tokenOf = async (email) => (await login(email)).data.token;
const nets = (r) => r.data.payslips.map((p) => p.netPay);
const INVALID = 'E-mail ou senha inválidos.';

// ---------- Documentação ----------
test('CT-DOC-02 YAML da especificação é renderizado', async () => {
  const r = await call('GET', '/api-docs.yaml');
  assert.equal(r.status, 200);
  assert.match(r.text, /^openapi: 3\.0\.3/);
});

// ---------- Login ----------
for (const [email, nome] of [['ana@empresa.com', 'Ana Souza'], ['bruno@empresa.com', 'Bruno Lima'], ['carla@empresa.com', 'Carla Mendes']]) {
  test(`CT-LOG-01 login válido: ${nome}`, async () => {
    const r = await login(email);
    assert.equal(r.status, 200);
    assert.ok(r.data.token);
    assert.equal(r.data.employee.name, nome);
    assert.doesNotMatch(r.text, /passwordHash/);
  });
}
test('CT-LOG-02 e-mail com maiúsculas e espaços (a confirmar: apenas registra)', async (t) => {
  const r = await login(' ANA@Empresa.com ');
  t.diagnostic(`status observado: ${r.status}`);
  assert.ok([200, 401].includes(r.status));
});
for (const [id, senha] of [['CT-LOG-03 senha incorreta', 'Errada@1'], ['CT-LOG-04 caixa diferente', 'senha@123'], ['CT-LOG-05 espaço no final', 'Senha@123 ']]) {
  test(id, async () => {
    const r = await login('ana@empresa.com', senha);
    assert.equal(r.status, 401);
    assert.equal(r.data.message, INVALID);
  });
}
test('CT-LOG-06 senha vazia', async () => {
  const r = await login('ana@empresa.com', '');
  assert.ok([400, 401].includes(r.status)); assert.equal(r.data.token, undefined);
});
test('CT-LOG-07 e-mail não cadastrado', async () => {
  const r = await login('joao@empresa.com');
  assert.equal(r.status, 401); assert.equal(r.data.message, INVALID);
});
test('CT-LOG-08 e-mail em formato inválido', async () => {
  const r = await login('ana.empresa.com');
  assert.ok([400, 401].includes(r.status)); assert.equal(r.data.token, undefined);
});
test('CT-LOG-09 e-mail vazio', async () => {
  const r = await login('');
  assert.ok([400, 401].includes(r.status)); assert.equal(r.data.token, undefined);
});
test('CT-LOG-10 sem o campo senha', async () => {
  const r = await call('POST', '/api/auth/login', { json: { email: 'ana@empresa.com' } });
  assert.equal(r.status, 400); assert.equal(r.data.message, 'Informe e-mail e senha.');
});
test('CT-LOG-11 sem o campo e-mail', async () => {
  const r = await call('POST', '/api/auth/login', { json: { password: PASSWORD } });
  assert.equal(r.status, 400);
});
for (const [nome, body] of [
  ['e-mail número', { email: 123, password: PASSWORD }],
  ['senha número', { email: 'ana@empresa.com', password: 123 }],
  ['e-mail objeto', { email: { $ne: null }, password: PASSWORD }]]) {
  test(`CT-LOG-12 tipo incorreto: ${nome}`, async () => {
    const r = await call('POST', '/api/auth/login', { json: body });
    assert.equal(r.status, 400); assert.equal(r.data.token, undefined);
  });
}
test('CT-LOG-13 mensagem não revela se o e-mail existe', async () => {
  const a = await login('ana@empresa.com', 'Errada@1'); const b = await login('joao@empresa.com');
  assert.equal(a.status, b.status); assert.equal(a.data.message, b.data.message);
});

// ---------- Autorização ----------
for (const rota of ['/api/payslips/latest', '/api/payslips']) {
  test(`CT-AUT-01 sem token: ${rota}`, async () => {
    const r = await call('GET', rota);
    assert.equal(r.status, 401); assert.equal(r.data.message, 'Autenticação necessária.');
  });
}
for (const h of ['Bearer', 'Bearer abc123', 'Basic YW5hOjEyMw==']) {
  test(`CT-AUT-02 cabeçalho malformado: "${h}"`, async () => {
    const r = await call('GET', '/api/payslips', { headers: { Authorization: h } });
    assert.equal(r.status, 401);
  });
}
test('CT-AUT-03 token adulterado', async () => {
  const t = await tokenOf('ana@empresa.com'); const p = t.length - 10;
  const bad = t.slice(0, p) + (t[p] === 'A' ? 'B' : 'A') + t.slice(p + 1);
  const r = await call('GET', '/api/payslips', { token: bad });
  assert.equal(r.status, 401);
});
test('CT-AUT-04 token expirado', async () => {
  const exp = jwt.sign({ sub: '507f1f77bcf86cd799439011' }, SECRET, { expiresIn: -10 });
  const r = await call('GET', '/api/payslips', { token: exp });
  assert.equal(r.status, 401); assert.match(r.data.message, /login novamente/i);
});
test('CT-AUT-05 token retorna somente os dados do dono', async () => {
  const ana = await call('GET', '/api/payslips', { token: await tokenOf('ana@empresa.com') });
  const bruno = await call('GET', '/api/payslips', { token: await tokenOf('bruno@empresa.com') });
  assert.deepEqual(nets(ana), [5745, 5395]);
  assert.deepEqual(nets(bruno), [6806, 6806]);
});
test('CT-AUT-06 resposta não expõe dados internos', { todo: 'BUG-001' }, async () => {
  const token = await tokenOf('ana@empresa.com');
  for (const rota of ['/api/payslips/latest', '/api/payslips']) {
    const r = await call('GET', rota, { token });
    assert.doesNotMatch(r.text, /"_id"|employeeId|passwordHash|"status"/, `campo interno em ${rota}`);
  }
});
test('CT-AUT-09 parâmetro employeeId não troca o funcionário', async () => {
  const r = await call('GET', '/api/payslips?employeeId=qualquer-id', { token: await tokenOf('ana@empresa.com') });
  assert.deepEqual(nets(r), [5745, 5395]);
});

// ---------- Consulta ----------
test('CT-CON-01/02 Ana: holerite mais recente e valores', async () => {
  const r = await call('GET', '/api/payslips/latest', { token: await tokenOf('ana@empresa.com') });
  const p = r.data.payslip;
  assert.equal(r.status, 200);
  assert.equal(p.competence, '2026-10'); assert.equal(p.version, 2);
  assert.equal(p.earnings.reduce((s, e) => s + e.amount, 0), 6850);
  assert.equal(p.deductions.reduce((s, e) => s + e.amount, 0), 1105);
  assert.equal(p.netPay, 5745);
  assert.match(p.publishedAt, /^2026-11-05/);
});
test('CT-CON-01 Bruno: holerite mais recente', async () => {
  const p = (await call('GET', '/api/payslips/latest', { token: await tokenOf('bruno@empresa.com') })).data.payslip;
  assert.equal(p.competence, '2026-10'); assert.equal(p.version, 1); assert.equal(p.netPay, 6806);
});
test('CT-CON-03 Carla: mensagem informativa em /latest', async () => {
  const r = await call('GET', '/api/payslips/latest', { token: await tokenOf('carla@empresa.com') });
  assert.equal(r.status, 200); assert.equal(r.data.payslip, null); assert.equal(r.data.message, EMPTY_MSG);
});
test('CT-CON-04 Ana: lista ordenada, última versão por competência', async () => {
  const r = await call('GET', '/api/payslips', { token: await tokenOf('ana@empresa.com') });
  assert.deepEqual(r.data.payslips.map((p) => [p.competence, p.version]), [['2026-10', 2], ['2026-09', 1]]);
});
test('CT-CON-05 Bruno: versão em rascunho não substitui a publicada', async () => {
  const r = await call('GET', '/api/payslips', { token: await tokenOf('bruno@empresa.com') });
  assert.deepEqual(r.data.payslips.map((p) => [p.competence, p.version]), [['2026-10', 1], ['2026-09', 1]]);
});
test('CT-CON-06 competência só com rascunho (2026-11) não aparece', async () => {
  for (const e of ['ana@empresa.com', 'bruno@empresa.com']) {
    const r = await call('GET', '/api/payslips', { token: await tokenOf(e) });
    assert.ok(!r.data.payslips.some((p) => p.competence === '2026-11'));
  }
});
test('CT-CON-07 Carla: lista vazia com mensagem', async () => {
  const r = await call('GET', '/api/payslips', { token: await tokenOf('carla@empresa.com') });
  assert.equal(r.status, 200); assert.deepEqual(r.data.payslips, []); assert.equal(r.data.message, EMPTY_MSG);
});

// ---------- VADER ----------
for (const [verbo, rota] of [['PUT', '/api/payslips'], ['DELETE', '/api/payslips'], ['POST', '/api/payslips/latest']]) {
  test(`CT-API-01 verbo ${verbo} em ${rota} deveria retornar 405`, { todo: 'BUG-003' }, async () => {
    const r = await call(verbo, rota, { token: await tokenOf('ana@empresa.com') });
    assert.equal(r.status, 405);
  });
}
test('CT-API-02 GET em /api/auth/login deveria retornar 405', { todo: 'BUG-003' }, async () => {
  assert.equal((await call('GET', '/api/auth/login')).status, 405);
});
test('CT-API-03 JSON malformado no login deveria retornar 400', { todo: 'BUG-002' }, async () => {
  const r = await call('POST', '/api/auth/login', { raw: '{"email": "ana@empresa.com",' });
  assert.equal(r.status, 400);
});
test('CT-API-04 rota inexistente', async () => {
  const r = await call('GET', '/api/rota-inexistente');
  assert.equal(r.status, 404); assert.equal(r.data.message, 'Recurso não encontrado.');
});
test('CT-API-05 login sem corpo', async () => {
  const r = await call('POST', '/api/auth/login');
  assert.equal(r.status, 400); assert.equal(r.data.message, 'Informe e-mail e senha.');
});
test('CT-API-06 estrutura e tipos do holerite', async () => {
  const p = (await call('GET', '/api/payslips/latest', { token: await tokenOf('ana@empresa.com') })).data.payslip;
  assert.match(p.competence, /^\d{4}-(0[1-9]|1[0-2])$/);
  assert.ok(Number.isInteger(p.version));
  assert.ok(!Number.isNaN(Date.parse(p.publishedAt)));
  for (const l of [...p.earnings, ...p.deductions]) { assert.equal(typeof l.description, 'string'); assert.equal(typeof l.amount, 'number'); }
  for (const k of ['grossPay', 'totalDeductions', 'netPay']) assert.equal(typeof p[k], 'number');
  assert.ok(Math.abs(p.netPay - (p.grossPay - p.totalDeductions)) < 0.01);
});
test('CT-API-08 20 logins seguidos', async (t) => {
  const tempos = [];
  for (let i = 0; i < 20; i++) { const r = await login('ana@empresa.com'); assert.equal(r.status, 200); tempos.push(r.ms); }
  t.diagnostic(`menor ${Math.min(...tempos).toFixed(0)} ms, maior ${Math.max(...tempos).toFixed(0)} ms`);
});
