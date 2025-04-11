"use client"

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

import axios from "axios"
import { Category } from "@prisma/client";

export default function NewCategoryForm({ category }: { category?: Category }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isEditMode = !!category;

  // État du formulaire
  const [formData, setFormData] = useState({
    name: category?.name || "",
  });

  // Gérer les changements des champs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isEditMode) {
        await axios.put(`/api/categories/${category.id}`, formData);
        window.history.back();
      } else {
        await axios.post("/api/categories", formData);
        window.history.back();
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError("Une erreur est survenue lors de l'enregistrement");
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

      <div className="space-y-2">
        <Label htmlFor="name">Nom de la catégorie *</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
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
          {loading ? (isEditMode ? "Mise à jour..." : "Création en cours...") : (isEditMode ? "Mettre à jour" : "Créer la catégorie")}
        </Button>
      </div>
    </form>
  );
}