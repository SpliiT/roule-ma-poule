'use client';

import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface GoogleAddressAutocompleteProps {
    /**
     * Callback appelé lors de la sélection d'une adresse validée.
     */
    onAddressSelect: (address: {
        street: string;
        city: string;
        postalCode: string;
        latitude: number;
        longitude: number;
    }) => void;
    /**
     * Valeur par défaut pour l'input.
     */
    defaultValue?: string;
    /**
     * Classes CSS additionnelles pour l'input.
     */
    className?: string;
}

/**
 * Composant d'autocomplétion d'adresse utilisant l'API Google Maps Places.
 * Permet une validation robuste de l'adresse et récupère les coordonnées GPS.
 */
export function GoogleAddressAutocomplete({
    onAddressSelect,
    defaultValue = '',
    className
}: GoogleAddressAutocompleteProps) {
    const [inputValue, setInputValue] = useState(defaultValue);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isValidated, setIsValidated] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [showPredictions, setShowPredictions] = useState(false);

    const autocompleteSuggestionRef = useRef<any>(null);
    const sessionTokenRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const onAddressSelectRef = useRef(onAddressSelect);
    useEffect(() => {
        onAddressSelectRef.current = onAddressSelect;
    }, [onAddressSelect]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setShowPredictions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';
        if (!apiKey || apiKey.includes('XXXXX')) return;

        setOptions({
            key: apiKey,
            v: 'weekly',
            language: 'fr',
        });

        const initGoogle = async () => {
            try {
                const { AutocompleteSuggestion, AutocompleteSessionToken } = await importLibrary('places') as any;
                autocompleteSuggestionRef.current = AutocompleteSuggestion; // On garde la classe pour les méthodes statiques
                sessionTokenRef.current = new AutocompleteSessionToken();
                console.log('Google Places API (New) fully loaded');
                setIsLoaded(true);
            } catch (err) {
                console.error('Failed to init Google Places New:', err);
            }
        };

        initGoogle();
    }, []);

    const fetchPredictions = async (input: string) => {
        if (!input || input.length < 2 || !autocompleteSuggestionRef.current) {
            setPredictions([]);
            return;
        }

        try {
            const request = {
                input,
                sessionToken: sessionTokenRef.current,
                locationRestriction: {
                    north: 45.81,
                    south: 45.73,
                    east: 4.93,
                    west: 4.79,
                },
                includedRegionCodes: ['fr']
            };

            // Méthode statique de l'API New (AutocompleteSuggestion.fetchAutocompleteSuggestions)
            const { suggestions } = await autocompleteSuggestionRef.current.fetchAutocompleteSuggestions(request);
            setPredictions(suggestions || []);
            setShowPredictions(true);
        } catch (err) {
            console.error('Error fetching predictions via New API:', err);
            setPredictions([]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setInputValue(val);
        setIsValidated(false);
        fetchPredictions(val);
    };

    const handleSelectPrediction = async (suggestion: any) => {
        const place = suggestion.placePrediction?.toPlace();
        if (!place) return;

        setIsSearching(true);
        setShowPredictions(false);
        setInputValue(suggestion.placePrediction?.text?.text || '');

        try {
            console.log('Fetching details for:', place.id);
            await place.fetchFields({
                fields: ['addressComponents', 'location', 'formattedAddress', 'displayName']
            });

            const components = place.addressComponents || [];
            let streetNumber = '';
            let route = '';
            let city = '';
            let postalCode = '';

            components.forEach((component: any) => {
                const types = component.types;
                if (types.includes('street_number')) streetNumber = component.longText;
                if (types.includes('route')) route = component.longText;
                if (types.includes('locality')) city = component.longText;
                if (types.includes('postal_code')) postalCode = component.longText;
            });

            const streetFromComponents = `${streetNumber} ${route}`.trim();
            const name = place.displayName || '';
            const streetValue = streetFromComponents || name || (place.formattedAddress?.split(',')[0].trim()) || '';

            const details = {
                street: streetValue,
                city: city || 'Lyon',
                postalCode: postalCode || '69000',
                latitude: place.location?.lat() || 0,
                longitude: place.location?.lng() || 0,
            };

            console.log('Address validated manually (Truly New API):', details);
            setInputValue(place.formattedAddress || streetValue);
            setIsValidated(true);
            onAddressSelectRef.current(details);

            const { AutocompleteSessionToken } = await importLibrary('places') as any;
            sessionTokenRef.current = new AutocompleteSessionToken();
        } catch (err) {
            console.error('Error fetching place details:', err);
            toast.error('Erreur lors de la récupération des détails de l\'adresse');
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <div ref={containerRef} className="relative w-full space-y-1">
            <div className="relative">
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={() => predictions.length > 0 && setShowPredictions(true)}
                    placeholder={isLoaded ? "Rechercher une adresse à Lyon..." : "Chargement..."}
                    className={`${className} pl-9 pr-12`}
                    disabled={!isLoaded || isSearching}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />

                {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}

                {!isSearching && isValidated && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                    </div>
                )}
            </div>

            {/* Liste des prédictions */}
            {showPredictions && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-auto overflow-x-hidden py-1">
                    {predictions.map((p, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => handleSelectPrediction(p)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors flex flex-col gap-0.5"
                        >
                            <span className="font-medium truncate">
                                {p.placePrediction?.text?.text || 'Adresse inconnue'}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            {isValidated && (
                <div className="flex items-center gap-1.5 text-[10px] text-green-500 font-medium px-1">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    Lieu validé par le système
                </div>
            )}
            {!isValidated && isLoaded && !isSearching && (
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1 italic">
                    <Search className="h-2.5 w-2.5" />
                    Taper un nom (ex: "Zoï") et cliquer sur le résultat
                </div>
            )}
        </div>
    );
}
