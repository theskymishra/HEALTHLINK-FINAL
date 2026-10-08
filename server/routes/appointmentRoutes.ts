import { Router, Request, Response } from 'express';
import { AppointmentModel } from '../models/Appointment';

const router = Router();

// GET /api/appointments
router.get('/', async (_req: Request, res: Response) => {
  try {
    const appointments = await AppointmentModel.find().sort({ date: -1, time: -1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve appointments' });
  }
});

// GET /api/appointments/today
router.get('/today', async (_req: Request, res: Response) => {
  try {
    const today = '2026-10-07'; // matches project mock timeline, also fallback to real today if needed
    const realToday = new Date().toISOString().split('T')[0];
    const appointments = await AppointmentModel.find({
      $or: [{ date: today }, { date: realToday }],
    }).sort({ time: 1 });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching today appointments:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve today appointments' });
  }
});

// GET /api/appointments/patient/:patientId
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const appointments = await AppointmentModel.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch patient appointments' });
  }
});

// GET /api/appointments/doctor/:doctorId
router.get('/doctor/:doctorId', async (req: Request, res: Response) => {
  try {
    const appointments = await AppointmentModel.find({ doctorId: req.params.doctorId }).sort({ date: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch doctor appointments' });
  }
});

// POST /api/appointments
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let id = body.id;

    if (!id) {
      const allAppts = await AppointmentModel.find({}, 'id');
      const existingIds = allAppts.map((a) => {
        const match = a.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 300;
      });
      const nextNum = Math.max(...existingIds, 300) + 1;
      id = `APT-${nextNum}`;
    }

    const sameDayCount = await AppointmentModel.countDocuments({ date: body.date });
    const tokenNumber = body.tokenNumber || (sameDayCount + 1);

    const created = await AppointmentModel.create({
      ...body,
      id,
      tokenNumber,
      status: body.status || 'Scheduled',
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to create appointment' });
  }
});

// PATCH /api/appointments/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await AppointmentModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating appointment status:', error);
    res.status(500).json({ success: false, error: 'Failed to update status' });
  }
});

// DELETE /api/appointments/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await AppointmentModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ success: false, error: 'Failed to delete appointment' });
  }
});

export default router;
