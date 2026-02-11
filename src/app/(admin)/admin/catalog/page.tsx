'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
    Tag, Plus, Package, Wrench, MoreVertical, CheckCircle2,
    Edit, Archive, Loader2, Clock, Euro
} from 'lucide-react';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';
interface Forfait {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number | string;
    isActive: boolean;
}
interface Product {
    id: string;
    name: string;
    description: string | null;
    price: number | string;
    stock: number;
    category: string | null;
    imageUrl: string | null;
    isActive: boolean;
}
export default function AdminCatalogPage() {
    const queryClient = useQueryClient();
    const [forfaitDialogOpen, setForfaitDialogOpen] = useState(false);
    const [productDialogOpen, setProductDialogOpen] = useState(false);
    const [editingForfait, setEditingForfait] = useState<Forfait | null>(null);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [forfaitName, setForfaitName] = useState('');
    const [forfaitDescription, setForfaitDescription] = useState('');
    const [forfaitDuration, setForfaitDuration] = useState('60');
    const [forfaitPrice, setForfaitPrice] = useState('');
    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productStock, setProductStock] = useState('0');
    const [productCategory, setProductCategory] = useState('');
    const [productImageUrl, setProductImageUrl] = useState('');
    const { data: forfaits = [], isLoading: forfaitsLoading } = useQuery({
        queryKey: ['admin-forfaits-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/forfaits');
            return data.data;
        },
    });
    const { data: products = [], isLoading: productsLoading } = useQuery({
        queryKey: ['admin-products-list'],
        queryFn: async () => {
            const { data } = await axios.get('/api/admin/products');
            return data.data;
        },
    });
    const createForfait = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await axios.post('/api/forfaits', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forfaits-list'] });
            toast.success('Forfait créé avec succès');
            closeForfaitDialog();
        },
        onError: () => toast.error('Erreur lors de la création du forfait'),
    });
    const updateForfait = useMutation({
        mutationFn: async ({ id, ...payload }: any) => {
            const { data } = await axios.patch(`/api/admin/forfaits/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forfaits-list'] });
            toast.success('Forfait mis à jour');
            closeForfaitDialog();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });
    const archiveForfait = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/admin/forfaits/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-forfaits-list'] });
            toast.success('Forfait archivé');
        },
        onError: () => toast.error('Erreur lors de l\'archivage'),
    });
    const createProduct = useMutation({
        mutationFn: async (payload: any) => {
            const { data } = await axios.post('/api/admin/products', payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
            toast.success('Produit créé avec succès');
            closeProductDialog();
        },
        onError: () => toast.error('Erreur lors de la création du produit'),
    });
    const updateProduct = useMutation({
        mutationFn: async ({ id, ...payload }: any) => {
            const { data } = await axios.patch(`/api/admin/products/${id}`, payload);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
            toast.success('Produit mis à jour');
            closeProductDialog();
        },
        onError: () => toast.error('Erreur lors de la mise à jour'),
    });
    const archiveProduct = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/admin/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-products-list'] });
            toast.success('Produit archivé');
        },
        onError: () => toast.error('Erreur lors de l\'archivage'),
    });
    function openForfaitDialog(f?: Forfait) {
        if (f) {
            setEditingForfait(f);
            setForfaitName(f.name);
            setForfaitDescription(f.description);
            setForfaitDuration(String(f.duration));
            setForfaitPrice(String(f.price));
        } else {
            setEditingForfait(null);
            setForfaitName('');
            setForfaitDescription('');
            setForfaitDuration('60');
            setForfaitPrice('');
        }
        setForfaitDialogOpen(true);
    }
    function closeForfaitDialog() {
        setForfaitDialogOpen(false);
        setEditingForfait(null);
    }
    function openProductDialog(p?: Product) {
        if (p) {
            setEditingProduct(p);
            setProductName(p.name);
            setProductDescription(p.description || '');
            setProductPrice(String(p.price));
            setProductStock(String(p.stock));
            setProductCategory(p.category || '');
            setProductImageUrl(p.imageUrl || '');
        } else {
            setEditingProduct(null);
            setProductName('');
            setProductDescription('');
            setProductPrice('');
            setProductStock('0');
            setProductCategory('');
            setProductImageUrl('');
        }
        setProductDialogOpen(true);
    }
    function closeProductDialog() {
        setProductDialogOpen(false);
        setEditingProduct(null);
    }
    function handleForfaitSubmit() {
        const payload = {
            name: forfaitName,
            description: forfaitDescription,
            duration: parseInt(forfaitDuration),
            price: parseFloat(forfaitPrice),
        };
        if (editingForfait) {
            updateForfait.mutate({ id: editingForfait.id, ...payload });
        } else {
            createForfait.mutate(payload);
        }
    }
    function handleProductSubmit() {
        const payload = {
            name: productName,
            description: productDescription || undefined,
            price: parseFloat(productPrice),
            stock: parseInt(productStock),
            category: productCategory || undefined,
            imageUrl: productImageUrl || undefined,
        };
        if (editingProduct) {
            updateProduct.mutate({ id: editingProduct.id, ...payload });
        } else {
            createProduct.mutate(payload);
        }
    }
    const isForfaitSubmitting = createForfait.isPending || updateForfait.isPending;
    const isProductSubmitting = createProduct.isPending || updateProduct.isPending;
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Catalogue</h1>
                    <p className="text-muted-foreground">Gérez vos forfaits de réparation et votre stock de pièces.</p>
                </div>
            </div>
            <Tabs defaultValue="forfaits" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="forfaits" className="gap-2">
                        <Wrench className="h-4 w-4" /> Forfaits
                    </TabsTrigger>
                    <TabsTrigger value="products" className="gap-2">
                        <Package className="h-4 w-4" /> Pièces & Produits
                    </TabsTrigger>
                </TabsList>
                {}
                <TabsContent value="forfaits">
                    <div className="flex justify-end mb-4">
                        <Button className="gap-2" onClick={() => openForfaitDialog()}>
                            <Plus className="h-4 w-4" />
                            Nouveau Forfait
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {forfaitsLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-40 bg-muted rounded-lg" />
                                </Card>
                            ))
                        ) : forfaits.length === 0 ? (
                            <Card className="col-span-full border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Wrench className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="font-medium">Aucun forfait</p>
                                    <p className="text-sm">Créez votre premier forfait d'entretien.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            forfaits.map((f: Forfait) => (
                                <Card key={f.id} className="relative group overflow-hidden">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="secondary" className="gap-1">
                                                <Euro className="h-3 w-3" />
                                                {Number(f.price).toFixed(2)}€
                                            </Badge>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openForfaitDialog(f)} className="gap-2">
                                                        <Edit className="h-4 w-4" /> Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => archiveForfait.mutate(f.id)}
                                                        className="gap-2 text-destructive"
                                                    >
                                                        <Archive className="h-4 w-4" /> Archiver
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardTitle className="text-lg">{f.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{f.description}</p>
                                        <div className="flex items-center gap-3 text-[10px]">
                                            <div className="flex items-center gap-1 text-primary bg-primary/5 p-1.5 rounded">
                                                <Clock className="h-3 w-3" /> {f.duration} min
                                            </div>
                                            <div className="flex items-center gap-1 text-primary bg-primary/5 p-1.5 rounded">
                                                <CheckCircle2 className="h-3 w-3" /> Disponible
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
                {}
                <TabsContent value="products">
                    <div className="flex justify-end mb-4">
                        <Button className="gap-2" onClick={() => openProductDialog()}>
                            <Plus className="h-4 w-4" />
                            Nouveau Produit
                        </Button>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {productsLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <div className="h-40 bg-muted rounded-lg" />
                                </Card>
                            ))
                        ) : products.length === 0 ? (
                            <Card className="col-span-full border-dashed">
                                <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                                    <Package className="h-10 w-10 mb-3 opacity-20" />
                                    <p className="font-medium">Aucun produit</p>
                                    <p className="text-sm">Ajoutez des pièces et consommables à votre catalogue.</p>
                                </CardContent>
                            </Card>
                        ) : (
                            products.filter((p: Product) => p.isActive).map((p: Product) => (
                                <Card key={p.id} className="relative group overflow-hidden">
                                    {p.imageUrl && (
                                        <div className="aspect-video w-full overflow-hidden bg-muted">
                                            <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                                        </div>
                                    )}
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="flex gap-2">
                                                <Badge variant="secondary" className="gap-1">
                                                    <Euro className="h-3 w-3" />
                                                    {Number(p.price).toFixed(2)}€
                                                </Badge>
                                                {p.category && (
                                                    <Badge variant="outline" className="gap-1">
                                                        <Tag className="h-3 w-3" /> {p.category}
                                                    </Badge>
                                                )}
                                            </div>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => openProductDialog(p)} className="gap-2">
                                                        <Edit className="h-4 w-4" /> Modifier
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => archiveProduct.mutate(p.id)}
                                                        className="gap-2 text-destructive"
                                                    >
                                                        <Archive className="h-4 w-4" /> Archiver
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                        <CardTitle className="text-lg">{p.name}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                            {p.description || 'Aucune description'}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px]">
                                            <div className="flex items-center gap-1 text-primary bg-primary/5 p-1.5 rounded">
                                                <Package className="h-3 w-3" /> Stock : {p.stock}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </TabsContent>
            </Tabs>
            {}
            <Dialog open={forfaitDialogOpen} onOpenChange={setForfaitDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingForfait ? 'Modifier le forfait' : 'Nouveau forfait'}</DialogTitle>
                        <DialogDescription>
                            {editingForfait ? 'Modifiez les informations du forfait.' : 'Créez un nouveau forfait d\'entretien.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="forfait-name">Nom</Label>
                            <Input id="forfait-name" placeholder="Ex: Révision complète" value={forfaitName} onChange={(e) => setForfaitName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="forfait-desc">Description</Label>
                            <Textarea id="forfait-desc" placeholder="Détaillez les prestations incluses..." value={forfaitDescription} onChange={(e) => setForfaitDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="forfait-duration">Durée (min)</Label>
                                <Input id="forfait-duration" type="number" min="15" step="15" value={forfaitDuration} onChange={(e) => setForfaitDuration(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="forfait-price">Prix (€)</Label>
                                <Input id="forfait-price" type="number" min="0" step="0.01" placeholder="29.90" value={forfaitPrice} onChange={(e) => setForfaitPrice(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={closeForfaitDialog}>Annuler</Button>
                        <Button onClick={handleForfaitSubmit} disabled={isForfaitSubmitting || !forfaitName || !forfaitPrice}>
                            {isForfaitSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editingForfait ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {}
            <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingProduct ? 'Modifier le produit' : 'Nouveau produit'}</DialogTitle>
                        <DialogDescription>
                            {editingProduct ? 'Modifiez les informations du produit.' : 'Ajoutez un nouveau produit à votre catalogue.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="product-name">Nom</Label>
                            <Input id="product-name" placeholder="Ex: Chambre à air 700c" value={productName} onChange={(e) => setProductName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="product-desc">Description</Label>
                            <Textarea id="product-desc" placeholder="Description du produit..." value={productDescription} onChange={(e) => setProductDescription(e.target.value)} />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="product-price">Prix (€)</Label>
                                <Input id="product-price" type="number" min="0" step="0.01" placeholder="5.90" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-stock">Stock</Label>
                                <Input id="product-stock" type="number" min="0" value={productStock} onChange={(e) => setProductStock(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="product-category">Catégorie</Label>
                                <Input id="product-category" placeholder="Pneus" value={productCategory} onChange={(e) => setProductCategory(e.target.value)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Image du produit</Label>
                            {productImageUrl ? (
                                <div className="relative aspect-video rounded-lg overflow-hidden border">
                                    <img src={productImageUrl} alt="Preview" className="h-full w-full object-cover" />
                                    <Button
                                        variant="destructive"
                                        size="icon"
                                        className="absolute top-2 right-2 h-6 w-6"
                                        onClick={() => setProductImageUrl('')}
                                    >
                                        <Archive className="h-3 w-3" />
                                    </Button>
                                </div>
                            ) : (
                                <CloudinaryUpload
                                    onUpload={(urls) => setProductImageUrl(urls[0])}
                                    folder="products"
                                    buttonText="Téléverser une image"
                                    className="w-full"
                                />
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={closeProductDialog}>Annuler</Button>
                        <Button onClick={handleProductSubmit} disabled={isProductSubmitting || !productName || !productPrice}>
                            {isProductSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            {editingProduct ? 'Mettre à jour' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}