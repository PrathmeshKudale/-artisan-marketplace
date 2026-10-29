import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../usersStore';
const JWT_SECRET = 'your_jwt_secret'; // Change in production

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Create JWT token
  const token = jwt.sign({ email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
  return NextResponse.json({ message: 'Sign in successful', token }, { status: 200 });
}
