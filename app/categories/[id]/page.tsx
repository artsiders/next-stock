import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CategoryForm from "@/components/category-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getCategorieById } from "@/lib/data"

export default async function EditCategoryPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const category = await getCategorieById(Number.parseInt(id));

    if (!category) {
        notFound();
    }

    return (
        <div className="container mx-auto py-10">
            <Link href="/categories">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux categories
                </Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Modifier La Categorie</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryForm category={category} />
                </CardContent>
            </Card>
        </div>
    );
}