
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Ingredient, Recipe, RecipeIngredient, MenuItem } from '../types';
import { dbService } from '../services/db';
import * as XLSX from 'xlsx';

interface InventoryContextType {
  ingredients: Ingredient[];
  recipes: Recipe[];
  isLoading: boolean;
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => Promise<void>;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => Promise<void>;
  deleteIngredient: (id: string) => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  calculateRecipeCost: (recipe: Recipe) => number;
  calculateInventoryValue: () => number;
  importRealData: () => Promise<void>;
  importFromFile: (file: File) => Promise<void>;
  importRecipesFromFile: (file: File, menuItems: MenuItem[]) => Promise<void>;
  exportIngredientsToExcel: () => void;
  exportRecipesToExcel: (menuItems: MenuItem[]) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const STORAGE_PREFIX = 'kvala_v3_stable_';

const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(STORAGE_PREFIX + key);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      console.error('Error reading from localStorage', e);
      return null;
    }
  },
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to localStorage', e);
    }
  }
};

const REAL_INGREDIENTS_DATA: Omit<Ingredient, 'id'>[] = [
  // CARNE & PEȘTE
  { name: 'Ghiros pui', pricePerKg: 66, stockKg: 20, unit: 'kg' },
  { name: 'Ghiros porc', pricePerKg: 63, stockKg: 24, unit: 'kg' },
  { name: 'Calamar', pricePerKg: 51, stockKg: 20, unit: 'kg' },
  { name: 'Creveți', pricePerKg: 50, stockKg: 22, unit: 'kg' },
  { name: 'Caracatiță', pricePerKg: 194, stockKg: 7, unit: 'kg' },
  { name: 'Pește', pricePerKg: 0, stockKg: 10, unit: 'kg' },
  { name: 'Pui (piept/pulpe)', pricePerKg: 32, stockKg: 3.47, unit: 'kg' },
  { name: 'Porc (ceafă/cotlet)', pricePerKg: 34, stockKg: 3.9, unit: 'kg' },
  { name: 'Vită (mușchi)', pricePerKg: 154, stockKg: 2.4, unit: 'kg' },
  { name: 'Cotlet berbec', pricePerKg: 85, stockKg: 9.2, unit: 'kg' },
  { name: 'Berbec (carne)', pricePerKg: 75, stockKg: 21.1, unit: 'kg' },
  
  // LACTATE & OUĂ
  { name: 'Brânză Feta', pricePerKg: 58, stockKg: 18, unit: 'kg' },
  { name: 'Cașcaval', pricePerKg: 36, stockKg: 3, unit: 'kg' },
  { name: 'Haloumi', pricePerKg: 58, stockKg: 19, unit: 'buc' },
  { name: 'Iaurt', pricePerKg: 12, stockKg: 7, unit: 'kg' },
  { name: 'Ouă', pricePerKg: 1, stockKg: 50, unit: 'buc' },
  
  // PRODUSE DE BAZĂ / DRY
  { name: 'Făină', pricePerKg: 4, stockKg: 9, unit: 'kg' },
  { name: 'Semola', pricePerKg: 8, stockKg: 9, unit: 'kg' },
  { name: 'Panko', pricePerKg: 30, stockKg: 2, unit: 'kg' },
  
  // CONSERVE / DIVERSE
  { name: 'Măsline negre feliate', pricePerKg: 27, stockKg: 0.5, unit: 'kg' },
  { name: 'Măsline verzi feliate', pricePerKg: 28, stockKg: 0.365, unit: 'kg' },
  { name: 'Ulei măsline', pricePerKg: 42, stockKg: 8, unit: 'kg' },
  
  // DESERT / PREPARATE
  { name: 'Vinete', pricePerKg: 4, stockKg: 1.05, unit: 'kg' },
  { name: 'Icre', pricePerKg: 22, stockKg: 1.35, unit: 'kg' },
  { name: 'Sarmale', pricePerKg: 27, stockKg: 6.7, unit: 'kg' },
  
  // SOSURI & CONDIMENTE
  { name: 'Sos chili', pricePerKg: 21, stockKg: 0.85, unit: 'kg' },
  { name: 'Soia', pricePerKg: 58, stockKg: 1, unit: 'l' },
  { name: 'Ardei iute (sos/conservă)', pricePerKg: 19, stockKg: 0.23, unit: 'kg' },
  { name: 'Oregano', pricePerKg: 83, stockKg: 0.03, unit: 'kg' },
  { name: 'Busuioc', pricePerKg: 60, stockKg: 0.5, unit: 'kg' },
  
  // LEGUME
  { name: 'Ardei roșu', pricePerKg: 15, stockKg: 5, unit: 'kg' },
  { name: 'Ardei galben', pricePerKg: 21, stockKg: 8, unit: 'kg' },
  { name: 'Ardei copt', pricePerKg: 28, stockKg: 5, unit: 'kg' },
  { name: 'Roșii', pricePerKg: 14, stockKg: 15, unit: 'kg' },
  { name: 'Roșii cherry', pricePerKg: 16, stockKg: 2.65, unit: 'kg' },
  { name: 'Rosii uscate', pricePerKg: 45, stockKg: 2, unit: 'kg' },
  { name: 'Castraveți', pricePerKg: 12, stockKg: 4.65, unit: 'kg' },
  { name: 'Dovlecei', pricePerKg: 14, stockKg: 7, unit: 'kg' },
  { name: 'Zucchini', pricePerKg: 21, stockKg: 5.2, unit: 'kg' },
  { name: 'Anghinare', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Pătrunjel', pricePerKg: 2, stockKg: 25, unit: 'buc' },
  { name: 'Salată mix', pricePerKg: 21, stockKg: 6, unit: 'buc' },
  { name: 'Usturoi curățat', pricePerKg: 22, stockKg: 3.5, unit: 'kg' },
  { name: 'Rucola', pricePerKg: 33, stockKg: 1.1, unit: 'kg' },
  { name: 'Ciuperci', pricePerKg: 14, stockKg: 3, unit: 'buc' },
  { name: 'Morcov', pricePerKg: 3, stockKg: 0.5, unit: 'kg' },
  { name: 'Ceapă', pricePerKg: 4, stockKg: 70, unit: 'kg' },
  { name: 'Ceapă roșie', pricePerKg: 6, stockKg: 15, unit: 'kg' },
  { name: 'Cartofi', pricePerKg: 2, stockKg: 15, unit: 'kg' },
  
  // EXTRA / ITALIAN / GARNITURI
  { name: 'Pita', pricePerKg: 1, stockKg: 120, unit: 'buc' },
  { name: 'Spaghete', pricePerKg: 12, stockKg: 1.5, unit: 'kg' },
  
  // PREPARATE COMPOZITE
  { name: 'Hummus (bază)', pricePerKg: 0, stockKg: 2.3, unit: 'kg' },
  { name: 'Tirokafteri (bază)', pricePerKg: 0, stockKg: 2, unit: 'kg' },
  { name: 'Salată vinete (bază)', pricePerKg: 0, stockKg: 3, unit: 'kg' },
  { name: 'Tzatiki (bază)', pricePerKg: 0, stockKg: 3, unit: 'kg' },
  { name: 'Dovlecei pane (preparat)', pricePerKg: 0, stockKg: 2, unit: 'kg' },
  { name: 'Branzeturi mix', pricePerKg: 0, stockKg: 5, unit: 'kg' },
  { name: 'Masline kalamata', pricePerKg: 0, stockKg: 2, unit: 'kg' },
  
  // SALATE PREMIUM
  { name: 'Gorgonzola', pricePerKg: 159, stockKg: 0.4, unit: 'kg' },
  { name: 'Unt', pricePerKg: 36, stockKg: 1.1, unit: 'kg' },
  { name: 'Frisée', pricePerKg: 15, stockKg: 4, unit: 'buc' },
  { name: 'Radicchio', pricePerKg: 21, stockKg: 0.4, unit: 'kg' },
  { name: 'Miere', pricePerKg: 45, stockKg: 2, unit: 'kg' },
  { name: 'Foi de viță', pricePerKg: 35, stockKg: 5, unit: 'kg' },
  { name: 'Mentă', pricePerKg: 40, stockKg: 0.5, unit: 'kg' },
  { name: 'Lapte', pricePerKg: 6, stockKg: 10, unit: 'l' },
  { name: 'Frișcă', pricePerKg: 25, stockKg: 5, unit: 'l' },
  { name: 'Nucă', pricePerKg: 55, stockKg: 2, unit: 'kg' },
  { name: 'Curmale', pricePerKg: 40, stockKg: 1, unit: 'kg' },

  // GENERICE PENTRU RETETAR EXCEL
  { name: 'Decor', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Legume (mix)', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Ierburi', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Sos (generic)', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Verdeață', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Lichid (supă)', pricePerKg: 0, stockKg: 1, unit: 'l' },
  { name: 'Fructe de mare (mix)', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Carne (mix)', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Mix Kleftico', pricePerKg: 0, stockKg: 1, unit: 'kg' },
  { name: 'Tahina', pricePerKg: 0, stockKg: 1.28, unit: 'kg' },
  { name: 'Năut', pricePerKg: 0, stockKg: 4.1, unit: 'kg' },
];

const getInitialIngredients = (): Ingredient[] => {
  const cached = storage.get('ingredients');
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  return REAL_INGREDIENTS_DATA.map(ing => ({ ...ing, id: crypto.randomUUID() }));
};

const getInitialRecipes = (ingredients: Ingredient[]): Recipe[] => {
  const cached = storage.get('recipes');
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  
  const findIngId = (name: string) => ingredients.find(i => i.name.toLowerCase() === name.toLowerCase())?.id || '';

  const initialRecipes: Omit<Recipe, 'id'>[] = [
    {
      menuItemId: 'ap1', // HUMMUS
      ingredients: [
        { ingredientId: findIngId('Năut'), quantity: 70 },
        { ingredientId: findIngId('Tahina'), quantity: 20 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 10 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 3 },
        { ingredientId: findIngId('Busuioc'), quantity: 2 },
        { ingredientId: findIngId('Anghinare'), quantity: 20 },
        { ingredientId: findIngId('Rosii uscate'), quantity: 20 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap3', // MIX MASLINE
      ingredients: [
        { ingredientId: findIngId('Măsline verzi feliate'), quantity: 40 },
        { ingredientId: findIngId('Măsline negre feliate'), quantity: 40 },
        { ingredientId: findIngId('Ardei copt'), quantity: 10 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 5 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 2 },
        { ingredientId: findIngId('Ceapă roșie'), quantity: 3 },
        { ingredientId: findIngId('Pătrunjel'), quantity: 2 },
        { ingredientId: findIngId('Ardei iute (sos/conservă)'), quantity: 2 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap4', // TIROKAFTERI
      ingredients: [
        { ingredientId: findIngId('Tirokafteri (bază)'), quantity: 120 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap5', // ICRE KVALA
      ingredients: [
        { ingredientId: findIngId('Icre'), quantity: 120 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap6', // MELITZANA
      ingredients: [
        { ingredientId: findIngId('Salată vinete (bază)'), quantity: 100 },
        { ingredientId: findIngId('Brânză Feta'), quantity: 30 },
        { ingredientId: findIngId('Roșii cherry'), quantity: 30 },
        { ingredientId: findIngId('Decor'), quantity: 10 },
        { ingredientId: findIngId('Pita'), quantity: 80 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap7', // TZATIKI
      ingredients: [
        { ingredientId: findIngId('Tzatiki (bază)'), quantity: 120 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap8', // HALLOUMI GRILL
      ingredients: [
        { ingredientId: findIngId('Haloumi'), quantity: 150 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap9', // FETA SAGANAKI
      ingredients: [
        { ingredientId: findIngId('Brânză Feta'), quantity: 130 },
        { ingredientId: findIngId('Legume (mix)'), quantity: 70 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Ierburi'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap10', // BOUIURDI
      ingredients: [
        { ingredientId: findIngId('Branzeturi mix'), quantity: 200 },
        { ingredientId: findIngId('Legume (mix)'), quantity: 100 },
        { ingredientId: findIngId('Sos (generic)'), quantity: 40 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'ap12', // DOVLECEI PANE
      ingredients: [
        { ingredientId: findIngId('Dovlecei pane (preparat)'), quantity: 150 },
        { ingredientId: findIngId('Tzatiki (bază)'), quantity: 50 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm1', // PLATOU KVALA 1 pers
      ingredients: [
        { ingredientId: findIngId('Calamar'), quantity: 100 },
        { ingredientId: findIngId('Caracatiță'), quantity: 80 },
        { ingredientId: findIngId('Creveți'), quantity: 80 },
        { ingredientId: findIngId('Scoici cochilie'), quantity: 100 },
        { ingredientId: findIngId('Dovlecei'), quantity: 100 },
        { ingredientId: findIngId('Roșii'), quantity: 80 },
        { ingredientId: findIngId('Sos chimichurri'), quantity: 0 },
        { ingredientId: findIngId('Salată mix'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm2', // KALAMAR PANE
      ingredients: [
        { ingredientId: findIngId('Calamar'), quantity: 200 },
        { ingredientId: findIngId('Cartofi'), quantity: 150 },
        { ingredientId: findIngId('Sos Kvala'), quantity: 50 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm3', // KALAMAR UMPLUT
      ingredients: [
        { ingredientId: findIngId('Calamar'), quantity: 200 },
        { ingredientId: findIngId('Brânză Feta'), quantity: 100 },
        { ingredientId: findIngId('Roșii'), quantity: 50 },
        { ingredientId: findIngId('Ardei roșu'), quantity: 30 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Oregano'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm4', // CREVETI SAGANAKI
      ingredients: [
        { ingredientId: findIngId('Creveți'), quantity: 150 },
        { ingredientId: findIngId('Legume (mix)'), quantity: 70 },
        { ingredientId: findIngId('Sos (generic)'), quantity: 50 },
        { ingredientId: findIngId('Brânză Feta'), quantity: 30 },
        { ingredientId: findIngId('Pita'), quantity: 60 },
        { ingredientId: findIngId('Verdeață'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm5', // PASTE CU CREVETI
      ingredients: [
        { ingredientId: findIngId('Creveți'), quantity: 150 },
        { ingredientId: findIngId('Dovlecei'), quantity: 50 },
        { ingredientId: findIngId('Spaghete'), quantity: 100 },
        { ingredientId: findIngId('Roșii cherry'), quantity: 30 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 5 },
        { ingredientId: findIngId('Unt'), quantity: 10 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Verdeață'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm6', // PASTE CU FRUCTE DE MARE
      ingredients: [
        { ingredientId: findIngId('Creveți'), quantity: 80 },
        { ingredientId: findIngId('Calamar'), quantity: 50 },
        { ingredientId: findIngId('Midii'), quantity: 50 },
        { ingredientId: findIngId('Caracatiță'), quantity: 30 },
        { ingredientId: findIngId('Sos (generic)'), quantity: 50 },
        { ingredientId: findIngId('Spaghete'), quantity: 100 },
        { ingredientId: findIngId('Verdeață'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm8', // CARACATITA
      ingredients: [
        { ingredientId: findIngId('Caracatiță'), quantity: 150 },
        { ingredientId: findIngId('Cartofi'), quantity: 100 },
        { ingredientId: findIngId('Ceapă roșie'), quantity: 50 },
        { ingredientId: findIngId('Sos chimichurri'), quantity: 0 },
        { ingredientId: findIngId('Unt'), quantity: 0 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 0 },
        { ingredientId: findIngId('Cimbrisor'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'dm9', // TIGAIE DE CARACATITA
      ingredients: [
        { ingredientId: findIngId('Caracatiță'), quantity: 80 },
        { ingredientId: findIngId('Roșii cherry'), quantity: 30 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 5 },
        { ingredientId: findIngId('Unt'), quantity: 10 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Dovlecei'), quantity: 0 },
        { ingredientId: findIngId('Masline kalamata'), quantity: 0 },
        { ingredientId: findIngId('Sweetchilli'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'sp1', // SUPA DE PESTE
      ingredients: [
        { ingredientId: findIngId('Lichid (supă)'), quantity: 300 },
        { ingredientId: findIngId('Fructe de mare (mix)'), quantity: 100 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'sp2', // KLEFTICO
      ingredients: [
        { ingredientId: findIngId('Carne (mix)'), quantity: 200 },
        { ingredientId: findIngId('Mix Kleftico'), quantity: 50 },
        { ingredientId: findIngId('Cartofi'), quantity: 150 },
        { ingredientId: findIngId('Ulei măsline'), quantity: 0 },
        { ingredientId: findIngId('Usturoi curățat'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'sp5', // FILETO
      ingredients: [
        { ingredientId: findIngId('Vită (mușchi)'), quantity: 200 },
        { ingredientId: findIngId('Cartofi aromati'), quantity: 150 },
        { ingredientId: findIngId('Salată mix'), quantity: 50 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'sl6', // SALATA CU VITA CARAMELIZATA
      ingredients: [
        { ingredientId: findIngId('Vită (mușchi)'), quantity: 100 },
        { ingredientId: findIngId('Gorgonzola'), quantity: 30 },
        { ingredientId: findIngId('Salată mix'), quantity: 100 },
        { ingredientId: findIngId('Roșii cherry'), quantity: 50 },
        { ingredientId: findIngId('Ardei roșu'), quantity: 50 },
        { ingredientId: findIngId('Dressing'), quantity: 0 },
        { ingredientId: findIngId('Susan'), quantity: 0 },
        { ingredientId: findIngId('Soia'), quantity: 0 },
      ].filter(i => i.ingredientId !== ''),
    },
    {
      menuItemId: 'tg3', // TIGAIE DE VITA
      ingredients: [
        { ingredientId: findIngId('Vită (mușchi)'), quantity: 150 },
        { ingredientId: findIngId('Cartofi'), quantity: 150 },
        { ingredientId: findIngId('Legume (mix)'), quantity: 100 },
      ].filter(i => i.ingredientId !== ''),
    }
  ];

  return initialRecipes.map(r => ({ ...r, id: crypto.randomUUID() }));
};

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dbIngs, dbRecipes] = await Promise.all([
        dbService.getIngredients(),
        dbService.getRecipes()
      ]);

      if (dbIngs && dbIngs.length > 0) {
        setIngredients(dbIngs);
      } else {
        const initialIngs = REAL_INGREDIENTS_DATA.map(ing => ({ ...ing, id: crypto.randomUUID() }));
        setIngredients(initialIngs);
        dbService.seedIngredients(initialIngs);
      }

      if (dbRecipes && dbRecipes.length > 0) {
        setRecipes(dbRecipes);
      } else {
        // We need ingredients to find IDs for initial recipes
        const currentIngs = dbIngs && dbIngs.length > 0 ? dbIngs : REAL_INGREDIENTS_DATA.map(ing => ({ ...ing, id: crypto.randomUUID() }));
        const initialRecipes = getInitialRecipes(currentIngs);
        setRecipes(initialRecipes);
        dbService.seedRecipes(initialRecipes);
      }
    } catch (error) {
      console.error("Error loading inventory data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const addIngredient = async (ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient = { ...ingredient, id: crypto.randomUUID() };
    setIngredients(prev => [...prev, newIngredient]);
    await dbService.updateIngredient(newIngredient.id, newIngredient);
  };

  const updateIngredient = async (id: string, updates: Partial<Ingredient>) => {
    const original = ingredients.find(i => i.id === id);
    if (!original) return;
    const updated = { ...original, ...updates };
    setIngredients(prev => prev.map(item => item.id === id ? updated : item));
    await dbService.updateIngredient(id, updated);
  };

  const deleteIngredient = async (id: string) => {
    setIngredients(prev => prev.filter(item => item.id !== id));
    await dbService.deleteIngredient(id);
  };

  const addRecipe = async (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe = { ...recipe, id: crypto.randomUUID() };
    setRecipes(prev => [...prev, newRecipe]);
    await dbService.updateRecipe(newRecipe.id, newRecipe);
  };

  const updateRecipe = async (id: string, updates: Partial<Recipe>) => {
    const original = recipes.find(r => r.id === id);
    if (!original) return;
    const updated = { ...original, ...updates };
    setRecipes(prev => prev.map(item => item.id === id ? updated : item));
    await dbService.updateRecipe(id, updated);
  };

  const deleteRecipe = async (id: string) => {
    setRecipes(prev => prev.filter(item => item.id !== id));
    await dbService.deleteRecipe(id);
  };

  const calculateRecipeCost = (recipe: Recipe) => {
    return recipe.ingredients.reduce((total: number, ri: RecipeIngredient) => {
      const ingredient = ingredients.find(i => i.id === ri.ingredientId);
      if (!ingredient) return total;
      
      const quantity = ri.quantity || 0;
      const price = ingredient.pricePerKg || 0;
      
      // If unit is kg or l, quantity is in g or ml, so we divide by 1000
      const isWeightOrVolume = ingredient.unit === 'kg' || ingredient.unit === 'l';
      const factor = isWeightOrVolume ? 1000 : 1;
      const cost = (quantity / factor) * price;
      
      return total + cost;
    }, 0);
  };

  const calculateInventoryValue = () => {
    return ingredients.reduce((total, ing) => {
      return total + (ing.stockKg * ing.pricePerKg);
    }, 0);
  };

  const importRealData = async () => {
    const newIngs = REAL_INGREDIENTS_DATA.map(ing => ({ ...ing, id: crypto.randomUUID() }));
    setIngredients(newIngs);
    await dbService.seedIngredients(newIngs);
  };

  const importFromFile = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            throw new Error('Fișierul este gol.');
          }

          const importedIngredients: Ingredient[] = jsonData.map((row: any) => {
            // Try to find columns by common names
            const name = row.Nume || row.Name || row.Ingredient || row.Produs || Object.values(row)[0];
            const price = parseFloat(row.Pret || row.Price || row['Pret/Kg'] || row['Pret/Unitate'] || 0);
            const stock = parseFloat(row.Stoc || row.Stock || row['Stoc Actual'] || 0);
            const unit = (row.Unitate || row.Unit || 'kg').toLowerCase();

            return {
              id: crypto.randomUUID(),
              name: String(name),
              pricePerKg: isNaN(price) ? 0 : price,
              stockKg: isNaN(stock) ? 0 : stock,
              unit: (unit === 'l' || unit === 'buc' ? unit : 'kg') as any
            };
          });

          let finalIngs: Ingredient[] = [];
          setIngredients(prev => {
            // Merge logic: if name exists, update it, otherwise add new
            const newIngs = [...prev];
            importedIngredients.forEach(imp => {
              const existingIndex = newIngs.findIndex(i => i.name.toLowerCase() === imp.name.toLowerCase());
              if (existingIndex >= 0) {
                newIngs[existingIndex] = { ...newIngs[existingIndex], pricePerKg: imp.pricePerKg, stockKg: imp.stockKg, unit: imp.unit };
              } else {
                newIngs.push(imp);
              }
            });
            finalIngs = newIngs;
            return newIngs;
          });

          // Sync to DB
          if (finalIngs.length > 0) {
            await dbService.seedIngredients(finalIngs);
          }

          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const importRecipesFromFile = async (file: File, menuItems: MenuItem[]) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            throw new Error('Fișierul este gol.');
          }

          // Group by Recipe Name (Column 1)
          const recipeGroups: Record<string, any[]> = {};
          jsonData.forEach((row: any) => {
            const values = Object.values(row);
            const recipeName = String(values[0] || '').trim();
            if (!recipeName) return;
            if (!recipeGroups[recipeName]) recipeGroups[recipeName] = [];
            recipeGroups[recipeName].push(row);
          });

          const newRecipes: Recipe[] = [];

          Object.entries(recipeGroups).forEach(([recipeName, rows]) => {
            const menuItem = menuItems.find(mi => mi.name.toLowerCase() === recipeName.toLowerCase());
            if (!menuItem) return;

            const recipeIngredients: RecipeIngredient[] = [];

            rows.forEach((row: any) => {
              const values = Object.values(row);
              const ingName = String(values[1] || '').trim();
              const qtyStr = String(values[2] || '0').replace(',', '.');
              const unitStr = String(values[3] || '').trim().toLowerCase();
              
              const qty = parseFloat(qtyStr);
              if (isNaN(qty)) return;

              const ingredient = ingredients.find(i => i.name.toLowerCase() === ingName.toLowerCase());
              if (!ingredient) return;

              let finalQty = qty;
              // Conversion logic: if ingredient is kg/l and row is g/ml, it's already correct for our cost calculation
              // If ingredient is kg and row is kg, multiply by 1000
              if ((ingredient.unit === 'kg' && unitStr === 'kg') || (ingredient.unit === 'l' && unitStr === 'l')) {
                finalQty = qty * 1000;
              }

              recipeIngredients.push({
                ingredientId: ingredient.id,
                quantity: finalQty
              });
            });

            if (recipeIngredients.length > 0) {
              newRecipes.push({
                id: crypto.randomUUID(),
                menuItemId: menuItem.id,
                ingredients: recipeIngredients
              });
            }
          });

          setRecipes(newRecipes);
          await dbService.seedRecipes(newRecipes);

          resolve();
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsArrayBuffer(file);
    });
  };

  const exportIngredientsToExcel = () => {
    const data = ingredients.map(ing => ({
      'Nume Ingredient': ing.name,
      'Pret/Unitate (RON)': ing.pricePerKg,
      'Stoc Actual': ing.stockKg,
      'Unitate': ing.unit,
      'Valoare Stoc (RON)': (ing.stockKg * ing.pricePerKg).toFixed(2)
    }));
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ingrediente');
    XLSX.writeFile(wb, 'Kvala_Ingrediente.xlsx');
  };

  const exportRecipesToExcel = (menuItems: MenuItem[]) => {
    const data: any[] = [];
    
    recipes.forEach(recipe => {
      const menuItem = menuItems.find(mi => mi.id === recipe.menuItemId);
      if (!menuItem) return;
      
      recipe.ingredients.forEach(ri => {
        const ing = ingredients.find(i => i.id === ri.ingredientId);
        if (!ing) return;
        
        data.push({
          'Produs Meniu': menuItem.name,
          'Ingredient': ing.name,
          'Cantitate': ri.quantity,
          'Unitate': (ing.unit === 'kg' ? 'g' : ing.unit === 'l' ? 'ml' : ing.unit),
          'Cost Ingredient (RON)': ((ri.quantity / (ing.unit === 'kg' || ing.unit === 'l' ? 1000 : 1)) * ing.pricePerKg).toFixed(2)
        });
      });
      
      // Add a summary row for the recipe
      data.push({
        'Produs Meniu': `TOTAL ${menuItem.name}`,
        'Ingredient': '',
        'Cantitate': '',
        'Unitate': '',
        'Cost Ingredient (RON)': calculateRecipeCost(recipe).toFixed(2)
      });
      
      // Add empty row for spacing
      data.push({});
    });
    
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Retetar');
    XLSX.writeFile(wb, 'Kvala_Retetar.xlsx');
  };

  return (
    <InventoryContext.Provider value={{ 
      ingredients, recipes, isLoading,
      addIngredient, updateIngredient, deleteIngredient,
      addRecipe, updateRecipe, deleteRecipe,
      calculateRecipeCost, calculateInventoryValue,
      importRealData, importFromFile, importRecipesFromFile,
      exportIngredientsToExcel, exportRecipesToExcel
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (context === undefined) throw new Error('useInventory must be used within an InventoryProvider');
  return context;
};
