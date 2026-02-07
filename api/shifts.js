import { verifyUser } from './lib/auth.js';

export default async function handler(req, res) {
    let user;
    try {
        user = await verifyUser(req);
    } catch (error) {
        return res.status(error.status || 401).json({ error: error.message });
    }

    const { db } = user;
    const collection = db.collection('shifts');

    // GET: List last 5 shifts (Son Hareketler)
    if (req.method === 'GET') {
        try {
            // Admin sees all shifts, others see only their own
            const query = user.role === 'admin' ? {} : { email: user.email };
            const limit = parseInt(req.query.limit) || 5;

            const shifts = await collection
                .find(query)
                .sort({ date: -1, _id: -1 }) // Sort by date desc
                .limit(limit)
                .toArray();

            return res.status(200).json(shifts);
        } catch (error) {
            console.error('Fetch Shifts Error:', error);
            return res.status(500).json({ error: 'Veriler alınırken bir hata oluştu.' });
        }
    }

    // POST: Create new shift (Kaydet)
    if (req.method === 'POST') {
        try {
            const { date, shiftType, startTime, endTime, description } = req.body;

            // Simple validation
            if (!date || !shiftType || !startTime || !endTime) {
                return res.status(400).json({ error: 'Lütfen tüm zorunlu alanları doldurunuz.' });
            }

            const newShift = {
                name: user.name,
                email: user.email,
                username: user.username,
                date,
                shiftType,
                startTime,
                endTime,
                description,
                createdAt: new Date()
            };

            await collection.insertOne(newShift);

            return res.status(201).json(newShift);
        } catch (error) {
            console.error('Create Shift Error:', error);
            return res.status(500).json({ error: 'Kayıt sırasında bir hata oluştu.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
