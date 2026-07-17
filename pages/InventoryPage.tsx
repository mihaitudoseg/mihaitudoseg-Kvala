
import React, { useState, useMemo, useRef } from 'react';
import { useInventory } from '../context/InventoryContext';
import { useMenu } from '../context/MenuContext';
import { Plus, Trash2, Edit2, Save, X, Calculator, Package, BookOpen, ChevronRight, TrendingUp, ShieldCheck, ArrowUpDown, ArrowUp, ArrowDown, Search, Filter, AlertTriangle, XCircle, Upload, Download } from 'lucide-react';
import { Ingredient, Recipe, RecipeIngredient, MenuItem, Page } from '../types';

interface InventoryPageProps {
  onNavigate: (page: Page) => void;
}

export const InventoryPage: React.FC<InventoryPageProps> = ({ onNavigate }) => {
  const { 
    ingredients, recipes, isLoading, addIngredient, updateIngredient, deleteIngredient,
    addRecipe, updateRecipe, deleteRecipe, calculateRecipeCost, calculateInventoryValue, 
    importRealData, importFromFile, importRecipesFromFile, exportIngredientsToExcel, exportRecipesToExcel
  } = useInventory();
  const { menuItems, siteContent } = useMenu();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recipeFileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes' | 'dashboard'>('ingredients');
  const [editingIngredient, setEditingIngredient] = useState<string | null>(null);
  const [newIngredient, setNewIngredient] = useState<Partial<Ingredient>>({
    name: '',
    pricePerKg: 0,
    stockKg: 0,
    unit: 'kg'
  });

  const [selectedMenuItem, setSelectedMenuItem] = useState<string | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Ingredient | 'value'; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'missing-price' | 'out-of-stock'>('all');
  const [profitFilter, setProfitFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('all');
  const [dashboardSearchTerm, setDashboardSearchTerm] = useState('');
  const [dashboardFilterCategory, setDashboardFilterCategory] = useState('all');

  const filteredAndSortedIngredients = useMemo(() => {
    let result = [...ingredients];

    // Filter
    if (searchTerm) {
      result = result.filter(ing => ing.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (unitFilter !== 'all') {
      result = result.filter(ing => ing.unit === unitFilter);
    }
    if (statusFilter === 'missing-price') {
      result = result.filter(ing => ing.pricePerKg === 0);
    } else if (statusFilter === 'out-of-stock') {
      result = result.filter(ing => ing.stockKg === 0);
    }

    // Sort
    if (sortConfig !== null) {
      result.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        if (sortConfig.key === 'value') {
          aValue = a.pricePerKg * a.stockKg;
          bValue = b.pricePerKg * b.stockKg;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [ingredients, sortConfig, searchTerm, unitFilter]);

  const requestSort = (key: keyof Ingredient | 'value') => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key: keyof Ingredient | 'value') => {
    if (!sortConfig || sortConfig.key !== key) return <ArrowUpDown className="h-3 w-3 opacity-30" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-greek-blue" /> : <ArrowDown className="h-3 w-3 text-greek-blue" />;
  };

  const [recipeIngSearch, setRecipeIngSearch] = useState('');

  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter(i => !['vinuri', 'bauturi', 'bere', 'tarie', 'cocktails-long-drinks', 'cocktails-fara-alcool', 'calde'].includes(i.category))
      .filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase());
        const matchesCategory = menuFilterCategory === 'all' || item.category === menuFilterCategory;
        return matchesSearch && matchesCategory;
      });
  }, [menuItems, menuSearchTerm, menuFilterCategory]);

  const filteredIngredientsForRecipe = useMemo(() => {
    if (!editingRecipe) return [];
    return ingredients
      .filter(ing => !editingRecipe.ingredients.some(ri => ri.ingredientId === ing.id))
      .filter(ing => ing.name.toLowerCase().includes(recipeIngSearch.toLowerCase()));
  }, [ingredients, editingRecipe, recipeIngSearch]);

  const totalRecipeWeight = useMemo(() => {
    if (!editingRecipe) return 0;
    return editingRecipe.ingredients.reduce((total, ri) => {
      const ing = ingredients.find(i => i.id === ri.ingredientId);
      if (!ing || (ing.unit !== 'kg' && ing.unit !== 'l' && ing.unit !== 'g' && ing.unit !== 'ml')) return total;
      return total + ri.quantity;
    }, 0);
  }, [editingRecipe, ingredients]);

  // Ingredient Handlers
  const handleAddIngredient = async () => {
    if (!newIngredient.name || newIngredient.pricePerKg === undefined) return;
    await addIngredient({
      name: newIngredient.name,
      pricePerKg: newIngredient.pricePerKg,
      stockKg: newIngredient.stockKg || 0,
      unit: newIngredient.unit as any || 'kg'
    });
    setNewIngredient({ name: '', pricePerKg: 0, stockKg: 0, unit: 'kg' });
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importFromFile(file);
      alert('Import ingrediente reușit!');
    } catch (err) {
      console.error(err);
      alert('Eroare la import ingrediente: ' + (err instanceof Error ? err.message : 'Eroare necunoscută'));
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRecipeFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importRecipesFromFile(file, menuItems);
      alert('Import rețete reușit!');
    } catch (err) {
      console.error(err);
      alert('Eroare la import rețete: ' + (err instanceof Error ? err.message : 'Eroare necunoscută'));
    }
    if (recipeFileInputRef.current) recipeFileInputRef.current.value = '';
  };

  const handleUpdateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    await updateIngredient(id, updates);
    setEditingIngredient(null);
  };

  // Recipe Handlers
  const handleEditRecipe = (menuItem: MenuItem) => {
    const existingRecipe = recipes.find(r => r.menuItemId === menuItem.id);
    if (existingRecipe) {
      setEditingRecipe({ ...existingRecipe });
    } else {
      setEditingRecipe({
        id: '',
        menuItemId: menuItem.id,
        ingredients: []
      });
    }
    setSelectedMenuItem(menuItem.id);
  };

  const handleSaveRecipe = async () => {
    if (!editingRecipe) return;
    if (editingRecipe.id) {
      await updateRecipe(editingRecipe.id, editingRecipe);
    } else {
      await addRecipe(editingRecipe);
    }
    setEditingRecipe(null);
    setSelectedMenuItem(null);
  };

  const addIngredientToRecipe = (ingredientId: string) => {
    if (!editingRecipe) return;
    if (editingRecipe.ingredients.some(ri => ri.ingredientId === ingredientId)) return;
    
    setEditingRecipe({
      ...editingRecipe,
      ingredients: [...editingRecipe.ingredients, { ingredientId, quantity: 0 }]
    });
  };

  const updateRecipeIngredientQuantity = (ingredientId: string, quantity: number) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.map(ri => 
        ri.ingredientId === ingredientId ? { ...ri, quantity } : ri
      )
    });
  };

  const removeIngredientFromRecipe = (ingredientId: string) => {
    if (!editingRecipe) return;
    setEditingRecipe({
      ...editingRecipe,
      ingredients: editingRecipe.ingredients.filter(ri => ri.ingredientId !== ingredientId)
    });
  };

  const averageMarkup = useMemo(() => {
    const recipesWithPrice = menuItems
      .filter(i => !['vinuri', 'bauturi', 'bere', 'tarie', 'cocktails-long-drinks', 'cocktails-fara-alcool', 'calde'].includes(i.category))
      .map(item => {
        const recipe = recipes.find(r => r.menuItemId === item.id);
        if (!recipe) return null;
        
        const parsePrice = (p: string | number): number => {
          if (typeof p === 'number') return p;
          if (!p) return 0;
          const firstPart = p.toString().split('/')[0].trim();
          const val = parseFloat(firstPart);
          return isNaN(val) ? 0 : val;
        };

        const priceNum = parsePrice(item.price);
        const cost = calculateRecipeCost(recipe);
        if (cost === 0) return null;
        return priceNum / cost;
      })
      .filter((m): m is number => m !== null);

    if (recipesWithPrice.length === 0) return 0;
    return recipesWithPrice.reduce((a, b) => a + b, 0) / recipesWithPrice.length;
  }, [menuItems, recipes, calculateRecipeCost]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sand flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-greek-blue mx-auto mb-4"></div>
          <p className="text-greek-blue font-bold">Se încarcă datele din Cloud...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand pb-20">
      {/* Header */}
      <div className="bg-greek-blue text-white py-12 px-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h1 className="text-4xl font-serif font-bold mb-2">Gestiune Inventar & Costuri</h1>
            <p className="text-blue-100 opacity-80 mb-4">Administrează ingredientele, rețetele și calculează profitabilitatea preparatelor.</p>
            <button 
              onClick={() => onNavigate(Page.ADMIN)}
              className="bg-white/10 hover:bg-white/20 border border-white/30 px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Înapoi la Admin
            </button>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => importRealData()}
              className="bg-greek-gold hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg"
            >
              <Package className="h-5 w-5" />
              Încarcă Inventar Real
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-xl overflow-hidden mb-8">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'ingredients' ? 'bg-greek-blue text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <Package className="h-5 w-5" />
              Ingrediente
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'recipes' ? 'bg-greek-blue text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <BookOpen className="h-5 w-5" />
              Retetar
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 py-4 px-6 text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${
                activeTab === 'dashboard' ? 'bg-greek-blue text-white' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="h-5 w-5" />
              Dashboard
            </button>
          </div>

          <div className="p-6">
            {/* Ingredients Tab */}
            {activeTab === 'ingredients' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center gap-4">
                    <div className="bg-greek-blue/10 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-greek-blue" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Valoare Totală Inventar</p>
                      <p className="text-2xl font-bold text-greek-blue">{calculateInventoryValue().toFixed(2)} RON</p>
                    </div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex items-center gap-4">
                    <div className="bg-yellow-500/10 p-3 rounded-lg">
                      <AlertTriangle className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Articole Preț 0</p>
                      <p className="text-2xl font-bold text-yellow-600">{ingredients.filter(i => i.pricePerKg === 0).length}</p>
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-4">
                    <div className="bg-red-500/10 p-3 rounded-lg">
                      <XCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase">Articole Stoc 0</p>
                      <p className="text-2xl font-bold text-red-600">{ingredients.filter(i => i.stockKg === 0).length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <div className="flex-grow space-y-1">
                    <label className="text-xs font-bold text-greek-blue uppercase">Nume Ingredient</label>
                    <input
                      type="text"
                      placeholder="Ex: Năut, Ulei măsline..."
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none"
                      value={newIngredient.name}
                      onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                    <label className="text-xs font-bold text-greek-blue uppercase">Preț / Kg (RON)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none"
                      value={newIngredient.pricePerKg || ''}
                      onChange={(e) => setNewIngredient({ ...newIngredient, pricePerKg: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                    <label className="text-xs font-bold text-greek-blue uppercase">Stoc (Kg/L)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none"
                      value={newIngredient.stockKg || ''}
                      onChange={(e) => setNewIngredient({ ...newIngredient, stockKg: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="w-full md:w-32 space-y-1">
                    <label className="text-xs font-bold text-greek-blue uppercase">Unitate</label>
                    <select
                      className="w-full p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none"
                      value={newIngredient.unit}
                      onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value as any })}
                    >
                      <option value="kg">Kg</option>
                      <option value="l">Litri</option>
                      <option value="buc">Bucăți</option>
                    </select>
                  </div>
                  <button
                    onClick={handleAddIngredient}
                    className="bg-greek-blue text-white p-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 px-4 font-bold"
                  >
                    <Plus className="h-5 w-5" />
                    Adaugă
                  </button>
                  
                  <div className="flex items-center">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileImport} 
                      className="hidden" 
                      accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border-2 border-greek-blue text-greek-blue p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-2 px-4 font-bold"
                    >
                      <Upload className="h-5 w-5" />
                      Import CSV/Excel
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Caută ingredient după nume..."
                      className="w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none bg-white"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 w-full md:w-auto">
                    <div className="flex items-center gap-2 text-gray-500 text-sm font-bold">
                      <Filter className="h-4 w-4" />
                      Filtrează:
                    </div>
                    <select
                      className="p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none bg-white text-sm"
                      value={unitFilter}
                      onChange={(e) => setUnitFilter(e.target.value)}
                    >
                      <option value="all">Toate unitățile</option>
                      <option value="kg">Kg</option>
                      <option value="l">Litri</option>
                      <option value="buc">Bucăți</option>
                    </select>
                    <select
                      className="p-2 border rounded-md focus:ring-2 focus:ring-greek-blue outline-none bg-white text-sm"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as any)}
                    >
                      <option value="all">Toate statusurile</option>
                      <option value="missing-price">Preț lipsă (0)</option>
                      <option value="out-of-stock">Stoc epuizat (0)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-100">
                        <th 
                          className="py-3 px-4 text-xs font-bold uppercase text-gray-400 cursor-pointer hover:text-greek-blue transition-colors"
                          onClick={() => requestSort('name')}
                        >
                          <div className="flex items-center gap-1">
                            Ingredient
                            {getSortIcon('name')}
                          </div>
                        </th>
                        <th 
                          className="py-3 px-4 text-xs font-bold uppercase text-gray-400 cursor-pointer hover:text-greek-blue transition-colors"
                          onClick={() => requestSort('pricePerKg')}
                        >
                          <div className="flex items-center gap-1">
                            Preț / Unitate
                            {getSortIcon('pricePerKg')}
                          </div>
                        </th>
                        <th 
                          className="py-3 px-4 text-xs font-bold uppercase text-gray-400 cursor-pointer hover:text-greek-blue transition-colors"
                          onClick={() => requestSort('stockKg')}
                        >
                          <div className="flex items-center gap-1">
                            Stoc Actual
                            {getSortIcon('stockKg')}
                          </div>
                        </th>
                        <th 
                          className="py-3 px-4 text-xs font-bold uppercase text-gray-400 cursor-pointer hover:text-greek-blue transition-colors"
                          onClick={() => requestSort('value')}
                        >
                          <div className="flex items-center gap-1">
                            Valoare Stoc
                            {getSortIcon('value')}
                          </div>
                        </th>
                        <th className="py-3 px-4 text-xs font-bold uppercase text-gray-400 text-right">Acțiuni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAndSortedIngredients.map((ing) => (
                        <tr key={ing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="py-4 px-4 font-bold text-gray-800">{ing.name}</td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                className={`w-24 p-1 border rounded text-right focus:ring-2 focus:ring-greek-blue outline-none transition-colors ${
                                  ing.pricePerKg === 0 ? 'bg-yellow-50 border-yellow-200 text-yellow-700 font-bold' : 'bg-white border-gray-200'
                                }`}
                                value={ing.pricePerKg}
                                onChange={(e) => updateIngredient(ing.id, { pricePerKg: parseFloat(e.target.value) || 0 })}
                              />
                              <span className="text-xs font-bold text-gray-400 uppercase">RON / {ing.unit}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                step="0.01"
                                className={`w-24 p-1 border rounded text-right focus:ring-2 focus:ring-greek-blue outline-none transition-colors ${
                                  ing.stockKg === 0 ? 'bg-red-50 border-red-100 text-red-700 font-bold' : 'bg-white border-gray-200'
                                }`}
                                value={ing.stockKg}
                                onChange={(e) => updateIngredient(ing.id, { stockKg: parseFloat(e.target.value) || 0 })}
                              />
                              <span className="text-xs font-bold text-gray-400 uppercase">{ing.unit}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 font-mono text-greek-blue">{(ing.stockKg * ing.pricePerKg).toFixed(2)} RON</td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button 
                                onClick={() => deleteIngredient(ing.id)}
                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {ingredients.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                            Nu există ingrediente adăugate încă.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Recipes Tab */}
            {activeTab === 'recipes' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Menu Items List */}
                <div className="lg:col-span-1 border-r border-gray-100 pr-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-serif font-bold text-greek-blue">Produse Meniu</h3>
                    <div>
                      <input 
                        type="file" 
                        ref={recipeFileInputRef} 
                        onChange={handleRecipeFileImport} 
                        className="hidden" 
                        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                      />
                      <button
                        onClick={() => recipeFileInputRef.current?.click()}
                        className="text-greek-blue hover:text-blue-700 p-1 rounded-md transition-colors flex items-center gap-1 text-xs font-bold border border-greek-blue/20"
                        title="Importă rețete din CSV/Excel"
                      >
                        <Upload className="h-3 w-3" />
                        Import
                      </button>
                    </div>
                  </div>

                  {/* Menu Filters */}
                  <div className="space-y-2 mb-4">
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Caută produs..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-greek-blue outline-none transition-all"
                        value={menuSearchTerm}
                        onChange={(e) => setMenuSearchTerm(e.target.value)}
                      />
                    </div>
                    <select
                      className="w-full p-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-greek-blue outline-none bg-white"
                      value={menuFilterCategory}
                      onChange={(e) => setMenuFilterCategory(e.target.value)}
                    >
                      <option value="all">Toate categoriile</option>
                      {siteContent.categories
                        .filter(c => !['vinuri', 'cocktails-fara-alcool'].includes(c.id))
                        .map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.label}</option>
                        ))}
                    </select>
                  </div>

                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
                    {filteredMenuItems.map((item) => {
                      const recipe = recipes.find(r => r.menuItemId === item.id);
                      const cost = recipe ? calculateRecipeCost(recipe) : 0;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleEditRecipe(item)}
                          className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center group ${
                            selectedMenuItem === item.id 
                              ? 'bg-greek-blue border-greek-blue text-white shadow-md' 
                              : 'bg-white border-gray-100 hover:border-greek-blue hover:shadow-sm'
                          }`}
                        >
                          <div>
                            <p className={`font-bold ${selectedMenuItem === item.id ? 'text-white' : 'text-gray-800'}`}>{item.name}</p>
                            <p className={`text-xs ${selectedMenuItem === item.id ? 'text-blue-100' : 'text-gray-400'}`}>{item.weight}</p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-bold ${selectedMenuItem === item.id ? 'text-white' : 'text-greek-blue'}`}>
                              {cost > 0 ? `${cost.toFixed(2)} RON` : '--'}
                            </p>
                            <ChevronRight className={`h-4 w-4 ml-auto transition-transform ${selectedMenuItem === item.id ? 'translate-x-1' : 'text-gray-300 group-hover:translate-x-1'}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recipe Editor */}
                <div className="lg:col-span-2">
                  {editingRecipe ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-serif font-bold text-greek-blue">
                          Rețetă: {menuItems.find(i => i.id === editingRecipe.menuItemId)?.name}
                        </h3>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => { setEditingRecipe(null); setSelectedMenuItem(null); }}
                            className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            Anulează
                          </button>
                          <button 
                            onClick={handleSaveRecipe}
                            className="px-4 py-2 text-sm font-bold bg-greek-blue text-white rounded-md hover:bg-blue-700 shadow-md transition-all flex items-center gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Salvează Rețeta
                          </button>
                        </div>
                      </div>

                      <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                        <div className="flex justify-between items-end mb-4">
                          <h4 className="text-sm font-bold uppercase tracking-widest text-greek-blue">Ingrediente necesare</h4>
                          <div className="flex gap-8 text-right">
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Greutate Totală</p>
                              <p className="text-lg font-bold text-gray-600">{totalRecipeWeight} g/ml</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-gray-500 uppercase font-bold">Cost Total Preparat</p>
                              <p className="text-2xl font-bold text-greek-blue">{calculateRecipeCost(editingRecipe).toFixed(2)} RON</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3 mb-6">
                          {editingRecipe.ingredients.map((ri) => {
                            const ing = ingredients.find(i => i.id === ri.ingredientId);
                            if (!ing) return null;
                            const isWeightOrVolume = ing.unit === 'kg' || ing.unit === 'l';
                            const unitLabel = isWeightOrVolume ? (ing.unit === 'kg' ? 'g' : 'ml') : ing.unit;
                            const subtotal = (ri.quantity / (isWeightOrVolume ? 1000 : 1)) * ing.pricePerKg;

                            return (
                              <div key={ri.ingredientId} className="flex items-center gap-4 bg-white p-3 rounded-lg shadow-sm group">
                                <div className="flex-grow">
                                  <span className="font-bold text-gray-700 block">{ing.name}</span>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Preț:</span>
                                    <input
                                      type="number"
                                      className="w-16 p-0.5 text-[10px] border-b border-transparent hover:border-gray-200 focus:border-greek-blue outline-none bg-transparent"
                                      value={ing.pricePerKg}
                                      onChange={(e) => updateIngredient(ing.id, { pricePerKg: parseFloat(e.target.value) })}
                                    />
                                    <span className="text-[10px] text-gray-400">RON / {ing.unit}</span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="number"
                                    className="w-20 p-1 border rounded text-right focus:ring-1 focus:ring-greek-blue outline-none font-mono"
                                    value={ri.quantity || ''}
                                    onChange={(e) => updateRecipeIngredientQuantity(ri.ingredientId, parseFloat(e.target.value))}
                                  />
                                  <span className="text-xs font-bold text-gray-400 w-8 uppercase">{unitLabel}</span>
                                </div>
                                <div className="w-24 text-right font-mono text-sm text-greek-blue font-bold">
                                  {subtotal.toFixed(2)} RON
                                </div>
                                <button 
                                  onClick={() => removeIngredientFromRecipe(ri.ingredientId)}
                                  className="p-1 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            );
                          })}
                          {editingRecipe.ingredients.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-blue-200 rounded-lg text-blue-300 italic">
                              Adaugă ingrediente din lista de mai jos.
                            </div>
                          )}
                        </div>

                        <div className="border-t border-blue-200 pt-4">
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-greek-blue">Adaugă Ingredient</h4>
                            <div className="relative">
                              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Caută ingredient..."
                                className="pl-10 pr-4 py-2 text-sm border rounded-full w-64 focus:ring-2 focus:ring-greek-blue outline-none shadow-sm transition-all"
                                value={recipeIngSearch}
                                onChange={(e) => setRecipeIngSearch(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-1">
                            {filteredIngredientsForRecipe.map(ing => (
                              <button
                                key={ing.id}
                                onClick={() => {
                                  addIngredientToRecipe(ing.id);
                                  setRecipeIngSearch('');
                                }}
                                className="px-3 py-1 bg-white border border-blue-200 rounded-full text-xs font-bold text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-1 shadow-sm"
                              >
                                <Plus className="h-3 w-3" />
                                {ing.name}
                              </button>
                            ))}
                            {filteredIngredientsForRecipe.length === 0 && (
                              <p className="text-xs text-gray-400 italic">Niciun ingredient găsit.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                      <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                        <Calculator className="h-12 w-12 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-serif font-bold text-gray-400 mb-2">Selectează un produs</h3>
                      <p className="text-gray-400 max-w-xs">Alege un preparat din lista din stânga pentru a-i defini rețeta și a-i calcula costul.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-greek-blue">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Valoare Totală Inventar</p>
                    <p className="text-3xl font-bold text-greek-blue">{calculateInventoryValue().toFixed(2)} RON</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-greek-gold">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Produse cu Rețetă</p>
                    <p className="text-3xl font-bold text-greek-gold">{recipes.length} / {menuItems.filter(i => !['vinuri', 'bauturi', 'bere', 'tarie', 'cocktails-long-drinks', 'cocktails-fara-alcool', 'calde'].includes(i.category)).length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Adaos Mediu (Markup)</p>
                    <p className="text-3xl font-bold text-green-500">{averageMarkup.toFixed(2)}x</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h3 className="font-serif font-bold text-greek-blue mb-6 flex items-center gap-2">
                      <Download className="h-5 w-5" />
                      Export Date
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => exportIngredientsToExcel()}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-greek-blue hover:bg-blue-50 transition-all group"
                      >
                        <Package className="h-10 w-10 text-gray-300 group-hover:text-greek-blue mb-4" />
                        <span className="font-bold text-gray-600 group-hover:text-greek-blue">Export Ingrediente</span>
                        <span className="text-xs text-gray-400 mt-1">Format .xlsx</span>
                      </button>
                      <button
                        onClick={() => exportRecipesToExcel(menuItems)}
                        className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-xl hover:border-greek-blue hover:bg-blue-50 transition-all group"
                      >
                        <BookOpen className="h-10 w-10 text-gray-300 group-hover:text-greek-blue mb-4" />
                        <span className="font-bold text-gray-600 group-hover:text-greek-blue">Export Rețetar</span>
                        <span className="text-xs text-gray-400 mt-1">Format .xlsx</span>
                      </button>
                    </div>
                    
                    <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-bold text-greek-blue mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Notă Import/Export
                      </h4>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        Fișierele exportate pot fi folosite ca șablon pentru import. Asigură-te că păstrezi structura coloanelor dacă dorești să re-imporți datele după modificări în Excel.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="bg-greek-blue px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
                    <h3 className="font-serif font-bold text-white flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Raport Detaliat Adaos Comercial
                    </h3>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="relative w-full md:w-48">
                        <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/50" />
                        <input
                          type="text"
                          placeholder="Caută produs..."
                          className="w-full pl-9 pr-4 py-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:ring-2 focus:ring-white/30 outline-none transition-all"
                          value={dashboardSearchTerm}
                          onChange={(e) => setDashboardSearchTerm(e.target.value)}
                        />
                      </div>
                      <select
                        className="p-1.5 text-xs bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-white/30 outline-none"
                        value={dashboardFilterCategory}
                        onChange={(e) => setDashboardFilterCategory(e.target.value)}
                      >
                        <option value="all" className="text-black">Toate categoriile</option>
                        {siteContent.categories
                          .filter(c => !['vinuri', 'cocktails-fara-alcool'].includes(c.id))
                          .map(cat => (
                            <option key={cat.id} value={cat.id} className="text-black">{cat.label}</option>
                          ))}
                      </select>
                      <div className="flex bg-white/10 rounded-lg p-1 border border-white/20">
                        <button
                          onClick={() => setProfitFilter('all')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${profitFilter === 'all' ? 'bg-white text-greek-blue shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                          Toate
                        </button>
                        <button
                          onClick={() => setProfitFilter('high')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${profitFilter === 'high' ? 'bg-green-500 text-white shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                          Profit Mare
                        </button>
                        <button
                          onClick={() => setProfitFilter('medium')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${profitFilter === 'medium' ? 'bg-blue-500 text-white shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                          Mediu
                        </button>
                        <button
                          onClick={() => setProfitFilter('low')}
                          className={`px-3 py-1 rounded-md text-[10px] font-bold transition-all ${profitFilter === 'low' ? 'bg-yellow-500 text-white shadow-sm' : 'text-white hover:bg-white/10'}`}
                        >
                          Profit Mic
                        </button>
                      </div>
                      <button 
                        onClick={() => window.print()}
                        className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded border border-white/30 font-bold transition-all"
                      >
                        Printează Raport
                      </button>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {menuItems
                        .filter(i => !['vinuri', 'bauturi', 'bere', 'tarie', 'cocktails-long-drinks', 'cocktails-fara-alcool', 'calde'].includes(i.category))
                        .filter(item => {
                          const matchesSearch = item.name.toLowerCase().includes(dashboardSearchTerm.toLowerCase());
                          const matchesCategory = dashboardFilterCategory === 'all' || item.category === dashboardFilterCategory;
                          if (!matchesSearch || !matchesCategory) return false;

                          if (profitFilter === 'all') return true;
                          const recipe = recipes.find(r => r.menuItemId === item.id);
                          if (!recipe) return false;
                          
                          const parsePrice = (p: string | number): number => {
                            if (typeof p === 'number') return p;
                            if (!p) return 0;
                            const firstPart = p.toString().split('/')[0].trim();
                            const val = parseFloat(firstPart);
                            return isNaN(val) ? 0 : val;
                          };
                          const priceNum = parsePrice(item.price);
                          const cost = calculateRecipeCost(recipe);
                          const markup = cost > 0 ? (priceNum / cost) : 0;

                          if (profitFilter === 'high') return markup >= 4;
                          if (profitFilter === 'medium') return markup >= 3 && markup < 4;
                          if (profitFilter === 'low') return markup < 3;
                          return true;
                        })
                        .map(item => {
                          const recipe = recipes.find(r => r.menuItemId === item.id);
                          const parsePrice = (p: string | number): number => {
                            if (typeof p === 'number') return p;
                            if (!p) return 0;
                            const firstPart = p.toString().split('/')[0].trim();
                            const val = parseFloat(firstPart);
                            return isNaN(val) ? 0 : val;
                          };
                          const priceNum = parsePrice(item.price);
                          const cost = recipe ? calculateRecipeCost(recipe) : 0;
                          const markup = cost > 0 ? (priceNum / cost) : 0;
                          const markupPercent = cost > 0 ? ((priceNum - cost) / cost) * 100 : 0;

                          return (
                            <div key={item.id} className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-800 text-sm">{item.name}</h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                                  markup >= 4 ? 'bg-green-100 text-green-700' : markup >= 3 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {item.category}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Cost Producție:</span>
                                  <span className="font-mono font-bold text-red-500">{cost > 0 ? `${cost.toFixed(2)} RON` : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Preț Vânzare:</span>
                                  <span className="font-mono font-bold text-gray-700">{priceNum.toFixed(2)} RON</span>
                                </div>
                                <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                                  <span className="font-bold text-greek-blue">Adaos (Markup):</span>
                                  <div className="text-right">
                                    <span className="text-lg font-bold text-greek-blue block">{cost > 0 ? `${markup.toFixed(2)}x` : '---'}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{cost > 0 ? `(+${markupPercent.toFixed(0)}%)` : ''}</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setActiveTab('recipes');
                                    handleEditRecipe(item);
                                  }}
                                  className="mt-3 w-full py-2 bg-greek-blue/5 hover:bg-greek-blue text-greek-blue hover:text-white text-[10px] font-bold uppercase rounded transition-all flex items-center justify-center gap-2 border border-greek-blue/10"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  Editează rețetar
                                </button>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                  <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                    <h3 className="font-serif font-bold text-greek-blue">Analiză Costuri Preparate</h3>
                  </div>
                  <div className="p-0">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/50">
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Produs</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Preț Vânzare</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Cost Producție</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Profit/Unitate</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Vânzări</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Profit Total</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400">Food Cost %</th>
                          <th className="py-3 px-6 text-xs font-bold uppercase text-gray-400 text-right">Acțiuni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {menuItems.filter(i => !['vinuri', 'bauturi', 'bere', 'tarie', 'cocktails-long-drinks', 'cocktails-fara-alcool', 'calde'].includes(i.category)).map(item => {
                          const recipe = recipes.find(r => r.menuItemId === item.id);
                          if (!recipe) return null;
                          
                          const parsePrice = (p: string | number): number => {
                            if (typeof p === 'number') return p;
                            if (!p) return 0;
                            const firstPart = p.toString().split('/')[0].trim();
                            const val = parseFloat(firstPart);
                            return isNaN(val) ? 0 : val;
                          };

                          const priceNum = parsePrice(item.price);
                          const cost = calculateRecipeCost(recipe);
                          const unitProfit = priceNum - cost;
                          const salesQuantity = item.salesQuantity || 0;
                          const totalProfit = unitProfit * salesQuantity;
                          const foodCostPercent = priceNum > 0 ? (cost / priceNum) * 100 : 0;

                          return (
                            <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                              <td className="py-4 px-6 font-bold text-gray-800">{item.name}</td>
                              <td className="py-4 px-6 font-bold text-gray-600">
                                {typeof item.price === 'number' ? item.price.toFixed(2) : item.price} RON
                              </td>
                              <td className="py-4 px-6 font-bold text-red-500">{cost.toFixed(2)} RON</td>
                              <td className="py-4 px-6 font-bold text-greek-blue">{unitProfit.toFixed(2)} RON</td>
                              <td className="py-4 px-6 font-bold text-gray-500">{salesQuantity} buc</td>
                              <td className="py-4 px-6 font-bold text-green-600">{totalProfit.toFixed(2)} RON</td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <div className="flex-grow bg-gray-100 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full ${foodCostPercent > 35 ? 'bg-red-500' : foodCostPercent > 25 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                      style={{ width: `${Math.min(foodCostPercent, 100)}%` }}
                                    ></div>
                                  </div>
                                  <span className="text-xs font-bold text-gray-500 w-10">{foodCostPercent.toFixed(0)}%</span>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <button
                                  onClick={() => {
                                    setActiveTab('recipes');
                                    handleEditRecipe(item);
                                  }}
                                  className="p-2 text-greek-blue hover:bg-blue-50 rounded-md transition-colors"
                                  title="Editează rețetar"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {recipes.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center text-gray-400 italic">
                              Definește rețete în tab-ul "Retetar" pentru a vedea analiza costurilor.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
