"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar as CalendarIcon, AlertCircle, TrendingUp, ArrowDown, ArrowUp, Package, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell, LineChart as RechartsLineChart, Line } from "recharts";

// Types pour nos données statistiques
type StatsPeriod = "day" | "week" | "month" | "year";
type CategoryStats = { name: string; count: number; value: number };
type MovementStats = { date: string; in: number; out: number; adjustment: number };
type LowStockProduct = { id: number; name: string; quantity: number; minQuantity: number; percentage: number };
type ValueStats = { totalValue: number; averageCost: number; potentialRevenue: number; margin: number };

// Fonction pour récupérer les statistiques
const fetchStats = async (period: StatsPeriod) => {
    // Dans une application réelle, ces appels seraient envoyés à une API backend
    // Ici nous simulons des données

    try {
        // Les dates sont calculées selon la période
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case "day":
                startDate.setDate(now.getDate() - 1);
                break;
            case "week":
                startDate.setDate(now.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        // Simulation des données pour l'affichage
        return {
            summary: {
                totalProducts: 432,
                lowStockProducts: 18,
                outOfStockProducts: 5,
                totalMovements: period === "day" ? 12 : period === "week" ? 87 : period === "month" ? 346 : 1240,
            },
            valueStats: {
                totalValue: 87520,
                averageCost: 45.75,
                potentialRevenue: 124350,
                margin: 36830,
            },
            categoryStats: [
                { name: "Électronique", count: 145, value: 32450 },
                { name: "Mobilier", count: 78, value: 18720 },
                { name: "Accessoires", count: 112, value: 15640 },
                { name: "Livres", count: 97, value: 12350 },
                { name: "Autres", count: 45, value: 8360 },
            ],
            movementStats: Array.from({ length: period === "day" ? 24 : period === "week" ? 7 : period === "month" ? 30 : 12 }, (_, i) => {
                const date = period === "day" ? `${i}h` :
                    period === "week" ? ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][i] :
                        period === "month" ? `${i + 1}` : ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Aoû", "Sep", "Oct", "Nov", "Déc"][i];

                const randomFactor = Math.random() * 10;
                return {
                    date,
                    in: Math.floor(randomFactor * 5),
                    out: Math.floor(randomFactor * 3),
                    adjustment: Math.floor(randomFactor * 0.5),
                };
            }),
            lowStockProducts: [
                { id: 1, name: "Smartphone Galaxy X", quantity: 3, minQuantity: 10, percentage: 30 },
                { id: 2, name: "Écran 27 pouces", quantity: 2, minQuantity: 5, percentage: 40 },
                { id: 3, name: "Clavier sans fil", quantity: 4, minQuantity: 15, percentage: 27 },
                { id: 4, name: "Souris optique", quantity: 6, minQuantity: 20, percentage: 30 },
                { id: 5, name: "Écouteurs bluetooth", quantity: 8, minQuantity: 25, percentage: 32 },
            ]
        };
    } catch (error) {
        console.error("Erreur lors de la récupération des statistiques:", error);
        throw error;
    }
};

// Couleurs pour les graphiques
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function StatisticsPage() {
    const [period, setPeriod] = useState<StatsPeriod>("month");
    const [date, setDate] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // États pour les données statistiques
    const [summary, setSummary] = useState({ totalProducts: 0, lowStockProducts: 0, outOfStockProducts: 0, totalMovements: 0 });
    const [valueStats, setValueStats] = useState<ValueStats>({ totalValue: 0, averageCost: 0, potentialRevenue: 0, margin: 0 });
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [movementStats, setMovementStats] = useState<MovementStats[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);

    useEffect(() => {
        const loadStats = async () => {
            setLoading(true);
            setError(null);

            try {
                const stats = await fetchStats(period);
                setSummary(stats.summary);
                setValueStats(stats.valueStats);
                setCategoryStats(stats.categoryStats);
                setMovementStats(stats.movementStats);
                setLowStockProducts(stats.lowStockProducts);
            } catch (err) {
                setError("Impossible de charger les statistiques");
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, [period, date]);

    return (
        <div className="container mx-auto py-6">
            <h1 className="text-3xl font-bold mb-6">Statistiques de l'inventaire</h1>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="space-y-2">
                    <p className="text-sm font-medium">Période</p>
                    <Select value={period} onValueChange={(value) => setPeriod(value as StatsPeriod)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Sélectionner une période" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="day">Journalier</SelectItem>
                            <SelectItem value="week">Hebdomadaire</SelectItem>
                            <SelectItem value="month">Mensuel</SelectItem>
                            <SelectItem value="year">Annuel</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <p className="text-sm font-medium">Date</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-[180px]">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "dd MMMM yyyy", { locale: fr })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(date) => date && setDate(date)}
                                locale={fr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            {/* Section résumé */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total produits</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            références en stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produits faible stock</CardTitle>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.lowStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            produits sous le seuil minimum
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Produits épuisés</CardTitle>
                        <AlertCircle className="h-4 w-4 text-destructive" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.outOfStockProducts}</div>
                        <p className="text-xs text-muted-foreground">
                            produits avec stock à zéro
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mouvements</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summary.totalMovements}</div>
                        <p className="text-xs text-muted-foreground">
                            sur la période
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Section valeur */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valeur totale stock</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valueStats.totalValue.toLocaleString('fr-FR')} €</div>
                        <p className="text-xs text-muted-foreground">
                            au prix d'achat
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Coût moyen par produit</CardTitle>
                        <ArrowDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valueStats.averageCost.toLocaleString('fr-FR')} €</div>
                        <p className="text-xs text-muted-foreground">
                            prix d'achat moyen
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Revenus potentiels</CardTitle>
                        <ArrowUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valueStats.potentialRevenue.toLocaleString('fr-FR')} €</div>
                        <p className="text-xs text-muted-foreground">
                            au prix de vente
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Marge potentielle</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{valueStats.margin.toLocaleString('fr-FR')} €</div>
                        <p className="text-xs text-muted-foreground">
                            ({((valueStats.margin / valueStats.totalValue) * 100).toFixed(1)}%)
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Graphiques avancés */}
            <Tabs defaultValue="movements" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="movements">Mouvements</TabsTrigger>
                    <TabsTrigger value="categories">Catégories</TabsTrigger>
                    <TabsTrigger value="lowstock">Stock faible</TabsTrigger>
                </TabsList>

                <TabsContent value="movements" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Mouvements de stock</CardTitle>
                            <CardDescription>
                                Entrées et sorties de produits sur la période
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart
                                        data={movementStats}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="date" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="in" name="Entrées" stroke="#0088FE" strokeWidth={2} />
                                        <Line type="monotone" dataKey="out" name="Sorties" stroke="#FF8042" strokeWidth={2} />
                                        <Line type="monotone" dataKey="adjustment" name="Ajustements" stroke="#FFBB28" strokeWidth={2} />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="categories" className="space-y-4 grid md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Répartition par catégorie</CardTitle>
                            <CardDescription>
                                Nombre de produits par catégorie
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={categoryStats}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="count"
                                        >
                                            {categoryStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Valeur par catégorie</CardTitle>
                            <CardDescription>
                                Valeur du stock par catégorie (en €)
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-2">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={categoryStats}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => `${Number(value).toLocaleString('fr-FR')} €`} />
                                        <Bar dataKey="value" fill="#0088FE" name="Valeur (€)">
                                            {categoryStats.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="lowstock">
                    <Card>
                        <CardHeader>
                            <CardTitle>Produits en stock faible</CardTitle>
                            <CardDescription>
                                Produits dont la quantité est inférieure au seuil minimum
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 gap-4">
                                {lowStockProducts.map((product) => (
                                    <Card key={product.id} className="bg-muted/50">
                                        <CardContent className="p-4">
                                            <div className="flex items-center justify-between">
                                                <div className="space-y-1">
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        En stock: <span className="font-medium text-destructive">{product.quantity}</span> / Minimum: {product.minQuantity}
                                                    </p>
                                                </div>
                                                <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${product.percentage < 30 ? 'bg-destructive' : 'bg-amber-500'}`}
                                                        style={{ width: `${product.percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}