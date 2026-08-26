export const WEEKEND_UNAVAILABLE_ITEMS_RO = [
  'Tigaie Grecească de pui',
  'Tigaie Grecească de porc',
  'Gyros de pui',
  'Gyros de porc'
];

export const WEEKEND_NOTICE_RO = "Vă rugăm să luați în considerare că în timpul weekendului, nu sunt disponibile următoarele produse: Tigaie Grecească de pui, Tigaie Grecească de porc, Gyros de pui, Gyros de porc.";

export const WEEKEND_NOTICE_EN = "Please note that during the weekend, the following dishes are not available: Chicken Greek Pan, Pork Greek Pan, Chicken Gyros Platter, Pork Gyros Platter.";

/**
 * Returns true if today is Saturday (6) or Sunday (0)
 */
export const isWeekend = (): boolean => {
  const day = new Date().getDay();
  return day === 0 || day === 6;
};

/**
 * Returns true if the given menu item is one of the 4 items restricted on weekends:
 * - Tigaie Grecească de pui / Tigaie Pui
 * - Tigaie Grecească de porc / Tigaie Porc
 * - Gyros de pui / Gyros Pui
 * - Gyros de porc / Gyros Porc
 */
export const isWeekendRestrictedItem = (item: { id?: string; name: string }): boolean => {
  if (!item) return false;
  
  // Direct ID check from initial seed
  if (item.id === 'tg1' || item.id === 'tg2' || item.id === 'tg4' || item.id === 'tg5') {
    return true;
  }

  const name = (item.name || '').toLowerCase().trim();

  const isTigaiePui = (name.includes('tigaie') && name.includes('pui')) || name.includes('chicken pan');
  const isTigaiePorc = (name.includes('tigaie') && name.includes('porc')) || name.includes('pork pan');
  const isGyrosPui = (name.includes('gyros') && name.includes('pui')) || name.includes('chicken gyros');
  const isGyrosPorc = (name.includes('gyros') && name.includes('porc')) || name.includes('pork gyros');

  return isTigaiePui || isTigaiePorc || isGyrosPui || isGyrosPorc;
};
