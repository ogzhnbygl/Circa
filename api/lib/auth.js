import clientPromise from '../../lib/mongodb.js';

export async function verifyUser(req) {
    // Mock for local development
    if (process.env.NODE_ENV === 'development' && !req.headers.cookie?.includes('interapp_session')) {
        console.log('DEV MODE: Using mock user for backend');
        const client = await clientPromise;
        const circaDb = client.db('Circa_db');
        return {
            email: 'dev@wildtype.app',
            name: 'Geliştirici',
            role: 'admin',
            apps: ['circa'],
            db: circaDb
        };
    }

    const cookieHeader = (req.headers && req.headers.cookie) || '';

    // 1. Verify Identity with Apex
    // Note: In production this would call the actual Apex API
    // For local testing without full Apex running, we rely on the dev mock above
    // or real calls if configured.
    const apexResponse = await fetch('https://wildtype.app/api/auth/me', {
        method: 'GET',
        headers: {
            'Cookie': cookieHeader,
            'Content-Type': 'application/json'
        }
    });

    if (!apexResponse.ok) {
        throw { status: apexResponse.status, message: 'Kimlik doğrulama başarısız' };
    }

    const userData = await apexResponse.json();
    const userEmail = userData.email;

    // 2. Verify Authorization with Database (Apex_db)
    const client = await clientPromise;
    const db = client.db('Apex_db');
    const user = await db.collection('users').findOne({ email: userEmail });

    if (!user) {
        throw { status: 403, message: 'Kullanıcı veritabanında bulunamadı.' };
    }

    // Check Permissions
    const isAdmin = user.role === 'admin';
    const hasAppAccess = Array.isArray(user.apps) && user.apps.some(app => app.toLowerCase() === 'circa');

    if (!isAdmin && !hasAppAccess) {
        throw { status: 403, message: 'Bu uygulamaya erişim yetkiniz bulunmamaktadır.' };
    }

    // Connect to Circa_db for app specific data
    const circaDb = client.db('Circa_db');

    return {
        ...userData,
        name: user.name || user.email.split('@')[0],
        role: user.role,
        apps: user.apps,
        db: circaDb // Provide access to Circa_db
    };
}
