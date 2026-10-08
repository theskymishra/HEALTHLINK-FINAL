import { Router, Request, Response } from 'express';
import { MedicalRecordModel } from '../models/MedicalRecord';

const router = Router();

// GET /api/medical-records
router.get('/', async (_req: Request, res: Response) => {
  try {
    const records = await MedicalRecordModel.find().sort({ date: -1 });
    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve medical records' });
  }
});

// GET /api/medical-records/patient/:patientId
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const records = await MedicalRecordModel.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch patient records' });
  }
});

// GET /api/medical-records/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const record = await MedicalRecordModel.findOne({ id: req.params.id });
    if (!record) {
      return res.status(404).json({ success: false, error: 'Medical record not found' });
    }
    res.json(record);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching medical record' });
  }
});

// POST /api/medical-records
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let id = body.id;

    if (!id) {
      const allRecords = await MedicalRecordModel.find({}, 'id');
      const existingIds = allRecords.map((r) => {
        const match = r.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 400;
      });
      const nextNum = Math.max(...existingIds, 400) + 1;
      id = `REC-${nextNum}`;
    }

    const created = await MedicalRecordModel.create({
      ...body,
      id,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating medical record:', error);
    res.status(500).json({ success: false, error: 'Failed to create medical record' });
  }
});

// DELETE /api/medical-records/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await MedicalRecordModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Medical record not found' });
    }
    res.json({ success: true, message: 'Medical record deleted successfully' });
  } catch (error) {
    console.error('Error deleting medical record:', error);
    res.status(500).json({ success: false, error: 'Failed to delete medical record' });
  }
});

export default router;
