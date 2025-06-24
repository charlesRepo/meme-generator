import Header from './Components/Header'
import Meme from './Components/Meme'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-800">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Meme />
      </div>
    </main>
  )
}
