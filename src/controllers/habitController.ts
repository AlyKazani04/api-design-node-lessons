import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.ts";
import { db } from '../db/connection.ts';
import { habits, entries, habitTags, tags } from "../db/schema.ts";
import { eq, and, desc, inArray } from 'drizzle-orm';

export const createHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, description, frequency, targetCount, tagIds } = req.body;

    const result = await db.transaction(async (tx) => {
      const [newHabit] = await tx.insert(habits).values({
        userId: req.user.id,
        name,
        description,
        frequency,
        targetCount,
      }).returning();

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId) => ({
          habitId: newHabit.id,
          tagId
        }));


        await tx.insert(habitTags).values(habitTagValues);
      }

      return newHabit;
    })

    res.status(201).json({
      message: 'Habit Created',
      habit: result
    })
  } catch (e) {
    console.error('Habit Creation Error', e);
    res.status(500).json({ error: 'Failed to create habit' });
  }
}

export const getUserHabits = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userHabitsWithTags = await db.query.habits.findMany({
      where: eq(habits.userId, req.user.id),
      with: {
        habitTags: {
          with: {
            tag: true,
          }
        }
      },
      orderBy: [desc(habits.created_at)],
    })

    const habitsWithTags = userHabitsWithTags.map(habit => ({
      ...habit,
      tags: habit.habitTags.map(ht => ht.tag),
      habitTags: undefined,
    }))

    res.json({
      habits: habitsWithTags,
    })
  } catch (e) {
    console.error('Habit Fetch Error', e);
    res.status(500).json({ error: 'Failed to get habits' });
  }
};

export const updateHabit = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { tagIds, name, description, frequency } = req.body;

    const result = await db.transaction(async (tx) => {
      const updatedResult = await tx
        .update(habits)
        .set({
          name,
          description,
          frequency,
          updated_at: new Date(),
        })
        .where(and(eq(habits.id, id), eq(habits.userId, userId)))
        .returning();

      const updatedHabit = Array.isArray(updatedResult) ? updatedResult[0] : null;

      if (!updatedHabit) {
        throw new Error('Habit not found');
      }

      if (tagIds !== undefined) {
        await tx.delete(habitTags).where(eq(habitTags.habitId, id));

        if (tagIds.length > 0) {
          const habitTagValues = tagIds.map((tagId) => ({
            habitId: id,
            tagId,
          }))

          await tx.insert(habitTags).values(habitTagValues);
        }
      }

      return updatedHabit;
    })

    return res.json({
      message: 'Habit was updated',
      habit: result,
    })
  } catch (e) {
    console.error('Habit Update Error', e);
    res.status(500).json({ error: 'Failed to update habit' });
  }
};
