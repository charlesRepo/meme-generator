"use client"

import { useState, useEffect } from "react"

type MemeTemplate = {
    id: string;
    name: string;
    url: string;
    width: number;
    height: number;
    box_count: number;
}

export default function Meme() {
    const [meme, setMeme] = useState({
        topText: '',
        bottomText: '',
        randomImage: 'https://i.imgflip.com/1bij.jpg', // Default meme
        width: 0,
        height: 0
    });
    const [allMemes, setAllMemes] = useState<MemeTemplate[]>([]);

    useEffect(() => {
        // Fetch meme templates from Imgflip API
        fetch('https://api.imgflip.com/get_memes')
            .then(res => res.json())
            .then(data => {
                setAllMemes(data.data.memes);
            })
            .catch(err => {
                console.error("Error fetching memes:", err);
                // Fallback to some default memes if API fails
                setAllMemes([
                    {
                        id: '181913649',
                        name: 'Drake Hotline Bling',
                        url: 'https://i.imgflip.com/30b1gx.jpg',
                        width: 1200,
                        height: 1200,
                        box_count: 2
                    },
                    {
                        id: '87743020',
                        name: 'Two Buttons',
                        url: 'https://i.imgflip.com/1g8my4.jpg',
                        width: 600,
                        height: 908,
                        box_count: 2
                    },
                    {
                        id: '112126428',
                        name: 'Distracted Boyfriend',
                        url: 'https://i.imgflip.com/1ihzfe.jpg',
                        width: 1200,
                        height: 800,
                        box_count: 3
                    }
                ]);
            });
    }, []);

    const getMemeImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (allMemes.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * allMemes.length);
        const { url, width, height } = allMemes[randomIndex];
        
        setMeme(prevMeme => ({
            ...prevMeme,
            randomImage: url,
            width,
            height
        }));
    }


    return (
        <article className="w-full lg:w-1/2 mx-auto p-6 rounded-lg">
            <form className="flex flex-col gap-4 w-full">
                <button 
                    onClick={getMemeImage}
                    className="bg-gradient-to-r from-purple-600 to-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity"
                >
                    Get a new meme image 🖼️
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <input 
                        type="text"
                        placeholder="Top text"
                        className="p-2 border border-gray-300 rounded text-black"
                        value={meme.topText}
                        onChange={(e) => setMeme(prev => ({...prev, topText: e.target.value}))}
                    />
                    <input 
                        type="text"
                        placeholder="Bottom text"
                        className="p-2 border border-gray-300 rounded text-black"
                        value={meme.bottomText}
                        onChange={(e) => setMeme(prev => ({...prev, bottomText: e.target.value}))}
                    />
                </div>
            </form>
            
            <div className="mt-8 relative flex justify-center">
                {meme.randomImage && (
                    <div className="relative">
                        <img 
                            src={meme.randomImage} 
                            alt="Random meme" 
                            className="max-w-full rounded-lg shadow-lg"
                        />
                        <h2 className="absolute top-4 left-0 right-0 text-center text-4xl font-bold text-white uppercase tracking-wider text-outline">
                            {meme.topText}
                        </h2>
                        <h2 className="absolute bottom-4 left-0 right-0 text-center text-4xl font-bold text-white uppercase tracking-wider text-outline">
                            {meme.bottomText}
                        </h2>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .text-outline {
                    text-shadow: 
                        -2px -2px 0 #000,
                        2px -2px 0 #000,
                        -2px 2px 0 #000,
                        2px 2px 0 #000;
                }
            `}
            </style>
        </article>
    )
}