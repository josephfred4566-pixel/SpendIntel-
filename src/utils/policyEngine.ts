import { Expense, PolicyViolation } from '../types';
import { detectAnomalies } from './anomalousSpendDetector';

/**
 * Automated Policy Check Engine
 * Evaluates expense records against corporate compliance & accounting governance rules.
 */

export const OUT_OF_POLICY_KEYWORDS = [
  'casino',
  'lounge',
  'nightclub',
  'luxury',
  'jewelry',
  'vip valet',
  'first class upgrade',
];

export const POLICY_RULES_META = [
  {
    code: 'POL-001',
    name: 'Mandatory Receipt Requirement',
    description: 'Any expense transaction exceeding $50.00 must have an itemized tax receipt attached.',
    severity: 'critical' as const,
  },
  {
    code: 'POL-002',
    name: 'Travel & Lodging Per-Diem Cap',
    description: 'Hotel lodging cannot exceed $700.00 total ($250/night) without VP Travel clearance.',
    severity: 'critical' as const,
  },
  {
    code: 'POL-003',
    name: 'Single Meal Spending Limit',
    description: 'Client or team meals exceeding $250.00 require secondary Executive approval.',
    severity: 'warning' as const,
  },
  {
    code: 'POL-004',
    name: 'Unsanctioned SaaS / Shadow IT',
    description: 'Software subscriptions above $400.00 require Procurement & Security approval ticket.',
    severity: 'warning' as const,
  },
  {
    code: 'POL-005',
    name: 'Business Purpose Completeness',
    description: 'Expenses above $100.00 must contain an explicit business justification (min 15 characters).',
    severity: 'info' as const,
  },
  {
    code: 'POL-006',
    name: 'Restricted Vendor & Merchant Watchlist',
    description: 'Charges from entertainment, gambling, or non-work related merchants are strictly prohibited.',
    severity: 'critical' as const,
  }
];

/**
 * Validates a single expense against all active accounting rules.
 * Returns an array of detected PolicyViolations.
 */
export function evaluatePolicyRules(expense: Expense): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  // Rule 1: Missing Receipt for amounts > $50
  const hasReceipt = expense.hasReceipt !== false && Boolean(expense.receiptUrl && expense.receiptUrl.trim().length > 0);
  if (expense.amount > 50 && !hasReceipt) {
    violations.push({
      id: `viol-${expense.id}-receipt`,
      expenseId: expense.id,
      code: 'POL-001',
      ruleName: 'Missing Itemized Receipt',
      severity: 'critical',
      description: `Expense amount is $${expense.amount.toFixed(2)} (exceeds $50.00 audit threshold) with no receipt attached.`,
      suggestedAction: 'Request employee to upload receipt or signed affidavit.',
      date: expense.date,
    });
  }

  // Rule 2: Travel & Lodging Per-Diem Cap ($700)
  if (expense.category === 'Travel' && expense.amount > 700) {
    violations.push({
      id: `viol-${expense.id}-travel`,
      expenseId: expense.id,
      code: 'POL-002',
      ruleName: 'Per-Diem Lodging Limit Exceeded',
      severity: 'critical',
      description: `Lodging charge of $${expense.amount.toFixed(2)} exceeds standard corporate rate limit ($700 max cap).`,
      suggestedAction: 'Require manager exception approval or employee reimbursement deduction.',
      date: expense.date,
    });
  }

  // Rule 3: Single Meal Threshold ($250)
  if (expense.category === 'Meals' && expense.amount > 250) {
    violations.push({
      id: `viol-${expense.id}-meals`,
      expenseId: expense.id,
      code: 'POL-003',
      ruleName: 'Executive Meal Limit Exceeded',
      severity: 'warning',
      description: `Dining expense of $${expense.amount.toFixed(2)} exceeds the $250.00 standard meal allowance.`,
      suggestedAction: 'Verify attendee roster and confirm client business development purpose.',
      date: expense.date,
    });
  }

  // Rule 4: Software > $400 without procurement note
  if (expense.category === 'Software' && expense.amount > 400) {
    const notesLower = (expense.notes || '').toLowerCase();
    const hasApproval = notesLower.includes('approved') || notesLower.includes('ticket') || notesLower.includes('procurement') || notesLower.includes('license');
    if (!hasApproval) {
      violations.push({
        id: `viol-${expense.id}-saas`,
        expenseId: expense.id,
        code: 'POL-004',
        ruleName: 'Unsanctioned SaaS / Shadow IT',
        severity: 'warning',
        description: `Software purchase of $${expense.amount.toFixed(2)} lacks reference to an approved IT Procurement ticket.`,
        suggestedAction: 'Verify security clearance with IT Ops before approving reimbursement.',
        date: expense.date,
      });
    }
  }

  // Rule 5: Vague business justification for expenses > $100
  const notesLength = (expense.notes || '').trim().length;
  if (expense.amount > 100 && notesLength < 15) {
    violations.push({
      id: `viol-${expense.id}-justification`,
      expenseId: expense.id,
      code: 'POL-005',
      ruleName: 'Vague Business Justification',
      severity: 'info',
      description: `Transaction amount ($${expense.amount.toFixed(2)}) requires detailed justification (found ${notesLength} chars).`,
      suggestedAction: 'Prompt employee to provide project code and business context.',
      date: expense.date,
    });
  }

  // Rule 6: Out-of-policy merchants
  const merchantLower = expense.merchant.toLowerCase();
  const matchedKeyword = OUT_OF_POLICY_KEYWORDS.find(kw => merchantLower.includes(kw));
  if (matchedKeyword) {
    violations.push({
      id: `viol-${expense.id}-merchant`,
      expenseId: expense.id,
      code: 'POL-006',
      ruleName: 'Restricted Merchant Category',
      severity: 'critical',
      description: `Merchant "${expense.merchant}" triggered high-risk classification ("${matchedKeyword}").`,
      suggestedAction: 'Freeze payout immediately and escalate to Internal Audit compliance team.',
      date: expense.date,
    });
  }

  return violations;
}

/**
 * Augments a list of expenses with computed policy violations.
 * If violations exist, sets status to 'Flagged' if not already Approved.
 */
export function auditAllExpenses(expenses: Expense[]): Expense[] {
  const audited = expenses.map(expense => {
    const violations = evaluatePolicyRules(expense);
    return {
      ...expense,
      violations,
      status: violations.length > 0 && expense.status !== 'Approved' ? 'Flagged' : expense.status,
    };
  });
  return detectAnomalies(audited);
}
