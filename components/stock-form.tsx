"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createStockItem, updateStockItem } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { Project, StockItem } from "@prisma/client"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  quantity: z.coerce.number().min(0, "La quantité doit être positive"),
  projectId: z.string().optional(),
})

type StockFormValues = z.infer<typeof formSchema>

interface StockItemWithProject extends StockItem {
  project: { name: string } | null
}

export default function StockForm({
  item,
  projects,
}: {
  item?: StockItemWithProject
  projects: Project[]
}) {
  const router = useRouter()
  const form = useForm<StockFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: item?.name || "",
      quantity: item?.quantity || 0,
      projectId: item?.projectId?.toString() || "",
    },
  })

  async function onSubmit(values: StockFormValues) {
    const data = {
      ...values,
      projectId: values.projectId ? Number.parseInt(values.projectId) : null,
    }

    if (item) {
      await updateStockItem(item.id, data)
    } else {
      await createStockItem(data)
    }
    router.push("/stock")
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom de l'article" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantité</FormLabel>
              <FormControl>
                <Input type="number" min="0" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="projectId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Projet</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un projet" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="null">Aucun projet</SelectItem>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">{item ? "Mettre à jour" : "Créer"}</Button>
      </form>
    </Form>
  )
}
