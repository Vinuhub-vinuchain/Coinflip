import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Coin } from '../components/Coin'; 

describe('Coin', () => {
  it('renders heads when not flipping', () => {
    render(<Coin side="heads" flipping={false} />);
    expect(screen.getByAltText('Heads')).toBeInTheDocument();
  });

  it('applies flipping class when flipping', () => {
   render(<Coin side="heads" flipping={true} />);
    const coinDiv = screen.getByAltText('Heads').parentElement?.parentElement;
    expect(coinDiv!).toHaveClass('flipping');  
  });
});
