import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ProductForm from "@/components/product-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getCategories, getProductById, getSuppliers } from "@/lib/data"

// Define the props type for clarity
interface EditProjectPageProps {
    params: Promise<{ id: string }> | { id: string }; // Account for both sync and async params
}

export default async function EditProjectPage({ params }: EditProjectPageProps) {
    // Resolve params if it's a Promise (for App Router 14+ compatibility)
    const resolvedParams = await params;
    const product = await getProductById(Number.parseInt(resolvedParams.id));
    const categories = await getCategories();
    const suppliers = await getSuppliers();

    if (!product) {
        notFound();
    }

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
                    <CardTitle>Modifier Projet</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm product={product} categories={categories} suppliers={suppliers} />
                </CardContent>
            </Card>
        </div>
    );
}