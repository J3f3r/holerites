const mongoose = require('mongoose');

const Employee = mongoose.model('Employee', new mongoose.Schema({
  name: { type: String, required: true },
  registration: { type: String, required: true, unique: true },
  role: String,
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true }
}));

const line = { description: String, amount: Number };
const Payslip = mongoose.model('Payslip', new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true, index: true },
  competence: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ }, // AAAA-MM
  version: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['DRAFT', 'PUBLISHED'], required: true },
  publishedAt: Date,
  earnings: [line],
  deductions: [line],
  grossPay: Number,
  totalDeductions: Number,
  netPay: Number
}));

module.exports = { Employee, Payslip };
