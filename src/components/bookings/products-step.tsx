'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Package, Plus, Minus, Loader2 } from 'lucide-react';
interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    stock: number;
    category: string | null;
    imageUrl?: string | null;
}
interface SelectedProduct {
    productId: string;
    quantity: number;
    name: string;
    price: number;
}
interface ProductsStepProps {
    onNext: (products: SelectedProduct[]) => void;
    onBack: () => void;
    selectedProducts?: SelectedProduct[];
}
export function ProductsStep({ onNext, onBack, selectedProducts = [] }: ProductsStepProps) {
    const [selected, setSelected] = useState<SelectedProduct[]>(selectedProducts);
    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products-for-booking'],
        queryFn: async () => {
            const { data } = await axios.get('/api/products');
            return (data.data || []).filter((p: Product) => p.stock > 0);
        },
    });
    function addProduct(product: Product) {
        const existing = selected.find(p => p.productId === product.id);
        if (existing) {
            setSelected(selected.map(p =>
                p.productId === product.id
                    ? { ...p, quantity: Math.min(p.quantity + 1, product.stock) }
                    : p
            ));
        } else {
            setSelected([...selected, {
                productId: product.id,
                quantity: 1,
                name: product.name,
                price: Number(product.price),
            }]);
        }
    }
    function removeProduct(productId: string) {
        const existing = selected.find(p => p.productId === productId);
        if (existing && existing.quantity > 1) {
            setSelected(selected.map(p =>
                p.productId === productId ? { ...p, quantity: p.quantity - 1 } : p
            ));
        } else {
            setSelected(selected.filter(p => p.productId !== productId));
        }
    }
    function getQuantity(productId: string): number {
        return selected.find(p => p.productId === productId)?.quantity || 0;
    }
    const total = selected.reduce((sum, p) => sum + p.price * p.quantity, 0);
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-2 border-b pb-4">
                <Package className="text-primary h-5 w-5" />
                <h2 className="text-xl font-semibold">Produits additionnels</h2>
            </div>
            <p className="text-muted-foreground text-sm">
                Besoin de pièces de rechange ? Ajoutez-les à votre commande. <strong>Optionnel</strong> — vous pouvez passer cette étape.
            </p>
            {isLoading ? (
                <div className="flex h-32 items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
            ) : products.length === 0 ? (
                <div className="bg-muted flex h-32 items-center justify-center rounded-lg border border-dashed">
                    <p className="text-muted-foreground text-sm">Aucun produit disponible actuellement</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {products.map((product: Product) => {
                        const qty = getQuantity(product.id);
                        return (
                            <Card key={product.id} className={`transition-colors min-w-0 ${qty > 0 ? 'border-primary/50 bg-primary/5' : ''}`}>
                                <CardContent className="flex items-center justify-between p-4">
                                    <div className="flex-1 min-w-0 flex items-center gap-4">
                                        {product.imageUrl && (
                                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
                                                <img 
                                                    src={product.imageUrl} 
                                                    alt={product.name} 
                                                    className="absolute inset-0 h-full w-full object-cover text-transparent" 
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                        )}
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm truncate">{product.name}</p>
                                                {product.category && (
                                                    <Badge variant="outline" className="text-[10px]">{product.category}</Badge>
                                                )}
                                            </div>
                                            {product.description && (
                                                <p className="text-xs text-muted-foreground truncate mt-0.5">{product.description}</p>
                                            )}
                                            <p className="text-sm font-semibold text-primary mt-1">
                                                {Number(product.price).toFixed(2)}€
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {qty > 0 ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => removeProduct(product.id)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-6 text-center font-semibold text-sm">{qty}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() => addProduct(product)}
                                                    disabled={qty >= product.stock}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </>
                                        ) : (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="gap-1"
                                                onClick={() => addProduct(product)}
                                            >
                                                <Plus className="h-3 w-3" />
                                                Ajouter
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
            {selected.length > 0 && (
                <div className="bg-muted/50 rounded-lg border p-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                            {selected.reduce((sum, p) => sum + p.quantity, 0)} produit(s) ajouté(s)
                        </span>
                        <span className="font-bold text-primary">+{total.toFixed(2)}€</span>
                    </div>
                </div>
            )}
            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={onBack} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Précédent
                </Button>
                <Button onClick={() => onNext(selected)} className="gap-2">
                    {selected.length > 0 ? 'Suivant' : 'Passer cette étape'}
                </Button>
            </div>
        </div>
    );
}