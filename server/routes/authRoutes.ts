import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User';
import { DEMO_USERS } from '../../src/context/AuthContext';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'healthlink-clinical-os-jwt-secret-2026';

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, email, password, customName } = req.body;
    const roleKey = role || 'admin';
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    let user = null;

    if (cleanEmail) {
      user = await UserModel.findOne({ email: cleanEmail });
      if (!user) {
        // Check if matches a demo user email template
        const demoTemplate = Object.values(DEMO_USERS).find((d) => d.email.toLowerCase() === cleanEmail);
        if (demoTemplate) {
          user = await UserModel.findOne({ id: demoTemplate.id });
        }
      }
    } else {
      user = await UserModel.findOne({ roleKey });
    }

    if (!user) {
      const template = DEMO_USERS[roleKey as keyof typeof DEMO_USERS] || DEMO_USERS.admin;
      user = await UserModel.create({
        id: template.id,
        name: customName || (cleanEmail && !cleanEmail.includes('healthlink.org') ? cleanEmail.split('@')[0] : template.name),
        email: cleanEmail || template.email.toLowerCase(),
        role: template.role,
        roleKey: template.roleKey,
        phone: template.phone,
        password: password || 'securePass123',
      });
    }

    // Verify password if provided
    const expectedPassword = user.password || 'securePass123';
    if (password && password !== expectedPassword && password !== 'demo1234') {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, roleKey: user.roleKey },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleKey: user.roleKey,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during login' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { role, name, email, password } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Full name is required' });
    }
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'A valid email address is required' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ success: false, error: 'Password must be at least 4 characters' });
    }

    const signupRole = role === 'doctor' ? 'doctor' : 'patient';
    const formattedName = signupRole === 'doctor' && !name.startsWith('Dr.') ? `Dr. ${name.trim()}` : name.trim();
    const cleanEmail = email.trim().toLowerCase();

    const existing = await UserModel.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ success: false, error: 'An account with this email already exists' });
    }

    const count = await UserModel.countDocuments({ roleKey: signupRole });
    const id = signupRole === 'doctor' ? `DOC-${200 + count + 1}` : `PAT-${1000 + count + 1}`;

    const created = await UserModel.create({
      id,
      name: formattedName,
      email: cleanEmail,
      role: signupRole === 'doctor' ? 'Doctor' : 'Patient',
      roleKey: signupRole,
      phone: '+91 98XXX XXXXX',
      password,
    });

    const token = jwt.sign(
      { id: created.id, email: created.email, role: created.role, roleKey: created.roleKey },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        roleKey: created.roleKey,
        avatarUrl: created.avatarUrl,
        phone: created.phone,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, error: 'Internal server error during signup' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Unauthorized: missing authorization token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await UserModel.findOne({ id: decoded.id });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleKey: user.roleKey,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
});

// GET /api/auth/users
router.get('/users', async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch registered users' });
  }
});

export default router;
