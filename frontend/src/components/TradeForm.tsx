import { useState, type FormEvent } from 'react';
import type { TradeRequest } from '../types';

interface Props {
  mode: 'buy' | 'sell';
  onSubmit: (request: TradeRequest) => Promise<void>;
}

export default function TradeForm({ mode, onSubmit }: Props) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const buttonText = mode === 'buy' ? 'Buy stock' : 'Sell stock';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit({
        symbol: symbol.trim().toUpperCase(),
        quantity: Number(quantity),
        price: Number(price)
      });
      setSymbol('');
      setQuantity('');
      setPrice('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">{mode === 'buy' ? 'Buy stock' : 'Sell stock'}</h2>
      <form onSubmit={handleSubmit} className="field-group">
        <label>
          Symbol
          <input value={symbol} onChange={(event) => setSymbol(event.target.value)} placeholder="TSLA" required />
        </label>
        <label>
          Quantity
          <input
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="1"
            required
          />
        </label>
        <label>
          Price
          <input
            value={price}
            onChange={(event) => setPrice(event.target.value)}
            type="number"
            min="0"
            step="0.01"
            placeholder="170.50"
            required
          />
        </label>
        <button type="submit" className="primary" disabled={isLoading}>
          {isLoading ? 'Submitting...' : buttonText}
        </button>
      </form>
    </div>
  );
}
