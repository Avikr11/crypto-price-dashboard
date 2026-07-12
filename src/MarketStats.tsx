import { useEffect, useState } from "react";
import type { GlobalStats } from "./types";

function formatNumber(num: number): string {
  if (num >= 1_000_000_000_000) {
    return "$" + (num / 1_000_000_000_000).toFixed(2) + "T";
  }

  if (num >= 1_000_000_000) {
    return "$" + (num / 1_000_000_000).toFixed(2) + "B";
  }

  return "$" + num.toLocaleString();
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 rounded-2xl animate-pulse">
      <div className="h-3 w-24 bg-slate-700/70 rounded mb-4" />
      <div className="h-8 w-32 bg-slate-700/70 rounded" />
    </div>
  );
}

function MarketStats() {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchGlobalStats() {
      try {
        setError(false);

        const response = await fetch(
          "https://api.coingecko.com/api/v3/global",
          {
            headers: {
              "x-cg-demo-api-key":
                import.meta.env.VITE_COINGECKO_API_KEY,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch market data");
        }

        const json = await response.json();

        setStats(json.data as GlobalStats);

      } catch (error) {
        console.error(error);
        setError(true);

      } finally {
        setLoading(false);
      }
    }

    fetchGlobalStats();
  }, []);


  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">
        {[...Array(4)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }


  if (error || !stats) {
    return (
      <div className="mt-8 mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
        ⚠️ Unable to fetch market data. Please check API key or try again later.
      </div>
    );
  }


  const statCards = [
    {
      title: "Market Cap",
      value: formatNumber(stats.total_market_cap.usd),
      icon: "📊",
    },
    {
      title: "24h Volume",
      value: formatNumber(stats.total_volume.usd),
      icon: "💹",
    },
    {
      title: "BTC Dominance",
      value: stats.market_cap_percentage.btc.toFixed(1) + "%",
      icon: "₿",
    },
    {
      title: "Active Coins",
      value: stats.active_cryptocurrencies.toLocaleString(),
      icon: "🪙",
    },
  ];


  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-8 mb-8">

      {statCards.map((stat) => (
        <div
          key={stat.title}
          className="
            bg-slate-900/60
            backdrop-blur-xl
            border border-white/10
            hover:border-blue-400/30
            hover:-translate-y-1
            p-6
            rounded-2xl
            transition-all
            duration-300
          "
        >

          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-400 text-sm">
              {stat.title}
            </p>

            <span className="text-xl">
              {stat.icon}
            </span>
          </div>


          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {stat.value}
          </h2>

        </div>
      ))}

    </div>
  );
}

export default MarketStats;