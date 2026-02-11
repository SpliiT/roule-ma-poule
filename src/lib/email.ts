import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

/**
 * Envoie un email via SMTP.
 */
export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        await transporter.sendMail({
            from: `"${process.env.NEXT_PUBLIC_APP_NAME || 'Roule Ma Poule'}" <${process.env.EMAIL_FROM}>`,
            to,
            subject,
            html,
        });
        console.log(`[Email] Envoyé à ${to}: ${subject}`);
    } catch (error) {
        console.error('[Email] Erreur envoi email:', error);
        // Ne pas throw pour ne pas bloquer le flow principal
    }
}

/**
 * Email de confirmation de réservation.
 */
export async function sendBookingConfirmation(intervention: {
    id: string;
    address: string;
    city: string;
    scheduledAt: Date;
    totalPrice: number | any;
    duration: number;
    client: { email: string; name: string };
    forfait: { name: string };
}) {
    const date = new Date(intervention.scheduledAt);
    const dateStr = date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    await sendEmail({
        to: intervention.client.email,
        subject: `Réservation confirmée — ${intervention.forfait.name}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #16a34a; margin: 0; font-size: 24px;">Réservation confirmée</h1>
                    </div>
                    <p style="color: #374151; font-size: 16px;">Bonjour <strong>${intervention.client.name}</strong>,</p>
                    <p style="color: #6b7280; font-size: 14px;">Votre intervention a bien été enregistrée. Voici le récapitulatif :</p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 20px 0;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Service</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${intervention.forfait.name}</td></tr>
                            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Date</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${dateStr}</td></tr>
                            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Heure</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${timeStr}</td></tr>
                            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Durée</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${intervention.duration} min</td></tr>
                            <tr><td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Adresse</td><td style="padding: 6px 0; text-align: right; font-weight: 600;">${intervention.address}, ${intervention.city}</td></tr>
                            <tr style="border-top: 1px solid #d1d5db;"><td style="padding: 10px 0 0; color: #374151; font-weight: 700;">Total</td><td style="padding: 10px 0 0; text-align: right; font-weight: 700; color: #16a34a; font-size: 18px;">${Number(intervention.totalPrice).toFixed(2)}€</td></tr>
                        </table>
                    </div>
                    <p style="color: #6b7280; font-size: 13px;">Le paiement s'effectuera directement sur place auprès du technicien.</p>
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #16a34a; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voir ma réservation</a>
                    </div>
                </div>
                <p style="text-align: center; color: #9ca3af; font-size: 11px; margin-top: 16px;">Roule Ma Poule — Réparation vélo à domicile</p>
            </div>
        `,
    });
}

/**
 * Email de changement de statut.
 */
export async function sendStatusUpdate(intervention: {
    id: string;
    status: string;
    client: { email: string; name: string };
    forfait: { name: string };
}) {
    const statusMessages: Record<string, { emoji: string; label: string; description: string }> = {
        CONFIRMED: { emoji: '', label: 'Confirmée', description: 'Un technicien a été assigné à votre intervention.' },
        IN_PROGRESS: { emoji: '', label: 'En cours', description: 'Le technicien est arrivé et travaille sur votre vélo.' },
        COMPLETED: { emoji: '', label: 'Terminée', description: 'Votre vélo a été réparé avec succès !' },
        CANCELLED: { emoji: '', label: 'Annulée', description: 'Votre intervention a été annulée.' },
    };

    const status = statusMessages[intervention.status];
    if (!status) return;

    await sendEmail({
        to: intervention.client.email,
        subject: `${status.emoji} Intervention ${status.label} — ${intervention.forfait.name}`,
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                    <h1 style="text-align: center; font-size: 24px; margin: 0 0 16px;">Intervention ${status.label}</h1>
                    <p style="color: #374151;">Bonjour <strong>${intervention.client.name}</strong>,</p>
                    <p style="color: #6b7280;">${status.description}</p>
                    <div style="text-align: center; margin-top: 24px;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600;">Voir le détail</a>
                    </div>
                </div>
            </div>
        `,
    });
}
