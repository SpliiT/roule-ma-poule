'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
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
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BikeAutocompleteProps {
    type: 'manufacturer' | 'model';
    manufacturer?: string;
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function BikeAutocomplete({
    type,
    manufacturer,
    value,
    onValueChange,
    placeholder,
    className,
}: BikeAutocompleteProps) {
    const [open, setOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(value || '');
    const [suggestions, setSuggestions] = useState<{ name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const fetchSuggestions = useCallback(async (query: string) => {
        const isModelWithManufacturer = type === 'model' && manufacturer;
        if (!isModelWithManufacturer && (!query || query.length < 2)) {
            setSuggestions([]);
            return;
        }

        setIsLoading(true);
        try {
            let url = `/api/bikes/search?type=${type}&query=${encodeURIComponent(query)}`;
            if (type === 'model' && manufacturer) {
                url += `&manufacturer=${encodeURIComponent(manufacturer)}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            if (data.suggestions) {
                setSuggestions(data.suggestions);
            } else if (data.bikes) {
                
                setSuggestions(data.bikes.map((b: any) => ({ name: b.name || b.manufacturer })));
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
        } finally {
            setIsLoading(false);
        }
    }, [type, manufacturer]);

    useEffect(() => {
        if (open && type === 'model' && manufacturer && searchTerm === '') {
            fetchSuggestions('');
        }
    }, [open, type, manufacturer, searchTerm, fetchSuggestions]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (searchTerm !== value) {
                
                const isModelWithManufacturer = type === 'model' && manufacturer;
                if (searchTerm.length >= 2 || (isModelWithManufacturer && searchTerm.length >= 0)) {
                    fetchSuggestions(searchTerm);
                }
            }
        }, 300);
        return () => clearTimeout(timeout);
    }, [searchTerm, fetchSuggestions, value, type, manufacturer]);

    return (
        <div className={cn("relative w-full", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                    >
                        {value ? value : placeholder}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                    <Command shouldFilter={false}>
                        <CommandInput
                            placeholder={`Rechercher ${type === 'manufacturer' ? 'une marque' : 'un modèle'}...`}
                            value={searchTerm}
                            onValueChange={setSearchTerm}
                        />
                        <CommandList>
                            {isLoading && (
                                <div className="flex items-center justify-center p-4">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                </div>
                            )}
                            {!isLoading && suggestions.length === 0 && searchTerm.length >= 2 && (
                                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                            )}
                            {!isLoading && suggestions.length === 0 && searchTerm.length < 2 && (
                                <div className="p-4 text-sm text-muted-foreground text-center">
                                    Tapez au moins 2 caractères...
                                </div>
                            )}
                            <CommandGroup>
                                {suggestions.map((suggestion) => (
                                    <CommandItem
                                        key={suggestion.name}
                                        value={suggestion.name}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue);
                                            setSearchTerm(currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === suggestion.name ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        {suggestion.name}
                                    </CommandItem>
                                ))}
                                {searchTerm && !suggestions.find(s => s.name.toLowerCase() === searchTerm.toLowerCase()) && (
                                    <CommandItem
                                        value={searchTerm}
                                        onSelect={(currentValue) => {
                                            onValueChange(currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                value === searchTerm ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        Utiliser "{searchTerm}"
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
    );
}
