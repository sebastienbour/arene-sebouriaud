import { useState } from 'react'
import { Bonjour } from './Bonjour'
import { Compteur } from './Compteur'
import { Scoreboard } from './Scoreboard'

export default function App() {
  const [count, setCount] = useState(0) 
  return (
    <>
      <Bonjour name="Ada" />
      <Scoreboard score={count}/>
      <Compteur setCount={setCount} count={count}/>
    </>
  )
}