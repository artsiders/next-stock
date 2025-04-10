import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectForm from "@/components/project-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewProjectPage() {
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
          <CardTitle>Nouveau Projet</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectForm />
        </CardContent>
      </Card>
    </div>
  )
}
