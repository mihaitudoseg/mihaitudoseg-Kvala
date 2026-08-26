
import React, { createContext, useState, useContext, ReactNode, useEffect, useMemo } from 'react';
const INITIAL_PROMO_ITEMS: PromoItem[] = [
  {
    id: 'p1',
    name: "Moschofilero Boutari",
    description: "Vin alb sec de excepție, cu note florale intense și arome de citrice. Partenerul ideal pentru preparatele noastre din pește și fructe de mare.",
    image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800",
    tag: "Recomandarea Somelierului",
    isHidden: false
  },
  {
    id: 'p2',
    name: "Ouzo Plomari",
    description: "Autentic, distilat tradițional cu anason din Lesvos. Savurați-l cu gheață alături de aperitivele noastre grecești (Meze).",
    image: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?auto=format&fit=crop&q=80&w=800",
    tag: "Tradiție Grecească",
    isHidden: false
  },
  {
    id: 'p3',
    name: "Masticha de Chios",
    description: "Lichior unic produs din rășina arborilor de mastic. Un digestiv sublim, cu note rășinoase și dulci, perfect pentru finalul mesei.",
    image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80&w=800",
    tag: "Digestiv Premium",
    isHidden: false
  }
];

import { MenuItem, SiteContent, SiteImages, Category, PromoItem, DesignVariant } from '../types';
import { dbService, isDbConfigured } from '../services/db';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'aperitive', label: 'Aperitive' },
  { id: 'din-mare', label: 'Din Mare' },
  { id: 'tigaie-greceasca', label: 'Tigaie Grecească' },
  { id: 'specialitati', label: 'Specialități' },
  { id: 'salate', label: 'Salate' },
  { id: 'desert', label: 'Desert' },
  { id: 'garnituri', label: 'Garnituri' },
  { id: 'sosuri', label: 'Sosuri' },
  { id: 'vinuri', label: 'Vinuri' },
  { id: 'cocktails-fara-alcool', label: 'Cocktails Fără Alcool' }
];

const INITIAL_MENU_ITEMS: MenuItem[] = [
  // Aperitive
  { id: 'ap1', name: 'Humus', description: 'năut, susan, lămâie, ulei de măsline, usturoi, busuioc, pită', price: 33, category: 'aperitive', weight: '200gr', calories: '320', order: 0 },
  { id: 'ap2', name: 'Feta în crustă de susan', description: 'feta, susan, miere, semola, ou', price: 39, category: 'aperitive', weight: '200gr', calories: '420', order: 1 },
  { id: 'ap3', name: 'Mix măsline', description: 'măsline mix, pătrunjel, usturoi, ulei de măsline, ardei copt, ceapă roșie, ardei iute, pită', price: 33, category: 'aperitive', weight: '160gr', calories: '250', order: 2 },
  { id: 'ap4', name: 'Tirokafteri', description: 'cremă ușor picantă-iute de brânzeturi grecești, pită', price: 33, category: 'aperitive', weight: '150gr', calories: '380', order: 3, salesQuantity: 881, salesValue: 24127.38 },
  { id: 'ap5', name: 'Icre Kvala', description: 'rețeta casei, ceapă, condimente, pită', price: 33, category: 'aperitive', weight: '150gr', calories: '520', order: 4, salesQuantity: 1449, salesValue: 40010.56 },
  { id: 'ap6', name: 'Melitzana', description: 'reţeta casei cu vinete coapte, feta și roșie, reducție balsamică, pită', price: 33, category: 'aperitive', weight: '150gr', calories: '180', order: 5, salesQuantity: 1134, salesValue: 30812.92 },
  { id: 'ap7', name: 'Tzatziki', description: 'cremă de iaurt cu castraveți și usturoi, pită', price: 33, category: 'aperitive', weight: '150gr', calories: '170', order: 6, salesQuantity: 1714, salesValue: 47520.86 },
  { id: 'ap8', name: 'Halloumi grill', description: 'brânză halloumi la plită, servită cu roșii proaspete, ulei de măsline și oregano, acompaniată de pită caldă', price: 39, category: 'aperitive', weight: '200gr', calories: '620', order: 7, isHighlighted: true, salesQuantity: 1073, salesValue: 34743.59 },
  { id: 'ap9', name: 'Feta saganaki', description: 'brânză feta cu legume, în folie, la grătar', price: 39, category: 'aperitive', weight: '200gr', calories: '540', order: 8, salesQuantity: 573, salesValue: 19501.38 },
  { id: 'ap10', name: 'Bouiourdi', description: 'mix de brânzeturi grecești la cuptor, roșie, ardei, ceapă, ulei măsline, pită', price: 42, category: 'aperitive', weight: '400gr', calories: '460', order: 9, salesQuantity: 1304, salesValue: 47088.19 },
  { id: 'ap11', name: 'Sărmăluțe grecești', description: 'foi de viță, orez, mentă, tzatziki', price: 42, category: 'aperitive', weight: '200gr', calories: '360', order: 10, salesQuantity: 557, salesValue: 20287.11 },
  { id: 'ap12', name: 'Dovlecei pane', description: 'serviți cu sos tzatziki', price: 39, category: 'aperitive', weight: '150gr', calories: '390', order: 11, salesQuantity: 2311.5, salesValue: 79175.82 },
  { id: 'ap13', name: 'Piperia Kremi', description: 'ardei copt, iaurt grecesc, pastă de susan, usturoi, pită', price: 33, category: 'aperitive', weight: '150gr', calories: '150', order: 12 },

  // Din Mare
  { id: 'dm1', name: 'Platou Grill', description: 'grătar de creveți, calamar, caracatiță, dovlecei, roșie, scoici în cochilie, sos Kvala grill, mix salată', price: 130, category: 'din-mare', weight: '450gr', calories: '850', order: 13, salesQuantity: 337.5, salesValue: 83536.50 },
  { id: 'dm2', name: 'Kalamari', description: 'calamar pane, cartofi prăjiți, sos Kvala', price: 78, category: 'din-mare', weight: '400gr', calories: '520', order: 14, salesQuantity: 772, salesValue: 59314.09 },
  { id: 'dm3', name: 'Kalamari gemisto', description: 'calamar la grătar, umplut cu feta și legume, busuioc', price: 90, category: 'din-mare', weight: '400gr', calories: '480', order: 15, salesQuantity: 821, salesValue: 73510.20 },
  { id: 'dm4', name: 'Creveți saganaki', description: 'creveți, sos de roșii, legume, feta, pită, verdeață', price: 67, category: 'din-mare', weight: '350gr', calories: '420', order: 16, salesQuantity: 295, salesValue: 17646.31 },
  { id: 'dm5', name: 'Paste cu creveți', description: 'creveți, roșii cherry, dovlecel, unt, verdeață, usturoi', price: 64, category: 'din-mare', weight: '350gr', calories: '620', order: 17, salesQuantity: 336, salesValue: 21291.04 },
  { id: 'dm6', name: 'Paste cu fructe de mare', description: 'creveți, calamar, midii, caracatiță, sos roșu de casă, verdeață', price: 67, category: 'din-mare', weight: '350gr', calories: '650', order: 18, salesQuantity: 301, salesValue: 19158.40 },
  { id: 'dm7', name: 'Pește Kvala', description: 'pește proaspăt la grătar, sos de lămâie', price: 85, category: 'din-mare', weight: '~600gr', calories: '520', order: 19, salesQuantity: 1021, salesValue: 85166.54 },
  { id: 'dm8', name: 'Caracatiță la grătar', description: 'caracatiță, cartofi copți, ceapă roșie, sos Kvala grill', price: 120, category: 'din-mare', weight: '300gr', calories: '480', order: 20, salesQuantity: 361, salesValue: 42355.59 },
  { id: 'dm9', name: 'Tigaie de caracatiță', description: 'tentacule de caracatiță fragede, sotate în unt cu usturoi, roșii cherry, dovlecei, măsline, servite cu pită rumenită', price: 74, category: 'din-mare', weight: '300gr', calories: '540', order: 21, isHighlighted: true, salesQuantity: 900, salesValue: 64234.39 },
  { id: 'dm10', name: 'Frigărui de creveți', description: 'creveți, salată, roșii cherry, sos Kvala grill, pită', price: 70, category: 'din-mare', weight: '300gr', calories: '470', order: 22, salesQuantity: 401, salesValue: 27682.03 },
  { id: 'dm11', name: 'Tigaie de creveți', description: 'creveți, unt, vin, usturoi, roșii cherry, pită', price: 67, category: 'din-mare', weight: '400gr', calories: '590', order: 23, salesQuantity: 1186, salesValue: 75320.31 },
  { id: 'dm12', name: 'Tigaie de scoici', description: 'carne midii, unt, vin, usturoi, roșii cherry, pită', price: 59, category: 'din-mare', weight: '400gr', calories: '430', order: 24 },
  { id: 'dm13', name: 'Scoici saganaki', description: 'carne midii, sos de roșii, legume, feta, pită', price: 64, category: 'din-mare', weight: '350gr', calories: '520', order: 25 },
  { id: 'dm14', name: 'Creveți pane', description: 'creveți pane, cartofi prăjiți, sos Kvala', price: 77, category: 'din-mare', weight: '350gr', calories: '690', order: 26, salesQuantity: 389.5, salesValue: 28632.20 },
  { id: 'dm15', name: 'Paste cu vită', description: 'mușchi de vită, sos de roșii, apio, ciuperci, roșii cherry, usturoi', price: 75, category: 'din-mare', weight: '350gr', calories: '750', order: 27 },

  // Tigaie Grecească
  { id: 'tg1', name: 'Tigaie Pui', description: 'piept pui, legume, condimente, tzatziki, cartofi prăjiți, salată mix', price: 65, category: 'tigaie-greceasca', weight: '400gr', calories: '610', order: 28 },
  { id: 'tg2', name: 'Tigaie Porc', description: 'mușchiuleț, legume, condimente, tzatziki, cartofi prăjiți, salată mix', price: 65, category: 'tigaie-greceasca', weight: '400gr', calories: '720', order: 29 },
  { id: 'tg3', name: 'Tigaie Vită', description: 'mușchi de vită caramelizată în sos chilli, condimente, legume, susan, cartofi prăjiți', price: 84, category: 'tigaie-greceasca', weight: '400gr', calories: '780', order: 30 },
  { id: 'tg4', name: 'Gyros Pui', description: 'carne de pui, tzatziki, cartofi prăjiți, salată', price: 61, category: 'tigaie-greceasca', weight: '400gr', calories: '690', order: 31, salesQuantity: 2154, salesValue: 125387.29 },
  { id: 'tg5', name: 'Gyros Porc', description: 'carne de porc, tzatziki, cartofi prăjiți, salată', price: 61, category: 'tigaie-greceasca', weight: '400gr', calories: '740', order: 32, salesQuantity: 1453, salesValue: 83819.88 },

  // Specialități
  { id: 'sp1', name: 'Supă de pește și fructe de mare', description: 'pește mediteranean, scoici, creveți, legume, condimente, pită', price: 64, category: 'specialitati', weight: '450gr', calories: '280', order: 33 },
  { id: 'sp2', name: 'Kleftico', description: 'berbecuț gătit încet la cuptor cu legume, cartofi prăjiți', price: 72, category: 'specialitati', weight: '400gr', calories: '650', order: 34, salesQuantity: 1635, salesValue: 105691.66 },
  { id: 'sp3', name: 'Cotlet de berbecuț', description: 'cotlete de berbecuț la grătar, piure de cartofi, sos Kvala grill', price: 92, category: 'specialitati', weight: '450gr', calories: '820', order: 35 },
  { id: 'sp4', name: 'Crispy Koto', description: 'fâșii de pui, panko, sos Kvala (E415, E330, E260), cartofi prăjiți', price: 59, category: 'specialitati', weight: '350gr', calories: '510', order: 36, salesQuantity: 938, salesValue: 49357.71 },
  { id: 'sp5', name: 'Steak de vită', description: 'mușchi de vită la grătar, mix de salată verde, cartofi aromați, sos Kvala grill', price: 109, category: 'specialitati', weight: '400gr', calories: '880', order: 37 },
  { id: 'sp6', name: 'Schnitzel de pui / porc', description: 'piept pui / mușchiuleț de porc, semola, ou, cartofi prăjiți, tzatziki', price: 67, category: 'specialitati', weight: '450gr', calories: '720', order: 38 },

  // Salate
  { id: 'sl1', name: 'Kvala', description: 'mix de salată, creveți grill, reducție rodie, portocală, piersică, morcov, roșii uscate, dressing de lămâie și portocală', price: 69, category: 'salate', weight: '350gr', calories: '420', order: 39 },
  { id: 'sl2', name: 'Horiatiki', description: 'salată grecească tradițională, cu roșii, castravete, ardei, ceapă, măsline, feta', price: 47, category: 'salate', weight: '300gr', calories: '390', order: 40, salesQuantity: 984, salesValue: 41371.49 },
  { id: 'sl3', name: 'Agourotomata', description: 'salată grecească cu roșii, castravete, ceapă, ardei, măsline', price: 26, category: 'salate', weight: '300gr', calories: '260', order: 41 },
  { id: 'sl4', name: 'Ardei copți', description: 'ardei kapia, ulei de măsline, usturoi, pătrunjel', price: 26, category: 'salate', weight: '210gr', calories: '180', order: 42 },
  { id: 'sl5', name: 'Salată verde', description: 'mix salată verde, roșii cherry, măsline, dressing de lămâie', price: 25, category: 'salate', weight: '190gr', calories: '150', order: 43 },
  { id: 'sl6', name: 'Salată caldă cu vită', description: 'mușchi de vită, gorgonzola, salată mix, roșii cherry, ardei gras', price: 74, category: 'salate', weight: '350gr', calories: '580', order: 44 },

  // Desert
  { id: 'ds1', name: 'Clătite flambate', description: 'făină, ou, lapte, rom, zahăr brun, portocală, unt, înghețată de nuci, fistic', price: 38, category: 'desert', weight: '200gr', calories: '480', order: 45 },
  { id: 'ds2', name: 'Profiterol', description: '2 choux cu cremă de vanilie și glazură de ciocolată', price: 33, category: 'desert', weight: '100gr', calories: '348', order: 46 },
  { id: 'ds3', name: 'Portokalopita', description: 'prajitură cu aluat. ouă, iaurt, zahăr. sirop de portocale', price: 29, category: 'desert', weight: '200gr', calories: '390', order: 47, salesQuantity: 1291, salesValue: 34643.36 },
  { id: 'ds4', name: 'Ekmek Kataif', description: 'foitaj, cremă lapte, vanilie, frișcă vegetală cu îndulcitor, nucă, fistic, zahăr, miere', price: 33, category: 'desert', weight: '200gr', calories: '450', order: 48 },
  { id: 'ds5', name: 'Tiropita', description: 'plăcintă grecească cu brânză, aluat, feta, iaurt, susan, zahăr, stafide, curmale, portcală, lămâie, ouă', price: 40, category: 'desert', weight: '200gr', calories: '430', order: 49 },

  // Garnituri
  { id: 'gn1', name: 'Piure de cartofi', description: 'cartofi, unt, lapte, sare', price: 19, category: 'garnituri', weight: '200gr', calories: '210', order: 50 },
  { id: 'gn2', name: 'Cartofi prăjiți', description: 'Cartofi proaspeți, prăjiți aurii și presărați cu sare și oregano.', price: 17, category: 'garnituri', weight: '150gr', calories: '420', order: 51, salesQuantity: 1380, salesValue: 23004.75 },
  { id: 'gn3', name: 'Orez', description: 'Orez basmati aromat, pregătit cu unt și ierburi mediteraneene.', price: 19, category: 'garnituri', weight: '200gr', calories: '260', order: 52 },
  { id: 'gn4', name: 'Pita', description: 'Pită grecească tradițională, rumenită pe grătar cu ulei de măsline și oregano.', price: 6, category: 'garnituri', weight: '70gr', calories: '180', order: 53 },
  { id: 'gn5', name: 'Legume sote', description: 'legume de sezon, unt, ulei de măsline, sare, oregano', price: 24, category: 'garnituri', weight: '200gr', calories: '190', order: 54 },

  // Sosuri
  { id: 'ss1', name: 'Sos Kvala', description: 'maioneză, chilli, usturoi', price: 8, category: 'sosuri', weight: '50gr', calories: '120', order: 55 },
  { id: 'ss2', name: 'Sos Kvala grill', description: 'ulei de măsline, măsline verzi, pătrunjel, usturoi, lamâie', price: 8, category: 'sosuri', weight: '50gr', calories: '110', order: 56 },

  // Vinuri
  { id: 'v1', name: 'Mezzacorona - Castel Firmian Pinot Grigio', description: 'Vin lejer și parfumat din regiunea Trentino, cu arome de măr, pară și un strop de citrice. Final proaspăt și crocant.', price: 125, category: 'vinuri', weight: '750ml', order: 57 },
  { id: 'v2', name: 'Marchesi Antinori - Villa Antinori Bianco', description: 'Un cupaj sofisticat de soiuri toscane și internaționale. Note de piersici albe, flori și fructe exotice. Textură fină și echilibru perfect.', price: 165, category: 'vinuri', weight: '750ml', order: 58 },
  { id: 'v3', name: 'Porta 6 - Vinho Verde', description: 'Vin verde portughez cu perlaj subtil, prospețime ridicată și note verzi de citrice și mere. Ușor mineral, perfect pentru zilele calde.', price: 115, category: 'vinuri', weight: '750ml', order: 59 },
  { id: 'v4', name: 'Rapaura Springs - Sauvignon Blanc', description: 'Un Sauvignon Blanc tipic din Marlborough, Noua Zeelandă. Explozie de fructul pasiunii, lime și iarbă proaspăt tăiată.', price: 175, category: 'vinuri', weight: '750ml', order: 60 },
  { id: 'v5', name: 'Negrini Hex - Crâmpoșie Selecționată', description: 'Soi autohton românesc, cu arome de mere verzi și citrice, gust proaspăt și aciditate echilibrată.', price: 146, category: 'vinuri', weight: '750ml', order: 61 },
  { id: 'v6', name: 'Recaș Implicit - Sauvignon Blanc', description: 'Vin sec cu note intense de grapefruit, flori albe și ierburi aromate. Final proaspăt și revigorant.', price: 142, category: 'vinuri', weight: '750ml', order: 62 },
  { id: 'v7', name: 'Sărica Niculițel - Caii de le Letea vol.II, Aligote', description: 'Vin alb sec, proaspăt și mineral, obținut din soiul Aligoté cultivat în Dobrogea, arome delicate de flori albe, citrice și măr verde.', price: 149, category: 'vinuri', weight: '750ml', order: 63 },
  { id: 'v8', name: 'Kechribari Retsina', description: 'Modern, proaspăt și vibrant, galben-verzui, cu gust de fructe albe proaspete și mentă, în combinație cu o eleganță notă de rășină.', price: 85, category: 'vinuri', weight: '500ml', order: 64 },
  { id: 'v9', name: 'Domaine Tropez - Sand Tropez Rosé', description: 'Vin elegant din Provence, cu note de zmeură, grapefruit și petale de trandafir. Sec, rafinat și perfect pentru vară.', price: 145, category: 'vinuri', weight: '750ml', order: 65 },
  { id: 'v10', name: 'Negrini Hex - Rosé Drăgășani', description: 'Rosé românesc proaspăt, cu nuanțe de fructe roșii de pădure și aciditate ușoară.', price: 146, category: 'vinuri', weight: '750ml', order: 66 },
  { id: 'v11', name: 'Negrini Hex - Negru de Drăgășani', description: 'Vin emblematic românesc, corpolent și condimentat, cu taninuri fine și note de prune, vișine și ciocolată neagră.', price: 146, category: 'vinuri', weight: '750ml', order: 67 },
  { id: 'v12', name: 'Recaș Selene - Shiraz', description: 'Shiraz românesc intens, cu note de fructe negre, piper și condimente dulci. Corp mediu și final condimentat.', price: 185, category: 'vinuri', weight: '750ml', order: 68 },
  { id: 'v13', name: 'Ornellaia - Le Volte dell\'Ornellaia', description: 'Un cupaj italian rafinat, cu arome de cireșe negre, ierburi mediteraneene și lemn fin. Structură solidă și echilibru de excepție.', price: 250, category: 'vinuri', weight: '750ml', order: 69 },
  { id: 'v14', name: 'Recaș Implicit - Fetească Neagră', description: 'Vin roșu sec, cu arome tipice de fructe negre, prune uscate și note ușor afumate. Final lung și catifelat.', price: 142, category: 'vinuri', weight: '750ml', order: 70 },
  { id: 'v15', name: 'Cava Jane Ventura - Reserva de la Música Brut Nature', description: 'Spumant spaniol elegant, obținut prin metoda tradițională. Arome fine de mere verzi, citrice și migdale, cu o aciditate plăcută și un perlaj fin.', price: 165, category: 'vinuri', weight: '750ml', order: 71 },

  // Bere (Mutate la Vinuri)
  { id: 'be1', name: 'Mythos draught', description: 'Bere grecească autentică la draft, proaspătă și echilibrată.', price: 19, category: 'vinuri', weight: '400ml', order: 64, salesQuantity: 5848, salesValue: 108899.64 },
  { id: 'be2', name: 'Alfa', description: 'Bere lager grecească tradițională, cu gospel bogat și răcoritor.', price: 19, category: 'vinuri', weight: '330ml', order: 65 },
  { id: 'be3', name: 'Mythos', description: 'Cea mai populară bere grecească, premiată pentru gustul său unic.', price: 18, category: 'vinuri', weight: '330ml', order: 66 },
  { id: 'be4', name: 'Mamos nefiltrată', description: 'Bere artizanală grecească nefiltrată, cu arome intense de malț.', price: 19, category: 'vinuri', weight: '330ml', order: 67 },
  { id: 'be5', name: 'Fix Greek blonde', description: 'Bere premium lager cu o istorie bogată și gust fin.', price: 19, category: 'vinuri', weight: '330ml', order: 68 },
  { id: 'be6', name: 'Bere neagră', description: 'Bere brună cu note de caramel și malț prăjit.', price: 24, category: 'vinuri', weight: '500ml', order: 69 },
  { id: 'be7', name: 'Corona', description: 'Bere lager mexicană, servită tradițional cu o felie de lime.', price: 21, category: 'vinuri', weight: '355ml', order: 70 },
  { id: 'be8', name: 'Bere fără alcool', description: 'Gustul berii autentice, fără conținut de alcool.', price: 19, category: 'vinuri', weight: '330ml', order: 71 },
];

const INITIAL_SITE_IMAGES: SiteImages = {
  hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070',
  story: '/kvala_patio_story.jpg',
  menuHeader: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974',
  logo: '',
  tablematImage: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=800&q=80',
};

const INITIAL_SITE_CONTENT: SiteContent = {
  general: { 
    address: 'Strada Louis Pasteur 63, Cartier Cotroceni, București', 
    phone: '0726 731 663', 
    email: 'kvalarestaurant@gmail.com', 
    hours: '12:30 - 22:00', 
    instagram: 'kvala_restaurant', 
    facebook: 'KvalaRestaurant',
    footerTagline: 'Suflet grecesc în inima Bucureștiului.',
    publicUrl: 'https://kvala.ro'
  },
  home: { 
    heroTitle: 'Restaurant cu suflet grecesc', 
    heroSubtitle: 'Cotroceni • București', 
    storyTitle: 'Povestea Kvala', 
    storyText: 'Situat pe strada Louis Pasteur 63, într-o casă interbelică renovată cu grijă, Kvala aduce spiritul tavernelor rafinate din Santorini în inima Bucureștiului.',
    weekendNotice: 'Vă rugăm să luați în considerare că în timpul weekendului, nu sunt disponibile următoarele produse: Tigaie Grecească de pui, Tigaie Grecească de porc, Gyros de pui, Gyros de porc.'
  },
  menuPage: {
    title: 'Meniul Kvala',
    description: 'O selecție de preparate tradiționale gătite cu drag și ingrediente proaspete.'
  },
  reservationsPage: {
    title: 'Rezervă o Masă',
    subtitle: 'Completați formularul pentru a trimite cererea direct pe WhatsApp.',
    infoTitle: 'Info Rezervări',
    infoText: 'Pentru grupuri mai mari de 8 persoane, vă rugăm să ne contactați telefonic pentru a pregăti o masă festivă.',
    helpText: 'Sună-ne la'
  },
  contactPage: { title: 'Contactează-ne', infoTitle: 'Informații' },
  popup: { isActive: true, title: 'Eveniment Special', message: 'Te invităm la o seară de muzică grecească live!' },
  categories: INITIAL_CATEGORIES,
  promoItems: INITIAL_PROMO_ITEMS
};

// English translations for the categories
const categoryTranslations: Record<string, string> = {
  'Aperitive': 'Appetizers',
  'Din Mare': 'From the Sea',
  'Tigaie Grecească': 'Greek Pan',
  'Specialități': 'Specialties',
  'Salate': 'Salads',
  'Desert': 'Desserts',
  'Garnituri': 'Sides',
  'Sosuri': 'Sauces',
  'Vinuri': 'Wines',
  'Cocktails Fără Alcool': 'Non-alcoholic Cocktails'
};

// English translations for the initial menu items
const itemTranslations: Record<string, { name: string; description: string }> = {
  // Aperitive
  'Humus': { name: 'Hummus', description: 'chickpeas, tahini, lemon, olive oil, garlic, basil, pita bread' },
  'Feta în crustă de susan': { name: 'Sesame-crusted Feta', description: 'feta cheese, sesame, honey, semola, egg' },
  'Mix măsline': { name: 'Mixed Olives', description: 'mixed olives, parsley, garlic, olive oil, roasted pepper, red onion, hot pepper, pita bread' },
  'Tirokafteri': { name: 'Tirokafteri', description: 'mildly spicy Greek cheese dip, pita bread' },
  'Icre Kvala': { name: 'Kvala Fish Roe Salad', description: 'house recipe of fish roe, onion, spices, pita bread' },
  'Melitzana': { name: 'Melitzana', description: 'house recipe of roasted eggplant with feta and tomato, balsamic reduction, pita bread' },
  'Tzatziki': { name: 'Tzatziki', description: 'yogurt cream with cucumber, garlic, and dill, served with pita bread' },
  'Halloumi grill': { name: 'Grilled Halloumi', description: 'grilled halloumi cheese served with fresh tomatoes, olive oil, oregano, and warm pita bread' },
  'Feta saganaki': { name: 'Feta Saganaki', description: 'feta cheese grilled with vegetables in foil' },
  'Bouiourdi': { name: 'Bouyourdi', description: 'baked mix of Greek cheeses, tomato, pepper, onion, olive oil, pita bread' },
  'Sărmăluțe grecești': { name: 'Dolmades (Greek Stuffed Vine Leaves)', description: 'vine leaves, rice, mint, tzatziki' },
  'Dovlecei pane': { name: 'Fried Zucchini', description: 'served with tzatziki sauce' },
  'Piperia Kremi': { name: 'Piperia Kremi', description: 'roasted pepper, Greek yogurt, tahini sesame paste, garlic, pita bread' },

  // Din Mare
  'Platou Grill': { name: 'Grill Platter', description: 'grilled shrimp, calamari, octopus, zucchini, tomato, mussels in shell, Kvala grill sauce, mixed salad' },
  'Kalamari': { name: 'Fried Calamari', description: 'fried calamari, french fries, Kvala sauce' },
  'Kalamari gemisto': { name: 'Stuffed Calamari', description: 'grilled calamari stuffed with feta cheese and vegetables, basil' },
  'Creveți saganaki': { name: 'Shrimp Saganaki', description: 'shrimp, tomato sauce, vegetables, feta, pita bread, herbs' },
  'Paste cu creveți': { name: 'Shrimp Pasta', description: 'shrimp, cherry tomatoes, zucchini, butter, herbs, garlic' },
  'Paste cu fructe de mare': { name: 'Seafood Pasta', description: 'shrimp, calamari, mussels, octopus, homemade red sauce, herbs' },
  'Pește Kvala': { name: 'Kvala Fish', description: 'fresh grilled fish, lemon sauce' },
  'Caracatiță la grătar': { name: 'Grilled Octopus', description: 'octopus, baked potatoes, red onion, Kvala grill sauce' },
  'Tigaie de caracatiță': { name: 'Octopus Pan', description: 'tender octopus tentacles sautéed in butter with garlic, cherry tomatoes, zucchini, olives, served with toasted pita' },
  'Frigărui de creveți': { name: 'Shrimp Skewers', description: 'shrimp, salad, cherry tomatoes, Kvala grill sauce, pita bread' },
  'Tigaie de creveți': { name: 'Shrimp Pan', description: 'shrimp, butter, wine, garlic, cherry tomatoes, pita bread' },
  'Tigaie de scoici': { name: 'Mussels Pan', description: 'mussel meat, butter, wine, garlic, cherry tomatoes, pita bread' },
  'Scoici saganaki': { name: 'Mussels Saganaki', description: 'mussel meat, tomato sauce, vegetables, feta cheese, pita bread' },
  'Creveți pane': { name: 'Fried Shrimp', description: 'breaded shrimp, french fries, Kvala sauce' },
  'Paste cu vită': { name: 'Beef Pasta', description: 'beef tenderloin, tomato sauce, celery, mushrooms, cherry tomatoes, garlic' },

  // Tigaie Grecească
  'Tigaie Pui': { name: 'Chicken Pan', description: 'chicken breast, vegetables, spices, tzatziki, french fries, mixed salad' },
  'Tigaie Porc': { name: 'Pork Pan', description: 'pork tenderloin, vegetables, spices, tzatziki, french fries, mixed salad' },
  'Tigaie Vită': { name: 'Beef Pan', description: 'beef tenderloin caramelized in chili sauce, spices, vegetables, sesame, french fries' },
  'Gyros Pui': { name: 'Chicken Gyros Platter', description: 'chicken gyros meat, tzatziki, french fries, salad' },
  'Gyros Porc': { name: 'Pork Gyros Platter', description: 'pork gyros meat, tzatziki, french fries, salad' },

  // Specialități
  'Supă de pește și fructe de mare': { name: 'Fish and Seafood Soup', description: 'Mediterranean fish, mussels, shrimp, vegetables, spices, pita' },
  'Kleftico': { name: 'Kleftiko Lamb', description: 'slow-cooked lamb in the oven with vegetables, french fries' },
  'Cotlet de berbecuț': { name: 'Lamb Chops', description: 'grilled lamb chops, mashed potatoes, Kvala grill sauce' },
  'Crispy Koto': { name: 'Crispy Koto', description: 'chicken strips, panko, Kvala sauce, french fries' },
  'Steak de vită': { name: 'Beef Steak', description: 'grilled beef tenderloin, mixed green salad, aromatic potatoes, Kvala grill sauce' },
  'Schnitzel de pui / porc': { name: 'Chicken / Pork Schnitzel', description: 'chicken breast / pork tenderloin, semola, egg, french fries, tzatziki' },

  // Salate
  'Kvala': { name: 'Kvala Salad', description: 'salad mix, grilled shrimp, pomegranate reduction, orange, peach, carrot, sun-dried tomatoes, lemon and orange dressing' },
  'Horiatiki': { name: 'Greek Salad (Choriatiki)', description: 'traditional Greek salad with tomatoes, cucumber, pepper, onion, olives, feta cheese' },
  'Agourotomata': { name: 'Tomato & Cucumber Salad', description: 'Greek salad with tomatoes, cucumber, onion, pepper, olives' },
  'Ardei copți': { name: 'Roasted Peppers', description: 'kapia peppers, olive oil, garlic, parsley' },
  'Salată verde': { name: 'Green Salad', description: 'mixed green salad, cherry tomatoes, olives, lemon dressing' },
  'Salată caldă cu vită': { name: 'Warm Beef Salad', description: 'beef tenderloin, gorgonzola, mixed salad, cherry tomatoes, bell pepper' },

  // Desert
  'Clătite flambate': { name: 'Flambéed Crepes', description: 'flour, egg, milk, rum, brown sugar, orange, butter, walnut ice cream, pistachio' },
  'Profiterol': { name: 'Profiteroles', description: '2 choux pastries with vanilla cream and chocolate glaze' },
  'Portokalopita': { name: 'Portokalopita', description: 'traditional orange cake made with phyllo pastry, eggs, yogurt, sugar, and orange syrup' },
  'Ekmek Kataif': { name: 'Ekmek Kataifi', description: 'shredded phyllo pastry, milk cream, vanilla, whipped cream, walnuts, pistachio, sugar, honey' },
  'Tiropita': { name: 'Tiropita Sweet Pie', description: 'Greek sweet cheese pie with feta, yogurt, sesame, sugar, raisins, dates, orange, lemon, eggs' },

  // Garnituri
  'Piure de cartofi': { name: 'Mashed Potatoes', description: 'potatoes, butter, milk, salt' },
  'Cartofi prăjiți': { name: 'French Fries', description: 'fresh potatoes, fried golden, sprinkled with salt and oregano' },
  'Orez': { name: 'Basmati Rice', description: 'aromatic basmati rice, prepared with butter and Mediterranean herbs' },
  'Pita': { name: 'Pita Bread', description: 'traditional Greek pita bread, grilled with olive oil and oregano' },
  'Legume sote': { name: 'Sautéed Vegetables', description: 'seasonal vegetables, butter, olive oil, salt, oregano' },

  // Sosuri
  'Sos Kvala': { name: 'Kvala Sauce', description: 'mayonnaise, chili, garlic' },
  'Sos Kvala grill': { name: 'Kvala Grill Sauce', description: 'olive oil, green olives, parsley, garlic, lemon' },

  // Vinuri / Bere
  'Mezzacorona - Castel Firmian Pinot Grigio': { name: 'Mezzacorona - Castel Firmian Pinot Grigio', description: 'Light and fragrant wine from Trentino, with apple, pear and touch of citrus notes. Fresh and crisp finish.' },
  'Marchesi Antinori - Villa Antinori Bianco': { name: 'Marchesi Antinori - Villa Antinori Bianco', description: 'A sophisticated blend of Tuscan and international varieties. Notes of white peaches, flowers, and exotic fruits.' },
  'Porta 6 - Vinho Verde': { name: 'Porta 6 - Vinho Verde', description: 'Portuguese green wine with subtle pearling, high freshness, and green notes of citrus and apples. Slightly mineral.' },
  'Rapaura Springs - Sauvignon Blanc': { name: 'Rapaura Springs - Sauvignon Blanc', description: 'A typical Sauvignon Blanc from Marlborough, New Zealand. Explosion of passion fruit, lime, and fresh-cut grass.' },
  'Negrini Hex - Crâmpoșie Selecționată': { name: 'Negrini Hex - Crâmpoșie Selecționată', description: 'Local Romanian grape variety, with green apple and citrus flavors, fresh taste, and balanced acidity.' },
  'Recaș Implicit - Sauvignon Blanc': { name: 'Recaș Implicit - Sauvignon Blanc', description: 'Dry wine with intense notes of grapefruit, white flowers, and aromatic herbs. Fresh and invigorating finish.' },
  'Sărica Niculițel - Caii de le Letea vol.II, Aligote': { name: 'Sărica Niculițel - Caii de la Letea vol.II, Aligote', description: 'Dry, fresh and mineral white wine, from Aligoté grape grown in Dobrogea, delicate notes of white flowers, citrus and green apple.' },
  'Kechribari Retsina': { name: 'Kechribari Retsina', description: 'Modern, fresh, and vibrant retsina, yellow-greenish, with taste of fresh white fruits and mint, combined with an elegant touch of resin.' },
  'Domaine Tropez - Sand Tropez Rosé': { name: 'Domaine Tropez - Sand Tropez Rosé', description: 'Elegant Provence rosé with notes of raspberry, grapefruit, and rose petals. Dry, refined, and perfect for summer.' },
  'Negrini Hex - Rosé Drăgășani': { name: 'Negrini Hex - Rosé Drăgășani', description: 'Fresh Romanian rosé with nuances of wild red fruits and gentle acidity.' },
  'Negrini Hex - Negru de Drăgășani': { name: 'Negrini Hex - Negru de Drăgășani', description: 'Emblematic Romanian wine, full-bodied and spicy, with fine tannins and notes of plums, sour cherries, and dark chocolate.' },
  'Recaș Selene - Shiraz': { name: 'Recaș Selene - Shiraz', description: 'Intense Romanian Shiraz, with notes of black fruits, pepper, and sweet spices. Medium body and spicy finish.' },
  'Ornellaia - Le Volte dell\'Ornellaia': { name: 'Ornellaia - Le Volte dell\'Ornellaia', description: 'A refined Italian blend, with aromas of black cherries, Mediterranean herbs, and fine wood. Solid structure.' },
  'Recaș Implicit - Fetească Neagră': { name: 'Recaș Implicit - Fetească Neagră', description: 'Dry red wine with typical aromas of black fruits, prunes, and slightly smoky notes. Long and velvety finish.' },
  'Cava Jane Ventura - Reserva de la Música Brut Nature': { name: 'Cava Jane Ventura - Reserva de la Música Brut Nature', description: 'Elegant Spanish sparkling wine made using the traditional method. Fine aromas of green apple, citrus, and almond.' },
  'Mythos draught': { name: 'Mythos Draught Beer', description: 'Authentic Greek draught beer, fresh and well-balanced.' },
  'Alfa': { name: 'Alfa Beer', description: 'Traditional Greek lager beer, with rich and refreshing taste.' },
  'Mythos': { name: 'Mythos Beer', description: 'The most popular Greek beer, awarded for its unique taste.' },
  'Mamos nefiltrată': { name: 'Mamos Unfiltered', description: 'Unfiltered craft Greek beer, with intense malt aromas.' },
  'Fix Greek blonde': { name: 'Fix Greek Blonde', description: 'Premium lager beer with a rich history and smooth taste.' },
  'Bere neagră': { name: 'Dark Beer', description: 'Brown beer with notes of caramel and roasted malt.' },
  'Corona': { name: 'Corona Beer', description: 'Mexican lager beer, traditionally served with a slice of lime.' },
  'Bere fără alcool': { name: 'Non-alcoholic Beer', description: 'The taste of authentic beer, without alcohol content.' },
};

const siteContentEnTranslations = {
  general: {
    footerTagline: 'Greek soul in the heart of Bucharest.',
  },
  home: {
    heroTitle: 'Restaurant with a Greek Soul',
    heroSubtitle: 'Cotroceni • Bucharest',
    storyTitle: 'The Kvala Story',
    storyText: 'Located on 63 Louis Pasteur Street, in a carefully renovated interwar house, Kvala brings the spirit of refined Santorini taverns to the heart of Bucharest.',
    weekendNotice: 'Please note that during weekends, the following dishes are not available: Chicken Greek Pan, Pork Greek Pan, Chicken Gyros Platter, Pork Gyros Platter.'
  },
  menuPage: {
    title: 'Kvala Menu',
    description: 'A selection of traditional dishes cooked with love and fresh ingredients.'
  },
  reservationsPage: {
    title: 'Book a Table',
    subtitle: 'Fill out the form to send your request directly via WhatsApp.',
    infoTitle: 'Reservation Info',
    infoText: 'For groups larger than 8 people, please contact us by phone to arrange a festive table.',
    helpText: 'Call us at'
  },
  contactPage: { title: 'Contact Us', infoTitle: 'Information' },
  popup: { title: 'Special Event', message: 'We invite you to an evening of live Greek music!' }
};

const staticTranslations: Record<string, Record<string, string>> = {
  en: {
    'Acasă': 'Home',
    'Meniu': 'Menu',
    'Rezervări': 'Reservations',
    'Contact': 'Contact',
    'Acasă în inima bisericii bizantine Cotroceni': 'At home in the heart of Byzantine Cotroceni',
    'Niciun preparat în această categorie': 'No dishes in this category',
    'Data Rezervării': 'Reservation Date',
    'Ora': 'Time',
    'Selectează ora': 'Select time',
    'Numele tău': 'Your Name',
    'Nume complet': 'Full Name',
    'Telefon': 'Phone',
    'Nr. Persoane': 'Number of Guests',
    'Note': 'Notes',
    'ex: Preferăm o masă pe terasă...': 'e.g., We prefer a table on the terrace...',
    'gdprText': 'I agree to the processing of my personal data for the purpose of managing the reservation. The data will not be shared with third parties.',
    'gdprAlert': 'Please accept the privacy policy to continue.',
    'errorAlert': 'An error occurred. Please contact us directly by phone.',
    'Solicitare Trimisă!': 'Request Sent!',
    'reservationSuccessText': 'Your reservation has been registered. Please also send the message on WhatsApp if the window remained open for instant confirmation.',
    'Fă o altă rezervare': 'Make another reservation',
    'Finalizează pe WhatsApp': 'Complete on WhatsApp',
    'Adresă': 'Address',
    'Program': 'Hours',
    'Super! Mulțumesc': 'Great! Thank you',
    'Informații': 'Information',
    'Contactează-ne': 'Contact Us',
    'Rezervă o Masă': 'Book a Table',
    'Meniul Nostru': 'Our Menu',
    'O experiență culinară autentică.': 'An authentic culinary experience.',
    'Se încarcă gustul Greciei...': 'Loading the taste of Greece...',
    'Notă Weekend': 'Weekend Notice',
    'Indisponibil în weekend': 'Unavailable on weekends',
    'Indisponibil astăzi (Weekend)': 'Unavailable today (Weekend)',
    'Disponibil Luni - Vineri': 'Available Monday - Friday',
    'Info Disponibilitate Weekend': 'Weekend Availability Notice',
    'Restaurant cu suflet grecesc': 'Restaurant with a Greek soul'
  }
};

interface MenuContextType {
  menuItems: MenuItem[];
  siteImages: SiteImages;
  siteContent: SiteContent;
  isLoading: boolean;
  isDbActive: boolean;
  activeVariant: DesignVariant;
  setActiveVariant: (variant: DesignVariant) => void;
  language: 'ro' | 'en';
  setLanguage: (lang: 'ro' | 'en') => void;
  t: (key: string) => string;
  updateMenuItem: (id: string, updates: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (id: string) => Promise<void>;
  addMenuItem: (item: MenuItem) => Promise<void>;
  reorderMenuItems: (newItems: MenuItem[]) => Promise<void>;
  deleteHiddenMenuItems: () => Promise<void>;
  restoreDefaults: () => Promise<void>;
  updateSiteImage: (key: keyof SiteImages, url: string) => Promise<void>;
  updateSiteContent: (section: keyof SiteContent, key: string, value: any) => Promise<void>;
}

const getDefaultItemImage = (name: string, category: string): string => {
  const lowerName = name.toLowerCase().trim();
  
  // Aperitive
  if (lowerName.includes('humus')) return 'https://images.unsplash.com/photo-1547058886-f126989668e8?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('tzatziki')) return 'https://images.unsplash.com/photo-1571053748382-141b7de59b88?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('susan') || lowerName.includes('feta în crustă')) return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('halloumi')) return 'https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('dovlecei')) return 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('icre')) return 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('melitzana')) return 'https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('tirokafteri')) return 'https://images.unsplash.com/photo-1571053748382-141b7de59b88?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('bouiourdi')) return 'https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('măsline') || lowerName.includes('masline')) return 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&q=80&w=800';
  
  // Din mare
  if (lowerName.includes('platou grill') || lowerName.includes('fructe de mare')) return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('kalamari') || lowerName.includes('calamar')) return 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('creveți') || lowerName.includes('creveti')) return 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('caracati')) return 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('pește') || lowerName.includes('peste') || lowerName.includes('scoici') || lowerName.includes('midii')) return 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800';
  
  // Tigaie Grecească & Gyros
  if (lowerName.includes('gyros')) return 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('tigaie pui') || lowerName.includes('pui')) return 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('tigaie porc') || lowerName.includes('porc')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('tigaie vită') || lowerName.includes('vită') || lowerName.includes('vita')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';

  // Specialități
  if (lowerName.includes('kleftico')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('berbecuț') || lowerName.includes('berbecut')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800';

  // Salate
  if (lowerName.includes('horiatiki') || lowerName.includes('salată grecească') || lowerName.includes('salata greceasca')) return 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&q=80&w=800';
  if (category === 'salate') return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800';

  // Desert
  if (lowerName.includes('portokalopita')) return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('clătite') || lowerName.includes('clatite')) return 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&q=80&w=800';
  if (lowerName.includes('ekmek') || lowerName.includes('kataif')) return 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&q=80&w=800';
  if (category === 'desert') return 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&q=80&w=800';

  // Vinuri & Bauturi
  if (category === 'vinuri') {
    if (lowerName.includes('bere') || lowerName.includes('mythos') || lowerName.includes('alfa') || lowerName.includes('mamos') || lowerName.includes('fix') || lowerName.includes('corona')) {
      return 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&q=80&w=800';
    }
    return 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&q=80&w=800';
  }

  // Default general
  return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800';
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

const STORAGE_PREFIX = 'kvala_v3_stable_';

const storage = {
  get: (key: string) => {
    try {
      const data = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (e) { return null; }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
    } catch (e) {}
  }
};

export const MenuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const cached = storage.get('menu_items');
    if (cached && Array.isArray(cached) && cached.length > 0) return cached;
    return INITIAL_MENU_ITEMS;
  });
  
  const [siteImages, setSiteImages] = useState<SiteImages>(() => {
    const cached = storage.get('site_images');
    if (cached && typeof cached === 'object' && Object.keys(cached).length > 0) {
      const merged = { ...INITIAL_SITE_IMAGES, ...cached };
      // Replace old default/unsplash story photo with the new uploaded terrace photo
      if (!merged.story || merged.story.includes('unsplash.com') || merged.story.includes('photo-1559339352')) {
        merged.story = '/kvala_patio_story.jpg';
        storage.set('site_images', merged);
      }
      return merged;
    }
    return INITIAL_SITE_IMAGES;
  });
  
  const [siteContent, setSiteContent] = useState<SiteContent>(() => {
    const cached = storage.get('site_content');
    if (cached && typeof cached === 'object' && cached.categories && cached.categories.length > 0) {
      const merged = { ...INITIAL_SITE_CONTENT, ...cached };
      if (merged.home && (merged.home.heroTitle === 'Restaurant cu suflet grecesc' || !merged.home.heroTitle)) {
        merged.home.heroTitle = 'Restaurant cu suflet grecesc';
      }
      if (!merged.home.weekendNotice) {
        merged.home.weekendNotice = INITIAL_SITE_CONTENT.home.weekendNotice;
      }
      return merged;
    }
    return INITIAL_SITE_CONTENT;
  });
  
  const [isLoading, setIsLoading] = useState(true);

  const [activeVariant, setVariantState] = useState<DesignVariant>(() => {
    try {
      const saved = localStorage.getItem('kvala_design_variant');
      if (saved === 'byzantine' || saved === 'rustic') return saved as DesignVariant;
    } catch (e) {}
    return 'aegean';
  });

  const setActiveVariant = (variant: DesignVariant) => {
    setVariantState(variant);
    try {
      localStorage.setItem('kvala_design_variant', variant);
    } catch (e) {}
  };

  const [language, setLanguageState] = useState<'ro' | 'en'>(() => {
    try {
      const saved = localStorage.getItem('kvala_language');
      if (saved === 'en') return 'en';
    } catch (e) {}
    return 'ro';
  });

  const setLanguage = (lang: 'ro' | 'en') => {
    setLanguageState(lang);
    try {
      localStorage.setItem('kvala_language', lang);
    } catch (e) {}
  };

  const t = (key: string): string => {
    if (language === 'en' && staticTranslations.en[key]) {
      return staticTranslations.en[key];
    }
    return key;
  };

  const translatedSiteContent = useMemo(() => {
    if (language === 'ro') return siteContent;
    return {
      ...siteContent,
      general: {
        ...siteContent.general,
        footerTagline: siteContentEnTranslations.general.footerTagline,
      },
      home: {
        ...siteContent.home,
        heroTitle: siteContentEnTranslations.home.heroTitle,
        heroSubtitle: siteContentEnTranslations.home.heroSubtitle,
        storyTitle: siteContentEnTranslations.home.storyTitle,
        storyText: siteContentEnTranslations.home.storyText,
        weekendNotice: siteContentEnTranslations.home.weekendNotice,
      },
      menuPage: {
        ...siteContent.menuPage,
        title: siteContentEnTranslations.menuPage.title,
        description: siteContentEnTranslations.menuPage.description,
      },
      reservationsPage: {
        ...siteContent.reservationsPage,
        title: siteContentEnTranslations.reservationsPage.title,
        subtitle: siteContentEnTranslations.reservationsPage.subtitle,
        infoTitle: siteContentEnTranslations.reservationsPage.infoTitle,
        infoText: siteContentEnTranslations.reservationsPage.infoText,
        helpText: siteContentEnTranslations.reservationsPage.helpText,
      },
      contactPage: {
        ...siteContent.contactPage,
        title: siteContentEnTranslations.contactPage.title,
        infoTitle: siteContentEnTranslations.contactPage.infoTitle,
      },
      popup: {
        ...siteContent.popup,
        title: siteContentEnTranslations.popup.title,
        message: siteContentEnTranslations.popup.message,
      },
      categories: (siteContent.categories || []).map(cat => ({
        ...cat,
        label: categoryTranslations[cat.label] || cat.label
      }))
    };
  }, [siteContent, language]);

  const translatedMenuItems = useMemo(() => {
    return menuItems.map(item => {
      const defaultImg = item.image || getDefaultItemImage(item.name, item.category);
      
      if (language === 'ro') {
        return {
          ...item,
          image: defaultImg
        };
      }
      
      const trans = itemTranslations[item.name];
      if (trans) {
        return {
          ...item,
          name: trans.name,
          description: item.description ? trans.description : item.description,
          image: defaultImg
        };
      }
      return {
        ...item,
        image: defaultImg
      };
    });
  }, [menuItems, language]);

  const loadData = async () => {
    // Oprim loading-ul vizual rapid deoarece am inițializat deja din cache/initial
    setIsLoading(false);
    
    const safetyTimeout = setTimeout(() => setIsLoading(false), 3000);

    // Încărcăm datele proaspete din Supabase în fundal
    
    // Produse
    dbService.getMenuItems().then(items => {
      if (items && Array.isArray(items) && items.length > 0) {
        // Sortăm și setăm produsele din DB fără a forța resetări automate
        const sortedItems = [...items].sort((a, b) => (a.order || 0) - (b.order || 0));
        setMenuItems(sortedItems);
        
        // Verificăm dacă lipsesc vinurile (caz special de migrare)
        const hasWines = items.some(i => i.category === 'vinuri');
        if (!hasWines) {
          const wineItems = INITIAL_MENU_ITEMS.filter(i => i.category === 'vinuri');
          const combinedItems = [...items, ...wineItems].sort((a, b) => (a.order || 0) - (b.order || 0));
          setMenuItems(combinedItems);
          if (isDbConfigured) {
            wineItems.forEach(w => dbService.updateMenuItem(w.id, w));
          }
        }
      } else {
        // Doar dacă DB e complet goală inițializăm
        console.log("DB goală, inițializăm cu meniul implicit");
        setMenuItems(INITIAL_MENU_ITEMS);
        if (isDbConfigured) {
          dbService.seedMenuItems(INITIAL_MENU_ITEMS);
        }
      }
    }).catch(e => {
      console.error("Menu items load error:", e);
    });

    // Conținut site
    dbService.getSiteContent().then(content => {
      if (content && typeof content === 'object' && Object.keys(content).length > 0) {
        const finalContent = { ...INITIAL_SITE_CONTENT, ...content };
        
        if (!finalContent.general.publicUrl || finalContent.general.publicUrl.includes('ais-pre-')) {
          finalContent.general.publicUrl = INITIAL_SITE_CONTENT.general.publicUrl;
        }
        
        setSiteContent(finalContent);
      }
    }).catch(e => console.error("Site content load error:", e));

    // Imagini site
    dbService.getSiteImages().then(images => {
      if (images && typeof images === 'object' && Object.keys(images).length > 0) {
        const cleanImages = { ...images };
        let hasStoryUpdate = false;
        if (!cleanImages.story || cleanImages.story.includes('unsplash.com') || cleanImages.story.includes('photo-1559339352')) {
          cleanImages.story = '/kvala_patio_story.jpg';
          hasStoryUpdate = true;
        }
        setSiteImages(prev => ({ ...prev, ...cleanImages }));
        if (hasStoryUpdate) {
          dbService.saveSiteImages(cleanImages);
        }
      }
    }).catch(e => console.error("Site images load error:", e))
      .finally(() => {
        clearTimeout(safetyTimeout);
        setIsLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const updateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const originalItem = menuItems.find(i => i.id === id);
    if (!originalItem) return;
    const updatedItem = { ...originalItem, ...updates };
    setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
    await dbService.updateMenuItem(id, updatedItem);
  };

  const deleteMenuItem = async (id: string) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
    await dbService.deleteMenuItem(id);
  };

  const deleteHiddenMenuItems = async () => {
    const hiddenItems = menuItems.filter(item => item.isHidden);
    const hiddenIds = hiddenItems.map(item => item.id);
    
    if (hiddenIds.length === 0) {
      console.log("No hidden items to delete.");
      return;
    }
    
    console.log(`Deleting ${hiddenIds.length} hidden items...`);
    
    // 1. Update local state immediately (optimistic)
    setMenuItems(prev => prev.filter(item => !item.isHidden));
    
    try {
      // 2. Update database
      await dbService.deleteMenuItemsBulk(hiddenIds);
      console.log("Database updated successfully.");
    } catch (error) {
      console.error("Database update failed:", error);
      // Re-sync from DB if it failed
      loadData();
      throw error;
    }
  };

  const addMenuItem = async (item: MenuItem) => {
    const newItem = { ...item, order: menuItems.length };
    setMenuItems(prev => [...prev, newItem]);
    await dbService.updateMenuItem(newItem.id, newItem);
  };

  const reorderMenuItems = async (newItems: MenuItem[]) => {
    const orderedItems = newItems.map((item, index) => ({ ...item, order: index }));
    setMenuItems(orderedItems);
    await dbService.seedMenuItems(orderedItems);
  };

  const restoreDefaults = async () => {
    console.log("Triggering restoreDefaults...");
    // Am adăugat alert pentru confirmare vizuală în mediu sandbox
    alert("Resetarea a început. Pagina se va reîncărca automat la final.");
    setIsLoading(true);
    try {
      // Ștergem tot din localStorage pentru a forța reîncărcarea
      localStorage.clear();
      
      setMenuItems(INITIAL_MENU_ITEMS);
      setSiteContent(INITIAL_SITE_CONTENT);
      setSiteImages(INITIAL_SITE_IMAGES);
      
      await Promise.all([
        dbService.seedMenuItems(INITIAL_MENU_ITEMS),
        dbService.saveSiteContent(INITIAL_SITE_CONTENT),
        dbService.saveSiteImages(INITIAL_SITE_IMAGES)
      ]);
      
      // Forțăm o reîncărcare a paginii pentru a fi siguri că totul e fresh
      window.location.reload();
    } catch (error) {
      console.error("Reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSiteImage = async (key: keyof SiteImages, url: string) => {
    const newImages = { ...siteImages, [key]: url };
    setSiteImages(newImages);
    await dbService.saveSiteImages(newImages);
  };

  const updateSiteContent = async (section: keyof SiteContent, key: string, value: any) => {
    setSiteContent(prev => {
      const newContent = { 
        ...prev, 
        [section]: (section === 'categories' || section === 'promoItems') ? value : { ...prev[section as keyof SiteContent], [key]: value } 
      };
      dbService.saveSiteContent(newContent as SiteContent);
      return newContent as SiteContent;
    });
  };

  return (
    <MenuContext.Provider value={{ 
      menuItems: translatedMenuItems, siteImages, siteContent: translatedSiteContent, isLoading, isDbActive: isDbConfigured,
      activeVariant, setActiveVariant,
      language, setLanguage, t,
      updateMenuItem, deleteMenuItem, deleteHiddenMenuItems, addMenuItem, reorderMenuItems, restoreDefaults, updateSiteImage, updateSiteContent 
    }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => {
  const context = useContext(MenuContext);
  if (context === undefined) throw new Error('useMenu error');
  return context;
};
