import { Router, Request, Response } from 'express';
import { DepartmentModel } from '../models/Department';

const router = Router();

// GET /api/departments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const departments = await DepartmentModel.find().sort({ name: 1 });
    res.json(departments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve departments' });
  }
});

// GET /api/departments/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const department = await DepartmentModel.findOne({ id: req.params.id });
    if (!department) {
      return res.status(404).json({ success: false, error: 'Department not found' });
    }
    res.json(department);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching department' });
  }
});

export default router;
