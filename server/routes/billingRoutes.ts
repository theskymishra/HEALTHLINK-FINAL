import { Router, Request, Response } from 'express';
import { InvoiceModel } from '../models/Invoice';

const router = Router();

// GET /api/billing/stats (must be defined before /:id)
router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const invoices = await InvoiceModel.find();
    const stats = invoices.reduce(
      (acc, inv) => {
        acc.totalRevenue += inv.totalAmount;
        if (inv.status === 'Paid') acc.paid += inv.totalAmount;
        if (inv.status === 'Pending') acc.pending += inv.totalAmount;
        if (inv.status === 'Overdue') acc.overdue += inv.totalAmount;
        return acc;
      },
      { totalRevenue: 0, paid: 0, pending: 0, overdue: 0 }
    );
    res.json(stats);
  } catch (error) {
    console.error('Error fetching billing stats:', error);
    res.status(500).json({ success: false, error: 'Failed to compute billing stats' });
  }
});

// GET /api/billing
router.get('/', async (_req: Request, res: Response) => {
  try {
    const invoices = await InvoiceModel.find().sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve invoices' });
  }
});

// GET /api/billing/patient/:patientId
router.get('/patient/:patientId', async (req: Request, res: Response) => {
  try {
    const invoices = await InvoiceModel.find({ patientId: req.params.patientId }).sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch patient invoices' });
  }
});

// GET /api/billing/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const invoice = await InvoiceModel.findOne({ id: req.params.id });
    if (!invoice) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching invoice' });
  }
});

// POST /api/billing
router.post('/', async (req: Request, res: Response) => {
  try {
    const body = req.body;
    let id = body.id;

    if (!id) {
      const allInvoices = await InvoiceModel.find({}, 'id');
      const existingIds = allInvoices.map((i) => {
        const match = i.id.match(/\d+/);
        return match ? parseInt(match[0], 10) : 500;
      });
      const nextNum = Math.max(...existingIds, 500) + 1;
      id = `INV-${nextNum}`;
    }

    const created = await InvoiceModel.create({
      ...body,
      id,
    });

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to create invoice' });
  }
});

// PATCH /api/billing/:id/status
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = await InvoiceModel.findOneAndUpdate(
      { id: req.params.id },
      { $set: { status } },
      { returnDocument: 'after' }
    );
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating invoice status:', error);
    res.status(500).json({ success: false, error: 'Failed to update invoice status' });
  }
});

// DELETE /api/billing/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await InvoiceModel.findOneAndDelete({ id: req.params.id });
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Invoice not found' });
    }
    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ success: false, error: 'Failed to delete invoice' });
  }
});

export default router;
