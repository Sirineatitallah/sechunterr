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
  const { email, password } = req.body;
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
  const accessToken = generateToken(newUser);
  const refreshToken = generateToken(newUser); // For simplicity, same token
  return res.json({ accessToken, refreshToken });
});

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  signedInUsers.add(user.name);
  const accessToken = generateToken(user);
  const refreshToken = generateToken(user); // For simplicity, same token
  return res.json({ accessToken, refreshToken });
});

// Refresh token endpoint
router.post('/refresh', (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token required' });
  }
  try {
    const user = jwt.verify(refreshToken, JWT_SECRET) as JwtPayload | string;
    if (!user || typeof user === 'string') return res.status(403).json({ message: 'Invalid token payload' });
    const refreshedUser = users.find(u => u.id === user.sub);
    if (!refreshedUser) return res.status(404).json({ message: 'User not found' });
    const accessToken = generateToken(refreshedUser);
    const newRefreshToken = generateToken(refreshedUser);
    return res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Admin-only endpoint to get signed-in users
router.get('/users', authenticateToken, requireAdmin, (req: Request, res: Response) => {
  res.json({ users: Array.from(signedInUsers) });
});

export default router;