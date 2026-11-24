const path = require('path');
const fs = require('fs');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const yaml = require('js-yaml');
const swaggerUi = require('swagger-ui-express');
const { Employee, Payslip } = require('./models');

const JWT_SECRET = process.env.JWT_SECRET || 'segredo-apenas-para-desenvolvimento';
const specPath = path.join(__dirname, '..', 'openapi.yaml');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// --- Documentação ---
app.get('/api-docs.yaml', (req, res) => res.type('text/yaml').send(fs.readFileSync(specPath, 'utf8')));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(yaml.load(fs.readFileSync(specPath, 'utf8'))));

// --- Autenticação ---
function auth(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Autenticação necessária.' });
  try {
    req.user = jwt.verify(token, JWT_SECRET); // { sub: id do funcionário }
    next();
  } catch {
    res.status(401).json({ message: 'Sessão inválida ou expirada. Faça login novamente.' });
  }
}

app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Informe e-mail e senha.' });
    }
    const employee = await Employee.findOne({ email: email.trim().toLowerCase() });
    const ok = employee && await bcrypt.compare(password, employee.passwordHash);
    if (!ok) return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
    const token = jwt.sign({ sub: String(employee._id) }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, employee: { name: employee.name, registration: employee.registration, role: employee.role } });
  } catch (e) { next(e); }
});

// --- Holerites ---
const EMPTY = 'Você ainda não possui holerites disponibilizados.';
const toDto = (p) => ({
  competence: p.competence, version: p.version, publishedAt: p.publishedAt,
  earnings: p.earnings, deductions: p.deductions,
  grossPay: p.grossPay, totalDeductions: p.totalDeductions, netPay: p.netPay
});

// O filtro SEMPRE usa o id do token (nunca um id vindo da requisição) e apenas status PUBLISHED.
const published = (req) => Payslip.find({ employeeId: req.user.sub, status: 'PUBLISHED' })
  .sort({ competence: -1, version: -1 }).lean();

app.get('/api/payslips/latest', auth, async (req, res, next) => {
  try {
    const [latest] = await published(req);
    res.json(latest ? { payslip: toDto(latest), message: null } : { payslip: null, message: EMPTY });
  } catch (e) { next(e); }
});

app.get('/api/payslips', auth, async (req, res, next) => {
  try {
    const seen = new Set();
    // já ordenado: a primeira ocorrência de cada competência é a última versão publicada
    const list = (await published(req)).filter((p) => !seen.has(p.competence) && seen.add(p.competence));
    res.json({ payslips: list.map(toDto), message: list.length ? null : EMPTY });
  } catch (e) { next(e); }
});

app.use('/api', (req, res) => res.status(404).json({ message: 'Recurso não encontrado.' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ message: 'Erro interno.' }); });

module.exports = app;
