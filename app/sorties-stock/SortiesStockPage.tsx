'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2, CalendarIcon, Package, PackageMinus, Info, RefreshCw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Types basés sur le schéma Prisma
type Product = {
    id: number;
    name: string;
    description: string | null;
    quantity: number;
    minQuantity: number;
    unitPrice: number;
    costPrice: number;
    categoryId: number;
    supplierId: number;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
    };
    supplier: {
        id: number;
        name: string;
    };
};

type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

type StockMovement = {
    id: number;
    productId: number;
    type: MovementType;
    quantity: number;
    date: string;
    note: string | null;
    product: Product;
};

// Enum pour les motifs de sortie
enum SortieMotif {
    VENTE = "Vente",
    CONSOMMATION = "Consommation interne",
    PERTE = "Perte",
    TRANSFERT = "Transfert"
}

// Schéma Zod pour la validation du formulaire
const stockOutSchema = z.object({
    productId: z.string().min(1, { message: "Le produit est requis" }),
    quantity: z.number().positive({ message: "La quantité doit être un nombre positif" }),
    motif: z.nativeEnum(SortieMotif, {
        errorMap: () => ({ message: "Veuillez sélectionner un motif valide" }),
    }),
    date: z.date({
        required_error: "La date est requise",
    }),
    note: z.string().optional(),
});

type StockOutFormValues = z.infer<typeof stockOutSchema>;

export default function SortiesStockPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        control,
        setValue,
        formState: { errors },
        watch
    } = useForm<StockOutFormValues>({
        resolver: zodResolver(stockOutSchema),
        defaultValues: {
            productId: '',
            quantity: 1,
            motif: SortieMotif.VENTE,
            date: new Date(),
            note: '',
        },
    });

    const watchProductId = watch('productId');

    useEffect(() => {
        if (watchProductId) {
            const product = products.find(p => p.id === parseInt(watchProductId));
            setSelectedProduct(product || null);
        } else {
            setSelectedProduct(null);
        }
    }, [watchProductId, products]);

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/stockmovements').then(res => res.json()),
        ])
            .then(([productsData, movementsData]) => {
                setProducts(productsData);
                setMovements(movementsData.filter((m: StockMovement) => m.type === 'OUT'));
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors du chargement des données:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les données. Veuillez réessayer.",
                    variant: "destructive"
                });
                setLoading(false);
            });
    }, []);

    const refreshData = () => {
        setLoading(true);
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/stockmovements').then(res => res.json()),
        ])
            .then(([productsData, movementsData]) => {
                setProducts(productsData);
                setMovements(movementsData.filter((m: StockMovement) => m.type === 'OUT'));
                setLoading(false);
            })
            .catch(error => {
                console.error("Erreur lors du rafraîchissement des données:", error);
                toast({
                    title: "Erreur",
                    description: "Impossible de rafraîchir les données.",
                    variant: "destructive"
                });
                setLoading(false);
            });
    };

    const onSubmit = async (data: StockOutFormValues) => {
        setSubmitting(true);

        try {
            // Vérifier si la quantité demandée est disponible
            const product = products.find(p => p.id === parseInt(data.productId));
            if (!product) {
                throw new Error("Produit non trouvé");
            }

            if (product.quantity < data.quantity) {
                throw new Error(`Stock insuffisant. Disponible: ${product.quantity}`);
            }

            const response = await fetch('/api/stockmovements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: parseInt(data.productId),
                    type: 'OUT',
                    quantity: data.quantity,
                    date: data.date.toISOString(),
                    note: `${data.motif}${data.note ? ` - ${data.note}` : ''}`,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Une erreur est survenue");
            }

            // Rafraîchir les données
            refreshData();

            toast({
                title: "Succès",
                description: "Sortie de stock enregistrée avec succès.",
            });

            reset();
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de la sortie:", error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteMovement = async () => {
        if (!selectedMovement) return;

        try {
            const response = await fetch(`/api/stockmovements/${selectedMovement.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Une erreur est survenue");
            }

            // Rafraîchir les données
            refreshData();

            toast({
                title: "Succès",
                description: "Sortie de stock annulée avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de l'annulation de la sortie:", error);
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Une erreur est survenue",
                variant: "destructive"
            });
        } finally {
            setIsDialogOpen(false);
            setSelectedMovement(null);
        }
    };

    const confirmDelete = (movement: StockMovement) => {
        setSelectedMovement(movement);
        setIsDialogOpen(true);
    };

    // Extraire le motif de la note
    const extractMotif = (note: string | null): string => {
        if (!note) return "Non spécifié";

        const motifs = Object.values(SortieMotif);
        for (const motif of motifs) {
            if (note.startsWith(motif)) {
                return motif;
            }
        }

        return "Non spécifié";
    };

    // Extraire la note sans le motif
    const extractNote = (note: string | null): string => {
        if (!note) return "";

        const motifs = Object.values(SortieMotif);
        for (const motif of motifs) {
            if (note.startsWith(motif)) {
                return note.slice(motif.length).replace(/^\s*-\s*/, '').trim();
            }
        }

        return note;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Chargement...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-2 py-8">
            <h1 className="text-3xl font-bold mb-8">Sorties de Stock</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <PackageMinus className="mr-2 h-5 w-5" />
                            Nouvelle Sortie de Stock
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="productId">Produit</Label>
                                <Select
                                    onValueChange={(value) => setValue('productId', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={product.id.toString()}
                                                disabled={product.quantity === 0}
                                            >
                                                {product.name} - {product.quantity} en stock
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.productId && (
                                    <p className="text-sm text-red-500">{errors.productId.message}</p>
                                )}
                            </div>

                            {selectedProduct && (
                                <div className="p-3 bg-slate-50 rounded-md text-sm">
                                    <p><strong>En stock:</strong> {selectedProduct.quantity} unités</p>
                                    <p><strong>Prix unitaire:</strong> {selectedProduct.unitPrice.toFixed(2)} €</p>
                                    <p><strong>Fournisseur:</strong> {selectedProduct.supplier.name}</p>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantité</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    max={selectedProduct?.quantity || 999999}
                                    {...register("quantity", { valueAsNumber: true })}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="motif">Motif de sortie</Label>
                                <Controller
                                    control={control}
                                    name="motif"
                                    render={({ field }) => (
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un motif" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(SortieMotif).map((motif) => (
                                                    <SelectItem key={motif} value={motif}>
                                                        {motif}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.motif && (
                                    <p className="text-sm text-red-500">{errors.motif.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Controller
                                    control={control}
                                    name="date"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className={cn(
                                                        "w-full justify-start text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {field.value ? format(field.value, "dd MMMM yyyy", { locale: fr }) : <span>Sélectionner une date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    initialFocus
                                                    locale={fr}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                                {errors.date && (
                                    <p className="text-sm text-red-500">{errors.date.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Notes supplémentaires (optionnel)</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Informations complémentaires..."
                                    {...register("note")}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting || !selectedProduct || selectedProduct.quantity === 0}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <PackageMinus className="mr-2 h-4 w-4" />
                                        Enregistrer la sortie
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Package className="mr-2 h-5 w-5" />
                                Historique des Sorties
                            </div>
                            <Button variant="outline" size="sm" onClick={refreshData}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Actualiser
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {movements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Info className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-lg font-medium">Aucune sortie de stock trouvée</p>
                                <p className="text-sm text-gray-500">Les sorties de stock apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Produit</TableHead>
                                            <TableHead>Quantité</TableHead>
                                            <TableHead>Motif</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {movements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>{format(new Date(movement.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                                <TableCell>{movement.product.name}</TableCell>
                                                <TableCell>{movement.quantity}</TableCell>
                                                <TableCell>{extractMotif(movement.note)}</TableCell>
                                                <TableCell>{extractNote(movement.note) || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => confirmDelete(movement)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir annuler cette sortie de stock ?
                            Cette action réintégrera {selectedMovement?.quantity} unités de {selectedMovement?.product.name} dans le stock.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMovement}>Confirmer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}