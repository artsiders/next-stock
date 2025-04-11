import React from 'react'
import { Metadata } from "next";
import ApprovisionnementPage from './ApprovisionnementPage';

export const metadata: Metadata = {
    title: "approvisionnements | Nest stock",
    description: ""
};

export default function page() {
    return (
        <ApprovisionnementPage />
    )
}
