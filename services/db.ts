import { MenuItem, SiteContent, SiteImages, ReservationData } from '../types';

export const API_BASE_URL = 'https://api.wizart.ro';
const STORAGE_PREFIX = 'kvala_v3_stable_';
const TOKEN_KEY = 'kvala_admin_token';

const storage = {
  save: (key: string, data: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  },
  get: (key: string) => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }
};

const getStoredToken = (): string => {
  try {
    return sessionStorage.getItem(TOKEN_KEY) || '';
  } catch {
    return '';
  }
};

const storeToken = (token: string) => {
  try {
    sessionStorage.setItem(TOKEN_KEY, token);
  } catch {
    // The current request can still complete.
  }
};

const clearToken = () => {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // Ignore storage failures.
  }
};

const loginAdmin = async (password: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || data?.status !== 'ok' || !data?.token) {
      clearToken();
      return false;
    }

    storeToken(data.token);
    return true;
  } catch (error) {
    console.error('Admin login failed:', error);
    clearToken();
    return false;
  }
};

const requireAdminToken = (): string => {
  const token = getStoredToken();
  if (!token) throw new Error('Sesiune admin lipsă. Autentificați-vă din nou.');
  return token;
};

const apiJson = async (
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<any> => {
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (requireAuth) {
    headers.set('Authorization', `Bearer ${requireAdminToken()}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && requireAuth) {
    clearToken();
    throw new Error('Sesiunea de administrator a expirat. Autentificați-vă din nou.');
  }

  if (!response.ok || data?.status === 'error') {
    throw new Error(data?.message || `API request failed (${response.status})`);
  }

  return data;
};

const uploadBlob = async (blob: Blob, filename = 'kvala.jpg'): Promise<string> => {
  const form = new FormData();
  form.append('image', blob, filename);

  const response = await fetch(`${API_BASE_URL}/upload.php`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${requireAdminToken()}` },
    body: form
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401) {
    clearToken();
    throw new Error('Sesiunea de administrator a expirat. Autentificați-vă din nou.');
  }

  if (!response.ok || data?.status !== 'ok' || !data?.url) {
    throw new Error(data?.message || 'Image upload failed');
  }

  return data.url;
};

const uploadDataUrl = async (dataUrl: string): Promise<string> => {
  if (!dataUrl.startsWith('data:image/')) return dataUrl;
  const blob = await fetch(dataUrl).then(r => r.blob());
  const extension = blob.type === 'image/png' ? 'png' : blob.type === 'image/webp' ? 'webp' : 'jpg';
  return uploadBlob(blob, `kvala.${extension}`);
};

const replaceBase64ImagesDeep = async (value: any): Promise<any> => {
  if (typeof value === 'string') {
    return value.startsWith('data:image/') ? uploadDataUrl(value) : value;
  }

  if (Array.isArray(value)) {
    const result = [];
    for (const entry of value) result.push(await replaceBase64ImagesDeep(entry));
    return result;
  }

  if (value && typeof value === 'object') {
    const result: Record<string, any> = {};
    for (const [key, entry] of Object.entries(value)) {
      result[key] = await replaceBase64ImagesDeep(entry);
    }
    return result;
  }

  return value;
};

const showWriteError = (error: unknown) => {
  console.error(error);
  if (typeof window !== 'undefined') {
    const message = error instanceof Error ? error.message : String(error);
    window.alert(`Salvarea pe server a eșuat: ${message}`);
  }
};

export const isDbConfigured = true;

export const dbDebugInfo = {
  hasUrl: true,
  hasKey: true,
  isConfigured: true,
  source: 'Self-hosted API (api.wizart.ro)'
};

export const supabase = null;

export const dbService = {
  async login(password: string): Promise<{ success: boolean; error?: string }> {
    const success = await loginAdmin(password);
    return success
      ? { success: true }
      : { success: false, error: 'Parolă incorectă sau autentificarea pe server a eșuat.' };
  },

  loginAdmin,

  getAuthToken(): string {
    return getStoredToken();
  },

  logout() {
    clearToken();
  },

  logoutAdmin() {
    clearToken();
  },

  async uploadImage(file: Blob & { name?: string }): Promise<string> {
    return uploadBlob(file, file.name || 'kvala.jpg');
  },

  async checkConnection() {
    try {
      const data = await apiJson('/menu.php');
      return data?.status === 'ok';
    } catch {
      return false;
    }
  },

  async testApiConnection(): Promise<{ status: 'ok' | 'error'; latencyMs?: number; menuCount?: number; message: string }> {
    const started = Date.now();
    try {
      const data = await apiJson('/menu.php');
      return {
        status: 'ok',
        latencyMs: Date.now() - started,
        menuCount: Array.isArray(data?.items) ? data.items.length : (typeof data?.count === 'number' ? data.count : undefined),
        message: 'Conexiunea la api.wizart.ro funcționează corect.'
      };
    } catch (error) {
      return {
        status: 'error',
        latencyMs: Date.now() - started,
        message: error instanceof Error ? error.message : 'Conexiunea la API a eșuat.'
      };
    }
  },

  async getMenuItems(): Promise<MenuItem[] | null> {
    try {
      const data = await apiJson('/menu.php');
      const items = Array.isArray(data?.items) ? data.items : [];
      const sorted = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
      storage.save('menu_items', sorted);
      return sorted;
    } catch (error) {
      console.error('API Error (getMenuItems):', error);
      return storage.get('menu_items');
    }
  },

  async updateMenuItem(id: string, fullItem: MenuItem) {
    try {
      const persistentItem = {
        ...fullItem,
        image: fullItem.image ? await uploadDataUrl(fullItem.image) : fullItem.image
      };

      const currentItems: MenuItem[] = storage.get('menu_items') || [];
      const index = currentItems.findIndex((i: any) => i.id === id);

      if (index === -1) {
        // A genuinely new product is persisted first, and every existing order
        // is shifted so the position survives a full refresh.
        const reordered: MenuItem[] = [
          { ...persistentItem, order: 0 } as MenuItem,
          ...currentItems.map((item, idx) => ({ ...item, order: idx + 1 }))
        ];

        await apiJson('/menu.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'bulk_upsert', items: reordered })
        }, true);

        storage.save('menu_items', reordered);
        return persistentItem;
      }

      const updatedItems = currentItems.map((item: any) => item.id === id ? persistentItem : item);
      storage.save('menu_items', updatedItems);

      await apiJson('/menu.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'upsert', item: persistentItem })
      }, true);

      return persistentItem;
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async deleteMenuItem(id: string) {
    try {
      const items = (storage.get('menu_items') || []).filter((i: any) => i.id !== id);
      storage.save('menu_items', items);

      await apiJson('/menu.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async deleteMenuItemsBulk(ids: string[]) {
    try {
      const currentItems = storage.get('menu_items') || [];
      storage.save('menu_items', currentItems.filter((i: any) => !ids.includes(i.id)));

      if (ids.length > 0) {
        await apiJson('/menu.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete_bulk', ids })
        }, true);
      }
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async seedMenuItems(items: MenuItem[]) {
    try {
      const persistentItems: MenuItem[] = [];
      for (const item of items) {
        persistentItems.push({
          ...item,
          image: item.image ? await uploadDataUrl(item.image) : item.image
        });
      }

      const current = await this.getMenuItems() || [];
      const wantedIds = new Set(persistentItems.map(i => i.id));
      const staleIds = current.filter(i => !wantedIds.has(i.id)).map(i => i.id);

      if (staleIds.length) {
        await apiJson('/menu.php', {
          method: 'POST',
          body: JSON.stringify({ action: 'delete_bulk', ids: staleIds })
        }, true);
      }

      await apiJson('/menu.php', {
        method: 'POST',
        body: JSON.stringify({ action: 'bulk_upsert', items: persistentItems })
      }, true);

      storage.save('menu_items', persistentItems);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async getReservations(): Promise<ReservationData[]> {
    try {
      const data = await apiJson('/data.php?resource=reservations', {}, true);
      return Array.isArray(data?.items) ? data.items : [];
    } catch (error) {
      console.error('Error fetching reservations:', error);
      return [];
    }
  },

  async saveReservation(res: ReservationData) {
    await apiJson('/data.php?resource=reservations', {
      method: 'POST',
      body: JSON.stringify({ action: 'create', reservation: res })
    });
  },

  async deleteReservation(id: string) {
    try {
      await apiJson('/data.php?resource=reservations', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async getSiteContent(): Promise<SiteContent | null> {
    try {
      const data = await apiJson('/data.php?resource=settings&key=main_content');
      if (data?.data) {
        storage.save('site_content', data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching site content:', error);
    }
    return storage.get('site_content');
  },

  async saveSiteContent(content: SiteContent) {
    try {
      const persistentContent = await replaceBase64ImagesDeep(content) as SiteContent;
      storage.save('site_content', persistentContent);

      await apiJson('/data.php?resource=settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'main_content', content: persistentContent })
      }, true);

      return persistentContent;
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async getSiteImages(): Promise<SiteImages | null> {
    try {
      const data = await apiJson('/data.php?resource=settings&key=site_images');
      if (data?.data) {
        storage.save('site_images', data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Error fetching site images:', error);
    }
    return storage.get('site_images');
  },

  async saveSiteImages(images: SiteImages) {
    try {
      const persistentImages = await replaceBase64ImagesDeep(images) as SiteImages;
      storage.save('site_images', persistentImages);

      await apiJson('/data.php?resource=settings', {
        method: 'POST',
        body: JSON.stringify({ key: 'site_images', content: persistentImages })
      }, true);

      return persistentImages;
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async getIngredients(): Promise<any[] | null> {
    try {
      const data = await apiJson('/data.php?resource=ingredients');
      const items = Array.isArray(data?.items) ? data.items : [];
      storage.save('ingredients', items);
      return items;
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      return storage.get('ingredients');
    }
  },

  async updateIngredient(id: string, ingredient: any) {
    try {
      const item = { ...ingredient, id };
      const current = storage.get('ingredients') || [];
      const index = current.findIndex((i: any) => i.id === id);
      storage.save('ingredients', index !== -1
        ? current.map((i: any) => i.id === id ? item : i)
        : [...current, item]);

      await apiJson('/data.php?resource=ingredients', {
        method: 'POST',
        body: JSON.stringify({ action: 'upsert', item })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async deleteIngredient(id: string) {
    try {
      const current = storage.get('ingredients') || [];
      storage.save('ingredients', current.filter((i: any) => i.id !== id));

      await apiJson('/data.php?resource=ingredients', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async seedIngredients(items: any[]) {
    try {
      storage.save('ingredients', items);
      await apiJson('/data.php?resource=ingredients', {
        method: 'POST',
        body: JSON.stringify({ action: 'replace_all', items })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async getRecipes(): Promise<any[] | null> {
    try {
      const data = await apiJson('/data.php?resource=recipes');
      const items = Array.isArray(data?.items) ? data.items : [];
      storage.save('recipes', items);
      return items;
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return storage.get('recipes');
    }
  },

  async updateRecipe(id: string, recipe: any) {
    try {
      const item = { ...recipe, id };
      const current = storage.get('recipes') || [];
      const index = current.findIndex((i: any) => i.id === id);
      storage.save('recipes', index !== -1
        ? current.map((i: any) => i.id === id ? item : i)
        : [...current, item]);

      await apiJson('/data.php?resource=recipes', {
        method: 'POST',
        body: JSON.stringify({ action: 'upsert', item })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async deleteRecipe(id: string) {
    try {
      const current = storage.get('recipes') || [];
      storage.save('recipes', current.filter((i: any) => i.id !== id));

      await apiJson('/data.php?resource=recipes', {
        method: 'POST',
        body: JSON.stringify({ action: 'delete', id })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  },

  async seedRecipes(items: any[]) {
    try {
      storage.save('recipes', items);
      await apiJson('/data.php?resource=recipes', {
        method: 'POST',
        body: JSON.stringify({ action: 'replace_all', items })
      }, true);
    } catch (error) {
      showWriteError(error);
      throw error;
    }
  }
};
