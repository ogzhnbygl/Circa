import { verifyUser } from './lib/auth.js';

export default async function handler(req, res) {
    let user;
    try {
        user = await verifyUser(req);
    } catch (error) {
        return res.status(error.status || 401).json({ error: error.message });
    }

    const { db } = user;
    const collection = db.collection('time_offs');

    // GET: List recent time-off requests
    if (req.method === 'GET') {
        try {
            // Admin sees all, user sees own
            const query = user.role === 'admin' ? {} : { email: user.email };
            const limit = parseInt(req.query.limit) || 10;

            const timeOffs = await collection
                .find(query)
                .sort({ createdAt: -1 })
                .limit(limit)
                .toArray();

            return res.status(200).json(timeOffs);
        } catch (error) {
            console.error('Fetch TimeOffs Error:', error);
            return res.status(500).json({ error: 'İzin verileri alınırken bir hata oluştu.' });
        }
    }

    // POST: Create new time-off request
    if (req.method === 'POST') {
        try {
            const { unit, dates, singleDate, startTime, endTime, totalHours, description } = req.body;

            // Simple validation
            if (!unit || !totalHours) {
                return res.status(400).json({ error: 'Eksik bilgi gönderildi.' });
            }

            if (unit === 'daily' && (!dates || dates.length === 0)) {
                return res.status(400).json({ error: 'Lütfen en az bir gün seçiniz.' });
            }

            if (unit === 'hourly' && (!singleDate || !startTime || !endTime)) {
                return res.status(400).json({ error: 'Saatlik izin için tarih ve saat aralığı zorunludur.' });
            }

            const newTimeOff = {
                name: user.name,
                email: user.email,
                unit,
                dates: unit === 'daily' ? dates.map(d => new Date(d)) : [],
                singleDate: unit === 'hourly' ? new Date(singleDate) : null,
                startTime,
                endTime,
                totalHours: parseFloat(totalHours),
                description,
                status: 'pending', // pending, approved, rejected
                createdAt: new Date()
            };

            await collection.insertOne(newTimeOff);

            return res.status(201).json(newTimeOff);
        } catch (error) {
            console.error('Create TimeOff Error:', error);
            return res.status(500).json({ error: 'İzin talebi oluşturulurken bir hata oluştu.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
