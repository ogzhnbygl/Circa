import { verifyUser } from '../lib/auth.js';

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
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0, 23, 59, 59, 999);

                // Add date range to query (assuming 'date' field stores the shift date/time as string or Date)
                // Note: If 'date' is stored as a string (YYYY-MM-DD...), we might need regex or convert to Date object in DB
                // Based on previous code, 'date' seems to be the main field. 
                // However, MongoDB usually stores dates as ISODate. 
                // Let's assume standard string comparison works if strict ISO or let's try to query by range.
                // Re-checking the POST handler: "date" comes from body. It's likely a string from the frontend.
                // If it's saved as string, we should match by string prefix like "YYYY-MM"

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
