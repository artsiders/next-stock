import { Button } from "@/components/ui/button"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"
import { getCategories } from "@/lib/data"
import CategoriesList from "@/components/categories-list"

export default async function ProjectsPage() {
    const categories = await getCategories()

    return (
        <div className="container mx-auto py-10">
            <Link href="/">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Accueil
                </Button>
            </Link>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Categorie</h1>
                <Link href="/categories/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Categorie
                    </Button>
                </Link>
            </div>
            <CategoriesList categories={categories} />
        </div>
    )
}
