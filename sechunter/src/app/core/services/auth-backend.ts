import express, { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bodyParser from 'body-parser';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload | string;
    }
  }
}

const router = express.Router();

router.use(bodyParser.json());

const JWT_SECRET = 'your_jwt_secret_key'; // Use a secure key in production
const TOKEN_EXPIRATION = '1h';

// In-memory user storage
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  roles: string[];
}

const users: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    password: 'adminpass', // In production, passwords must be hashed
    name: 'Admin User',
    roles: ['admin'],
  },
  {
    id: '2',
    email: 'admin',
    password: 'Admin1!/', // Special admin account
    name: 'Administrator',
    roles: ['admin', 'superuser'],
  },
];

const signedInUsers = new Set<string>();

// Helper to generate JWT token
function generateToken(user: User): string {
  const payload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    roles: user.roles,
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
}

// Middleware to verify JWT token and attach user to request
function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const user = jwt.verify(token, JWT_SECRET) as JwtPayload | string;
    req.user = user;
    next();
    return;
  } catch (err) {
    return res.status(403).json({ message: 'Invalid token' });
  }
}

// Middleware to check admin role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || typeof req.user === 'string' || !('roles' in req.user) || !req.user['roles'].includes('admin')) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
  return;
}

// Register endpoint
router.post('/register', (req: Request, res: Response) => {
  // Support both email and id parameters
  const email = req.body.email || req.body.id;
  const { password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  if (users.find(u => u.email === email)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser: User = {
    id: (users.length + 1).toString(),
    email,
    password, // In production, hash the password
    name: email.split('@')[0],
    roles: ['client'],
  };

  users.push(newUser);
  signedInUsers.add(newUser.name);
  const token = generateToken(newUser);
  return res.json({ token });
});

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  // Support both email and username parameters
  const username = req.body.username || req.body.email;
  const { password } = req.body;

  // Special case for admin
  if (username === 'admin' && password === 'Admin1!/') {
    const adminUser = users.find(u => u.email === 'admin');
    if (adminUser) {
      signedInUsers.add(adminUser.name);
      const token = generateToken(adminUser);
      return res.json({ token });
    }
  }

  // Regular user login
  const user = users.find(u => (u.email === username || u.name === username) && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  signedInUsers.add(user.name);
  const token = generateToken(user);
  return res.json({ token });
});

// Refresh token endpoint
router.post('/refresh-token', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  try {
    const user = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload | string;
    if (!user || typeof user === 'string') return res.status(403).json({ message: 'Invalid token payload' });
    const refreshedUser = users.find(u => u.id === user.sub);
    if (!refreshedUser) return res.status(404).json({ message: 'User not found' });
    const token = generateToken(refreshedUser);
    return res.json({ token });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Admin-only endpoint to get signed-in users
router.get('/users', authenticateToken, requireAdmin, (_req: Request, res: Response) => {
  res.json({ users: Array.from(signedInUsers) });
});

export default router;