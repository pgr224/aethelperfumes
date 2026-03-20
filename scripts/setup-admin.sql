DELETE FROM "User";
INSERT INTO "User" ("email", "password", "name", "firstName", "lastName", "role", "referralTier", "referralBalance", "refEmailNotifications", "refWhatsAppNotifications", "createdAt")
VALUES ('admin@aethelperfumes.com', '$2b$10$tKtWI14gI56TW2u7njHwxewhBLluCQhiQrqo1E0aBxs8IwUUOf45y', 'Aethel Admin', 'Aethel', 'Admin', 'admin', 'BRONZE', 0, 1, 1, CURRENT_TIMESTAMP);
