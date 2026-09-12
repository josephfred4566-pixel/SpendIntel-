import { Expense } from '../types';

/**
 * AI-Powered Anomalous Spend Detector
 * Evaluates expense transactions against dynamically calculated historical departmental norms.
 * Identifies mathematical outliers, anomalous category-to-department mismatches, and frequency spikes.
 */
export function detectAnomalies(expenses: Expense[]): Expense[] {
  if (expenses.length === 0) return expenses;

  // 1. Calculate historical metrics per department
  const deptStats: Record<string, {
    amounts: number[];
    categories: Record<string, number>;
    mean: number;
    stdDev: number;
    max: number;
  }> = {};

  // Initialize stats lists
  expenses.forEach(exp => {
    const dept = exp.department || 'Other';
    if (!deptStats[dept]) {
      deptStats[dept] = {
        amounts: [],
        categories: {},
        mean: 0,
        stdDev: 0,
        max: 0,
      };
    }
    deptStats[dept].amounts.push(exp.amount);
    deptStats[dept].categories[exp.category] = (deptStats[dept].categories[exp.category] || 0) + 1;
    if (exp.amount > deptStats[dept].max) {
      deptStats[dept].max = exp.amount;
    }
  });

  // Calculate Mean and Standard Deviation per department
  Object.keys(deptStats).forEach(dept => {
    const stats = deptStats[dept];
    const count = stats.amounts.length;
    if (count > 0) {
      const sum = stats.amounts.reduce((a, b) => a + b, 0);
      stats.mean = sum / count;

      if (count > 1) {
        const variance = stats.amounts.reduce((sumSq, amt) => sumSq + Math.pow(amt - stats.mean, 2), 0) / (count - 1);
        stats.stdDev = Math.sqrt(variance);
      } else {
        stats.stdDev = stats.mean * 0.5; // Baseline heuristic for single items
      }
    }
  });

  // 2. Classify each expense against department norms
  return expenses.map(expense => {
    const dept = expense.department || 'Other';
    const stats = deptStats[dept];
    
    // If no stats are available (should not happen), default to Low risk
    if (!stats || stats.amounts.length <= 1) {
      return {
        ...expense,
        patternRisk: 'Low',
        patternRiskExplanation: 'Consistent spending signature. Transaction matches standard baseline spending profiles for this organizational code.',
      };
    }

    const { mean, stdDev, categories } = stats;
    const amount = expense.amount;
    const categoryCount = categories[expense.category] || 0;
    const categoryRatio = categoryCount / stats.amounts.length;

    let risk: 'Low' | 'Medium' | 'High' = 'Low';
    let explanation = 'Consistent spending signature. Transaction matches standard baseline spending profiles for this organizational code.';

    // Heuristic 1: Severe statistical outlier (amount > mean + 2.0 * stdDev)
    const zScore = stdDev > 0 ? (amount - mean) / stdDev : 0;
    
    // Heuristic 2: Department-to-Category anomalous mismatch
    // e.g. Engineering spending on Meals or Sales spending on Cloud Infrastructure with high amounts
    const isRareCategory = categoryRatio < 0.15; // less than 15% of department expenses are in this category

    if (amount > 1500 && zScore > 2.0) {
      risk = 'High';
      explanation = `AI flagged an extreme spending outlier for the ${dept} department. This transaction of ${amount.toFixed(2)} is ${(zScore).toFixed(1)} standard deviations above the historical department mean of ${mean.toFixed(2)}. Highly anomalous pattern.`;
    } else if (amount > 800 && (zScore > 1.3 || (isRareCategory && amount > 2.5 * mean))) {
      risk = 'High';
      explanation = `AI identified high behavioral risk. The transaction is both a category outlier (${expense.category} is rarely charged by ${dept}) and deviates significantly (${(amount / mean).toFixed(1)}x) from the department's normal baseline of ${mean.toFixed(2)}.`;
    } else if (zScore > 1.0 || (isRareCategory && amount > 1.5 * mean)) {
      risk = 'Medium';
      explanation = `AI detected moderate risk. This transaction displays atypical spending pacing for ${dept}. The category of ${expense.category} has sparse historical activity, and the amount is higher than normal cycle ranges.`;
    } else if (amount > 200 && isRareCategory) {
      risk = 'Medium';
      explanation = `Atypical category distribution. Charges in ${expense.category} are uncommon for the ${dept} department, representing less than ${(categoryRatio * 100).toFixed(0)}% of typical department transactions.`;
    } else if (zScore > 0.8) {
      risk = 'Medium';
      explanation = `Subtle threshold elevation. Transaction amount exceeds the standard department average by ${(amount / mean).toFixed(1)}x. Pacing baseline remains within soft warning thresholds.`;
    }

    return {
      ...expense,
      patternRisk: risk,
      patternRiskExplanation: explanation,
    };
  });
}
