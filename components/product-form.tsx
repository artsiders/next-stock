"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { createProduit, ProduitCreate, updateProduit } from "@/lib/actions"

const formSchema = z.object({
  nom: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
  quantite: z.coerce.number().min(0, "La quantité est requise"),
  prixUnitaire: z.coerce.number().min(0, "Le prix unitaire est requis"),
  categorieId: z.string().min(1, "L'ID de catégorie est requis"),
  fournisseurId: z.string().min(1, "L'ID du fournisseur est requis"),
})

type ProductFormValues = z.infer<typeof formSchema>

export default function ProductForm({ product }: { product?: ProduitCreate }) {
  const router = useRouter()
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nom: product?.nom || "",
      description: product?.description || "",
      quantite: product?.quantite || 0,
      prixUnitaire: product?.prixUnitaire || 0,
      categorieId: product?.categorieId || "",
      fournisseurId: product?.fournisseurId || "",
    },
  })

  async function onSubmit(values: ProductFormValues) {
    if (product) {
      await updateProduit(product.categorieId, values)
    } else {
      await createProduit(values)
    }
    router.push("/products")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="nom"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom du projet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Description du projet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Quantité"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="prixUnitaire"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Prix Unitaire</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Prix Unitaire"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="categorieId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID de Catégorie</FormLabel>
              <FormControl>
                <Input placeholder="ID de Catégorie" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fournisseurId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID du Fournisseur</FormLabel>
              <FormControl>
                <Input placeholder="ID du Fournisseur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{product ? "Mettre à jour" : "Créer"}</Button>
      </form>
    </Form>
  )
}