-- Seed Admin User (Password: preview-admin-123)
-- Hash generated for: preview-admin-123
INSERT INTO "User" ("email", "password", "name", "role", "referralTier", "createdAt")
VALUES ('preview-admin@example.com', '$2a$10$7v8hI0s1G8T9/M7rX3y6aeK8fG9uR1p4y2W3S4t5U6V7W8X9Y0Z1.', 'Preview Admin', 'admin', 'BRONZE', CURRENT_TIMESTAMP);

-- Seed Initial Category
INSERT INTO "Category" ("name", "slug", "description", "productCount", "createdAt")
VALUES ('Luxury Collection', 'luxury-collection', 'Our signature collection of premium fragrances.', 1, CURRENT_TIMESTAMP);

-- Seed Featured Product
INSERT INTO "Product" ("name", "slug", "description", "shortDesc", "price", "images", "categoryId", "notes", "stock", "featured", "createdAt")
VALUES ('AETHEL Signature', 'aethel-signature', 'A sophisticated blend of amber, citrus, and rare woods.', 'Amber · Citrus · Woods', 99, '["/images/aethel/placeholder.jpg"]', 1, 'Amber, Citrus, Woods', 50, 1, CURRENT_TIMESTAMP);

-- Seed Site Settings
INSERT INTO "SiteSetting" ("key", "value") VALUES ('site_name', 'AETHEL PARFUMS');
INSERT INTO "SiteSetting" ("key", "value") VALUES ('tagline', 'The Essence of Luxury');
INSERT INTO "SiteSetting" ("key", "value") VALUES ('currency', 'USD');
INSERT INTO "SiteSetting" ("key", "value") VALUES ('currencySymbol', '$');
