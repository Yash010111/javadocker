import { useEffect, useState } from 'react';
import type { AuthResponse, Holding, StockDataResponse, StockSearchResult, TradeRequest } from '../types';
import { buyStock, getPortfolio, getStockData, searchStocks, sellStock } from '../api';
import ErrorBanner from '../components/ErrorBanner';
import PortfolioTable from '../components/PortfolioTable';
import StockSearch from '../components/StockSearch';
import TradeForm from '../components/TradeForm';

interface Props {
  auth: AuthResponse;
  onLogout: () => void;
}

export default function HomePage({ auth, onLogout }: Props) {
  const [portfolio, setPortfolio] = useState<Holding[]>([]);
  const [stockResult, setStockResult] = useState<StockDataResponse | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [selectedInterval, setSelectedInterval] = useState('1min');
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoadingPortfolio, setIsLoadingPortfolio] = useState(false);

  useEffect(() => {
    loadPortfolio();
  }, []);

  const loadPortfolio = async () => {
    setErrorMessage('');
    setIsLoadingPortfolio(true);
    try {
      const holdings = await getPortfolio();
      setPortfolio(holdings);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoadingPortfolio(false);
    }
  };

  const handleError = (error: unknown) => {
    if (error instanceof Error) {
      setErrorMessage(error.message);
      if (error.message.includes('login required') || error.message.includes('Access denied')) {
        onLogout();
      }
    } else {
      setErrorMessage('Unexpected error. Please try again.');
    }
  };

  const handleBuy = async (request: TradeRequest) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await buyStock(request);
      setStatusMessage('Stock purchased successfully. Refreshing portfolio.');
      await loadPortfolio();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSell = async (request: TradeRequest) => {
    setStatusMessage('');
    setErrorMessage('');
    try {
      await sellStock(request);
      setStatusMessage('Stock sold successfully. Refreshing portfolio.');
      await loadPortfolio();
    } catch (error) {
      handleError(error);
    }
  };

  const handleSearchSymbol = async (keyword: string) => {
    setErrorMessage('');
    try {
      return await searchStocks(keyword);
    } catch (error) {
      handleError(error);
      return [] as StockSearchResult[];
    }
  };

  const handleFetchQuote = async () => {
    setErrorMessage('');
    setStatusMessage('');
    if (!selectedSymbol.trim()) {
      setErrorMessage('Please select a stock symbol to load quote data.');
      return;
    }
    try {
      const data = await getStockData(selectedSymbol.trim(), selectedInterval);
      setStockResult(data);
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="app-shell container">
      <div className="status-row">
        <div>
          <h1 className="page-title">Hello, {auth.username}</h1>
          <p className="small-text">Role: {auth.roles.join(', ')}</p>
        </div>
        <button className="secondary" onClick={onLogout}>
          Logout
        </button>
      </div>

      {errorMessage && <ErrorBanner message={errorMessage} />}
      {statusMessage && <ErrorBanner message={statusMessage} variant="success" />}

      <div className="card">
        <div className="status-row">
          <h2 className="page-title">Portfolio</h2>
          <button className="primary" onClick={loadPortfolio} disabled={isLoadingPortfolio}>
            {isLoadingPortfolio ? 'Refreshing...' : 'Refresh portfolio'}
          </button>
        </div>
        <PortfolioTable holdings={portfolio} />
      </div>

      <StockSearch onSearch={handleSearchSymbol} onSymbolSelect={setSelectedSymbol} />

      <div className="card">
        <h2 className="page-title">Quote data</h2>
        <div className="field-group">
          <label>
            Symbol
            <input value={selectedSymbol} onChange={(event) => setSelectedSymbol(event.target.value.toUpperCase())} placeholder="TSLA" />
          </label>
          <label>
            Interval
            <select value={selectedInterval} onChange={(event) => setSelectedInterval(event.target.value)}>
              <option value="1min">1min</option>
              <option value="5min">5min</option>
              <option value="15min">15min</option>
              <option value="30min">30min</option>
              <option value="60min">60min</option>
            </select>
          </label>
          <button type="button" className="primary" onClick={handleFetchQuote}>
            Load quote
          </button>
        </div>
        {stockResult && (
          <pre style={{ overflowX: 'auto', background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '1rem' }}>
            {JSON.stringify(stockResult, null, 2)}
          </pre>
        )}
      </div>

      <TradeForm mode="buy" onSubmit={handleBuy} />
      <TradeForm mode="sell" onSubmit={handleSell} />
    </div>
  );
}
