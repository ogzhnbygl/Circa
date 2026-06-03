import { verifyAuth } from '../../lib/auth.js';
import clientPromise from '../../lib/mongodb.js';

export async function verifyUser(req) {
    const user = await verifyAuth(req, 'circa');
    if (!user) {
        throw { status: 401, message: 'Kimlik doğrulama başarısız' };
    }

    const client = await clientPromise;
    const circaDb = client.db('Circa_db');

    return {
        ...user,
        name: user.name || user.email.split('@')[0],
        db: circaDb
    };
}
