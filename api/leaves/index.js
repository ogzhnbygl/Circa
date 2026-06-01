import { verifyUser } from '../lib/auth.js';
import { ObjectId } from 'mongodb';

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

    // DELETE: Delete (Cancel) a time-off request
    if (req.method === 'DELETE') {
        try {
            const id = req.body?.id || req.query?.id;

            if (!id) {
                return res.status(400).json({ error: 'İzin ID gereklidir.' });
            }

            if (!ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Geçersiz İzin ID formatı.' });
            }

            const objectId = new ObjectId(id);

            // 1. Find the request
            const request = await collection.findOne({ _id: objectId });

            if (!request) {
                return res.status(404).json({ error: 'İzin talebi bulunamadı.' });
            }

            // 2. Security Check: Only Admin or the owner can delete, and only if it is pending!
            const isAdmin = user.role === 'admin';
            const isOwner = request.email === user.email;

            if (!isAdmin && !isOwner) {
                return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
            }

            if (request.status !== 'pending') {
                return res.status(400).json({ error: 'Sadece onay bekleyen izin talepleri iptal edilebilir.' });
            }

            // 3. Delete from DB
            await collection.deleteOne({ _id: objectId });

            return res.status(200).json({ success: true, message: 'İzin talebi başarıyla iptal edildi.' });

        } catch (error) {
            console.error('Delete TimeOff Error:', error);
            return res.status(500).json({ error: 'İzin iptali sırasında bir hata oluştu.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
