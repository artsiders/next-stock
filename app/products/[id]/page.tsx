import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectForm from "@/components/product-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getProjectById } from "@/lib/data"
import { notFound } from "next/navigation"

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const project = await getProjectById(Number.parseInt(params.id))

  if (!project) {
    notFound()
  }

  return (
    <div className="container mx-auto py-10">
      <Link href="/projects">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour aux projets
        </Button>
      </Link>
      <Card>
        <CardHeader>
          <CardTitle>Modifier Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm project={project} />
        </CardContent>
      </Card>
    </div>
  )
}
