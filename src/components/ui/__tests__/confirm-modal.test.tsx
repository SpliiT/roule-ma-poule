import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmModal } from '../confirm-modal';

// Mock matchMedia for Radix UI if needed
beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        })),
    });
    
    // Radix Dialog uses ResizeObserver
    global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
    };
});

describe('ConfirmModal Component', () => {
    const mockOnClose = jest.fn();
    const mockOnConfirm = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not render when isOpen is false', () => {
        render(
            <ConfirmModal
                isOpen={false}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title="Test Title"
            />
        );
        expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
    });

    it('should render title and description when isOpen is true', () => {
        render(
            <ConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title="Supprimer la zone"
                description="Êtes-vous sûr de vouloir continuer ?"
            />
        );
        
        // Use getByRole or getByText
        expect(screen.getByText('Supprimer la zone')).toBeInTheDocument();
        expect(screen.getByText('Êtes-vous sûr de vouloir continuer ?')).toBeInTheDocument();
        
        // Default button texts
        expect(screen.getByRole('button', { name: 'Annuler' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Confirmer' })).toBeInTheDocument();
    });

    it('should call onClose when cancel button is clicked', () => {
        render(
            <ConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title="Action"
            />
        );
        
        fireEvent.click(screen.getByRole('button', { name: 'Annuler' }));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        expect(mockOnConfirm).not.toHaveBeenCalled();
    });

    it('should call onConfirm and onClose when confirm button is clicked', () => {
        render(
            <ConfirmModal
                isOpen={true}
                onClose={mockOnClose}
                onConfirm={mockOnConfirm}
                title="Action"
                confirmText="Oui, supprimer"
            />
        );
        
        fireEvent.click(screen.getByRole('button', { name: 'Oui, supprimer' }));
        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
});
