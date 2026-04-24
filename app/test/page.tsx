"use client"

import { useState } from "react"
import Button from "./Button"

export default function TestPage() {
    const [name, setName] = useState()
    const [tanggal, setTanggal] = useState()


    // Buat handler function
    const handleSubmit = (e) => {
        e.preventDefault()
        setName(e.target.nama_lengkap.value)
        setTanggal(e.target.tanggal_lahir.value)
    }

    // Tulis html di page
    return (
        <div>
            <Button />

            {/* Buat form untuk input data */}

            <form action="#" onSubmit={handleSubmit}>
                <label className="label block">Nama Lengkap</label>
                <input type="text" className="input" name="nama_lengkap"/>

                <label className="label block">Tanggal Lahir</label>
                <input type="date" className="input" name="tanggal_lahir"/>

                <button type="submit" className="btn btn-primary block mt-4">Submit Data</button>
            </form>
            
            <div>
                <h1 className="font-bold text-4xl">Biodata Saya</h1>
                <p>Nama: {name}</p>
                <p>Tanggal Lahir: {tanggal}</p>
            </div>

        </div>

    )
}