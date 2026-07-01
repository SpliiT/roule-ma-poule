import { ConfirmModal } from '@/components/ui/confirm-modal';

interface Props {
    zoneToDelete: any;
    onClose: () => void;
    onConfirm: (id: string) => void;
}

export function ZoneDeleteModal({ zoneToDelete, onClose, onConfirm }: Props) {
    if (!zoneToDelete) return null;

    const futureInterventionsCount = zoneToDelete._count?.interventions || 0;
    const isDangerous = futureInterventionsCount > 0;

    return (
        <ConfirmModal
            isOpen={!!zoneToDelete}
            onClose={onClose}
            onConfirm={() => onConfirm(zoneToDelete.id)}
            title={isDangerous ? "⚠️ Attention : Annulation d'interventions" : "Supprimer la zone"}
            description={
                isDangerous
                    ? `${futureInterventionsCount} intervention(s) future(s) prévue(s) dans cette zone. Si vous supprimez cette zone, elles seront annulées et les clients seront notifiés. Voulez-vous continuer ?`
                    : `Êtes-vous sûr de vouloir supprimer la zone "${zoneToDelete?.name}" ? Cette action est irréversible.`
            }
            confirmText={isDangerous ? "Supprimer et annuler" : "Supprimer"}
        />
    );
}
