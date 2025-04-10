-- CreateTable
CREATE TABLE "Categorie" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Fournisseur" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "email" TEXT,
    "telephone" TEXT
);

-- CreateTable
CREATE TABLE "Produit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nom" TEXT NOT NULL,
    "description" TEXT,
    "quantite" INTEGER NOT NULL DEFAULT 0,
    "prixUnitaire" REAL NOT NULL,
    "categorieId" INTEGER NOT NULL,
    "fournisseurId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Produit_categorieId_fkey" FOREIGN KEY ("categorieId") REFERENCES "Categorie" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Produit_fournisseurId_fkey" FOREIGN KEY ("fournisseurId") REFERENCES "Fournisseur" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MouvementStock" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "produitId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "quantite" INTEGER NOT NULL,
    "date" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "MouvementStock_produitId_fkey" FOREIGN KEY ("produitId") REFERENCES "Produit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
