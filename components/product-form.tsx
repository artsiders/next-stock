"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { Category, Supplier } from "@prisma/client";
import { createProduct } from "@/lib/actions";
import axios from "axios";

interface Props {
  categories: Category[];
  suppliers: Supplier[];
}

export default function NewProductForm({ categories, suppliers }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // État du formulaire
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: 0,
    supplierId: 0,
    quantity: 0,
    minQuantity: 5,
    unitPrice: 0,
    costPrice: 0,
    location: "",
  });

  // Charger les catégories et fournisseurs au chargement
  useEffect(() => {
    const loadData = async () => {

      if (categories.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }

      if (suppliers.length > 0) {
        setFormData(prev => ({ ...prev, supplierId: suppliers[0].id }));
      }
    };

    loadData();
  }, []);

  // Gérer les changements des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ["quantity", "minQuantity", "unitPrice", "costPrice"].includes(name)
        ? parseFloat(value) || 0 // Conversion en nombre avec 0 comme fallback
        : value
    }));
  };

  // Gérer les changements des sélecteurs
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await axios.post("/api/products", formData);
      router.push("/products");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError("Une erreur est survenue");
        console.log(err.response?.data?.error);
      } else {
        setError("Une erreur inconnue est survenue");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations de base */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom du produit *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Emplacement</Label>
            <Input
              id="location"
              name="location"
              value={formData.location || ""}
              onChange={handleChange}
              placeholder="Ex: Étagère A-12"
            />
          </div>
        </div>

        {/* Catégorie, fournisseur et prix */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Catégorie *</Label>
            <Select
              value={formData.categoryId !== 0 ? formData.categoryId.toString() : undefined}
              onValueChange={(value) => handleSelectChange("categoryId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId">Fournisseur *</Label>
            <Select
              value={formData.supplierId !== 0 ? formData.supplierId.toString() : undefined}
              onValueChange={(value) => handleSelectChange("supplierId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id.toString()}>
                    {supplier.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costPrice">Prix d'achat *</Label>
              <Input
                id="costPrice"
                name="costPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPrice}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unitPrice">Prix de vente *</Label>
              <Input
                id="unitPrice"
                name="unitPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantité initiale *</Label>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                min="0"
                value={formData.quantity}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="minQuantity">Seuil d'alerte</Label>
              <Input
                id="minQuantity"
                name="minQuantity"
                type="number"
                min="0"
                value={formData.minQuantity}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Création en cours..." : "Créer le produit"}
        </Button>
      </div>
    </form>
  );
}