'use client';
import { useState } from 'react';
import { Star, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface RatingModalProps {
    interventionId: string;
    isOpen: boolean;
    onClose: () => void;
}

export function RatingModal({ interventionId, isOpen, onClose }: RatingModalProps) {
    const queryClient = useQueryClient();
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');

    const mutation = useMutation({
        mutationFn: async () => {
            await axios.post(`/api/interventions/${interventionId}/rate`, {
                rating,
                ratingComment: comment,
            });
        },
        onSuccess: () => {
            toast.success('Merci pour votre avis !');
            queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
            onClose();
        },
        onError: () => {
            toast.error('Une erreur est survenue lors de l\'envoi de votre avis.');
        },
    });

    const handleSubmit = () => {
        if (rating === 0) {
            toast.error('Veuillez sélectionner une note.');
            return;
        }
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Évaluer la prestation</DialogTitle>
                    <DialogDescription>
                        Votre avis nous aide à améliorer nos services. Comment s'est passée votre intervention ?
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                    <div className="flex flex-col items-center gap-4">
                        <Label>Votre note</Label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    className="p-1 transition-transform active:scale-90"
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    onClick={() => setRating(star)}
                                >
                                    <Star
                                        className={cn(
                                            "h-8 w-8 transition-colors",
                                            (hoveredRating || rating) >= star
                                                ? "fill-primary text-primary"
                                                : "text-muted border-muted fill-none"
                                        )}
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="comment">Votre commentaire (optionnel)</Label>
                        <Textarea
                            id="comment"
                            placeholder="Dites-nous ce que vous avez particulièrement apprécié..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="resize-none"
                            rows={4}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Envoyer mon avis
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
