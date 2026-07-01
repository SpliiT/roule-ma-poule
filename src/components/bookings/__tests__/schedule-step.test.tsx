import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ScheduleStep } from '../schedule-step';
import axios from 'axios';

jest.mock('axios');

describe('ScheduleStep Component', () => {
    const mockOnNext = jest.fn();
    const mockOnBack = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should prompt user to select a date first', () => {
        render(<ScheduleStep onNext={mockOnNext} onBack={mockOnBack} />);
        expect(screen.getByText("Sélectionnez une date d'abord")).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Suivant' })).toBeDisabled();
    });

    it('should fetch slots when a date is selected and display them', async () => {
        const mockSlots = [
            { start: '09:00', end: '10:00', available: true },
            { start: '09:30', end: '10:30', available: false },
        ];
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { data: mockSlots } });

        render(<ScheduleStep onNext={mockOnNext} onBack={mockOnBack} duration={60} />);
        
        // Find a valid day in the calendar (15th of the current displayed month)
        // Note: react-day-picker renders buttons for days
        const days = screen.getAllByRole('gridcell');
        const validDay = days.find(day => {
            const btn = day.querySelector('button');
            return btn && !btn.disabled;
        });

        if (validDay && validDay.querySelector('button')) {
            fireEvent.click(validDay.querySelector('button')!);
            
            expect(axios.get).toHaveBeenCalled();

            await waitFor(() => {
                expect(screen.getByText('09:00')).toBeInTheDocument();
            });

            // Check if 09:30 is disabled because it's not available
            const slotButtons = screen.getAllByRole('button').filter(b => b.className.includes('h-10 text-sm font-medium transition-all'));
            
            // First button (09:00) should be enabled
            expect(slotButtons[0]).not.toBeDisabled();
            // Second button (09:30) should be disabled
            expect(slotButtons[1]).toBeDisabled();
        }
    });

    it('should enable Next button when date and slot are selected', async () => {
        const mockSlots = [
            { start: '09:00', end: '10:00', available: true },
        ];
        (axios.get as jest.Mock).mockResolvedValueOnce({ data: { data: mockSlots } });

        render(<ScheduleStep onNext={mockOnNext} onBack={mockOnBack} duration={60} />);
        
        const days = screen.getAllByRole('gridcell');
        const validDay = days.find(day => {
            const btn = day.querySelector('button');
            return btn && !btn.disabled;
        });

        if (validDay && validDay.querySelector('button')) {
            fireEvent.click(validDay.querySelector('button')!);
            
            await waitFor(() => {
                expect(screen.getByText('09:00')).toBeInTheDocument();
            });

            const slotButtons = screen.getAllByRole('button').filter(b => b.className.includes('h-10 text-sm font-medium transition-all'));
            fireEvent.click(slotButtons[0]);

            const nextBtn = screen.getByRole('button', { name: 'Suivant' });
            expect(nextBtn).not.toBeDisabled();
            
            fireEvent.click(nextBtn);
            expect(mockOnNext).toHaveBeenCalled();
        }
    });
});
