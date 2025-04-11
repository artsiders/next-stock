'use client';

import { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/use-toast";
import { Plus, Loader2, Info, Package, PackageCheck, PackageX, RefreshCw } from "lucide-react";
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Types basés sur le schéma Prisma
type Supplier = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
};

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

// Schéma Zod pour la validation du formulaire
const stockMovementSchema = z.object({
    productId: z.string().min(1, { message: "Le produit est requis" }),
    quantity: z.number().positive({ message: "La quantité doit être un nombre positif" }),
    note: z.string().optional(),
    date: z.string().optional()
});

type StockMovementFormValues = z.infer<typeof stockMovementSchema>;

export default function ApprovisionementPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<string>('all');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState<StockMovement | null>(null);

    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<StockMovementFormValues>({
        resolver: zodResolver(stockMovementSchema),
        defaultValues: {
            productId: '',
            quantity: 1,
            note: '',
            date: new Date().toISOString().substring(0, 10)
        }
    });

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/stockmovements').then(res => res.json()),
            fetch('/api/suppliers').then(res => res.json())
        ])
            .then(([productsData, movementsData, suppliersData]) => {
                setProducts(productsData);
                setMovements(movementsData);
                setSuppliers(suppliersData);
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

    const onSubmit = async (data: StockMovementFormValues) => {
        setSubmitting(true);

        try {
            const response = await fetch('/api/stockmovements', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: parseInt(data.productId),
                    type: 'IN',
                    quantity: data.quantity,
                    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
                    note: data.note || null,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Une erreur est survenue");
            }

            const newMovement = await response.json();

            // Mettre à jour la liste des mouvements et des produits
            fetch('/api/stockmovements')
                .then(res => res.json())
                .then(data => setMovements(data));

            fetch('/api/products')
                .then(res => res.json())
                .then(data => setProducts(data));

            toast({
                title: "Succès",
                description: "Approvisionnement enregistré avec succès.",
            });

            reset();
        } catch (error) {
            console.error("Erreur lors de l'approvisionnement:", error);
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

            // Mettre à jour la liste des mouvements et des produits
            fetch('/api/stockmovements')
                .then(res => res.json())
                .then(data => setMovements(data));

            fetch('/api/products')
                .then(res => res.json())
                .then(data => setProducts(data));

            toast({
                title: "Succès",
                description: "Mouvement supprimé avec succès.",
            });
        } catch (error) {
            console.error("Erreur lors de la suppression du mouvement:", error);
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

    const filteredMovements = selectedSupplier === 'all'
        ? movements.filter(m => m.type === 'IN')
        : movements.filter(m => m.type === 'IN' && m.product.supplierId === parseInt(selectedSupplier));

    const filteredProducts = selectedSupplier === 'all'
        ? products
        : products.filter(p => p.supplierId === parseInt(selectedSupplier));

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-120px)]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-lg">Chargement...</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8">Gestion des Approvisionnements</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Plus className="mr-2 h-5 w-5" />
                            Nouvel Approvisionnement
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="supplierId">Fournisseur</Label>
                                <Select
                                    onValueChange={(value) => setSelectedSupplier(value)}
                                    value={selectedSupplier}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un fournisseur" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les fournisseurs</SelectItem>
                                        {suppliers.map((supplier) => (
                                            <SelectItem key={supplier.id} value={supplier.id.toString()}>
                                                {supplier.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="productId">Produit</Label>
                                <Select onValueChange={(value) => setValue('productId', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filteredProducts.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                {product.name} - {product.quantity} en stock
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.productId && (
                                    <p className="text-sm text-red-500">{errors.productId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="quantity">Quantité</Label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    min="1"
                                    {...register("quantity", { valueAsNumber: true })}
                                />
                                {errors.quantity && (
                                    <p className="text-sm text-red-500">{errors.quantity.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    {...register("date")}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note</Label>
                                <Textarea
                                    id="note"
                                    placeholder="Notes supplémentaires..."
                                    {...register("note")}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={submitting}>
                                {submitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <PackageCheck className="mr-2 h-4 w-4" />
                                        Enregistrer l'approvisionnement
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
                                Historique des Approvisionnements
                            </div>
                            <Button variant="outline" size="sm" onClick={() => {
                                setLoading(true);
                                fetch('/api/stockmovements')
                                    .then(res => res.json())
                                    .then(data => {
                                        setMovements(data);
                                        setLoading(false);
                                    });
                            }}>
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Actualiser
                            </Button>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredMovements.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <Info className="h-12 w-12 text-gray-400 mb-2" />
                                <p className="text-lg font-medium">Aucun approvisionnement trouvé</p>
                                <p className="text-sm text-gray-500">Les approvisionnements apparaîtront ici</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Date</TableHead>
                                            <TableHead>Produit</TableHead>
                                            {/* <TableHead>Fournisseur</TableHead> */}
                                            <TableHead>Quantité</TableHead>
                                            <TableHead>Note</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredMovements.map((movement) => (
                                            <TableRow key={movement.id}>
                                                <TableCell>{format(new Date(movement.date), 'dd/MM/yyyy', { locale: fr })}</TableCell>
                                                <TableCell>{movement.product.name}</TableCell>
                                                {/* <TableCell>{movement.product.supplier?.name}</TableCell> */}
                                                <TableCell>{movement.quantity}</TableCell>
                                                <TableCell>{movement.note || '-'}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => confirmDelete(movement)}
                                                    >
                                                        <PackageX className="h-4 w-4" />
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
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cet approvisionnement ?
                            Cette action annulera l'ajout de {selectedMovement?.quantity} unités de {selectedMovement?.product.name}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteMovement}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}