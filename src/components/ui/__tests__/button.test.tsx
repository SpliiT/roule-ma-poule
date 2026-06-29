import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button Component', () => {
    it('renders correctly with default props', () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole('button', { name: 'Click me' });
        expect(button).toBeInTheDocument();
        expect(button).not.toBeDisabled();
        // Should have default classes
        expect(button.className).toContain('bg-primary');
    });

    it('handles click events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button', { name: 'Click me' });
        
        fireEvent.click(button);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders as disabled when disabled prop is true', () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Click me</Button>);
        const button = screen.getByRole('button', { name: 'Click me' });
        
        expect(button).toBeDisabled();
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('shows loading spinner and is disabled when isLoading is true', () => {
        const handleClick = jest.fn();
        render(<Button isLoading onClick={handleClick}>Submit</Button>);
        const button = screen.getByRole('button', { name: 'Submit' });
        
        expect(button).toBeDisabled();
        // Check for the spinner svg
        const spinner = button.querySelector('svg.animate-spin');
        expect(spinner).toBeInTheDocument();
        
        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders with different variants and sizes', () => {
        const { rerender } = render(<Button variant="destructive" size="lg">Delete</Button>);
        let button = screen.getByRole('button', { name: 'Delete' });
        expect(button.className).toContain('bg-destructive');
        expect(button.className).toContain('h-12'); // lg size

        rerender(<Button variant="outline" size="sm">Cancel</Button>);
        button = screen.getByRole('button', { name: 'Cancel' });
        expect(button.className).toContain('border-input');
        expect(button.className).toContain('h-8'); // sm size
    });
});
