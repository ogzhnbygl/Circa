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
                return res.status(400).json({ error: validation.error.errors[0].message });
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

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}
