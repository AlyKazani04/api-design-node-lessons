import { Router } from 'express';
import { validateBody, validateParams } from '../middleware/validation.ts';
import { z } from 'zod';
import { authenticateToken } from '../middleware/auth.ts';
import { createHabit, getUserHabits, updateHabit } from '../controllers/habitController.ts';

const createhabitSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  frequency: z.string(),
  targetCount: z.number(),
  tagIds: z.array(z.string()).optional()
});

const completeParamsSchema = z.object({
  id: z.string().max(3),
})

const router = Router();

router.use(authenticateToken);

router.get('/', getUserHabits);

router.patch('/:id', updateHabit);

router.get('/:id', (req, res) => {
  res.json({ message: 'got one habit' });
});

router.post('/', validateBody(createhabitSchema), createHabit);

router.delete('/:id', (req, res) => {
  res.json({ message: 'deleted habit' });
});

router.post('/:id/complete', validateParams(completeParamsSchema), validateBody(createhabitSchema), (req, res) => {
  res.json({ message: 'completed habit' });
});

export default router;
