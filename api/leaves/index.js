import { verifyUser } from '../lib/auth.js';
import { ObjectId } from 'mongodb';
import { z } from 'zod';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}/;
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const leavePostSchema = z.object({
    unit: z.enum(['daily', 'hourly']),
    dates: z.array(z.string().regex(isoDateRegex, 'Geçersiz tarih formatı.')).optional().default([]),
    singleDate: z.string().regex(isoDateRegex, 'Geçersiz tarih formatı.').nullable().optional(),
    startTime: z.string().regex(timeRegex, 'Başlangıç saati HH:MM formatında olmalıdır.').nullable().optional(),
    endTime: z.string().regex(timeRegex, 'Bitiş saati HH:MM formatında olmalıdır.').nullable().optional(),
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
    const collection = db.collection('time_offs');

    // GET: List recent time-off requests
    if (req.method === 'GET') {
        try {
            // Admin sees all, user sees own
            const query = user.role === 'admin' ? {} : { email: user.email };
            const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 200);

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

    // POST: Create new time-off request (server-side totalHours calculation)
    if (req.method === 'POST') {
        try {
            const validation = leavePostSchema.safeParse(req.body);
            if (!validation.success) {
                return res.status(400).json({
                    error: validation.error.issues?.[0]?.message || 'Eksik veya geçersiz bilgi gönderildi.'
                });
            }

            const { unit, dates, singleDate, startTime, endTime, description } = validation.data;

            let computedTotalHours = 0;
            let normalizedDates = [];
            let normalizedSingleDate = null;

            if (unit === 'daily') {
                const uniqueDateKeys = [...new Set((dates || []).map(d => d.slice(0, 10)))];
                if (uniqueDateKeys.length === 0) {
                    return res.status(400).json({ error: 'Lütfen en az bir gün seçiniz.' });
                }
                normalizedDates = uniqueDateKeys.map(d => new Date(d));
                if (normalizedDates.some(d => Number.isNaN(d.getTime()))) {
                    return res.status(400).json({ error: 'Seçilen tarihlerden biri geçersiz.' });
                }
                computedTotalHours = uniqueDateKeys.length * 8;
            } else {
                if (!singleDate || !startTime || !endTime) {
                    return res.status(400).json({ error: 'Saatlik izin için tarih ve saat aralığı zorunludur.' });
                }
                normalizedSingleDate = new Date(singleDate.slice(0, 10));
                if (Number.isNaN(normalizedSingleDate.getTime())) {
                    return res.status(400).json({ error: 'Geçersiz izin tarihi.' });
                }

                const [sh, sm] = startTime.split(':').map(Number);
                const [eh, em] = endTime.split(':').map(Number);
                const startMinutes = sh * 60 + sm;
                const endMinutes = eh * 60 + em;

                if (endMinutes <= startMinutes) {
                    return res.status(400).json({ error: 'Bitiş saati başlangıç saatinden sonra olmalıdır.' });
                }

                computedTotalHours = parseFloat(((endMinutes - startMinutes) / 60).toFixed(2));
            }

            if (computedTotalHours <= 0) {
                return res.status(400).json({ error: 'İzin süresi sıfırdan büyük olmalıdır.' });
            }

            const newTimeOff = {
                name: user.name,
                email: user.email,
                unit,
                dates: normalizedDates,
                singleDate: normalizedSingleDate,
                startTime: unit === 'hourly' ? startTime : null,
                endTime: unit === 'hourly' ? endTime : null,
                totalHours: computedTotalHours,
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
