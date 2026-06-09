/**
 * Image resolution utilities.
 * Maps restaurant names, cuisines and menu item names to unique, 
 * high-quality Unsplash photos so every card looks distinct.
 *
 * Rules:
 *  - Restaurant image: keyed first by exact name, then by cuisine keyword, then fallback
 *  - Menu item image: keyed first by exact name, then by category keyword, then fallback
 */

// ─── Restaurant images ────────────────────────────────────────────────────────

const RESTAURANT_NAME_MAP: Record<string, string> = {
  // Specific restaurant names (case-insensitive match)
  "rr durbar": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop",
  "hotel shadab": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80&auto=format&fit=crop",
  "rayalaseema ruchulu": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80&auto=format&fit=crop",
  "cafe niloufer": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
  "ishtaa": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  "vegetarian": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  "sarvana": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&auto=format&fit=crop",
  "paradise": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop",
  "bawarchi": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80&auto=format&fit=crop",
  "golden dragon": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  "pasta": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80&auto=format&fit=crop",
  "sushi": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80&auto=format&fit=crop",
  "taco": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80&auto=format&fit=crop",
  "cafe": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
  "grill": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop",
  "kitchen": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop",
  "house": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80&auto=format&fit=crop",
  "biryani house": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop",
};

const CUISINE_IMAGE_MAP: Record<string, string> = {
  "indian": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80&auto=format&fit=crop",
  "mughlai": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=800&q=80&auto=format&fit=crop",
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80&auto=format&fit=crop",
  "south indian": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&q=80&auto=format&fit=crop",
  "andhra": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80&auto=format&fit=crop",
  "regional indian": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&q=80&auto=format&fit=crop",
  "spicy": "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&q=80&auto=format&fit=crop",
  "vegetarian": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  "vegan": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80&auto=format&fit=crop",
  "chinese": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=800&q=80&auto=format&fit=crop",
  "asian": "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80&auto=format&fit=crop",
  "italian": "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?w=800&q=80&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80&auto=format&fit=crop",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80&auto=format&fit=crop",
  "american": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80&auto=format&fit=crop",
  "mexican": "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=800&q=80&auto=format&fit=crop",
  "japanese": "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800&q=80&auto=format&fit=crop",
  "thai": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80&auto=format&fit=crop",
  "healthy": "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&auto=format&fit=crop",
  "cafe": "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80&auto=format&fit=crop",
  "seafood": "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80&auto=format&fit=crop",
  "bbq": "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop",
  "continental": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop",
  "dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=80&auto=format&fit=crop",
};

// Seeded fallbacks based on restaurant id so each unknown restaurant still gets different photo
const FALLBACK_RESTAURANT_IMAGES = [
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=800&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=800&q=80&auto=format&fit=crop",
];

export const getRestaurantImage = (
  restaurantId: string,
  name: string,
  cuisine?: string
): string => {
  const nameLower = name.toLowerCase();
  const cuisineLower = (cuisine ?? "").toLowerCase();

  // 1. Check name keywords
  for (const [key, url] of Object.entries(RESTAURANT_NAME_MAP)) {
    if (nameLower.includes(key)) return url;
  }

  // 2. Check cuisine keywords
  for (const [key, url] of Object.entries(CUISINE_IMAGE_MAP)) {
    if (cuisineLower.includes(key)) return url;
  }

  // 3. Stable fallback based on numeric hash of id
  const hash = restaurantId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_RESTAURANT_IMAGES[hash % FALLBACK_RESTAURANT_IMAGES.length];
};

// ─── Menu item images ─────────────────────────────────────────────────────────

const MENU_ITEM_NAME_MAP: Record<string, string> = {
  // Biryani varieties
  "chicken biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop",
  "mutton biryani": "https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80&auto=format&fit=crop",
  "veg biryani": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80&auto=format&fit=crop",
  "prawn biryani": "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=600&q=80&auto=format&fit=crop",
  "dum biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop",
  // Curries
  "butter chicken": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80&auto=format&fit=crop",
  "paneer butter masala": "https://images.unsplash.com/photo-1631292784640-2b24be784d5d?w=600&q=80&auto=format&fit=crop",
  "dal makhani": "https://images.unsplash.com/photo-1645177628172-a6a3e6e7e5c9?w=600&q=80&auto=format&fit=crop",
  "palak paneer": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop",
  "chicken curry": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80&auto=format&fit=crop",
  "mutton curry": "https://images.unsplash.com/photo-1574653853027-5382a3d23a15?w=600&q=80&auto=format&fit=crop",
  "fish curry": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80&auto=format&fit=crop",
  "korma": "https://images.unsplash.com/photo-1577859591685-2b3a3e8b1a9e?w=600&q=80&auto=format&fit=crop",
  "rogan josh": "https://images.unsplash.com/photo-1573246123716-6b1782bfc499?w=600&q=80&auto=format&fit=crop",
  "kadai chicken": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&auto=format&fit=crop",
  "vindaloo": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop",
  // Rice & Breads
  "naan": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop",
  "roti": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&auto=format&fit=crop",
  "paratha": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&auto=format&fit=crop",
  "pulao": "https://images.unsplash.com/photo-1596797038530-2c107229654b?w=600&q=80&auto=format&fit=crop",
  "fried rice": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=600&q=80&auto=format&fit=crop",
  "jeera rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80&auto=format&fit=crop",
  // South Indian
  "dosa": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80&auto=format&fit=crop",
  "idli": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&q=80&auto=format&fit=crop",
  "vada": "https://images.unsplash.com/photo-1606491956391-52a62cda98e8?w=600&q=80&auto=format&fit=crop",
  "sambar": "https://images.unsplash.com/photo-1606491956391-52a62cda98e8?w=600&q=80&auto=format&fit=crop",
  "uttapam": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&q=80&auto=format&fit=crop",
  "rasam": "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?w=600&q=80&auto=format&fit=crop",
  // Starters
  "chicken tikka": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&auto=format&fit=crop",
  "paneer tikka": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80&auto=format&fit=crop",
  "seekh kebab": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80&auto=format&fit=crop",
  "tandoori chicken": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&auto=format&fit=crop",
  "samosa": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop",
  "spring roll": "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&q=80&auto=format&fit=crop",
  "pakora": "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&q=80&auto=format&fit=crop",
  // Pizza
  "margherita": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&auto=format&fit=crop",
  "pepperoni pizza": "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&q=80&auto=format&fit=crop",
  "veggie pizza": "https://images.unsplash.com/photo-1571407970349-bc81e7e96d47?w=600&q=80&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&auto=format&fit=crop",
  // Burgers
  "chicken burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  "veg burger": "https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80&auto=format&fit=crop",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  "sandwich": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600&q=80&auto=format&fit=crop",
  "wrap": "https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80&auto=format&fit=crop",
  // Soups
  "tomato soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&auto=format&fit=crop",
  "chicken soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&auto=format&fit=crop",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&auto=format&fit=crop",
  // Desserts
  "gulab jamun": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop",
  "rasgulla": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop",
  "kheer": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80&auto=format&fit=crop",
  "halwa": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80&auto=format&fit=crop",
  "ice cream": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80&auto=format&fit=crop",
  "kulfi": "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=600&q=80&auto=format&fit=crop",
  "cake": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80&auto=format&fit=crop",
  "brownie": "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=600&q=80&auto=format&fit=crop",
  "cheesecake": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&q=80&auto=format&fit=crop",
  // Beverages
  "lassi": "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600&q=80&auto=format&fit=crop",
  "chai": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600&q=80&auto=format&fit=crop",
  "coffee": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80&auto=format&fit=crop",
  "juice": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80&auto=format&fit=crop",
  "shake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80&auto=format&fit=crop",
  "milkshake": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80&auto=format&fit=crop",
  "cold drink": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80&auto=format&fit=crop",
  "water": "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&q=80&auto=format&fit=crop",
};

const CATEGORY_IMAGE_MAP: Record<string, string> = {
  "biryani": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80&auto=format&fit=crop",
  "rice": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=600&q=80&auto=format&fit=crop",
  "curry": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80&auto=format&fit=crop",
  "starter": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&auto=format&fit=crop",
  "starters": "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80&auto=format&fit=crop",
  "soup": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&auto=format&fit=crop",
  "soups": "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600&q=80&auto=format&fit=crop",
  "bread": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&auto=format&fit=crop",
  "breads": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&q=80&auto=format&fit=crop",
  "pizza": "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80&auto=format&fit=crop",
  "burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  "burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80&auto=format&fit=crop",
  "dessert": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80&auto=format&fit=crop",
  "desserts": "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=600&q=80&auto=format&fit=crop",
  "sweet": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop",
  "sweets": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&q=80&auto=format&fit=crop",
  "beverage": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80&auto=format&fit=crop",
  "beverages": "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600&q=80&auto=format&fit=crop",
  "drink": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80&auto=format&fit=crop",
  "drinks": "https://images.unsplash.com/photo-1527960471264-932f39eb5846?w=600&q=80&auto=format&fit=crop",
  "south indian": "https://images.unsplash.com/photo-1630383249896-424e482df921?w=600&q=80&auto=format&fit=crop",
  "snack": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop",
  "snacks": "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&q=80&auto=format&fit=crop",
  "main": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  "main course": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  "salad": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop",
  "salads": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop",
  "seafood": "https://images.unsplash.com/photo-1559847844-5315695dadae?w=600&q=80&auto=format&fit=crop",
  "non-veg": "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=600&q=80&auto=format&fit=crop",
  "veg": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80&auto=format&fit=crop",
};

const FALLBACK_MENU_IMAGES = [
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600&q=80&auto=format&fit=crop",
];

export const getMenuItemImage = (
  menuItemId: string,
  name: string,
  category?: string
): string => {
  const nameLower = name.toLowerCase();
  const catLower = (category ?? "").toLowerCase();

  // 1. Exact / keyword match on item name
  for (const [key, url] of Object.entries(MENU_ITEM_NAME_MAP)) {
    if (nameLower.includes(key)) return url;
  }

  // 2. Category match
  for (const [key, url] of Object.entries(CATEGORY_IMAGE_MAP)) {
    if (catLower.includes(key)) return url;
  }

  // 3. Stable fallback based on id hash
  const hash = menuItemId
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return FALLBACK_MENU_IMAGES[hash % FALLBACK_MENU_IMAGES.length];
};
