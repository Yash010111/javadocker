import { useState } from 'react';
import type { StockSearchResult } from '../types';

interface Props {
  onSearch: (keyword: string) => Promise<StockSearchResult[]>;
  onSymbolSelect: (symbol: string) => void;
}

export default function StockSearch({ onSearch, onSymbolSelect }: Props) {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const items = await onSearch(keyword.trim());
      setResults(items);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="page-title">Search symbols</h2>
      <div className="field-group">
        <label>
          Keyword
          <input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="Tesla, Apple, MSFT"
          />
        </label>
        <button type="button" className="primary" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {results.length > 0 && (
        <div>
          <h3>Results</h3>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((item) => (
                <tr key={item.symbol ?? item.name ?? Math.random()}>
                  <td>{item.symbol}</td>
                  <td>{item.name ?? '-'}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => onSymbolSelect(item.symbol)}>
                      Use symbol
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
