const bcrypt = require('bcryptjs');
const { Employee, Payslip } = require('./models');

const PASSWORD = 'Senha@123';

function slip(employeeId, competence, version, status, base) {
  const earnings = [{ description: 'Salário base', amount: base }];
  if (competence.endsWith('-10') && version > 1) earnings.push({ description: 'Ajuste retroativo', amount: 350 });
  const inss = +(base * 0.09).toFixed(2);
  const irrf = +(base * 0.08).toFixed(2);
  const deductions = [{ description: 'INSS', amount: inss }, { description: 'IRRF', amount: irrf }];
  const grossPay = earnings.reduce((s, e) => s + e.amount, 0);
  const totalDeductions = +(inss + irrf).toFixed(2);
  const [y, m] = competence.split('-').map(Number);
  return {
    employeeId, competence, version, status, earnings, deductions, grossPay, totalDeductions,
    netPay: +(grossPay - totalDeductions).toFixed(2),
    publishedAt: status === 'PUBLISHED' ? new Date(Date.UTC(y, m, 5)) : undefined
  };
}

async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);
  const [ana, bruno, carla] = await Employee.insertMany([
    { name: 'Ana Souza', registration: '1001', role: 'Analista Financeiro', email: 'ana@empresa.com', passwordHash },
    { name: 'Bruno Lima', registration: '1002', role: 'Desenvolvedor', email: 'bruno@empresa.com', passwordHash },
    { name: 'Carla Mendes', registration: '1003', role: 'Designer', email: 'carla@empresa.com', passwordHash }
  ]);
  await Payslip.insertMany([
    // Ana: out/2026 tem 2 versões publicadas (vale a v2); nov/2026 em elaboração
    slip(ana._id, '2026-09', 1, 'PUBLISHED', 6500),
    slip(ana._id, '2026-10', 1, 'PUBLISHED', 6500),
    slip(ana._id, '2026-10', 2, 'PUBLISHED', 6500),
    slip(ana._id, '2026-11', 1, 'DRAFT', 6500),
    // Bruno: set/2026 v2 não publicada (vale a v1); nov/2026 em elaboração
    slip(bruno._id, '2026-09', 1, 'PUBLISHED', 8200),
    slip(bruno._id, '2026-09', 2, 'DRAFT', 8200),
    slip(bruno._id, '2026-10', 1, 'PUBLISHED', 8200),
    slip(bruno._id, '2026-11', 1, 'DRAFT', 8200),
    // Carla: somente holerites não publicados
    slip(carla._id, '2026-10', 1, 'DRAFT', 5400),
    slip(carla._id, '2026-11', 1, 'DRAFT', 5400)
  ]);
}

module.exports = { seed, PASSWORD };
