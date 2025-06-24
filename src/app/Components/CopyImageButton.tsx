'use client'

import { useRef } from 'react';

type CopyImageButtonProps = {
    imageUrl: string;
    topText: string;
    bottomText: string;
    disabled?: boolean;
}

export default function CopyImageButton({ imageUrl, topText, bottomText, disabled = false }: CopyImageButtonProps) {
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
        
        // Add text styling
        ctx.font = 'bold 48px Impact';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 4;
        
        // Draw top text with outline
        const x = canvas.width / 2;
        const topY = 60;
        
        ctx.strokeText(topText, x, topY);
        ctx.fillText(topText, x, topY);
        
        // Draw bottom text with outline
        const bottomY = canvas.height - 30;
        ctx.strokeText(bottomText, x, bottomY);
        ctx.fillText(bottomText, x, bottomY);

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
