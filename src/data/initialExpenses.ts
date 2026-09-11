import { Expense, CategorySummary, MonthlySpend, DepartmentSpend, ExpenseCategory, Department, CategoryDefinition } from '../types';
import { auditAllExpenses } from '../utils/policyEngine';

// Default initial state: strictly empty ($0.00) until the user logs an expense or uploads a receipt
export const INITIAL_EXPENSES: Expense[] = [];

// Clean initial empty monthly spend (0s across all months)
export const INITIAL_MONTHLY_SPEND: MonthlySpend[] = [
  { month: 'Apr', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
  { month: 'May', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
  { month: 'Jun', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
  { month: 'Jul', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
  { month: 'Aug', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
  { month: 'Sep', Travel: 0, Software: 0, Meals: 0, Office: 0, Cloud: 0, Marketing: 0, total: 0 },
];

// Department definitions with allotted institutional budget caps, but $0.00 actual initial spend
export const DEFAULT_DEPARTMENTS: { department: Department; budget: number }[] = [
  { department: 'Engineering', budget: 6500 },
  { department: 'Sales', budget: 3500 },
  { department: 'Marketing', budget: 3000 },
  { department: 'Executive', budget: 1500 },
  { department: 'Operations', budget: 1200 },
  { department: 'Design', budget: 1000 },
];

// Standard expense categories with allocated budget caps, descriptions, and customizable labels
export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  {
    id: 'cat-cloud',
    category: 'Cloud & Hosting',
    description: 'AWS, Google Cloud, Azure, and server compute infrastructure.',
    budgetCap: 5000,
    labels: ['infrastructure', 'servers', 'cloud-compute'],
  },
  {
    id: 'cat-travel',
    category: 'Travel',
    description: 'Airlines, lodging, ride-shares, and business trip per-diems.',
    budgetCap: 4000,
    labels: ['flights', 'hotels', 'per-diem'],
  },
  {
    id: 'cat-marketing',
    category: 'Marketing',
    description: 'Paid ads, event sponsorships, SEO, and promotional campaigns.',
    budgetCap: 3000,
    labels: ['advertising', 'growth', 'events'],
  },
  {
    id: 'cat-software',
    category: 'Software',
    description: 'SaaS subscriptions, GitHub, Figma, Slack, and productivity tools.',
    budgetCap: 2500,
    labels: ['saas', 'licenses', 'devtools'],
  },
  {
    id: 'cat-meals',
    category: 'Meals',
    description: 'Client dinners, team lunches, and GSA meal allowances.',
    budgetCap: 1500,
    labels: ['dining', 'client', 'team-lunch'],
  },
  {
    id: 'cat-office',
    category: 'Office Supplies',
    description: 'Stationery, ergonomic equipment, and desk essentials.',
    budgetCap: 1000,
    labels: ['workspace', 'supplies'],
  },
  {
    id: 'cat-other',
    category: 'Other',
    description: 'Miscellaneous uncategorized corporate expenditures.',
    budgetCap: 1000,
    labels: ['misc', 'general'],
  },
];

// Prototyping Sample Expenses available if user desires to populate mock transactions
export const SAMPLE_PROTOTYPE_EXPENSES: Expense[] = auditAllExpenses([
  {
    id: 'exp-101',
    date: '2026-09-09',
    merchant: 'AWS Cloud Infrastructure',
    category: 'Cloud & Hosting',
    amount: 2450.00,
    currency: 'USD',
    status: 'Approved',
    employeeName: 'Sarah Jenkins',
    department: 'Engineering',
    tax: 196.00,
    hasReceipt: true,
    receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
    notes: 'Monthly production cluster scaling and S3 storage backup.'
  },
  {
    id: 'exp-102',
    date: '2026-09-08',
    merchant: 'Delta Air Lines - SFO to JFK',
    category: 'Travel',
    amount: 684.50,
    currency: 'USD',
    status: 'Approved',
    employeeName: 'Marcus Vance',
    department: 'Sales',
    tax: 54.76,
    hasReceipt: true,
    receiptUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=600',
    notes: 'Q3 Enterprise Client Onsite meetings in New York.'
  },
  {
    id: 'exp-103',
    date: '2026-09-07',
    merchant: 'GitHub Enterprise Seats',
    category: 'Software',
    amount: 420.00,
    currency: 'USD',
    status: 'Approved',
    employeeName: 'Alex Rivera',
    department: 'Engineering',
    tax: 33.60,
    hasReceipt: true,
    receiptUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    notes: 'Additional 20 developer seat licenses for core team.'
  },
  {
    id: 'exp-104',
    date: '2026-09-06',
    merchant: 'The French Laundry Bistro',
    category: 'Meals',
    amount: 312.80,
    currency: 'USD',
    status: 'Pending',
    employeeName: 'Elena Rostova',
    department: 'Executive',
    tax: 28.15,
    hasReceipt: true,
    receiptUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600',
    notes: 'Executive strategic dinner with prospective series B investment partners.'
  },
  {
    id: 'exp-105',
    date: '2026-09-05',
    merchant: 'Apple Store Online',
    category: 'Office Supplies',
    amount: 189.45,
    currency: 'USD',
    status: 'Pending',
    employeeName: 'David Chen',
    department: 'Operations',
    tax: 17.05,
    hasReceipt: false,
    notes: 'Replacement USB-C high-throughput display adapters and cables for conference rooms.'
  }
]);
