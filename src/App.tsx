
import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import MarketStats from "./MarketStats";
import CoinTable from "./CoinTable";
import WatchlistPage from "./WatchlistPage";

function App() {
  const [showWatchlist, setShowWatchlist] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("watchlist");
    if (saved) setWatchlist(JSON.parse(saved));
  }, []);

  function toggleWatchlist(coinId: string) {
    const updated = watchlist.includes(coinId)
      ? watchlist.filter((id) => id !== coinId)
      : [...watchlist, coinId];
    setWatchlist(updated);
    localStorage.setItem("watchlist", JSON.stringify(updated));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <Navbar
        showWatchlist={showWatchlist}
        onToggleWatchlist={() => setShowWatchlist((prev) => !prev)}
        watchlistCount={watchlist.length}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {showWatchlist ? (
          <WatchlistPage watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />
        ) : (
          <>
            <div className="mb-10">
              <span className="text-xs font-semibold uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                Live Market Data
              </span>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mt-4">
  Crypto Market <span className="text-blue-400">Dashboard</span>
</h1>
              <p className="text-slate-400 mt-3 text-lg max-w-xl">
                Track real-time cryptocurrency prices, market caps, and 7-day trends.
              </p>
            </div>
            <MarketStats />
            <CoinTable watchlist={watchlist} onToggleWatchlist={toggleWatchlist} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
