import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface Props {
    stats: any;
}

export function ZoneBreakdown({ stats }: Props) {
    return (
        <Card className="border border-white/10 shadow-xl bg-neutral-900/50 backdrop-blur-sm rounded-[2.5rem] overflow-hidden">
            <CardHeader className="bg-white/5 border-b border-white/10 p-8">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black italic uppercase tracking-tight text-white">Secteurs Géographiques</CardTitle>
                    <MapPin className="h-5 w-5 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="p-8">
                {stats?.byZone?.length > 0 ? (
                    <div className="grid gap-4">
                        {stats.byZone.map((z: any) => (
                            <div key={z.zoneId} className="group rounded-2xl bg-white/5 p-4 border border-white/10 hover:border-primary/30 hover:bg-white/10 transition-all flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                                        <MapPin className="h-5 w-5 text-neutral-400 group-hover:text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase text-sm text-white">{z.zoneName}</h4>
                                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Zone de couverture active</p>
                                    </div>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-none font-black italic uppercase px-3 py-1 text-[10px]">
                                    {z.count}
                                </Badge>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-300">
                        <MapPin className="h-12 w-12 mb-2 opacity-20" />
                        <p className="font-black italic uppercase tracking-widest">Zone vierge</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
