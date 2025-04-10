"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { createProject, updateProject } from "@/lib/actions"
import { useRouter } from "next/navigation"
import type { Project } from "@prisma/client"

const formSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  description: z.string().optional(),
})

type ProjectFormValues = z.infer<typeof formSchema>

export default function ProjectForm({ project }: { project?: Project }) {
  const router = useRouter()
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
    },
  })

  async function onSubmit(values: ProjectFormValues) {
    if (project) {
      await updateProject(project.id, values)
    } else {
      await createProject(values)
    }
    router.push("/projects")
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
        <Button type="submit">{project ? "Mettre à jour" : "Créer"}</Button>
      </form>
    </Form>
  )
}
