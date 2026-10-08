import { Router, Request, Response } from 'express';
import { PatientModel } from '../models/Patient';

const router = Router();

// GET /api/patients
router.get('/', async (_req: Request, res: Response) => {
  try {
    const patients = await PatientModel.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve patients' });
  }
});

// GET /api/patients/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const patient = await PatientModel.findOne({ id: req.params.id });
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching patient' });
  }
});

// POST /api/patients
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let id = body.id;

    if (!id) {
      const allPatients = await PatientModel.find({}, 'id');
      const existingIds = allPatients.map((p) => {
        const match = p.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 1000;
      });
      const nextNum = Math.max(...existingIds, 1000) + 1;
      id = `PAT-${nextNum}`;
    }

    const today = new Date().toISOString().split('T')[0];
    const newPatient = await PatientModel.create({
      ...body,
      id,
      lastVisit: body.lastVisit || today,
    });

    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ success: false, error: 'Failed to create patient' });
  }
});

// PUT /api/patients/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const updated = await PatientModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: req.body },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ success: false, error: 'Failed to update patient' });
  }
});

// DELETE /api/patients/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await PatientModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Patient not found' });
    }
    res.json({ success: true, message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ success: false, error: 'Failed to delete patient' });
  }
});

export default router;
