'use client';
import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArrowLeft, Clock, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import axios from 'axios';
interface Slot {
    start: string;
    end: string;
    available: boolean;
}
interface ScheduleStepProps {
    onNext: (date: Date, slot: string) => void;
    onBack: () => void;
    zoneId?: string;
    duration?: number;
}
export function ScheduleStep({ onNext, onBack, zoneId, duration = 60 }: ScheduleStepProps) {
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [slot, setSlot] = useState<string>('');
    const [slots, setSlots] = useState<Slot[]>([]);
    const [loading, setLoading] = useState(false);
    useEffect(() => {
        if (!date) {
            setSlots([]);
            setSlot('');
            return;
        }
        const dateStr = format(date, 'yyyy-MM-dd');
        setLoading(true);
        setSlot('');
        const params = new URLSearchParams({ date: dateStr, duration: String(duration) });
        if (zoneId) params.append('zoneId', zoneId);
        axios.get(`/api/bookings/slots?${params}`)
            .then(({ data }) => setSlots(data.data || []))
            .catch(() => setSlots([]))
            .finally(() => setLoading(false));
    }, [date, zoneId, duration]);
    const handleNext = () => {
        if (date && slot) {
            onNext(date, slot);
        }
    };
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
                <CalendarIcon className="text-primary h-5 w-5" />
                <h2 className="text-xl font-semibold">Quand souhaitez-vous l'intervention ?</h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <div className="flex flex-col items-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border shadow"
                        disabled={(d) => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            return d < today || d.getDay() === 0;
                        }}
                        locale={fr}
                    />
                </div>
                <div className="space-y-4">
                    <label className="text-sm font-medium">Créneaux disponibles</label>
                    {!date ? (
                        <div className="bg-muted flex h-32 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-muted-foreground text-sm">Sélectionnez une date d'abord</p>
                        </div>
                    ) : loading ? (
                        <div className="flex h-32 items-center justify-center">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="bg-muted flex h-32 items-center justify-center rounded-lg border border-dashed">
                            <p className="text-muted-foreground text-sm">Aucun créneau disponible ce jour</p>
                        </div>
                    ) : (
                        <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                {slots.map((s) => {
                                    const label = `${s.start}`;
                                    const isSelected = slot === s.start;
                                    return (
                                        <Button
                                            key={s.start}
                                            variant={isSelected ? 'default' : 'outline'}
                                            className={cn(
                                                "h-10 text-sm font-medium transition-all",
                                                isSelected ? "border-primary" : "hover:border-primary/50"
                                            )}
                                            disabled={!s.available}
                                            onClick={() => setSlot(s.start)}
                                        >
                                            <div className="flex flex-col items-center leading-tight">
                                                <span>{s.start}</span>
                                                {!s.available && <span className="text-[8px] uppercase font-bold opacity-50">Complet</span>}
                                            </div>
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-primary/5 flex items-start gap-3 rounded-lg border border-primary/20 p-4">
                <Clock className="text-primary mt-0.5 h-5 w-5" />
                <div>
                    <p className="font-semibold text-primary">Intervention Express</p>
                    <p className="text-muted-foreground text-xs">
                        Nos techniciens interviennent chez vous dans un créneau d'une heure.
                        Veuillez être présent au début du créneau choisi.
                    </p>
                </div>
            </div>
            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                </Button>
                <Button onClick={handleNext} disabled={!date || !slot} className="gap-2">
                    Suivant
                </Button>
            </div>
        </div>
    );
}
