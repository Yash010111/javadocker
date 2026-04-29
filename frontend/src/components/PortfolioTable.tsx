import type { Holding } from '../types';

interface Props {
  holdings: Holding[];
}

export default function PortfolioTable({ holdings }: Props) {
  if (holdings.length === 0) {
    return <p className="small-text">No holdings available. Buy a stock to populate your portfolio.</p>;
  }

  return (
    <div className="card">
      <h2 className="page-title">Portfolio holdings</h2>
      <table>
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Quantity</th>
            <th>Average price</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((holding) => (
            <tr key={holding.symbol}>
              <td>{holding.symbol}</td>
              <td>{holding.quantity}</td>
              <td>${holding.averagePrice.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
