import { verifyUser } from '../lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    let user;
    try {
        user = await verifyUser(req);
        // Only admins or authorized users should check this, but it's harmless
    } catch (error) {
        return res.status(error.status || 401).json({ error: error.message });
    }

    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: 'Ay ve yıl bilgisi gereklidir.' });
    }

    const { db } = user;
    const balancesCollection = db.collection('balances');

    try {
        const monthStr = month.toString().padStart(2, '0');
        const period = `${year}-${monthStr}`;

        // Check if any balance record exists for this period
        const count = await balancesCollection.countDocuments({ period });
        const lastRecord = await balancesCollection.findOne({ period }, { sort: { processedAt: -1 } });

        return res.status(200).json({
            processed: count > 0,
            count,
            lastProcessedAt: lastRecord ? lastRecord.processedAt : null
        });

    } catch (error) {
        console.error('Check Report Status Error:', error);
        return res.status(500).json({ error: 'Durum kontrolü sırasında hata oluştu.' });
    }
}
