import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getJwtSecret } from '@/lib/jwt-secret';

export async function getUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return null;
        }

        const decoded = jwt.verify(token, getJwtSecret());
        return decoded;
    } catch (error) {
        return null;
    }
}
