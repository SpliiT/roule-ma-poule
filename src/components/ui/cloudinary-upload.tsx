'use client';
import { useState, useRef, useCallback } from 'react';
import { UploadCloud, X, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
interface CloudinaryUploadProps {
    onUpload: (urls: string[]) => void;
    multiple?: boolean;
    folder?: string;
    buttonText?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
}
export function CloudinaryUpload({
    onUpload,
    multiple = false,
    folder = 'roule-ma-poule',
    buttonText = 'Ajouter des photos',
    className
}: CloudinaryUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const uploadToCloudinary = async (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'roule-ma-poule');
        formData.append('folder', folder);
        const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
        const xhr = new XMLHttpRequest();
        return new Promise<string>((resolve, reject) => {
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const progress = Math.round((e.loaded / e.total) * 100);
                    setUploadProgress(progress);
                }
            });
            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.secure_url);
                } else {
                    reject(new Error('Upload failed'));
                }
            });
            xhr.addEventListener('error', () => reject(new Error('Upload failed')));
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);
            xhr.send(formData);
        });
    };
    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;
        setIsUploading(true);
        setUploadProgress(0);
        try {
            const fileArray = Array.from(files).slice(0, multiple ? 10 : 1);
            const urls: string[] = [];
            for (const file of fileArray) {
                const url = await uploadToCloudinary(file);
                urls.push(url);
            }
            setUploadedUrls(urls);
            onUpload(urls);
            setUploadProgress(100);
            setTimeout(() => {
                setIsUploading(false);
                setUploadProgress(0);
            }, 1000);
        } catch (error) {
            console.error('Upload error:', error);
            setIsUploading(false);
            setUploadProgress(0);
        }
    }, [multiple, folder, onUpload]);
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);
    const handleClick = () => {
        fileInputRef.current?.click();
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };
    return (
        <div className={cn('relative', className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple={multiple}
                onChange={handleFileChange}
                className="hidden"
            />
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative cursor-pointer rounded-lg border-2 border-dashed transition-all duration-200',
                    'hover:border-primary/50 hover:bg-primary/5',
                    'flex flex-col items-center justify-center gap-3 p-8',
                    isDragging && 'border-primary bg-primary/10 scale-[1.02]',
                    isUploading && 'pointer-events-none opacity-75',
                    className
                )}
            >
                {isUploading ? (
                    <>
                        <Loader2 className="h-10 w-10 animate-spin text-primary" />
                        <div className="w-full max-w-xs">
                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full bg-primary transition-all duration-300 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                />
                            </div>
                            <p className="mt-2 text-center text-sm text-muted-foreground">
                                Upload en cours... {uploadProgress}%
                            </p>
                        </div>
                    </>
                ) : uploadProgress === 100 ? (
                    <>
                        <CheckCircle2 className="h-10 w-10 text-green-500" />
                        <p className="text-sm font-medium text-green-600">Upload réussi !</p>
                    </>
                ) : (
                    <>
                        <div className="rounded-full bg-primary/10 p-4">
                            <UploadCloud className="h-8 w-8 text-primary" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium">
                                {buttonText}
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Glissez-déposez ou cliquez pour sélectionner
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                                JPG, PNG ou WEBP • Max 10 Mo
                            </p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
