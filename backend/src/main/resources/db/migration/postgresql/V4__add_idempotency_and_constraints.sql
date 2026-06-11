-- Add idempotency_key to orders
ALTER TABLE orders ADD COLUMN idempotency_key VARCHAR(255) UNIQUE;

-- Add check constraints for quantities and prices
ALTER TABLE menu_items ADD CONSTRAINT chk_menu_items_price CHECK (price >= 0);
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_quantity CHECK (quantity > 0);
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_unit_price CHECK (unit_price >= 0);
ALTER TABLE order_items ADD CONSTRAINT chk_order_items_line_total CHECK (line_total >= 0);
ALTER TABLE cart_items ADD CONSTRAINT chk_cart_items_quantity CHECK (quantity > 0);
ALTER TABLE payments ADD CONSTRAINT chk_payments_amount CHECK (amount >= 0);

-- Add missing foreign keys and unique constraints
ALTER TABLE orders ADD CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT fk_orders_restaurant FOREIGN KEY (restaurant_id) REFERENCES restaurants (restaurant_id) ON DELETE CASCADE;
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (menu_item_id) ON DELETE CASCADE;
ALTER TABLE cart_items ADD CONSTRAINT fk_cart_items_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items (menu_item_id) ON DELETE CASCADE;
ALTER TABLE carts ADD CONSTRAINT fk_carts_user FOREIGN KEY (user_id) REFERENCES users (user_id) ON DELETE CASCADE;
ALTER TABLE carts ADD CONSTRAINT uq_carts_user UNIQUE (user_id);
ALTER TABLE payments ADD CONSTRAINT fk_payments_order FOREIGN KEY (order_id) REFERENCES orders (order_id) ON DELETE CASCADE;

-- Add indexes
CREATE INDEX idx_orders_user_id ON orders (user_id);
CREATE INDEX idx_orders_restaurant_id ON orders (restaurant_id);
CREATE INDEX idx_menu_items_restaurant_id ON menu_items (restaurant_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items (cart_id);
CREATE INDEX idx_order_items_order_id ON order_items (order_id);
