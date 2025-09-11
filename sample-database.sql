-- Sample Database for Testing AI Features
-- This script creates tables with sample data for testing the AI assistant

-- Create Users table
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    age INTEGER,
    country TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active INTEGER DEFAULT 1
);

-- Create Products table
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price REAL NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Orders table
CREATE TABLE orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    order_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT DEFAULT 'pending',
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (product_id) REFERENCES products (id)
);

-- Insert sample users
INSERT INTO users (username, email, age, country, created_at, is_active) VALUES
('john_doe', 'john@example.com', 28, 'USA', '2024-01-15', 1),
('jane_smith', 'jane@example.com', 32, 'Canada', '2024-01-20', 1),
('bob_johnson', 'bob@example.com', 45, 'UK', '2024-02-01', 1),
('alice_brown', 'alice@example.com', 24, 'Australia', '2024-02-10', 0),
('charlie_wilson', 'charlie@example.com', 38, 'Germany', '2024-02-15', 1),
('diana_davis', 'diana@example.com', 29, 'France', '2024-03-01', 1),
('eve_miller', 'eve@example.com', 33, 'Japan', '2024-03-05', 1),
('frank_garcia', 'frank@example.com', 27, 'Spain', '2024-03-10', 0),
('grace_martinez', 'grace@example.com', 31, 'Italy', '2024-03-15', 1),
('henry_anderson', 'henry@example.com', 26, 'Brazil', '2024-03-20', 1);

-- Insert sample products
INSERT INTO products (name, category, price, stock_quantity, created_at) VALUES
('MacBook Pro 16"', 'Electronics', 2499.99, 15, '2024-01-01'),
('iPhone 15 Pro', 'Electronics', 1199.99, 50, '2024-01-01'),
('AirPods Pro', 'Electronics', 249.99, 100, '2024-01-01'),
('Nike Air Max', 'Footwear', 159.99, 75, '2024-01-02'),
('Adidas Ultraboost', 'Footwear', 189.99, 60, '2024-01-02'),
('Levi\'s 501 Jeans', 'Clothing', 79.99, 120, '2024-01-03'),
('H&M Cotton T-Shirt', 'Clothing', 19.99, 200, '2024-01-03'),
('IKEA Desk Lamp', 'Home & Garden', 29.99, 80, '2024-01-04'),
('Coffee Maker', 'Home & Garden', 89.99, 40, '2024-01-04'),
('Gaming Chair', 'Furniture', 299.99, 25, '2024-01-05');

-- Insert sample orders
INSERT INTO orders (user_id, product_id, quantity, total_price, order_date, status) VALUES
(1, 1, 1, 2499.99, '2024-03-21', 'completed'),
(1, 3, 2, 499.98, '2024-03-21', 'completed'),
(2, 2, 1, 1199.99, '2024-03-22', 'shipped'),
(3, 4, 1, 159.99, '2024-03-22', 'completed'),
(3, 6, 2, 159.98, '2024-03-22', 'completed'),
(4, 7, 3, 59.97, '2024-03-23', 'cancelled'),
(5, 8, 1, 29.99, '2024-03-23', 'pending'),
(5, 9, 1, 89.99, '2024-03-23', 'shipped'),
(6, 10, 1, 299.99, '2024-03-24', 'completed'),
(7, 5, 1, 189.99, '2024-03-24', 'completed'),
(8, 1, 1, 2499.99, '2024-03-25', 'pending'),
(9, 2, 2, 2399.98, '2024-03-25', 'shipped'),
(10, 3, 1, 249.99, '2024-03-26', 'completed'),
(1, 4, 1, 159.99, '2024-03-26', 'completed'),
(2, 6, 1, 79.99, '2024-03-27', 'shipped');

-- Create some indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_country ON users(country);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_product_id ON orders(product_id);
CREATE INDEX idx_orders_status ON orders(status);
