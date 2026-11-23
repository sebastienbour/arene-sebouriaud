import { useState } from 'react'

export function Compteur() {
    const [count, setCount] = useState(0) 
    return (
        <>
            <button onClick={() => setCount(count + 1)}>+1</button>
            <button onClick={() => setCount(0)}>Réinitialiser</button>
        </>
    )
}