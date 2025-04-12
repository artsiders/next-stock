import { Button } from "@/components/ui/button"
import { ArrowLeft, PlusCircle } from "lucide-react"
import Link from "next/link"
import ProductList from "@/components/product-list"

export default async function ProjectsPage() {

    return (
        <div className="container mx-auto px-2 py-10">
            <Link href="/">
                <Button variant="ghost" className="mb-4">
                    <ArrowLeft className="h-4 w-4" />
                    Accueil
                </Button>
            </Link>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Product</h1>
                <Link href="/produits/new">
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau Product
                    </Button>
                </Link>
            </div>
            <ProductList />
        </div>
    )
}
