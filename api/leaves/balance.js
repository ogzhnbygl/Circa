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

    // Admins can query a specific staff member's balance (e.g. when generating leave petition PDFs)
    const requestedEmail = typeof req.query?.email === 'string' ? req.query.email.trim() : '';
    const targetEmail = (user.role === 'admin' && requestedEmail) ? requestedEmail : user.email;

    try {
        const pipeline = [
            { $match: { email: targetEmail } },
            { $group: { _id: null, totalBalance: { $sum: '$totalHours' } } }
        ];

        const result = await balancesCollection.aggregate(pipeline).toArray();
        const totalBalance = result.length > 0 ? result[0].totalBalance : 0;

        return res.status(200).json({
            email: targetEmail,
            totalBalance: parseFloat(totalBalance.toFixed(2)),
            currency: 'hours'
        });

    } catch (error) {
        console.error('Check Balance Error:', error);
        return res.status(500).json({ error: 'Bakiye sorgulanırken bir hata oluştu.' });
    }
}
