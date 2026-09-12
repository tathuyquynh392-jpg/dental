import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'lucky_dental_secret_key';

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
  patientId?: number;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
