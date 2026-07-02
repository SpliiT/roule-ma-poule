import React from 'react';
import { render, screen, act } from '@testing-library/react';
import NewBookingPage from '../page';
import { useRouter } from 'next/navigation';

// Mock child components to simplify the test
jest.mock('@/components/bookings/address-step', () => ({
    AddressStep: () => <div data-testid="address-step">Address Step</div>
}));
jest.mock('@/components/bookings/bike-step', () => ({
    BikeStep: () => <div data-testid="bike-step">Bike Step</div>
}));
jest.mock('@/components/bookings/service-step', () => ({
    ServiceStep: () => <div data-testid="service-step">Service Step</div>
}));
jest.mock('@/components/bookings/schedule-step', () => ({
    ScheduleStep: () => <div data-testid="schedule-step">Schedule Step</div>
}));
jest.mock('@/components/bookings/products-step', () => ({
    ProductsStep: () => <div data-testid="products-step">Products Step</div>
}));
jest.mock('@/components/bookings/summary-step', () => ({
    SummaryStep: () => <div data-testid="summary-step">Summary Step</div>
}));

jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

describe('NewBookingPage Workflow', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        sessionStorage.clear();
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
    });

    it('should load initial state from sessionStorage if present', async () => {
        // Simulate a user returning from adding a bike
        sessionStorage.setItem('roulemapoule_bookingStep', 'bike');
        sessionStorage.setItem('roulemapoule_bookingData', JSON.stringify({
            address: { street: '123 Main St', city: 'Paris' },
            bikeId: null,
            serviceId: null,
            date: null,
            slot: null,
            products: []
        }));

        await act(async () => {
            render(<NewBookingPage />);
        });

        // The Bike Step should be rendered instead of the default Address Step
        expect(screen.getByTestId('bike-step')).toBeInTheDocument();
        // The sidebar should show the persisted address
        expect(screen.getByText('123 Main St, Paris')).toBeInTheDocument();
    });

    it('should render address step by default if sessionStorage is empty', async () => {
        await act(async () => {
            render(<NewBookingPage />);
        });

        expect(screen.getByTestId('address-step')).toBeInTheDocument();
        expect(screen.getAllByText('À définir').length).toBeGreaterThan(0);
    });
});
