import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Activity, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Props {
    stats: any;
    statusLabels: Record<string, { label: string; color: string; dot: string }>;
}

export function RecentInterventions({ stats, statusLabels }: Props) {
    return (
        <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8 flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-black italic uppercase tracking-tight text-white">Opérations Récentes</CardTitle>
                    <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1 italic">Dernières 48 heures d'activité</p>
                </div>
                <Button variant="outline" className="border-2 border-white/10 text-white font-black italic uppercase text-xs rounded-xl hover:bg-white/10 group/all">
                    Voir tout <ChevronRight className="ml-2 h-4 w-4 group-hover/all:translate-x-1 transition-transform" />
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                {stats?.recentInterventions?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-white/5 border-b border-white/10">
                                <tr className="text-left text-[10px] font-black uppercase tracking-widest text-neutral-400 italic">
                                    <th className="px-8 py-5">Date & Heure</th>
                                    <th className="px-8 py-5">Client</th>
                                    <th className="px-8 py-5">Prestation</th>
                                    <th className="px-8 py-5">Expert</th>
                                    <th className="px-8 py-5 text-right">Statut</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentInterventions.map((i: any) => {
                                    const statusConfig = statusLabels[i.status] || { label: i.status, color: 'bg-neutral-100 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' };
                                    return (
                                        <tr key={i.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-5 font-bold text-white group-hover:text-primary transition-colors">
                                                {format(new Date(i.scheduledAt), 'dd/MM/yy', { locale: fr })}
                                                <span className="ml-2 text-[10px] font-black italic text-neutral-500">{format(new Date(i.scheduledAt), 'HH:mm')}</span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
                                                        <User className="h-4 w-4 text-neutral-400" />
                                                    </div>
                                                    <span className="font-bold text-neutral-300">{i.client?.name || 'Inconnu'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 font-black italic uppercase text-xs tracking-tight text-white">{i.forfait?.name || '—'}</td>
                                            <td className="px-8 py-5">
                                                {i.technician ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                                        <span className="font-semibold text-neutral-400">{i.technician.name}</span>
                                                    </div>
                                                ) : (
                                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest text-neutral-400 bg-neutral-50 border-neutral-200">En attente</Badge>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <Badge className={`${statusConfig.color} font-black italic uppercase text-[9px] tracking-tight border px-2 py-0.5`}>
                                                    {statusConfig.label}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center text-neutral-200">
                        <Activity className="h-16 w-16 mb-4 opacity-10" />
                        <p className="font-black italic uppercase tracking-widest">Le tarmac est désert</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
