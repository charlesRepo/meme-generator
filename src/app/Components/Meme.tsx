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
        width: number;
        height: number;
    };
    const [texts, setTexts] = useState<TextItem[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [loadingSuggest, setLoadingSuggest] = useState(false);
    const [dragId, setDragId] = useState<string | null>(null);
    const [resizeId, setResizeId] = useState<string | null>(null);
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

    // Handle resizing of text overlays
    useEffect(() => {
        const handleResize = (e: MouseEvent | TouchEvent) => {
            if (!resizeId || !imgRef.current) return;
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
            
            // Calculate new width and height based on distance from center
            const text = texts.find(t => t.id === resizeId);
            if (!text) return;
            
            const centerX = text.xPct * rect.width + rect.left;
            const centerY = text.yPct * rect.height + rect.top;
            
            const newWidth = Math.abs(clientX - centerX) * 2;
            const newHeight = Math.abs(clientY - centerY) * 2;
            
            // Convert to percentage of image size
            const widthPct = newWidth / rect.width;
            const heightPct = newHeight / rect.height;
            
            // Calculate optimal font size based on new dimensions
            const optimalFontSize = calculateOptimalFontSize(widthPct, heightPct, text.text);
            
            setTexts(prev => prev.map(t => t.id === resizeId ? { 
                ...t, 
                width: widthPct,
                height: heightPct,
                fontSize: optimalFontSize
            } : t));
        };
        
        const handleUp = () => setResizeId(null);
        
        if (resizeId) {
            // Mouse events
            window.addEventListener('mousemove', handleResize);
            window.addEventListener('mouseup', handleUp, { once: true });
            
            // Touch events
            window.addEventListener('touchmove', handleResize, { passive: false });
            window.addEventListener('touchend', handleUp, { once: true });
        }
        
        return () => {
            window.removeEventListener('mousemove', handleResize);
            window.removeEventListener('mouseup', handleUp);
            window.removeEventListener('touchmove', handleResize);
            window.removeEventListener('touchend', handleUp);
        };
    }, [resizeId, texts]);

    // Calculate optimal font size based on text box dimensions
    const calculateOptimalFontSize = (widthPct: number, heightPct: number, text: string): number => {
        if (widthPct <= 0 || heightPct <= 0) return 48;
        
        // Base font size calculation on the smaller dimension to ensure text fits
        const minDimension = Math.min(widthPct, heightPct);
        
        // Calculate base font size (percentage of image size)
        let baseFontSize = minDimension * 100; // Convert to percentage
        
        // Adjust based on text length
        const textLength = text.length;
        if (textLength > 20) {
            baseFontSize *= 0.7; // Reduce font size for longer text
        } else if (textLength > 10) {
            baseFontSize *= 0.85; // Slightly reduce for medium text
        }
        
        // Convert to pixels (assuming image height as reference)
        const fontSizeInPixels = baseFontSize * (imgRef.current?.height || 400) / 100;
        
        // Clamp between reasonable bounds
        const minFontSize = 12;
        const maxFontSize = 120;
        
        return Math.max(minFontSize, Math.min(maxFontSize, fontSizeInPixels));
    };

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
            fontSize: 48,
            textAlign: 'center',
            width: 0,
            height: 0
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
            fontSize: 48,
            textAlign: 'center',
            width: 0,
            height: 0
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
                                    width: t.width > 0 ? `${t.width * 100}%` : 'auto',
                                    height: t.height > 0 ? `${t.height * 100}%` : 'auto',
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

                                {/* Alignment handle - top right corner */}
                                <div
                                    className="absolute -top-8 -right-8 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-pointer z-20 touch-manipulation"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        // Cycle through alignment options
                                        const alignments = ['left', 'center', 'right'];
                                        const currentIndex = alignments.indexOf(t.textAlign);
                                        const nextIndex = (currentIndex + 1) % alignments.length;
                                        const newAlignment = alignments[nextIndex];
                                        setTexts(prev => prev.map(text => 
                                            text.id === t.id ? { ...text, textAlign: newAlignment } : text
                                        ));
                                    }}
                                    title={`Text alignment: ${t.textAlign} (click to change)`}
                                >
                                    <div className="w-8 h-8 md:w-6 md:h-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors">
                                        {t.textAlign === 'left' && (
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h6" />
                                            </svg>
                                        )}
                                        {t.textAlign === 'center' && (
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M6 12h12M8 18h8" />
                                            </svg>
                                        )}
                                        {t.textAlign === 'right' && (
                                            <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M14 18h6" />
                                            </svg>
                                        )}
                                    </div>
                                </div>

                                {/* Resize handle - bottom right corner */}
                                <div
                                    className="absolute bottom-0 right-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 cursor-se-resize z-20 touch-manipulation"
                                    onMouseDown={(e) => { 
                                        e.preventDefault(); 
                                        e.stopPropagation(); 
                                        setResizeId(t.id); 
                                    }}
                                    onTouchStart={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setResizeId(t.id);
                                    }}
                                    title={t.width > 0 || t.height > 0 ? "Resize text box (auto font size)" : "Resize text box"}
                                >
                                    <div className={`w-6 h-6 ${t.width > 0 || t.height > 0 ? 'bg-purple-500 hover:bg-purple-600 active:bg-purple-700' : 'bg-green-500 hover:bg-green-600 active:bg-green-700'} text-white rounded-full flex items-center justify-center shadow-lg transition-colors`}>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17L17 7M17 7H7M17 7V17" />
                                        </svg>
                                    </div>
                                </div>

                                <div
                                    data-text-id={t.id}
                                    onFocus={() => handleTextFocus(t.id)}
                                    dir="ltr" 
                                    contentEditable
                                    suppressContentEditableWarning
                                    className="font-bold text-white uppercase tracking-wider text-outline cursor-text select-text w-full h-full flex items-center justify-center"
                                    style={{
                                        direction: 'ltr',
                                        unicodeBidi: 'normal',
                                        fontSize: `${t.fontSize}px`,
                                        textAlign: t.textAlign as any,
                                        minWidth: 'fit-content',
                                        minHeight: 'fit-content',
                                        wordWrap: 'break-word',
                                        overflowWrap: 'break-word'
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