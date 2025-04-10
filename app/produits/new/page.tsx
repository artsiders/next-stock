import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectForm from "@/components/product-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getCategories, getSuppliers } from "@/lib/data"

export default async function NewProjectPage() {
    const categories = await getCategories();
    const suppliers = await getSuppliers();
    return (
        <div className="container mx-auto py-10">
            <Link href="/produits">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux projets
                </Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter un nouveau produit</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProjectForm categories={categories} suppliers={suppliers} />
                </CardContent>
            </Card>
        </div>
    )
}
