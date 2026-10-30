import { verifyAuthWithStatus } from '../../lib/auth.js';
import clientPromise, { getDbName } from '../../lib/mongodb.js';

export async function verifyUser(req) {
    const { user, status, error } = await verifyAuthWithStatus(req, 'circa');
    if (!user) {
        throw { status: status || 401, message: error || 'Kimlik doğrulama başarısız' };
    }

    const client = await clientPromise;
    const circaDb = client.db(getDbName('Circa_db'));

    return {
        ...user,
        name: user.name || user.email.split('@')[0],
        db: circaDb
    };
}
