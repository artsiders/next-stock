// app/dashboard/approvisionnements/page.tsx
"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Plus, Search, CheckCircle2, CalendarIcon, Trash2, FileEdit } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "@/components/ui/use-toast";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

// Types
type Product = {
    id: number;
    name: string;
    sku: string;
    costPrice: number;
};

type Supplier = {
    id: number;
    name: string;
};

type Supply = {
    id: number;
    date: string;
    quantity: number;
    unitPrice: number;
    product: Product;
    supplier: Supplier | null;
    createdAt: string;
};

// Schéma de validation Zod
const supplyFormSchema = z.object({
    productId: z.number({
        required_error: "Veuillez sélectionner un produit",
    }),
    quantity: z.number({
        required_error: "La quantité est requise",
    }).positive("La quantité doit être positive"),
    date: z.date({
        required_error: "La date est requise",
    }),
    supplierId: z.number().nullable().optional(),
    unitPrice: z.number().positive("Le prix unitaire doit être positif").optional(),
    notes: z.string().optional(),
});

type SupplyFormValues = z.infer<typeof supplyFormSchema>;

export default function ApprovisionnementPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [suppliers, setSuppliers] = useState<Supplier[]>([]);
    const [supplies, setSupplies] = useState<Supply[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [open, setOpen] = useState(false);
    const [openSupplier, setOpenSupplier] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSupply, setEditingSupply] = useState<Supply | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

    // Initialiser le formulaire
    const form = useForm<SupplyFormValues>({
        resolver: zodResolver(supplyFormSchema),
        defaultValues: {
            quantity: 1,
            date: new Date(),
            supplierId: null,
            notes: "",
        },
    });

    // Charger les données initiales
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [productsRes, suppliersRes, suppliesRes] = await Promise.all([
                    fetch("/api/products"),
                    fetch("/api/suppliers"),
                    fetch("/api/supplies"),
                ]);

                if (!productsRes.ok || !suppliersRes.ok || !suppliesRes.ok) {
                    throw new Error("Erreur lors du chargement des données");
                }

                const productsData = await productsRes.json();
                const suppliersData = await suppliersRes.json();
                const suppliesData = await suppliesRes.json();

                setProducts(productsData);
                setSuppliers(suppliersData);
                setSupplies(suppliesData);
            } catch (err) {
                setError("Impossible de charger les données. Veuillez réessayer.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Mettre à jour le formulaire quand on édite un approvisionnement
    useEffect(() => {
        if (editingSupply) {
            form.reset({
                productId: editingSupply.product.id,
                quantity: editingSupply.quantity,
                date: new Date(editingSupply.date),
                supplierId: editingSupply.supplier?.id || null,
                unitPrice: editingSupply.unitPrice,
            });
            setSelectedProduct(editingSupply.product);
        }
    }, [editingSupply, form]);

    // Filtrer les produits par recherche
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Gérer la soumission du formulaire
    const onSubmit = async (values: SupplyFormValues) => {
        setIsSubmitting(true);
        try {
            const endpoint = editingSupply
                ? `/api/supplies/${editingSupply.id}`
                : "/api/supplies";

            const method = editingSupply ? "PUT" : "POST";

            const response = await fetch(endpoint, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...values,
                    date: values.date.toISOString(),
                    unitPrice: values.unitPrice || (selectedProduct?.costPrice || 0),
                }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'enregistrement");
            }

            // Rafraîchir la liste des approvisionnements
            const updatedSuppliesRes = await fetch("/api/supplies");
            const updatedSupplies = await updatedSuppliesRes.json();
            setSupplies(updatedSupplies);

            toast({
                title: editingSupply ? "Approvisionnement mis à jour" : "Approvisionnement ajouté",
                description: `Opération effectuée avec succès`,
                variant: "default",
            });

            // Réinitialiser le formulaire
            form.reset({
                productId: undefined,
                quantity: 1,
                date: new Date(),
                supplierId: null,
                unitPrice: undefined,
                notes: "",
            });
            setSelectedProduct(null);
            setEditingSupply(null);
        } catch (err) {
            console.error(err);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de l'enregistrement",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Supprimer un approvisionnement
    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/supplies/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Erreur lors de la suppression");
            }

            // Rafraîchir la liste
            setSupplies(supplies.filter((supply) => supply.id !== id));

            toast({
                title: "Approvisionnement supprimé",
                description: "L'approvisionnement a été supprimé avec succès",
                variant: "default",
            });

            setConfirmDeleteId(null);
        } catch (err) {
            console.error(err);
            toast({
                title: "Erreur",
                description: "Une erreur est survenue lors de la suppression",
                variant: "destructive",
            });
        }
    };

    // Quand un produit est sélectionné, mettre à jour le prix unitaire
    const handleProductSelect = (productId: number) => {
        const product = products.find((p) => p.id === productId);
        setSelectedProduct(product || null);

        if (product && !form.getValues().unitPrice) {
            form.setValue("unitPrice", product.costPrice);
        }
    };

    // Fonction pour formater le prix
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("fr-FR", {
            style: "currency",
            currency: "EUR",
        }).format(price);
    };

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Gestion des Approvisionnements</h1>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Formulaire d'approvisionnement */}
                <Card className="md:col-span-1">
                    <CardHeader>
                        <CardTitle>
                            {editingSupply ? "Modifier l'approvisionnement" : "Nouvel approvisionnement"}
                        </CardTitle>
                        <CardDescription>
                            Enregistrez une nouvelle entrée de stock
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                {/* Sélection du produit */}
                                <FormField
                                    control={form.control}
                                    name="productId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Produit</FormLabel>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={open}
                                                            className="justify-between w-full"
                                                        >
                                                            {field.value
                                                                ? products.find(
                                                                    (product) => product.id === field.value
                                                                )?.name
                                                                : "Sélectionner un produit"}
                                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0">
                                                    <Command>
                                                        <CommandInput
                                                            placeholder="Rechercher un produit..."
                                                            onValueChange={setSearchQuery}
                                                        />
                                                        <CommandEmpty>Aucun produit trouvé.</CommandEmpty>
                                                        <CommandGroup className="max-h-60 overflow-y-auto">
                                                            {filteredProducts.map((product) => (
                                                                <CommandItem
                                                                    key={product.id}
                                                                    value={product.name}
                                                                    onSelect={() => {
                                                                        form.setValue("productId", product.id);
                                                                        handleProductSelect(product.id);
                                                                        setOpen(false);
                                                                    }}
                                                                >
                                                                    <CheckCircle2
                                                                        className={`mr-2 h-4 w-4 ${field.value === product.id
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                            }`}
                                                                    />
                                                                    <div className="flex-1">
                                                                        <p className="font-medium">{product.name}</p>
                                                                        <p className="text-xs text-muted-foreground">
                                                                            SKU: {product.sku}
                                                                        </p>
                                                                    </div>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Quantité */}
                                <FormField
                                    control={form.control}
                                    name="quantity"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Quantité reçue</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Date */}
                                <FormField
                                    control={form.control}
                                    name="date"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Date de réception</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className="w-full pl-3 text-left font-normal"
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "P", { locale: fr })
                                                            ) : (
                                                                <span>Choisir une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Fournisseur (optionnel) */}
                                <FormField
                                    control={form.control}
                                    name="supplierId"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Fournisseur (optionnel)</FormLabel>
                                            <Popover open={openSupplier} onOpenChange={setOpenSupplier}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant="outline"
                                                            role="combobox"
                                                            aria-expanded={openSupplier}
                                                            className="justify-between w-full"
                                                        >
                                                            {field.value
                                                                ? suppliers.find(
                                                                    (supplier) => supplier.id === field.value
                                                                )?.name
                                                                : "Sélectionner un fournisseur"}
                                                            <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-[300px] p-0">
                                                    <Command>
                                                        <CommandInput placeholder="Rechercher un fournisseur..." />
                                                        <CommandEmpty>Aucun fournisseur trouvé.</CommandEmpty>
                                                        <CommandGroup>
                                                            {suppliers.map((supplier) => (
                                                                <CommandItem
                                                                    key={supplier.id}
                                                                    value={supplier.name}
                                                                    onSelect={() => {
                                                                        form.setValue("supplierId", supplier.id);
                                                                        setOpenSupplier(false);
                                                                    }}
                                                                >
                                                                    <CheckCircle2
                                                                        className={`mr-2 h-4 w-4 ${field.value === supplier.id
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                            }`}
                                                                    />
                                                                    {supplier.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </Command>
                                                </PopoverContent>
                                            </Popover>
                                            <FormDescription>
                                                Laissez vide si aucun fournisseur n'est associé
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Prix unitaire */}
                                <FormField
                                    control={form.control}
                                    name="unitPrice"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prix unitaire (€)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    placeholder={selectedProduct ? selectedProduct.costPrice.toString() : "0.00"}
                                                    {...field}
                                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                                />
                                            </FormControl>
                                            <FormDescription>
                                                Prix d'achat unitaire (par défaut: prix actuel du produit)
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Notes */}
                                <FormField
                                    control={form.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Notes (optionnel)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Ajouter des notes sur cet approvisionnement" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </form>
                        </Form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            onClick={() => {
                                form.reset({
                                    productId: undefined,
                                    quantity: 1,
                                    date: new Date(),
                                    supplierId: null,
                                    unitPrice: undefined,
                                    notes: "",
                                });
                                setSelectedProduct(null);
                                setEditingSupply(null);
                            }}
                        >
                            {editingSupply ? "Annuler" : "Réinitialiser"}
                        </Button>
                        <Button
                            onClick={form.handleSubmit(onSubmit)}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-spin mr-2">⊚</span>
                                    Traitement...
                                </>
                            ) : (
                                <>
                                    <Plus className="mr-2 h-4 w-4" />
                                    {editingSupply ? "Mettre à jour" : "Ajouter"}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>

                {/* Liste des approvisionnements */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Historique des approvisionnements</CardTitle>
                        <CardDescription>
                            Les {supplies.length} derniers approvisionnements enregistrés
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : supplies.length > 0 ? (
                            <Table>
                                <TableCaption>Liste des approvisionnements récents</TableCaption>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Produit</TableHead>
                                        <TableHead>Quantité</TableHead>
                                        <TableHead>Prix unitaire</TableHead>
                                        <TableHead>Fournisseur</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {supplies.map((supply) => (
                                        <TableRow key={supply.id}>
                                            <TableCell>{format(new Date(supply.date), "dd/MM/yyyy")}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{supply.product.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        SKU: {supply.product.sku}
                                                    </p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{supply.quantity}</TableCell>
                                            <TableCell>{formatPrice(supply.unitPrice)}</TableCell>
                                            <TableCell>{supply.supplier?.name || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => setEditingSupply(supply)}
                                                    >
                                                        <FileEdit className="h-4 w-4" />
                                                    </Button>
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => setConfirmDeleteId(supply.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 text-destructive" />
                                                            </Button>
                                                        </DialogTrigger>
                                                        <DialogContent>
                                                            <DialogHeader>
                                                                <DialogTitle>Confirmer la suppression</DialogTitle>
                                                                <DialogDescription>
                                                                    Êtes-vous sûr de vouloir supprimer cet approvisionnement ?
                                                                    Cette action ne peut pas être annulée.
                                                                </DialogDescription>
                                                            </DialogHeader>
                                                            <DialogFooter className="gap-2">
                                                                <DialogClose asChild>
                                                                    <Button variant="outline">Annuler</Button>
                                                                </DialogClose>
                                                                <Button
                                                                    variant="destructive"
                                                                    onClick={() => confirmDeleteId && handleDelete(confirmDeleteId)}
                                                                >
                                                                    Supprimer
                                                                </Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </Dialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-64">
                                <p className="text-muted-foreground mb-4">
                                    Aucun approvisionnement enregistré
                                </p>
                                <Button variant="outline" onClick={() => form.setFocus("productId")}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Ajouter un approvisionnement
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}