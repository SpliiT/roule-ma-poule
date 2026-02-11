import * as React from 'react';
import { cn } from '@/lib/utils';
export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}
const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        const variants: Record<string, string> = {
            default: 'bg-primary text-primary-foreground',
            secondary: 'bg-secondary text-secondary-foreground',
            destructive: 'bg-destructive text-destructive-foreground',
            outline: 'border border-input text-foreground',
            success: 'bg-success text-success-foreground',
            warning: 'bg-warning text-warning-foreground',
        };
        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors',
                    variants[variant],
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = 'Badge';
export { Badge };