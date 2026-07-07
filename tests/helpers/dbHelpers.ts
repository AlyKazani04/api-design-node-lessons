import { PassThrough } from 'stream';
import { db } from '../../src/db/connection.ts'
import { users, habits, entries, type NewUser, type NewHabit, habitTags, tags } from '../../src/db/schema.ts';
import { generateToken } from '../../src/utils/jwt.ts';
import { hashPassword } from '../../src/utils/passwords.ts';

export const createTestUser = async (userData: Partial<NewUser> = {}) => {
  const defaultData = {
    email: `test-${Date.now()}-${Math.random()}@example.com`,
    username: `testuser-${Date.now()}-${Math.random()}`,
    password: `adminpassword1234`,
    firstName: 'test',
    lastName: 'user',
    ...userData
  }

  const hashedPassword = await hashPassword(defaultData.password);
  const [user] = await db
    .insert(users)
    .values({
      ...defaultData,
      password: hashedPassword,
    })
    .returning();

  const token = await generateToken({
    id: user.id,
    email: user.email,
    username: user.username,
  })

  return { token, user, rawPassword: defaultData.password };
};

export const createTestHabit = async (userId: string, habitData: Partial<NewHabit> = {}) => {
  const defaultData = {
    name: `Test Habit ${Date.now()}`,
    description: 'A test habit',
    frequency: 'daily',
    targetCount: 1,
    ...habitData,
  }

  const [habit] = await db
    .insert(habits)
    .values({
      userId,
      ...defaultData,
    })
    .returning();
};

export const cleanUpDatabase = async () => {
  await db.delete(habits);
  await db.delete(users);
  await db.delete(entries);
  await db.delete(habitTags);
  await db.delete(tags)
};
