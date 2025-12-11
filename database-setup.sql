-- Visual Query Builder - Sample Database Setup Script
-- This script creates sample tables and data for testing the Visual Query Builder

-- Create database (run this separately if needed)
-- CREATE DATABASE querybuilder;

-- Connect to the database
\c querybuilder;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    price DECIMAL(10,2) NOT NULL,
    stock_quantity INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(200) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create order_items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(10,2) NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data into categories
INSERT INTO categories (name, description) VALUES
    ('Electronics', 'Electronic devices and accessories'),
    ('Books', 'Physical and digital books'),
    ('Clothing', 'Apparel and fashion items'),
    ('Home & Garden', 'Home improvement and gardening supplies'),
    ('Sports', 'Sports equipment and accessories');

-- Insert sample data into products
INSERT INTO products (name, category_id, price, stock_quantity) VALUES
    ('Laptop Computer', 1, 899.99, 50),
    ('Wireless Mouse', 1, 29.99, 200),
    ('USB-C Cable', 1, 12.99, 500),
    ('Programming Book', 2, 49.99, 100),
    ('Fiction Novel', 2, 15.99, 150),
    ('T-Shirt', 3, 19.99, 300),
    ('Jeans', 3, 59.99, 150),
    ('Garden Hose', 4, 34.99, 80),
    ('LED Light Bulbs', 4, 24.99, 250),
    ('Basketball', 5, 29.99, 100),
    ('Yoga Mat', 5, 39.99, 120),
    ('Headphones', 1, 149.99, 75);

-- Insert sample data into customers
INSERT INTO customers (first_name, last_name, email, phone, address, city, country) VALUES
    ('John', 'Doe', 'john.doe@example.com', '555-0101', '123 Main St', 'New York', 'USA'),
    ('Jane', 'Smith', 'jane.smith@example.com', '555-0102', '456 Oak Ave', 'Los Angeles', 'USA'),
    ('Bob', 'Johnson', 'bob.johnson@example.com', '555-0103', '789 Pine Rd', 'Chicago', 'USA'),
    ('Alice', 'Williams', 'alice.williams@example.com', '555-0104', '321 Elm St', 'Houston', 'USA'),
    ('Charlie', 'Brown', 'charlie.brown@example.com', '555-0105', '654 Maple Dr', 'Phoenix', 'USA'),
    ('Diana', 'Davis', 'diana.davis@example.com', '555-0106', '987 Cedar Ln', 'Philadelphia', 'USA'),
    ('Eve', 'Miller', 'eve.miller@example.com', '555-0107', '147 Birch Ct', 'San Antonio', 'USA'),
    ('Frank', 'Wilson', 'frank.wilson@example.com', '555-0108', '258 Spruce Way', 'San Diego', 'USA');

-- Insert sample data into orders
INSERT INTO orders (customer_id, order_date, total_amount, status) VALUES
    (1, '2024-01-15', 929.98, 'completed'),
    (2, '2024-01-16', 89.97, 'completed'),
    (3, '2024-01-17', 149.99, 'shipped'),
    (4, '2024-01-18', 79.98, 'processing'),
    (5, '2024-01-19', 899.99, 'completed'),
    (1, '2024-01-20', 69.98, 'completed'),
    (6, '2024-01-21', 234.96, 'shipped'),
    (7, '2024-01-22', 39.99, 'pending');

-- Insert sample data into order_items
INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES
    -- Order 1 (John Doe)
    (1, 1, 1, 899.99, 899.99),
    (1, 2, 1, 29.99, 29.99),
    -- Order 2 (Jane Smith)
    (2, 4, 1, 49.99, 49.99),
    (2, 5, 2, 15.99, 31.98),
    (2, 8, 1, 7.99, 7.99),
    -- Order 3 (Bob Johnson)
    (3, 12, 1, 149.99, 149.99),
    -- Order 4 (Alice Williams)
    (4, 6, 2, 19.99, 39.98),
    (4, 7, 1, 39.99, 39.99),
    -- Order 5 (Charlie Brown)
    (5, 1, 1, 899.99, 899.99),
    -- Order 6 (John Doe's second order)
    (6, 10, 1, 29.99, 29.99),
    (6, 11, 1, 39.99, 39.99),
    -- Order 7 (Diana Davis)
    (7, 3, 2, 12.99, 25.98),
    (7, 8, 2, 34.99, 69.98),
    (7, 9, 1, 24.99, 24.99),
    (7, 12, 1, 149.99, 149.99),
    -- Order 8 (Eve Miller)
    (8, 11, 1, 39.99, 39.99);

-- Create some useful views for testing
CREATE OR REPLACE VIEW order_summary AS
SELECT 
    o.id as order_id,
    c.first_name || ' ' || c.last_name as customer_name,
    c.email,
    o.order_date,
    o.status,
    o.total_amount,
    COUNT(oi.id) as item_count
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, c.first_name, c.last_name, c.email, o.order_date, o.status, o.total_amount;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;

-- Display summary
SELECT 'Database setup completed!' as message;
SELECT 'Categories: ' || COUNT(*) as count FROM categories
UNION ALL
SELECT 'Products: ' || COUNT(*) FROM products
UNION ALL
SELECT 'Customers: ' || COUNT(*) FROM customers
UNION ALL
SELECT 'Orders: ' || COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items: ' || COUNT(*) FROM order_items;
