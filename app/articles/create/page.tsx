import Link from "next/link"
import FormBuatArtikel from "./FormBuatArtikel"

export default function PageBuatArtikel() {
    return (
        <div>
            <Link href="/articles" className="btn btn-accent mb-4">Kembali</Link>
            <FormBuatArtikel />
        </div>
    )
}
