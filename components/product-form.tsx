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

import { Category, Product, Supplier } from "@prisma/client";
import axios from "axios";

interface Props {
  categories: Category[];
  suppliers: Supplier[];
  product?: Product;
}

interface FormErrors {
  name?: string;
  categoryId?: string;
  supplierId?: string;
  quantity?: string;
  minQuantity?: string;
  unitPrice?: string;
  costPrice?: string;
}

export default function ProductForm({ product, categories, suppliers }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const isEditMode = !!product;

  // État du formulaire
  const [formData, setFormData] = useState({
    name: product?.name || "",
    description: product?.description || "",
    categoryId: product?.categoryId || 0,
    supplierId: product?.supplierId || 0,
    quantity: product?.quantity || 0,
    minQuantity: product?.minQuantity || 5,
    unitPrice: product?.unitPrice || 0,
    costPrice: product?.costPrice || 0,
  });

  // Charger les catégories et fournisseurs au chargement
  useEffect(() => {
    if (!isEditMode) {
      if (categories.length > 0 && formData.categoryId === 0) {
        setFormData(prev => ({ ...prev, categoryId: categories[0].id }));
      }

      if (suppliers.length > 0 && formData.supplierId === 0) {
        setFormData(prev => ({ ...prev, supplierId: suppliers[0].id }));
      }
    }
  }, [categories, suppliers, isEditMode, formData.categoryId, formData.supplierId]);

  // Gérer les changements des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Effacer l'erreur correspondante lorsqu'un champ est modifié
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    setFormData(prev => ({
      ...prev,
      [name]: ["quantity", "minQuantity", "unitPrice", "costPrice"].includes(name)
        ? parseFloat(value) || 0 // Conversion en nombre avec 0 comme fallback
        : value
    }));
  };

  // Gérer les changements des sélecteurs
  const handleSelectChange = (name: string, value: string) => {
    // Effacer l'erreur correspondante
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }

    setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) }));
  };

  // Valider le formulaire
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validation du nom
    if (!formData.name.trim()) {
      newErrors.name = "Le nom du produit est requis";
    } else if (formData.name.length < 2) {
      newErrors.name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de la catégorie
    if (formData.categoryId === 0) {
      newErrors.categoryId = "Veuillez sélectionner une catégorie";
    }

    // Validation du fournisseur
    if (formData.supplierId === 0) {
      newErrors.supplierId = "Veuillez sélectionner un fournisseur";
    }

    // Validation des prix
    if (formData.costPrice <= 0) {
      newErrors.costPrice = "Le prix d'achat doit être supérieur à 0";
    }

    if (formData.unitPrice <= 0) {
      newErrors.unitPrice = "Le prix de vente doit être supérieur à 0";
    } else if (formData.unitPrice < formData.costPrice) {
      newErrors.unitPrice = "Le prix de vente doit être supérieur ou égal au prix d'achat";
    }

    // Validation de la quantité
    if (formData.quantity < 0) {
      newErrors.quantity = "La quantité ne peut pas être négative";
    }

    if (formData.minQuantity < 0) {
      newErrors.minQuantity = "Le seuil d'alerte ne peut pas être négatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Valider le formulaire avant soumission
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        // Mise à jour d'un produit existant
        await axios.put(`/api/products/${product.id}`, formData);
        window.history.back();
      } else {
        // Création d'un nouveau produit
        await axios.post("/api/products", formData);
        window.history.back();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Une erreur est survenue lors de l'enregistrement");
        console.error(err.response?.data?.error);
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
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={10}
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
              <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
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
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplierId">Fournisseur *</Label>
            <Select
              value={formData.supplierId !== 0 ? formData.supplierId.toString() : undefined}
              onValueChange={(value) => handleSelectChange("supplierId", value)}
            >
              <SelectTrigger className={errors.supplierId ? "border-red-500" : ""}>
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
            {errors.supplierId && (
              <p className="text-red-500 text-sm mt-1">{errors.supplierId}</p>
            )}
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
                className={errors.costPrice ? "border-red-500" : ""}
              />
              {errors.costPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.costPrice}</p>
              )}
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
                className={errors.unitPrice ? "border-red-500" : ""}
              />
              {errors.unitPrice && (
                <p className="text-red-500 text-sm mt-1">{errors.unitPrice}</p>
              )}
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
                className={errors.quantity ? "border-red-500" : ""}
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>
              )}
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
                className={errors.minQuantity ? "border-red-500" : ""}
              />
              {errors.minQuantity && (
                <p className="text-red-500 text-sm mt-1">{errors.minQuantity}</p>
              )}
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
          {loading ? (isEditMode ? "Mise à jour..." : "Création en cours...") : (isEditMode ? "Mettre à jour" : "Créer le produit")}
        </Button>
      </div>
    </form>
  );
}