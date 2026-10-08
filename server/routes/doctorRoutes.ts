import { Router, Request, Response } from 'express';
import { DoctorModel } from '../models/Doctor';

const router = Router();

// GET /api/doctors
router.get('/', async (_req: Request, res: Response) => {
  try {
    const doctors = await DoctorModel.find().sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve doctors' });
  }
});

// GET /api/doctors/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const doctor = await DoctorModel.findOne({ id: req.params.id });
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching doctor' });
  }
});

// POST /api/doctors
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let id = body.id;

    if (!id) {
      const allDoctors = await DoctorModel.find({}, 'id');
      const existingIds = allDoctors.map((d) => {
        const match = d.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 200;
      });
      const nextNum = Math.max(...existingIds, 200) + 1;
      id = `DOC-${nextNum}`;
    }

    const created = await DoctorModel.create({
      ...body,
      id,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ success: false, error: 'Failed to create doctor' });
  }
});

// PUT /api/doctors/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await DoctorModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ success: false, error: 'Failed to update doctor' });
  }
});

// DELETE /api/doctors/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await DoctorModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Doctor not found' });
    }
    res.json({ success: true, message: 'Doctor deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ success: false, error: 'Failed to delete doctor' });
  }
});

export default router;
