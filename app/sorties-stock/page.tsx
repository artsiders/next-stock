import React from 'react'
import { Metadata } from "next";
import SortiesStockPage from './SortiesStockPage';

export const metadata: Metadata = {
    title: "Sorties Stock | Nest stock",
    description: ""
};

export default function page() {
    return (
        <SortiesStockPage />
    )
}
