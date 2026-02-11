import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type Bike, type BikeType } from '@/types/bikes';
import { Bike as BikeIcon, Zap, Settings2, Trash2 } from 'lucide-react';
interface BikeCardProps {
    bike: Bike;
    onEdit?: (bike: Bike) => void;
    onDelete?: (id: string) => void;
    isSelectable?: boolean;
    onSelect?: (bike: Bike) => void;
    isSelected?: boolean;
}
const bikeTypeLabels: Record<BikeType, string> = {
    CITY: 'Urbain',
    VTT: 'VTT',
    ROAD: 'Route',
    GRAVEL: 'Gravel',
    BMX: 'BMX',
    CARGO: 'Cargo',
    FOLDING: 'Pliant',
    OTHER: 'Autre',
};
export function BikeCard({
    bike,
    onEdit,
    onDelete,
    isSelectable,
    onSelect,
    isSelected
}: BikeCardProps) {
    return (
        <Card
            className={`relative overflow-hidden transition-all duration-200 ${isSelectable ? 'cursor-pointer hover:border-primary/50' : ''
                } ${isSelected ? 'border-primary ring-1 ring-primary' : ''}`}
            onClick={() => isSelectable && onSelect?.(bike)}
        >
            <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary overflow-hidden">
                    {bike.photoUrl ? (
                        <img src={bike.photoUrl} alt={bike.brand} className="h-full w-full object-cover" />
                    ) : (
                        <BikeIcon className="h-6 w-6" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden">
                    <CardTitle className="truncate text-lg">
                        {bike.brand} {bike.model}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                            {bikeTypeLabels[bike.type]}
                        </Badge>
                        {bike.isElectric && (
                            <Badge variant="success" className="gap-1 px-1.5 py-0">
                                <Zap className="h-3 w-3 fill-current" />
                                <span className="text-[10px]">Électrique</span>
                            </Badge>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pb-4 pt-2">
                {bike.year && (
                    <p className="text-sm text-muted-foreground">
                        Année : <span className="text-foreground font-medium">{bike.year}</span>
                    </p>
                )}
            </CardContent>
            {!isSelectable && (
                <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.(bike);
                        }}
                    >
                        <Settings2 className="h-3.5 w-3.5" />
                        Modifier
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 gap-1.5"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.(bike.id);
                        }}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Supprimer
                    </Button>
                </CardFooter>
            )}
            {isSelected && (
                <div className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary ring-4 ring-primary/20" />
            )}
        </Card>
    );
}