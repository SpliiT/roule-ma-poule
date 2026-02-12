import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { sendPushNotification } from '@/lib/push';

export async function POST() {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
        }

        console.log('API Push Test: Sending test notification for user', user.id);

        await sendPushNotification(user.id, {
            title: 'Test Roule Ma Poule 🐣',
            body: 'Si vous voyez ce message, vos notifications fonctionnent parfaitement !',
            data: {
                url: '/profile'
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('API Push Test Error:', error);
        return NextResponse.json({ error: 'Erreur lors de l\'envoi du test' }, { status: 500 });
    }
}
