import { defineConfig } from '@prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',

  datasource: {
    url: process.env.DATABASE_URL || 'postgresql://dummy@localhost:5432/dummy',
    directUrl: process.env.DIRECT_URL || 'postgresql://dummy@localhost:5432/dummy'
  }
});

