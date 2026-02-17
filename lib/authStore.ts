import { getDb } from './db';

import bcrypt from 'bcrypt';

type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

type AuthResult = {
  success: boolean;
  role?: UserRole;
  userId?: string;
  message?: string;
};

export async function authenticateUser(
    username: string,
  password: string
): Promise<AuthResult> {
  const db = getDb();
  const user = await db.user.findUnique({
    where: { username },
  });

  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return { success: false, message: 'Invalid credentials' };
  }

  return {
    success: true,
    role: user.role as UserRole,
    userId: user.userId,
  };
}