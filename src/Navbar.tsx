import { useEffect, useState } from "react";

interface NavbarProps {
  showWatchlist: boolean;
  onToggleWatchlist: () => void;
  watchlistCount: number;
}

function Navbar({
  showWatchlist,
  onToggleWatchlist,
  watchlistCount,
}: NavbarProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav className="border-b border-white/10 sticky top-0 z-50 bg-slate-950/70 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-blue-500/20">
            CP
          </div>

          <h1 className="text-xl font-bold tracking-tight">
            CryptoPulse
          </h1>
        </div>


        {/* Actions */}
        <div className="flex items-center gap-4">

          {/* Live clock */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />

            <span className="text-slate-400 text-sm font-mono">
              {time.toLocaleTimeString()}
            </span>
          </div>


          {/* Watchlist Button */}
          <button
            onClick={onToggleWatchlist}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
              showWatchlist
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/20"
                : "bg-slate-800/80 text-slate-300 hover:bg-slate-700/80"
            }`}
          >
            <span>⭐</span>

            <span className="hidden sm:inline">
              Watchlist
            </span>

            {watchlistCount > 0 && (
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                  showWatchlist
                    ? "bg-white/20 text-white"
                    : "bg-blue-500/20 text-blue-400"
                }`}
              >
                {watchlistCount}
              </span>
            )}
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;