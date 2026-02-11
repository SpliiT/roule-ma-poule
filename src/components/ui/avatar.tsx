import { cn } from '@/lib/utils';
interface AvatarProps {
    src?: string | null;
    name?: string | null;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}
function getInitials(name: string): string {
    return name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}
const COLORS = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
    'bg-indigo-500',
    'bg-red-500',
];
function getColorFromName(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return COLORS[Math.abs(hash) % COLORS.length];
}
export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
    const sizes = {
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-14 w-14 text-lg',
    };
    if (src) {
        return (
            <img
                src={src}
                alt={name || 'Avatar'}
                className={cn(
                    'rounded-full object-cover',
                    sizes[size],
                    className
                )}
            />
        );
    }
    const initials = name ? getInitials(name) : '?';
    const bgColor = name ? getColorFromName(name) : 'bg-muted';
    return (
        <div
            className={cn(
                'flex items-center justify-center rounded-full font-semibold text-white',
                sizes[size],
                bgColor,
                className
            )}
            title={name || undefined}
        >
            {initials}
        </div>
    );
}