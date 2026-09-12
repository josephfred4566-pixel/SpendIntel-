import { Expense } from '../types';

export const MERCHANT_CATEGORY_MAPPINGS: Record<string, string> = {
  'aws': 'Cloud & Hosting',
  'google cloud': 'Cloud & Hosting',
  'azure': 'Cloud & Hosting',
  'heroku': 'Cloud & Hosting',
  'github': 'Software',
  'slack': 'Software',
  'zoom': 'Software',
  'figma': 'Software',
  'notion': 'Software',
  'microsoft': 'Software',
  'salesforce': 'Software',
  'openai': 'Software',
  'delta': 'Travel',
  'united': 'Travel',
  'uber': 'Travel',
  'lyft': 'Travel',
  'hilton': 'Travel',
  'marriott': 'Travel',
  'airbnb': 'Travel',
  'facebook': 'Marketing',
  'google ads': 'Marketing',
  'linkedin': 'Marketing',
  'mailchimp': 'Marketing',
  'hubspot': 'Marketing',
  'starbucks': 'Meals',
  'mcdonald': 'Meals',
  'sweetgreen': 'Meals',
  'uber eats': 'Meals',
  'bistro': 'Meals',
  'french laundry': 'Meals',
  'amazon': 'Office Supplies',
  'staples': 'Office Supplies',
  'target': 'Office Supplies',
  'fedex': 'Office Supplies',
};

export function suggestCategoryForMerchant(merchant: string): string {
  const norm = merchant.toLowerCase();
  for (const [key, cat] of Object.entries(MERCHANT_CATEGORY_MAPPINGS)) {
    if (norm.includes(key)) {
      return cat;
    }
  }
  return 'Other';
}

export function generateMockUncategorizedExpenses(): Expense[] {
  return [
    {
      id: `exp-ai-mock-${Date.now()}-1`,
      date: new Date(Date.now() - 3600000 * 24).toISOString().split('T')[0], // 1 day ago
      merchant: 'AWS Cloud Compute Cluster',
      category: 'Other',
      amount: 1450.00,
      currency: 'USD',
      status: 'Pending',
      employeeName: 'Elena Rostova',
      department: 'Engineering',
      hasReceipt: true,
      receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600',
      notes: 'Monthly standard cloud instances for DevOps pipeline.'
    },
    {
      id: `exp-ai-mock-${Date.now()}-2`,
      date: new Date(Date.now() - 3600000 * 48).toISOString().split('T')[0], // 2 days ago
      merchant: 'GitHub Enterprise Subscription',
      category: 'Other',
      amount: 280.00,
      currency: 'USD',
      status: 'Pending',
      employeeName: 'Sarah Jenkins',
      department: 'Engineering',
      hasReceipt: false,
      notes: 'Developer tools and repositories seat licensing.'
    },
    {
      id: `exp-ai-mock-${Date.now()}-3`,
      date: new Date(Date.now() - 3600000 * 72).toISOString().split('T')[0], // 3 days ago
      merchant: 'Starbucks Coffee & Team Breakfast',
      category: 'Other',
      amount: 45.50,
      currency: 'USD',
      status: 'Pending',
      employeeName: 'Marcus Vance',
      department: 'Sales',
      hasReceipt: true,
      receiptUrl: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&q=80&w=600',
      notes: 'Morning coffee with prospective account reps.'
    }
  ];
}
