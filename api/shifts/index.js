import { ObjectId } from 'mongodb';
import { verifyUser } from '../lib/auth.js';
import { z } from 'zod';

const shiftPostSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-MM-DD formatında olmalıdır.'),
    shiftType: z.enum(['weekday', 'weekend', 'holiday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Başlangıç saati HH:MM formatında olmalıdır.'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Bitiş saati HH:MM formatında olmalıdır.'),
    description: z.string().optional().default('')
});

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

            // Date filtering
            const { month, year } = req.query;
            if (month && year) {
                // Construct regex for string date "YYYY-MM"
                const monthStr = month.toString().padStart(2, '0');
                const datePattern = `^${year}-${monthStr}`;
                query.date = { $regex: datePattern };

                // For monthly report, we typically want ALL records, not just 5
                const shifts = await collection
                    .find(query)
                    .sort({ date: 1 }) // Sort chronological for reports
                    .toArray();

                return res.status(200).json(shifts);
            }

            const limit = parseInt(req.query.limit) || 5;

            const shifts = await collection
                .find(query)
                .sort({ createdAt: -1 }) // Son eklenenler en üstte görünsün (Son hareketler)
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
            const validation = shiftPostSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({ error: validation.error.issues?.[0]?.message || 'Geçersiz vardiya verisi.' });
            }
            const { date, shiftType, startTime, endTime, description } = validation.data;

            const newShift = {
                name: user.name,
                email: user.email,
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

    // DELETE: Remove a shift by id (only owner or admin; blocked for regular users if month already processed)
    if (req.method === 'DELETE') {
        try {
            const { id } = req.query;
            if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
                return res.status(400).json({ error: 'Geçerli bir mesai kayıt ID gereklidir.' });
            }

            const existingShift = await collection.findOne({ _id: new ObjectId(id) });
            if (!existingShift) {
                return res.status(404).json({ error: 'Mesai kaydı bulunamadı.' });
            }

            const isOwner = existingShift.email === user.email;
            const isAdmin = user.role === 'admin';
            if (!isOwner && !isAdmin) {
                return res.status(403).json({ error: 'Yalnızca kendi mesai kayıtlarınızı silebilirsiniz.' });
            }

            const period = typeof existingShift.date === 'string' ? existingShift.date.slice(0, 7) : '';
            let periodProcessed = false;
            if (period) {
                const processedCount = await db.collection('balances').countDocuments({ period });
                periodProcessed = processedCount > 0;
                if (periodProcessed && !isAdmin) {
                    return res.status(400).json({
                        error: 'Bu aya ait mesailer bakiyeye işlendiği için kayıt silinemez. Lütfen yöneticinizle iletişime geçin.'
                    });
                }
            }

            await collection.deleteOne({ _id: new ObjectId(id) });

            return res.status(200).json({
                success: true,
                periodProcessed
            });
        } catch (error) {
            console.error('Delete Shift Error:', error);
            return res.status(500).json({ error: 'Kayıt silinirken bir hata oluştu.' });
        }
    }

    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
