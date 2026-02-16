import { verifyUser } from '../lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    let user;
    try {
        user = await verifyUser(req);
        if (user.role !== 'admin') {
            return res.status(403).json({ error: 'Bu işlem için yetkiniz yok.' });
        }
    } catch (error) {
        return res.status(error.status || 401).json({ error: error.message });
    }

    const { month, year } = req.body;

    if (!month || !year) {
        return res.status(400).json({ error: 'Ay ve yıl bilgisi gereklidir.' });
    }

    const { db } = user;
    const shiftsCollection = db.collection('shifts');
    const balancesCollection = db.collection('balances');

    try {
        // 1. Fetch shifts for the month
        // Construct regex for string date "YYYY-MM"
        // Note: verifyUser ensures that we are connected to the correct DB
        const monthStr = month.toString().padStart(2, '0');
        const datePattern = `^${year}-${monthStr}`;
        const query = { date: { $regex: datePattern } };

        const shifts = await shiftsCollection.find(query).toArray();

        // 2. Calculate hours per user
        const userBalances = {}; // { email: { totalHours: 0, details: [] } }

        shifts.forEach(shift => {
            if (!shift.startTime || !shift.endTime) return;

            const start = new Date(`1970-01-01T${shift.startTime}:00`);
            const end = new Date(`1970-01-01T${shift.endTime}:00`);
            let hours = (end - start) / (1000 * 60 * 60);

            if (hours < 0) hours += 24; // Handle overnight shifts if necessary (simple case)

            let multiplier = 1.0;
            if (shift.shiftType === 'weekend') multiplier = 1.5;
            else if (shift.shiftType === 'holiday') multiplier = 2.0;

            const weightedHours = hours * multiplier;

            if (!userBalances[shift.email]) {
                userBalances[shift.email] = {
                    name: shift.name,
                    email: shift.email,
                    totalHours: 0,
                    processedAt: new Date(),
                    period: `${year}-${monthStr}`
                };
            }

            userBalances[shift.email].totalHours += weightedHours;
        });

        // 3. Update balances collection
        const bulkOps = Object.values(userBalances).map(balance => ({
            updateOne: {
                filter: { email: balance.email, period: balance.period },
                update: { $set: balance },
                upsert: true
            }
        }));

        if (bulkOps.length > 0) {
            await balancesCollection.bulkWrite(bulkOps);
        }

        return res.status(200).json({
            message: 'Mesailer başarıyla işlendi.',
            processedCount: bulkOps.length,
            details: Object.values(userBalances)
        });

    } catch (error) {
        console.error('Process Monthly Shifts Error:', error);
        return res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
    }
}
