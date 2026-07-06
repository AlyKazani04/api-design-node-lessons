import { db } from "../../src/db/connection.ts";
import { users, habits, entries, tags, habitTags } from '../../src/db/schema.ts';
import { sql } from 'drizzle-orm';
import { execSync } from "child_process";

export default async function setup() {
  console.log('💾 Setting up the Test DB');
  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

    console.log('🚀 Pushing Schema using Drizzle kit');
    execSync(`npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
      {
        stdio: 'inherit',
        cwd: process.cwd(),
      });

    console.log('✅ Test DB Created');
  } catch (e) {
    console.error('❌ Failed to setup Test DB', e);
    throw e;
  }

  return async () => {
    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

      process.exit(0);
    } catch (e) {
      console.error('❌ Failed to setup Test DB', e);
      throw e;
    }
  }
}
