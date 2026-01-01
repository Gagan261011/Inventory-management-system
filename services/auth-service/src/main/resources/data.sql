-- Insert Roles
INSERT INTO roles (id, name, description) VALUES (1, 'ROLE_ADMIN', 'Administrator with full access');
INSERT INTO roles (id, name, description) VALUES (2, 'ROLE_USER', 'Warehouse/Store staff user');

-- Insert Admin User (password: Admin@123)
INSERT INTO users (id, email, password, first_name, last_name, active, warehouse_id, created_at, updated_at)
VALUES (1, 'admin@demo.com', '$2a$10$rDkPvvAFV8kqwvKJzwlRv.FDXz1Z6U6H8DPxDZkSS5pLGOI0CKJSa', 'Admin', 'User', true, null, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert Regular User (password: User@123)
INSERT INTO users (id, email, password, first_name, last_name, active, warehouse_id, created_at, updated_at)
VALUES (2, 'user1@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkLgpPt7jFgT6TbD8VZJ3M7B5CKWK', 'John', 'Warehouse', true, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, email, password, first_name, last_name, active, warehouse_id, created_at, updated_at)
VALUES (3, 'user2@demo.com', '$2a$10$8K1p/a0dL1LXMIgoEDFrwOfMQkLgpPt7jFgT6TbD8VZJ3M7B5CKWK', 'Jane', 'Store', true, 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Assign Roles
INSERT INTO user_roles (user_id, role_id) VALUES (1, 1);
INSERT INTO user_roles (user_id, role_id) VALUES (2, 2);
INSERT INTO user_roles (user_id, role_id) VALUES (3, 2);
