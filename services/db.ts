
import { createClient } from '@supabase/supabase-js';
import { MenuItem, SiteContent, SiteImages, ReservationData } from '../types';

// =========================================================================
// 🛠️ CONFIGURARE SUPABASE:
// =========================================================================
// Pune URL-ul și Cheia ta aici pentru a activa salvarea în Cloud:
const MANUAL_URL = "https://ewpshixprglxtrsmdhyq.supabase.co"; 
const MANUAL_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cHNoaXhwcmdseHRyc21kaHlxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4NzY0MDAsImV4cCI6MjA4MzQ1MjQwMH0.fbUS6NqhVj9UpKXvD5gu2IM7QyTFun7sDgN6HdvWM50"; 
// =========================================================================

const getEnv = (key: string): string => {
  try {
    const val = (typeof process !== 'undefined' && process.env ? process.env[key] : '') || 
                (typeof (import.meta as any).env !== 'undefined' ? (import.meta as any).env[`VITE_${key}`] : '') ||
                (window as any)?._env_?.[key] || 
                '';
    return typeof val === 'string' ? val.trim() : '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = MANUAL_URL || getEnv('SUPABASE_URL');
const supabaseAnonKey = MANUAL_KEY || getEnv('SUPABASE_ANON_KEY');

export const isDbConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://')
);

export const dbDebugInfo = {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  isConfigured: isDbConfigured,
  source: MANUAL_URL ? 'Cod (Manual)' : 'Sistem (Auto)'
};

export const supabase = (() => {
  if (!isDbConfigured) return null;
  try {
    return createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.error("Supabase initialization error:", e);
    return null;
  }
})();

const STORAGE_PREFIX = 'kvala_v3_stable_';

const storage = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      return true;
    } catch (e) { return false; }
  },
  get: (key: string) => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) { return null; }
  }
};

export const dbService = {
  async getMenuItems(): Promise<MenuItem[] | null> {
    if (supabase) {
      try {
        // Încercăm să luăm datele. Dacă coloana 'order' lipsește, Supabase va da eroare 400.
        const { data, error } = await supabase
          .from('menu_items')
          .select('*');
        
        if (error) {
          console.error("Supabase Error (getMenuItems):", error.message);
          // Dacă eroarea e legată de coloana 'order', încercăm să luăm datele fără sortare
          if (error.message.includes('order')) {
            console.warn("Coloana 'order' lipsește. Vă rugăm să o adăugați în SQL Editor.");
          }
        }

        if (!error && data) {
          // Sortăm manual în cod dacă avem coloana, altfel le lăsăm așa
          const sortedData = [...data].sort((a, b) => (a.order || 0) - (b.order || 0));
          storage.save('menu_items', sortedData); 
          return sortedData;
        }
      } catch (e) { 
        console.error("Connection Error (getMenuItems):", e);
      }
    }
    return storage.get('menu_items');
  },
  async updateMenuItem(id: string, fullItem: MenuItem) {
    const currentItems = storage.get('menu_items') || [];
    const index = currentItems.findIndex((i: any) => i.id === id);
    let updatedItems = index !== -1 
      ? currentItems.map((item: any) => item.id === id ? fullItem : item)
      : [...currentItems, fullItem];
    storage.save('menu_items', updatedItems);
    if (supabase) {
      const { error } = await supabase.from('menu_items').upsert(fullItem, { onConflict: 'id' });
      if (error) console.error("Supabase Error (updateMenuItem):", error.message);
    }
  },
  async deleteMenuItem(id: string) {
    const items = (storage.get('menu_items') || []).filter((i: any) => i.id !== id);
    storage.save('menu_items', items);
    if (supabase) {
      const { error } = await supabase.from('menu_items').delete().eq('id', id);
      if (error) console.error("Supabase Error (deleteMenuItem):", error.message);
    }
  },
  async deleteMenuItemsBulk(ids: string[]) {
    console.log("dbService.deleteMenuItemsBulk called with IDs:", ids);
    const currentItems = storage.get('menu_items') || [];
    const updatedItems = currentItems.filter((i: any) => !ids.includes(i.id));
    storage.save('menu_items', updatedItems);
    if (supabase && ids.length > 0) {
      console.log("Deleting from Supabase...");
      const { error } = await supabase.from('menu_items').delete().in('id', ids);
      if (error) {
        console.error("Supabase Error (deleteMenuItemsBulk):", error.message);
        throw error;
      }
      console.log("Supabase delete successful");
    }
  },
  async seedMenuItems(items: MenuItem[]) {
    storage.save('menu_items', items);
    if (supabase) {
      try {
        // Ștergem tot înainte de seed pentru a asigura o resetare curată
        await supabase.from('menu_items').delete().neq('id', '0');
        const { error } = await supabase.from('menu_items').insert(items);
        if (error) console.error("Supabase Error (seedMenuItems):", error.message);
      } catch (e) {
        console.error("Supabase Error (seedMenuItems catch):", e);
      }
    }
  },
  async getReservations(): Promise<ReservationData[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('reservations').select('*').order('date', { ascending: false });
        if (!error && data) return data;
      } catch (e) { console.error("Error fetching reservations:", e); }
    }
    return [];
  },
  async saveReservation(res: ReservationData) {
    if (supabase) {
      try {
        await supabase.from('reservations').insert([res]);
      } catch (e) { console.error("Error saving reservation:", e); }
    }
  },
  async deleteReservation(id: string) {
    if (supabase) {
      try {
        await supabase.from('reservations').delete().eq('id', id);
      } catch (e) { console.error("Error deleting reservation:", e); }
    }
  },
  async getSiteContent(): Promise<SiteContent | null> {
    if (supabase) {
      try {
        const { data } = await supabase.from('site_settings').select('content').eq('key', 'main_content').maybeSingle();
        if (data?.content) { storage.save('site_content', data.content); return data.content; }
      } catch (e) { }
    }
    return storage.get('site_content');
  },
  async saveSiteContent(content: SiteContent) {
    console.log("Saving site content to DB:", content);
    storage.save('site_content', content);
    if (supabase) {
      const { error } = await supabase.from('site_settings').upsert({ key: 'main_content', content }, { onConflict: 'key' });
      if (error) console.error("Supabase Save Error:", error);
      else console.log("Supabase Save Success");
    }
  },
  async getSiteImages(): Promise<SiteImages | null> {
    if (supabase) {
      try {
        const { data } = await supabase.from('site_settings').select('content').eq('key', 'site_images').maybeSingle();
        if (data?.content) { storage.save('site_images', data.content); return data.content; }
      } catch (e) { }
    }
    return storage.get('site_images');
  },
  async saveSiteImages(images: SiteImages) {
    storage.save('site_images', images);
    if (supabase) await supabase.from('site_settings').upsert({ key: 'site_images', content: images }, { onConflict: 'key' });
  },
  // INGREDIENTS
  async getIngredients(): Promise<any[] | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('ingredients').select('*');
        if (!error && data) {
          storage.save('ingredients', data);
          return data;
        }
      } catch (e) { console.error("Error fetching ingredients:", e); }
    }
    return storage.get('ingredients');
  },
  async updateIngredient(id: string, ingredient: any) {
    const current = storage.get('ingredients') || [];
    const index = current.findIndex((i: any) => i.id === id);
    const updated = index !== -1 
      ? current.map((item: any) => item.id === id ? ingredient : item)
      : [...current, ingredient];
    storage.save('ingredients', updated);
    if (supabase) {
      await supabase.from('ingredients').upsert(ingredient, { onConflict: 'id' });
    }
  },
  async deleteIngredient(id: string) {
    const items = (storage.get('ingredients') || []).filter((i: any) => i.id !== id);
    storage.save('ingredients', items);
    if (supabase) {
      await supabase.from('ingredients').delete().eq('id', id);
    }
  },
  async seedIngredients(items: any[]) {
    storage.save('ingredients', items);
    if (supabase) {
      try {
        await supabase.from('ingredients').delete().neq('id', '0');
        await supabase.from('ingredients').insert(items);
      } catch (e) { console.error("Error seeding ingredients:", e); }
    }
  },
  // RECIPES
  async getRecipes(): Promise<any[] | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('recipes').select('*');
        if (!error && data) {
          storage.save('recipes', data);
          return data;
        }
      } catch (e) { console.error("Error fetching recipes:", e); }
    }
    return storage.get('recipes');
  },
  async updateRecipe(id: string, recipe: any) {
    const current = storage.get('recipes') || [];
    const index = current.findIndex((i: any) => i.id === id);
    const updated = index !== -1 
      ? current.map((item: any) => item.id === id ? recipe : item)
      : [...current, recipe];
    storage.save('recipes', updated);
    if (supabase) {
      await supabase.from('recipes').upsert(recipe, { onConflict: 'id' });
    }
  },
  async deleteRecipe(id: string) {
    const items = (storage.get('recipes') || []).filter((i: any) => i.id !== id);
    storage.save('recipes', items);
    if (supabase) {
      await supabase.from('recipes').delete().eq('id', id);
    }
  },
  async seedRecipes(items: any[]) {
    storage.save('recipes', items);
    if (supabase) {
      try {
        await supabase.from('recipes').delete().neq('id', '0');
        await supabase.from('recipes').insert(items);
      } catch (e) { console.error("Error seeding recipes:", e); }
    }
  }
};
