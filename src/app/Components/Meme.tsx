"use client"

import { useState, useEffect, useRef } from "react"
import CopyImageButton from "./CopyImageButton"
import GenerateMemeButton from "./GenerateMemeButton"
import SuggestCaptionsButton from "./SuggestCaptionsButton"

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
        name: 'Default',
        randomImage: 'https://i.imgflip.com/1bij.jpg', // Default meme
        width: 0,
        height: 0
    });
    const [allMemes, setAllMemes] = useState<MemeTemplate[]>([]);
    type TextItem = { id: string; xPct: number; yPct: number; text: string };
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

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

    const fetchSuggestions = async () => {
        if (!meme.randomImage) return;
        setLoadingSuggest(true);
        try {
            console.log(meme.randomImage);
            const prompt = `Meme template name: "${meme.name}". Give me one short funny meme caption for this meme with explaination why it is funny.`;
            const apiUrl =
            process.env.NODE_ENV === 'production'
                ? 'https://meme-generator-two-self.vercel.app/api/groq/'
                : '/api/groq';

            const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
            });
            const data = await res.json();
            setSuggestions(data.suggestions || []);
        } catch (err) {
            console.error(err);
            setSuggestions([]);
        }
        setLoadingSuggest(false);
    };

    // Handle dragging of text overlays
    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!dragId || !imgRef.current) return;
            const rect = imgRef.current.getBoundingClientRect();
            const xPct = (e.clientX - rect.left) / rect.width;
            const yPct = (e.clientY - rect.top) / rect.height;
            setTexts(prev => prev.map(t => t.id === dragId ? { ...t, xPct, yPct } : t));
        };
        const handleUp = () => setDragId(null);
        if (dragId) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp, { once: true });
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [dragId, setTexts]);

    const getMemeImage = (e: React.MouseEvent) => {
        e.preventDefault();
        if (allMemes.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * allMemes.length);
        const { url, width, height, name } = allMemes[randomIndex];
        
        setMeme(prevMeme => ({
            ...prevMeme,
            name,
            randomImage: url,
            width,
            height
        }));
    }

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const xPct = (e.clientX - rect.left) / rect.width;
        const yPct = (e.clientY - rect.top) / rect.height;
        setTexts(prev => [...prev, { id: crypto.randomUUID(), xPct, yPct, text: 'Text' }]);
    }

    return (
        <article className="w-full lg:w-1/2 mx-auto p-6 rounded-lg">
            <form className="flex flex-col gap-4 w-full">
                <GenerateMemeButton onClick={getMemeImage} />

                {/* Suggest captions section */}
                <SuggestCaptionsButton
                    onClick={fetchSuggestions}
                    loading={loadingSuggest}
                    disabled={!meme.randomImage}
                />
                {suggestions.length > 0 && (
                    <div className="relative bg-gray-100 p-4 rounded-lg mt-2 space-y-2 text-black">
                            <button
                                type="button"
                                onClick={() => setSuggestions([])}
                                className="absolute top-1 right-1 text-gray-500 hover:text-gray-800 font-bold text-2xl leading-none"
                            >
                                ×
                            </button>
                        {suggestions.map((s, idx) => (
                            <p
                                key={idx}
                                className="text-sm"
                            >
                                {s}
                            </p>
                        ))}
                    </div>
                )}
                
                <CopyImageButton 
                        imageUrl={meme.randomImage}
                        texts={texts}
                        disabled={!meme.randomImage}
                    />
            </form>
            
            <div className="mt-8">
            <p className="text-center text-gray-400 italic p-4">Click on the image and write</p>
                <div className="relative flex justify-center">
                {meme.randomImage && (
                    <div className="relative">
                        <img 
                            ref={imgRef} src={meme.randomImage} 
                            alt="Random meme" 
                            className="max-w-full rounded-lg shadow-lg cursor-crosshair"
                            onClick={handleImageClick}
                        />
                        {texts.map(t => (
                            <div
                                key={t.id} onMouseDown={(e) => { e.stopPropagation(); setDragId(t.id); }}
                                dir="ltr" contentEditable
                                suppressContentEditableWarning
                                className="absolute text-4xl font-bold text-white uppercase tracking-wider text-outline cursor-text select-text"
                                style={{
                                    direction: 'ltr',
                                    unicodeBidi: 'normal',
                                    left: `${t.xPct * 100}%`,
                                    top: `${t.yPct * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                    whiteSpace: 'nowrap',
                                     cursor: dragId === t.id ? 'grabbing' : 'move'
                                }}
                                onBlur={(e: React.FocusEvent<HTMLDivElement>) => {
                                    const newText = (e.target as HTMLDivElement).textContent || '';
                                    setTexts(prev => prev.map(item => item.id === t.id ? { ...item, text: newText } : item));
                                }}
                            >
                                {t.text}
                            </div>
                        ))}
                    </div>
                )}
                </div>
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