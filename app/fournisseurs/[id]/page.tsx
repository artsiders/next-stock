import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SupplierForm from "@/components/supplier-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { getSupplierById } from "@/lib/data"


export default async function EditProjectPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const product = await getSupplierById(Number.parseInt(id));

    if (!product) {
        notFound();
    }

    return (
        <div className="container mx-auto px-2 py-10">
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
                    <SupplierForm supplier={product} />
                </CardContent>
            </Card>
        </div>
    );
}