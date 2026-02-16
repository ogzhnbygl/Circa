import { verifyUser } from '../lib/auth.js';
import { ObjectId } from 'mongodb';

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

    const { id } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'İzin ID gereklidir.' });
    }

    const { db } = user;
    const timeOffsCollection = db.collection('time_offs');
    const balancesCollection = db.collection('balances');

    try {
        const objectId = new ObjectId(id);

        // 1. Find the request
        const request = await timeOffsCollection.findOne({ _id: objectId });

        if (!request) {
            return res.status(404).json({ error: 'İzin talebi bulunamadı.' });
        }

        if (request.status === 'approved') {
            return res.status(400).json({ error: 'Bu izin zaten onaylanmış.' });
        }

        // 2. Update status
        await timeOffsCollection.updateOne(
            { _id: objectId },
            { $set: { status: 'approved', approvedAt: new Date(), approvedBy: user.email } }
        );

        // 3. Deduct from balance (Add negative record)
        const balanceEntry = {
            email: request.email,
            name: request.name,
            type: 'usage',
            totalHours: -1 * Math.abs(parseFloat(request.totalHours)), // Ensure negative
            requestId: objectId,
            processedAt: new Date(),
            description: `İzin Kullanımı: ${request.unit === 'daily' ? request.dates.length + ' Gün' : 'Saatlik'}`
        };

        await balancesCollection.insertOne(balanceEntry);

        return res.status(200).json({ message: 'İzin onaylandı ve bakiyeden düşüldü.' });

    } catch (error) {
        console.error('Approve TimeOff Error:', error);
        return res.status(500).json({ error: 'İşlem sırasında bir hata oluştu.' });
    }
}
