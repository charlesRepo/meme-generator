import Image from "next/image"

export default function Header(){
    return (
        <header className="w-full bg-white shadow-sm">
            <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center">
                    <Image className="mr-4 object-cover" src="/images/troll.webp" width="60" height="60" alt="troll meme face"/>
                    <h1 className="text-black font-bold text-3xl md:text-4xl">Meme Generator</h1>
                </div>
            </div>
        </header>
    )
}