import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import NewCategoryForm from "@/components/category-form"

export default async function NewProjectPage() {
    return (
        <div className="container py-10 max-w-xl mx-auto">
            <Link href="/categories">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux categories
                </Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une nouvelle categorie</CardTitle>
                </CardHeader>
                <CardContent>
                    <NewCategoryForm />
                </CardContent>
            </Card>
        </div>
    )
}
