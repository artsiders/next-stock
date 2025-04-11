import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import CategoryForm from "@/components/category-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getCategorieById } from "@/lib/data"

interface Props {
    params: Promise<{ id: string }> | { id: string };
}

export default async function EditCategoryPage({ params }: Props) {
    const resolvedParams = await params;
    const category = await getCategorieById(Number.parseInt(resolvedParams.id));

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