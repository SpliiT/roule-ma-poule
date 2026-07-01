import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface Props {
    stats: any;
    statusLabels: Record<string, { label: string; color: string; dot: string }>;
}

export function StatusBreakdown({ stats, statusLabels }: Props) {
    return (
        <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">Répartition Opérationnelle</CardTitle>
                    <Badge variant="outline" className="font-black italic uppercase text-[10px] border-white/20 text-neutral-400">Par Statut</Badge>
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {stats?.byStatus?.length > 0 ? (
                    <div className="space-y-6">
                        {stats.byStatus.map((s: any) => {
                            const config = statusLabels[s.status] || { label: s.status, color: 'bg-neutral-100 text-neutral-600 border-neutral-200', dot: 'bg-neutral-400' };
                            const pct = stats.totalInterventions > 0
                                ? Math.round((s.count / stats.totalInterventions) * 100)
                                : 0;
                            return (
                                <div key={s.status} className="space-y-2 group/status">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`h-2 w-2 rounded-full ${config.dot}`} />
                                            <span className="text-sm font-black italic uppercase tracking-tighter text-white">{config.label}</span>
                                        </div>
                                        <span className="text-sm font-black italic text-neutral-400 group-hover/status:text-primary transition-colors">{s.count} <span className="text-[10px] uppercase not-italic opacity-60">missions</span></span>
                                    </div>
                                    <div className="relative h-3 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`absolute inset-y-0 left-0 bg-primary rounded-full transition-all duration-1000 ease-out group-hover/status:bg-primary/80`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-300">
                        <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                        <p className="font-black italic uppercase tracking-widest">Aucune donnée</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
