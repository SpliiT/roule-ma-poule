import React from 'react';
import { render, screen } from '@testing-library/react';
import { LoadingSpinner, Skeleton, PageLoader } from '../loading';

describe('Loading Components', () => {
    describe('LoadingSpinner', () => {
        it('renders with default md size', () => {
            const { container } = render(<LoadingSpinner />);
            const svg = container.querySelector('svg');
            expect(svg).toBeInTheDocument();
            expect(svg?.className.baseVal).toContain('h-8 w-8');
            expect(svg?.className.baseVal).toContain('animate-spin');
        });

        it('renders with specific sizes and custom classes', () => {
            const { container, rerender } = render(<LoadingSpinner size="sm" className="custom-class" />);
            let svg = container.querySelector('svg');
            expect(svg?.className.baseVal).toContain('h-4 w-4');
            expect(svg?.className.baseVal).toContain('custom-class');

            rerender(<LoadingSpinner size="lg" />);
            svg = container.querySelector('svg');
            expect(svg?.className.baseVal).toContain('h-12 w-12');
        });
    });

    describe('Skeleton', () => {
        it('renders correctly with pulse animation', () => {
            const { container } = render(<Skeleton className="w-10 h-10" />);
            const div = container.firstChild as HTMLElement;
            expect(div).toBeInTheDocument();
            expect(div.className).toContain('animate-pulse');
            expect(div.className).toContain('w-10 h-10');
        });
    });

    describe('PageLoader', () => {
        it('renders with default message', () => {
            render(<PageLoader />);
            expect(screen.getByText('Chargement...')).toBeInTheDocument();
            // It should include a LoadingSpinner (which is an svg)
            const { container } = render(<PageLoader />);
            expect(container.querySelector('svg')).toBeInTheDocument();
        });

        it('renders with a custom message', () => {
            render(<PageLoader message="Patientez s'il vous plaît" />);
            expect(screen.getByText("Patientez s'il vous plaît")).toBeInTheDocument();
        });
    });
});
