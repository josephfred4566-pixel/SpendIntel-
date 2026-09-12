import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, CategoryDefinition } from '../types';
import { formatMoney } from '../utils/currencies';
import { getExpenseAmountInCurrency, convertBudget } from '../utils/currencyConverter';
import { 
  Layers, 
  Plus, 
  Tag, 
  Edit2, 
  Trash2, 
  Check, 
  X, 
  FileText, 
  Sparkles, 
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface CategoryBreakdownProps {
  expenses: Expense[];
  categories: CategoryDefinition[];
  onCategoriesChange: (newCategories: CategoryDefinition[]) => void;
  selectedCategory: ExpenseCategory | 'All';
  onSelectCategory: (category: ExpenseCategory | 'All') => void;
  currencyCode?: string;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
  expenses,
  categories,
  onCategoriesChange,
  selectedCategory,
  onSelectCategory,
  currencyCode = 'USD',
}) => {
  // New Category Creation state
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatBudget, setNewCatBudget] = useState('2000');
  const [newCatLabelsInput, setNewCatLabelsInput] = useState('');
  const [formError, setFormError] = useState('');

  // Inline editing state for Category Edit (name, desc, budget)
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editBudget, setEditBudget] = useState('');

  // Quick Inline New Tag state per category
  const [activeTagInputCatId, setActiveTagInputCatId] = useState<string | null>(null);
  const [newTagText, setNewTagText] = useState('');

  // Compute category totals dynamically in real-time converted currency
  const categoryStats = useMemo(() => {
    return categories.map(catDef => {
      const matchingExpenses = expenses.filter(e => e.category === catDef.category);
      const total = matchingExpenses.reduce((sum, e) => sum + getExpenseAmountInCurrency(e, currencyCode), 0);
      const budgetCap = convertBudget(catDef.budgetCap || 1000, currencyCode);
      return {
        id: catDef.id,
        category: catDef.category,
        description: catDef.description || '',
        labels: catDef.labels || [],
        total,
        count: matchingExpenses.length,
        budgetCap,
        percentOfBudget: budgetCap > 0 ? Math.round((total / budgetCap) * 100) : 0,
      };
    });
  }, [categories, expenses, currencyCode]);

  const totalSpend = categoryStats.reduce((sum, item) => sum + item.total, 0);

  // Handler: Add a brand new category
  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = newCatName.trim();
    if (!trimmedName) {
      setFormError('Category name is required.');
      return;
    }

    if (categories.some(c => c.category.toLowerCase() === trimmedName.toLowerCase())) {
      setFormError('A category with this name already exists.');
      return;
    }

    const parsedBudget = parseFloat(newCatBudget) || 1000;
    const initialLabels = newCatLabelsInput
      .split(',')
      .map(t => t.trim().replace(/^#+/, ''))
      .filter(Boolean);

    const newCategory: CategoryDefinition = {
      id: `cat-${Date.now()}`,
      category: trimmedName,
      description: newCatDesc.trim(),
      budgetCap: parsedBudget,
      labels: initialLabels.length > 0 ? initialLabels : [trimmedName.toLowerCase().replace(/\s+/g, '-')],
    };

    onCategoriesChange([...categories, newCategory]);
    setIsAddingNew(false);
    setNewCatName('');
    setNewCatDesc('');
    setNewCatBudget('2000');
    setNewCatLabelsInput('');
    setFormError('');
  };

  // Handler: Start editing category metadata
  const handleStartEdit = (cat: CategoryDefinition, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCatId(cat.id);
    setEditName(cat.category);
    setEditDesc(cat.description || '');
    setEditBudget(String(cat.budgetCap || 1000));
  };

  // Handler: Save edited category metadata
  const handleSaveEdit = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    const updated = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          category: trimmedName,
          description: editDesc.trim(),
          budgetCap: parseFloat(editBudget) || 1000,
        };
      }
      return c;
    });

    onCategoriesChange(updated);
    setEditingCatId(null);
  };

  // Handler: Delete a category
  const handleDeleteCategory = (catId: string, catName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (categories.length <= 1) {
      alert('You must keep at least one category.');
      return;
    }
    const updated = categories.filter(c => c.id !== catId);
    onCategoriesChange(updated);
    if (selectedCategory === catName) {
      onSelectCategory('All');
    }
  };

  // Handler: Remove a specific label/tag from category
  const handleRemoveLabel = (catId: string, labelToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = categories.map(c => {
      if (c.id === catId) {
        return {
          ...c,
          labels: (c.labels || []).filter(l => l !== labelToRemove),
        };
      }
      return c;
    });
    onCategoriesChange(updated);
  };

  // Handler: Add a new label/tag to category
  const handleAddLabel = (catId: string) => {
    const cleanTag = newTagText.trim().replace(/^#+/, '');
    if (!cleanTag) {
      setActiveTagInputCatId(null);
      setNewTagText('');
      return;
    }

    const updated = categories.map(c => {
      if (c.id === catId) {
        const existing = c.labels || [];
        if (existing.includes(cleanTag)) return c;
        return {
          ...c,
          labels: [...existing, cleanTag],
        };
      }
      return c;
    });

    onCategoriesChange(updated);
    setActiveTagInputCatId(null);
    setNewTagText('');
  };

  // Handler: Remove / Clear Description directly
  const handleClearDescription = (catId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = categories.map(c => {
      if (c.id === catId) {
        return { ...c, description: '' };
      }
      return c;
    });
    onCategoriesChange(updated);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Categorization
              </h2>
              <span className="text-[11px] text-slate-500">
                Total Allocated: {formatMoney(totalSpend, currencyCode)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="add-category-btn"
              type="button"
              onClick={() => {
                setIsAddingNew(!isAddingNew);
                setFormError('');
              }}
              className="inline-flex items-center px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>{isAddingNew ? 'Close Form' : 'Add Category'}</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectCategory('All')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                selectedCategory === 'All'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              Show All ({expenses.length})
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 mb-3.5">
          Autonomous classification rules, custom classification tag labels, descriptions, and budget allocations.
        </p>

        {/* Add New Category Form Panel */}
        {isAddingNew && (
          <form 
            onSubmit={handleCreateCategory}
            className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 space-y-3 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-slate-700" />
                Create New Smart Category & Description
              </span>
              <button 
                type="button" 
                onClick={() => setIsAddingNew(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-[11px] text-rose-700 flex items-center space-x-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Category Name / Label *
                </label>
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="e.g. Legal & Compliance"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Monthly Budget Cap ({currencyCode})
                </label>
                <input
                  type="number"
                  value={newCatBudget}
                  onChange={(e) => setNewCatBudget(e.target.value)}
                  placeholder="2000"
                  className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Category Description
              </label>
              <input
                type="text"
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="e.g. External legal counsel, patent filings, and regulatory compliance fees."
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Keyword Tag Labels (comma-separated)
              </label>
              <input
                type="text"
                value={newCatLabelsInput}
                onChange={(e) => setNewCatLabelsInput(e.target.value)}
                placeholder="e.g. legal, filings, contracts, patents"
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingNew(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-2xs cursor-pointer"
              >
                Save Category
              </button>
            </div>
          </form>
        )}

        {/* Categories List with Tag Labels & Editable Descriptions */}
        <div className="space-y-3">
          {categoryStats.map((item) => {
            const isSelected = selectedCategory === item.category;
            const isEditing = editingCatId === item.id;
            const fullCat = categories.find(c => c.id === item.id) || {
              id: item.id,
              category: item.category,
              description: item.description,
              budgetCap: item.budgetCap,
              labels: item.labels,
            };

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!isEditing) {
                    onSelectCategory(isSelected ? 'All' : item.category);
                  }
                }}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-slate-900 bg-slate-900/5 ring-1 ring-slate-900 shadow-2xs'
                    : 'border-slate-200/90 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                {/* Mode 1: Edit Category metadata inline */}
                {isEditing ? (
                  <div className="space-y-2.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Edit Category Details</span>
                      <div className="flex items-center space-x-1.5">
                        <button
                          type="button"
                          onClick={(e) => handleSaveEdit(item.id, e)}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-md text-xs font-semibold flex items-center cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 mr-1" /> Save
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingCatId(null);
                          }}
                          className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Category Name"
                        className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                      <input
                        type="number"
                        value={editBudget}
                        onChange={(e) => setEditBudget(e.target.value)}
                        placeholder="Budget Cap"
                        className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="Category Description"
                      className="w-full px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-900"
                    />
                  </div>
                ) : (
                  /* Mode 2: Normal Category View */
                  <>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-slate-800 shrink-0 mt-1 sm:mt-0" />
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-900">
                              {item.category}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">
                              ({item.count} item{item.count === 1 ? '' : 's'})
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-slate-900 font-mono">
                            {formatMoney(item.total, currencyCode)}
                          </span>
                          <span className="text-[10px] text-slate-500 ml-1 font-mono">
                            / {formatMoney(item.budgetCap, currencyCode)}
                          </span>
                        </div>

                        {/* Action buttons: Edit & Delete */}
                        <div className="flex items-center space-x-1 pl-1 border-l border-slate-200">
                          <button
                            type="button"
                            title="Edit Category & Description"
                            onClick={(e) => handleStartEdit(fullCat, e)}
                            className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          {categories.length > 1 && (
                            <button
                              type="button"
                              title="Delete Category"
                              onClick={(e) => handleDeleteCategory(item.id, item.category, e)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Category Description with inline remove/edit controls */}
                    <div className="my-1.5 pl-4 pr-1 flex items-start justify-between gap-2 text-[11px] text-slate-600 bg-white/70 rounded-lg p-1.5 border border-slate-200/60">
                      <div className="flex items-start space-x-1.5 leading-relaxed">
                        <FileText className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                        <span>
                          {item.description ? (
                            item.description
                          ) : (
                            <em className="text-slate-400 not-italic">No description set.</em>
                          )}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {item.description && (
                          <button
                            type="button"
                            title="Remove Description"
                            onClick={(e) => handleClearDescription(item.id, e)}
                            className="text-[10px] text-slate-400 hover:text-rose-600 p-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          type="button"
                          title={item.description ? "Edit Description" : "Add Description"}
                          onClick={(e) => handleStartEdit(fullCat, e)}
                          className="text-[10px] text-slate-500 hover:text-slate-800 font-medium px-1 py-0.5 rounded hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          {item.description ? 'Edit' : '+ Add Desc'}
                        </button>
                      </div>
                    </div>

                    {/* Customizable Tag Labels */}
                    <div className="mt-2 pl-4 flex flex-wrap items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      
                      {/* Render existing tag labels */}
                      {(item.labels || []).map((label) => (
                        <span
                          key={label}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200 group"
                        >
                          <span>#{label}</span>
                          <button
                            type="button"
                            title={`Remove #${label} label`}
                            onClick={(e) => handleRemoveLabel(item.id, label, e)}
                            className="ml-1 text-slate-400 hover:text-rose-600 p-0.2 rounded hover:bg-slate-200/50 cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}

                      {/* Add Tag Label input / trigger */}
                      {activeTagInputCatId === item.id ? (
                        <div className="inline-flex items-center space-x-1 bg-white border border-slate-300 rounded-md px-1.5 py-0.5">
                          <span className="text-[10px] text-slate-400">#</span>
                          <input
                            type="text"
                            value={newTagText}
                            autoFocus
                            onChange={(e) => setNewTagText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddLabel(item.id);
                              } else if (e.key === 'Escape') {
                                setActiveTagInputCatId(null);
                                setNewTagText('');
                              }
                            }}
                            placeholder="new-label"
                            className="text-[10px] text-slate-900 w-16 outline-hidden bg-transparent"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddLabel(item.id)}
                            className="text-emerald-700 hover:text-emerald-800 text-[10px] font-bold cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTagInputCatId(null);
                              setNewTagText('');
                            }}
                            className="text-slate-400 hover:text-slate-600 text-[10px] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTagInputCatId(item.id);
                            setNewTagText('');
                          }}
                          className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-dashed border-slate-300 transition-colors cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5 mr-0.5" />
                          <span>Add label</span>
                        </button>
                      )}
                    </div>

                    {/* Progress bar in financial slate */}
                    <div className="w-full bg-slate-200 rounded-full h-1 overflow-hidden mt-2.5">
                      <div
                        className="h-full rounded-full bg-slate-900 transition-all"
                        style={{ width: `${Math.min(item.percentOfBudget, 100)}%` }}
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
        <span>{categories.length} active categories • {expenses.length} logs recorded</span>
        <span className="font-semibold text-slate-700">
          Overall: {totalSpend > 0 ? formatMoney(totalSpend, currencyCode) : formatMoney(0, currencyCode)}
        </span>
      </div>
    </div>
  );
};
