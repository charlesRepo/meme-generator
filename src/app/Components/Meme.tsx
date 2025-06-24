"use client"

import { useState, useEffect, useRef } from "react"
import CopyImageButton from "./CopyImageButton"
import GenerateMemeButton from "./GenerateMemeButton"
import SuggestCaptionsButton from "./SuggestCaptionsButton"
import FontControls from "./FontControls"

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
        name: 'One does not simply',
        randomImage: 'https://i.imgflip.com/1bij.jpg', // Default meme
        width: 0,
        height: 0
    });
    const [allMemes, setAllMemes] = useState<MemeTemplate[]>([]);
    type TextItem = { 
        id: string; 
        xPct: number; 
        yPct: number; 
        text: string;
        fontSize: number;
        textAlign: string;
    };
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);
    const [fontSize, setFontSize] = useState(48);
    const [textAlign, setTextAlign] = useState('center');
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
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
        const handleMove = (e: MouseEvent | TouchEvent) => {
            if (!dragId || !imgRef.current) return;
            const rect = imgRef.current.getBoundingClientRect();
            
            let clientX: number, clientY: number;
            
            if (e instanceof MouseEvent) {
                clientX = e.clientX;
                clientY = e.clientY;
            } else {
                // Touch event
                const touch = e.touches[0];
                clientX = touch.clientX;
                clientY = touch.clientY;
            }
            
            const xPct = (clientX - rect.left) / rect.width;
            const yPct = (clientY - rect.top) / rect.height;
            setTexts(prev => prev.map(t => t.id === dragId ? { ...t, xPct, yPct } : t));
        };
        
        const handleUp = () => setDragId(null);
        
        if (dragId) {
            // Mouse events
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp, { once: true });
            
            // Touch events
            window.addEventListener('touchmove', handleMove, { passive: false });
            window.addEventListener('touchend', handleUp, { once: true });
        }
        
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleMove);
            window.removeEventListener('touchend', handleUp);
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
        setTexts(prev => [...prev, { 
            id: crypto.randomUUID(), 
            xPct, 
            yPct, 
            text: 'Text',
            fontSize,
            textAlign
        }]);
    }

    const handleImageTouch = (e: React.TouchEvent<HTMLImageElement>) => {
        e.preventDefault(); // Prevent default touch behavior
        const rect = e.currentTarget.getBoundingClientRect();
        const touch = e.touches[0];
        const xPct = (touch.clientX - rect.left) / rect.width;
        const yPct = (touch.clientY - rect.top) / rect.height;
        setTexts(prev => [...prev, { 
            id: crypto.randomUUID(), 
            xPct, 
            yPct, 
            text: 'Text',
            fontSize,
            textAlign
        }]);
    }

    const handleTextKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, textId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Insert a line break instead of submitting
            document.execCommand('insertLineBreak', false);
        } else if (e.key === 'Escape') {
            e.preventDefault();
            // Exit editing mode by blurring the element
            (e.target as HTMLDivElement).blur();
        }
    }

    const handleTextBlur = (e: React.FocusEvent<HTMLDivElement>, textId: string) => {
        const newText = e.target.textContent || '';
        setTexts(prev => prev.map(item => item.id === textId ? { ...item, text: newText } : item));
        setEditingTextId(null);
    }

    const handleTextFocus = (textId: string) => {
        setEditingTextId(textId);
    }

    const handleCheckmarkClick = (textId: string) => {
        setEditingTextId(null);
        // Find the text element and blur it
        const textElement = document.querySelector(`[data-text-id="${textId}"]`) as HTMLDivElement;
        if (textElement) {
            textElement.blur();
        }
    }

    const handleDeleteClick = (textId: string) => {
        // Remove the text from the array
        setTexts(prev => prev.filter(text => text.id !== textId));
        // Clear the editing state
        setEditingTextId(null);
    }

    const handleFontSizeChange = (size: number) => {
        setFontSize(size);
        // Update all existing texts with new font size
        setTexts(prev => prev.map(text => ({ ...text, fontSize: size })));
    }

    const handleTextAlignChange = (align: string) => {
        setTextAlign(align);
        // Update all existing texts with new alignment
        setTexts(prev => prev.map(text => ({ ...text, textAlign: align })));
    }

    return (
        <article className="w-full lg:w-1/2 mx-auto p-6 rounded-lg">
            <form className="flex flex-col gap-4 w-full">
                <GenerateMemeButton onClick={getMemeImage} />

                {/* Font Controls */}
                <FontControls
                    fontSize={fontSize}
                    textAlign={textAlign}
                    onFontSizeChange={handleFontSizeChange}
                    onTextAlignChange={handleTextAlignChange}
                />

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
                            onTouchStart={handleImageTouch}
                        />
                        {texts.map(t => (
                            <div
                                key={t.id} 
                                className="relative group"
                                style={{
                                    position: 'absolute',
                                    left: `${t.xPct * 100}%`,
                                    top: `${t.yPct * 100}%`,
                                    transform: 'translate(-50%, -50%)',
                                }}
                            >
                                {/* Move icon - appears on hover (desktop) and always visible on mobile */}
                                <div
                                    className="absolute -top-8 -left-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-move z-20 touch-manipulation"
                                    onMouseDown={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        setDragId(t.id); 
                                    }}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setDragId(t.id);
                                    }}
                                    title="Move text"
                                >
                                    <div className="w-8 h-8 md:w-6 md:h-6 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                                        <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                        </svg>
                                    </div>
                                </div>

                                <div
                                    data-text-id={t.id}
                                    onFocus={() => handleTextFocus(t.id)}
                                    dir="ltr" 
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="font-bold text-white uppercase tracking-wider text-outline cursor-text select-text"
                                    style={{
                                        direction: 'ltr',
                                        unicodeBidi: 'normal',
                                        whiteSpace: 'nowrap',
                                        fontSize: `${t.fontSize}px`,
                                        textAlign: t.textAlign as any,
                                        minWidth: 'fit-content'
                                    }}
                                    onKeyDown={(e) => handleTextKeyDown(e, t.id)}
                                    onBlur={(e) => handleTextBlur(e, t.id)}
                                >
                                    {t.text}
                                </div>
                                
                                {/* Buttons - only show when editing this specific text */}
                                {editingTextId === t.id && (
                                    <div className="absolute -bottom-6 -right-6 flex gap-2" style={{ zIndex: 10 }}>
                                        {/* Delete button */}
                                        <button
                                            type="button"
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleDeleteClick(t.id);
                                            }}
                                            className="w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                        
                                        {/* Checkmark button */}
                                        <button
                                            type="button"
                                            onClick={() => handleCheckmarkClick(t.id)}
                                            className="w-6 h-6 bg-green-500 hover:bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
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
                
                /* Prevent text selection during drag on mobile */
                .touch-manipulation {
                    touch-action: manipulation;
                    -webkit-user-select: none;
                    -moz-user-select: none;
                    -ms-user-select: none;
                    user-select: none;
                }
            `}
            </style>
        </article>
    )
}