-- 1. Seed admin user if not exists
INSERT INTO users (name, email, password, role, email_verified, created_at, token_version)
SELECT 'Hyderabad Admin', 'admin@foodflow.com', '$2a$10$N9qo8uLOqp.9xsx7nQD7Oe.wZ7x.xPq8e5j0XjZ3nZ0PqE4v3eZfG', 'ADMIN', TRUE, CURRENT_TIMESTAMP, 0
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@foodflow.com');

-- 2. Seed restaurants
INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'La Pino''z Pizza', 'Madhapur, Hyderabad', 'Pizza, Fast Food, Italian', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'La Pino''z Pizza');

INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'Burger Stories', 'Jubilee Hills, Hyderabad', 'Burgers, Fast Food, American', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Burger Stories');

INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'The Salad Bar', 'Gachibowli, Hyderabad', 'Healthy, Salad', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'The Salad Bar');

INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'Concu Desserts', 'Banjara Hills, Hyderabad', 'Desserts, Bakery, Cafe', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Concu Desserts');

INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'Bawarchi Biryani', 'RTC X Roads, Hyderabad', 'Biryani, South Indian', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Bawarchi Biryani');

INSERT INTO restaurants (name, address, cuisine, admin_id, active)
SELECT 'Chutneys', 'Himayatnagar, Hyderabad', 'South Indian, Healthy', user_id, TRUE
FROM users WHERE email = 'admin@foodflow.com'
AND NOT EXISTS (SELECT 1 FROM restaurants WHERE name = 'Chutneys');

-- 3. Seed Menu Items
-- La Pino'z Pizza
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Spring Hot Pizza', 'Cheese, onions, capsicum, tomatoes', 'Pizza', 299.00, TRUE
FROM restaurants WHERE name = 'La Pino''z Pizza'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Spring Hot Pizza' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'La Pino''z Pizza'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Paneer Tikka Pizza', 'Paneer, spices, bell peppers', 'Pizza', 349.00, TRUE
FROM restaurants WHERE name = 'La Pino''z Pizza'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Paneer Tikka Pizza' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'La Pino''z Pizza'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Garlic Bread with Cheese', 'Baked with garlic butter and mozzarella', 'Sides', 149.00, TRUE
FROM restaurants WHERE name = 'La Pino''z Pizza'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Garlic Bread with Cheese' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'La Pino''z Pizza'));

-- Burger Stories
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Classic Veg Burger', 'Crispy veg patty, lettuce, mayo', 'Burgers', 129.00, TRUE
FROM restaurants WHERE name = 'Burger Stories'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Classic Veg Burger' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Burger Stories'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Crispy Chicken Burger', 'Crispy fried chicken breast, cheese, special sauce', 'Burgers', 179.00, TRUE
FROM restaurants WHERE name = 'Burger Stories'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Crispy Chicken Burger' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Burger Stories'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Peri Peri French Fries', 'Spicy peri peri seasoned fries', 'Sides', 99.00, TRUE
FROM restaurants WHERE name = 'Burger Stories'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Peri Peri French Fries' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Burger Stories'));

-- The Salad Bar
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Avocado Toast', 'Fresh avocado mash, cherry tomatoes on toasted sourdough', 'Healthy', 249.00, TRUE
FROM restaurants WHERE name = 'The Salad Bar'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Avocado Toast' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'The Salad Bar'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Quinoa Salad Bowl', 'Organic quinoa, cucumbers, olives, feta, lemon dressing', 'Healthy', 299.00, TRUE
FROM restaurants WHERE name = 'The Salad Bar'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Quinoa Salad Bowl' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'The Salad Bar'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Green Detox Smoothie', 'Spinach, kale, green apple, cucumber, ginger juice', 'Beverages', 149.00, TRUE
FROM restaurants WHERE name = 'The Salad Bar'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Green Detox Smoothie' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'The Salad Bar'));

-- Concu Desserts
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Chocolate Hazelnut Tart', 'Decadent chocolate ganache, toasted hazelnut crust', 'Desserts', 199.00, TRUE
FROM restaurants WHERE name = 'Concu Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Chocolate Hazelnut Tart' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Concu Desserts'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Red Velvet Cupcake', 'Moist red velvet cake, cream cheese frosting', 'Desserts', 129.00, TRUE
FROM restaurants WHERE name = 'Concu Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Red Velvet Cupcake' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Concu Desserts'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Cold Brew Coffee', 'Slow-dripped organic cold brew', 'Beverages', 179.00, TRUE
FROM restaurants WHERE name = 'Concu Desserts'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Cold Brew Coffee' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Concu Desserts'));

-- Bawarchi Biryani
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Special Veg Biryani', 'Aromatic basmati rice, seasonal vegetables, spices', 'Biryani', 249.00, TRUE
FROM restaurants WHERE name = 'Bawarchi Biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Special Veg Biryani' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Bawarchi Biryani'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Chicken Dum Biryani', 'World-famous Hyderabadi chicken dum biryani', 'Biryani', 310.00, TRUE
FROM restaurants WHERE name = 'Bawarchi Biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Chicken Dum Biryani' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Bawarchi Biryani'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Double Ka Meetha', 'Traditional bread pudding dessert with nuts and saffron', 'Desserts', 99.00, TRUE
FROM restaurants WHERE name = 'Bawarchi Biryani'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Double Ka Meetha' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Bawarchi Biryani'));

-- Chutneys
INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Babai Idli', 'Soft, ghee-soaked idlis served with signature chutneys', 'South Indian', 99.00, TRUE
FROM restaurants WHERE name = 'Chutneys'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Babai Idli' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Chutneys'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Steam Dosa', 'Steam-cooked thin dosa served with sambar and chutneys', 'South Indian', 120.00, TRUE
FROM restaurants WHERE name = 'Chutneys'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Steam Dosa' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Chutneys'));

INSERT INTO menu_items (restaurant_id, item_name, description, category, price, availability)
SELECT restaurant_id, 'Filter Coffee', 'Authentic South Indian decoction filter coffee', 'Beverages', 49.00, TRUE
FROM restaurants WHERE name = 'Chutneys'
AND NOT EXISTS (SELECT 1 FROM menu_items WHERE item_name = 'Filter Coffee' AND restaurant_id = (SELECT restaurant_id FROM restaurants WHERE name = 'Chutneys'));
