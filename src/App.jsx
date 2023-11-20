import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AuctionInfo from './auctionInfo'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <AuctionInfo></AuctionInfo>
      </div>
      
    </>
  )
}

export default App
