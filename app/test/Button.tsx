"use client"

import { useState } from "react";

export default function Button() {
    // Buat state count
    const [count, setCount] = useState(0);
    
    return (
        <div>
            <h1 className="text-4xl font-bold">{count}</h1>

            <button className="btn btn-primary" onClick={() => setCount(count + 1)}>Count Up</button>
        </div>
    )
}