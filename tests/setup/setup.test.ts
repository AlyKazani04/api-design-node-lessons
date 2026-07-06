import { createTestUser, createTestHabit, cleanUpDatabase } from "../helpers/dbHelpers.ts";

describe('Test Setup', () => {
  test('Should connect to the Test DB', async () => {
    const { user, token } = await createTestUser();

    expect(user).toBeDefined();
    await cleanUpDatabase();
  })
})
