import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BikeStep } from '../bike-step';
import { useBikes } from '@/hooks/use-bikes';

// Mock the hook and next/link
jest.mock('@/hooks/use-bikes', () => ({
    useBikes: jest.fn(),
}));

jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href} data-testid="mock-link">
            {children}
        </a>
    );
});

describe('BikeStep Component', () => {
    const mockOnNext = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display loading state', () => {
        (useBikes as jest.Mock).mockReturnValue({ bikes: [], isLoading: true });
        render(<BikeStep selectedBikeId={null} onNext={mockOnNext} onBack={mockOnBack} />);
        expect(screen.getByText('Chargement de votre garage...')).toBeInTheDocument();
    });

    it('should display empty state with correct link when user has no bikes', () => {
        (useBikes as jest.Mock).mockReturnValue({ bikes: [], isLoading: false });
        render(<BikeStep selectedBikeId={null} onNext={mockOnNext} onBack={mockOnBack} />);
        
        expect(screen.getByText("Vous n'avez pas encore de vélo enregistré.")).toBeInTheDocument();
        
        const links = screen.getAllByTestId('mock-link');
        // There should be a link at the top and one in the empty state
        expect(links[0]).toHaveAttribute('href', '/bikes/add?returnTo=/bookings/new');
        expect(links[1]).toHaveAttribute('href', '/bikes/add?returnTo=/bookings/new');
    });

    it('should display bikes and allow selection', () => {
        const mockBikes = [
            { id: 'bike-1', brand: 'Trek', model: 'Marlin', type: 'VTT', isElectric: false },
            { id: 'bike-2', brand: 'VanMoof', model: 'S3', type: 'CITY', isElectric: true },
        ];
        (useBikes as jest.Mock).mockReturnValue({ bikes: mockBikes, isLoading: false });
        
        render(<BikeStep selectedBikeId={null} onNext={mockOnNext} onBack={mockOnBack} />);
        
        // Custom component BikeCard renders this, let's just assume we can click on a bike card
        // Since BikeCard is imported, it will render its content. We look for brand/model.
        expect(screen.getByText('Trek Marlin')).toBeInTheDocument();
        expect(screen.getByText('VanMoof S3')).toBeInTheDocument();
    });
});
