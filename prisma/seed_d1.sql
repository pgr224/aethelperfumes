-- Seed Admin User (admin@aethelperfumes.com / Admin@Aethel@2026)
INSERT INTO "User" ("email", "password", "name", "firstName", "lastName", "role", "referralTier", "referralBalance", "refEmailNotifications", "refWhatsAppNotifications", "createdAt")
VALUES ('admin@aethelperfumes.com', '$2b$10$tKtWI14gI56TW2u7njHwxewhBLluCQhiQrqo1E0aBxs8IwUUOf45y', 'Aethel Admin', 'Aethel', 'Admin', 'admin', 'BRONZE', 0, 1, 1, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

UPDATE "User"
SET
	"password" = '$2b$10$tKtWI14gI56TW2u7njHwxewhBLluCQhiQrqo1E0aBxs8IwUUOf45y',
	"name" = 'Aethel Admin',
	"role" = 'admin',
	"referralTier" = 'BRONZE'
WHERE "email" = 'admin@aethelperfumes.com';

-- Seed Initial Category
INSERT INTO "Category" ("name", "slug", "description", "productCount", "createdAt")
VALUES ('Luxury Collection', 'luxury-collection', 'Our signature collection of premium fragrances.', 1, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

UPDATE "Category"
SET
	"name" = 'Luxury Collection',
	"description" = 'Our signature collection of premium fragrances.'
WHERE "slug" = 'luxury-collection';

-- Seed Featured Product
INSERT INTO "Product" (
	"name",
	"slug",
	"description",
	"shortDesc",
	"price",
	"images",
	"categoryId",
	"notes",
	"stock",
	"featured",
	"createdAt"
)
VALUES (
	'AETHEL Signature',
	'aethel-signature',
	'A sophisticated blend of amber, citrus, and rare woods.',
	'Amber · Citrus · Woods',
	99,
	'["/images/aethel/placeholder.jpg"]',
	(SELECT "id" FROM "Category" WHERE "slug" = 'luxury-collection' LIMIT 1),
	'Amber, Citrus, Woods',
	50,
	1,
	CURRENT_TIMESTAMP
)
ON CONFLICT DO NOTHING;

UPDATE "Product"
SET
	"name" = 'AETHEL Signature',
	"description" = 'A sophisticated blend of amber, citrus, and rare woods.',
	"shortDesc" = 'Amber · Citrus · Woods',
	"price" = 99,
	"images" = '["/images/aethel/placeholder.jpg"]',
	"categoryId" = (SELECT "id" FROM "Category" WHERE "slug" = 'luxury-collection' LIMIT 1),
	"notes" = 'Amber, Citrus, Woods',
	"stock" = 50,
	"featured" = 1
WHERE "slug" = 'aethel-signature';

-- Seed Site Settings
INSERT INTO "SiteSetting" ("key", "value") VALUES ('site_name', 'AETHEL PARFUMS')
ON CONFLICT DO NOTHING;
UPDATE "SiteSetting" SET "value" = 'AETHEL PARFUMS' WHERE "key" = 'site_name';

INSERT INTO "SiteSetting" ("key", "value") VALUES ('tagline', 'The Essence of Luxury')
ON CONFLICT DO NOTHING;
UPDATE "SiteSetting" SET "value" = 'The Essence of Luxury' WHERE "key" = 'tagline';

INSERT INTO "SiteSetting" ("key", "value") VALUES ('currency', 'USD')
ON CONFLICT DO NOTHING;
UPDATE "SiteSetting" SET "value" = 'USD' WHERE "key" = 'currency';

INSERT INTO "SiteSetting" ("key", "value") VALUES ('currencySymbol', '$')
ON CONFLICT DO NOTHING;
UPDATE "SiteSetting" SET "value" = '$' WHERE "key" = 'currencySymbol';
