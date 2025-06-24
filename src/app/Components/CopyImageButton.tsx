'use client'

import { useRef } from 'react';

type TextItem = { xPct: number; yPct: number; text: string };

type CopyImageButtonProps = {
    imageUrl: string;
    texts: TextItem[];
    disabled?: boolean;
};

export default function CopyImageButton({ imageUrl, texts, disabled = false }: CopyImageButtonProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    const copyImageToClipboard = async () => {
        if (!imgRef.current || !canvasRef.current) return;
        
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size to match the image
        canvas.width = imgRef.current.naturalWidth;
        canvas.height = imgRef.current.naturalHeight;

        // Draw the image
        ctx.drawImage(imgRef.current, 0, 0);
        
        // Draw user-added texts
        texts.forEach(item => {
            ctx.font = 'bold 48px Impact';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'white';
            ctx.strokeStyle = 'black';
            ctx.lineWidth = 4;
            const x = item.xPct * canvas.width;
            const y = item.yPct * canvas.height;
            ctx.strokeText(item.text, x, y);
            ctx.fillText(item.text, x, y);
        });

        try {
            // Convert canvas to blob and copy to clipboard
            const blob = await new Promise<Blob | null>((resolve) => 
                canvas.toBlob((blob) => resolve(blob), 'image/png')
            );
            
            if (blob) {
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                alert('Meme copied to clipboard!');
            }
        } catch (err) {
            console.error('Failed to copy image: ', err);
            alert('Failed to copy image to clipboard');
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={copyImageToClipboard}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-6 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={disabled || !imageUrl}
            >
                Copy Image to Clipboard 📋
            </button>
            
            {/* Hidden elements for image processing */}
            <div className="hidden">
                <img 
                    ref={imgRef}
                    src={imageUrl} 
                    alt="Meme template" 
                    crossOrigin="anonymous"
                    onLoad={(e) => {
                        const img = e.target as HTMLImageElement;
                        if (canvasRef.current) {
                            canvasRef.current.width = img.naturalWidth;
                            canvasRef.current.height = img.naturalHeight;
                        }
                    }}
                />
                <canvas ref={canvasRef} />
            </div>
        </>
    );
}
