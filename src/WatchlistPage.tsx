
import { useEffect, useState } from "react";
import type { Coin } from "./types";

interface WatchlistPageProps {
  watchlist: string[];
  onToggleWatchlist: (coinId: string) => void;
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-5 gap-4 px-4 py-3.5 border-t border-slate-700/60 items-center animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-700 rounded-full" />
        <div className="space-y-1.5">
          <div className="w-20 h-3 bg-slate-700 rounded" />
          <div className="w-10 h-2 bg-slate-700 rounded" />
        </div>
      </div>
      <div className="w-16 h-3 bg-slate-700 rounded" />
      <div className="w-20 h-3 bg-slate-700 rounded" />
      <div className="w-12 h-3 bg-slate-700 rounded" />
      <div className="w-16 h-7 bg-slate-700 rounded-lg" />
    </div>
  );
}

function WatchlistPage({ watchlist, onToggleWatchlist }: WatchlistPageProps) {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchWatchlistCoins() {
      if (watchlist.length === 0) {
        setCoins([]);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(false);
        const ids = watchlist.join(",");
        const res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false`
        );
        if (!res.ok) throw new Error("Failed");
        const data = await res.json() as Coin[];
        setCoins(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchWatchlistCoins();
  }, [watchlist]);

  if (!loading && watchlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-5">⭐</div>
        <h3 className="text-xl font-bold mb-2">Your watchlist is empty</h3>
        <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
          Go back to the dashboard and click the star next to any coin to track it here.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Your Watchlist</h2>
        <p className="text-slate-400 text-sm mt-1">
          {watchlist.length} coin{watchlist.length !== 1 ? "s" : ""} tracked
        </p>
      </div>
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4">
          Failed to load watchlist prices. Please try again.
        </div>
      )}
      <div className="rounded-xl border border-slate-700/60 overflow-hidden">
        <div className="grid grid-cols-5 gap-4 px-4 py-3 bg-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          <p>Coin</p>
          <p>Price</p>
          <p>Market Cap</p>
          <p>24h Change</p>
          <p>Remove</p>
        </div>
        {loading && [...Array(watchlist.length || 3)].map((_, i) => <SkeletonRow key={i} />)}
        {!loading && !error && coins.map((coin) => {
          const pos = coin.price_change_percentage_24h >= 0;
          return (
            <div
              key={coin.id}
              className="grid grid-cols-5 gap-4 px-4 py-3.5 border-t border-slate-700/60 items-center hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <img src={coin.image} alt={coin.name} className="w-8 h-8 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{coin.name}</p>
                  <p className="text-xs text-slate-400 uppercase">{coin.symbol}</p>
                </div>
              </div>
              <p className="font-semibold text-sm tabular-nums">${coin.current_price.toLocaleString()}</p>
              <p className="text-sm text-slate-300 tabular-nums">${(coin.market_cap / 1_000_000_000).toFixed(2)}B</p>
              <div className={`flex items-center gap-1 text-sm font-medium ${pos ? "text-green-400" : "text-red-400"}`}>
                <span>{pos ? "▲" : "▼"}</span>
                <span>{Math.abs(coin.price_change_percentage_24h ?? 0).toFixed(2)}%</span>
              </div>
              <button
                onClick={() => onToggleWatchlist(coin.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-red-500/15 hover:text-red-400 text-slate-400 text-xs font-medium transition-colors border border-slate-600/50 w-fit"
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WatchlistPage;
