import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"
import { getProjects } from "@/lib/data"
import ProjectList from "@/components/project-list"

export default async function ProjectsPage() {
  const projects = await getProjects()

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projets</h1>
        <Link href="/projects/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nouveau Projet
          </Button>
        </Link>
      </div>
      <ProjectList projects={projects} />
    </div>
  )
}
