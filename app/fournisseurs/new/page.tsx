import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import NewSupplierForm from "@/components/supplier-form"

export default async function NewProjectPage() {
    return (
        <div className="container py-10 max-w-xl mx-auto">
            <Link href="/fournisseurs">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour aux fournisseurs
                </Button>
            </Link>
            <Card>
                <CardHeader>
                    <CardTitle>Ajouter une nouvelle founisseur</CardTitle>
                </CardHeader>
                <CardContent>
                    <NewSupplierForm />
                </CardContent>
            </Card>
        </div>
    )
}
