'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Check, ChevronsUpDown, Loader2, Search, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BikeType } from '@/types/bikes';

interface BikeSearchResult {
    id: string | number;
    brand: string;
    model: string;
    year: number | null;
    image: string | null;
    type: BikeType; 
    isElectric: boolean;
    isLocal?: boolean;
}

interface BikeSearchProps {
    onSelect: (bike: {
        brand: string;
        model: string;
        year: number | null;
        type: BikeType;
        isElectric: boolean;
        photoUrl: string | null;
    }) => void;
    className?: string;
}

export function BikeSearch({ onSelect, className }: BikeSearchProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<BikeSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchBikes = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setResults([]);
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch(`/api/bikes/search?type=model&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.suggestions) {
                setResults(data.suggestions);
            }
        } catch (error) {
            console.error('Error searching bikes:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm) {
                fetchBikes(searchTerm);
            }
        }, 400);
        return () => clearTimeout(timeout);
    }, [searchTerm, fetchBikes]);

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between h-12 text-lg font-medium border-2 hover:border-primary transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-muted-foreground" />
                            {searchTerm ? searchTerm : "Rechercher mon vélo (Marque, Modèle...)"}
                        </div>
                        <ChevronsUpDown className="ml-2 h-5 w-5 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[calc(100vw-3rem)] sm:w-[500px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder="Ex: Specialized Sirrus, Decathlon Rockrider..."
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList className="max-h-[400px]">
                            {isLoading && (
                                <div className="flex items-center justify-center p-8">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <span className="ml-2 text-muted-foreground">Recherche sur BikeIndex...</span>
                                </div>
                            )}
                            {!isLoading && results.length === 0 && searchTerm.length >= 3 && (
                                <CommandEmpty>
                                    <div className="flex items-center justify-center p-8 text-center">
                                        <div className="flex flex-col gap-2">
                                            <p className="text-muted-foreground font-medium">Aucun vélo trouvé correspondant à "{searchTerm}".</p>
                                            <Button
                                                variant="link"
                                                size="sm"
                                                onClick={() => {
                                                    onSelect({
                                                        brand: searchTerm.split(' ')[0] || '',
                                                        model: searchTerm.split(' ').slice(1).join(' ') || searchTerm,
                                                        year: null,
                                                        type: 'OTHER',
                                                        isElectric: false,
                                                        photoUrl: null,
                                                    });
                                                    setOpen(false);
                                                }}
                                            >
                                                Utiliser quand même "{searchTerm}"
                                            </Button>
                                        </div>
                                    </div>
                                </CommandEmpty>
                            )}
                            {!isLoading && searchTerm.length < 3 && (
                                <div className="p-8 text-sm text-muted-foreground text-center">
                                    Commencez à taper la marque et le modèle...
                                </div>
                            )}
                            <CommandGroup heading={results.length > 0 ? "Suggestions trouvées" : ""}>
                                {results.map((bike) => (
                                    <CommandItem
                                        key={bike.id}
                                        value={`${bike.brand} ${bike.model} ${bike.id}`}
                                        onSelect={() => {
                                            onSelect({
                                                brand: bike.brand,
                                                model: bike.model,
                                                year: bike.year,
                                                type: bike.type,
                                                isElectric: bike.isElectric,
                                                photoUrl: bike.image,
                                            });
                                            setSearchTerm(`${bike.brand} ${bike.model}`);
                                            setOpen(false);
                                        }}
                                        className="flex items-center gap-3 p-3 cursor-pointer"
                                    >
                                        <div className="h-12 w-12 rounded border bg-muted flex-shrink-0 overflow-hidden flex items-center justify-center relative">
                                            {bike.image ? (
                                                <img src={bike.image} alt={bike.model} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                    <Search className="h-4 w-4 opacity-20" />
                                                    <span className="text-[8px] uppercase font-bold opacity-40">No Photo</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-sm truncate">{bike.brand}</span>
                                                {bike.isElectric && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded flex items-center gap-1 font-bold uppercase">
                                                        <Zap className="h-3 w-3" /> Elec
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground truncate">
                                                {bike.model} {bike.year ? `(${bike.year})` : ''}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded italic">
                                                {bike.type.replace('_', ' ')}
                                            </span>
                                            {bike.isLocal && (
                                                <span className="text-[9px] text-primary font-medium">Déjà utilisé</span>
                                            )}
                                        </div>
                                    </CommandItem>
                                ))}
                            </CommandGroup>

                            {searchTerm.length >= 3 && !results.some(r => `${r.brand} ${r.model}`.toLowerCase() === searchTerm.toLowerCase()) && (
                                <CommandGroup heading="Autre option">
                                    <CommandItem
                                        onSelect={() => {
                                            onSelect({
                                                brand: searchTerm.split(' ')[0] || '',
                                                model: searchTerm.split(' ').slice(1).join(' ') || searchTerm,
                                                year: null,
                                                type: 'OTHER',
                                                isElectric: false,
                                                photoUrl: null,
                                            });
                                            setOpen(false);
                                        }}
                                        className="p-3 cursor-pointer"
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Ajouter "{searchTerm}"</span>
                                            <span className="text-xs text-muted-foreground text-italic">Saisie manuelle</span>
                                        </div>
                                    </CommandItem>
                                </CommandGroup>
                            )}
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover >
        </div >
    );
}
