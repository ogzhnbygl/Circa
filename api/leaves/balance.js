import { verifyUser } from '../lib/auth.js';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    let user;
    try {
        user = await verifyUser(req);
    } catch (error) {
        return res.status(error.status || 401).json({ error: error.message });
    }

    const { db } = user;
    const balancesCollection = db.collection('balances');

    try {
        // Aggregate all balance records for this user
        // Positive records: Monthly shift accruals
        // Negative records: Leave usage
        const pipeline = [
            { $match: { email: user.email } },
            { $group: { _id: null, totalBalance: { $sum: '$totalHours' } } }
        ];

        const result = await balancesCollection.aggregate(pipeline).toArray();
        const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

        return res.status(200).json({
            totalBalance: parseFloat(totalBalance.toFixed(2)),
            currency: 'hours'
        });

    } catch (error) {
        console.error('Check Balance Error:', error);
        return res.status(500).json({ error: 'Bakiye sorgulanırken bir hata oluştu.' });
    }
}
