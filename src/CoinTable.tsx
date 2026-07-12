import { useEffect, useState, useCallback } from "react";
import type { Coin } from "./types";

interface CoinTableProps {
  watchlist: string[];
  onToggleWatchlist: (coinId: string) => void;
}

function Sparkline({
  prices,
  positive,
}: {
  prices: number[];
  positive: boolean;
}) {
  if (!prices || prices.length < 2) {
    return <span className="text-slate-600 text-xs">—</span>;
  }

  const max = Math.max(...prices);
  const min = Math.min(...prices);

  const W = 100;
  const H = 36;

  const points = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * W;
      const y = H - ((p - min) / (max - min || 1)) * H;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="overflow-visible"
    >
      <polyline
        points={points}
        fill="none"
        stroke={positive ? "#22c55e" : "#ef4444"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


function SkeletonRow() {
  return (
    <div className="grid grid-cols-6 gap-4 px-4 py-4 border-t border-white/10 items-center animate-pulse">

      <div className="flex items-center gap-3">
        <div className="w-5 h-3 bg-slate-700/70 rounded" />
        <div className="w-8 h-8 bg-slate-700/70 rounded-full" />

        <div>
          <div className="w-20 h-3 bg-slate-700/70 rounded mb-2" />
          <div className="w-10 h-2 bg-slate-700/70 rounded" />
        </div>
      </div>

      <div className="w-16 h-3 bg-slate-700/70 rounded" />
      <div className="w-20 h-3 bg-slate-700/70 rounded" />
      <div className="w-12 h-3 bg-slate-700/70 rounded" />
      <div className="w-20 h-5 bg-slate-700/70 rounded" />
      <div className="w-6 h-6 bg-slate-700/70 rounded" />

    </div>
  );
}


function CoinTable({
  watchlist,
  onToggleWatchlist,
}: CoinTableProps) {

  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);


  const fetchCoins = useCallback(
    async (pageNum: number, append = false) => {
      try {
        append ? setLoadingMore(true) : setLoading(true);

        setError(false);

        const res = await fetch(
  `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${pageNum}&sparkline=true&price_change_percentage=24h`,
  {
    headers: {
      "x-cg-demo-api-key": import.meta.env.VITE_COINGECKO_API_KEY,
    },
  }
);

        if (!res.ok) throw new Error("Failed");

        const data = (await res.json()) as Coin[];

        setCoins((prev) =>
          append ? [...prev, ...data] : data
        );

        setLastUpdated(new Date());

      } catch {

        setError(true);

      } finally {

        setLoading(false);
        setLoadingMore(false);

      }
    },
    []
  );
    useEffect(() => {
    fetchCoins(1);
  }, [fetchCoins]);


  useEffect(() => {
    const interval = setInterval(() => {
      fetchCoins(1);
      setPage(1);
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchCoins]);


  function handleLoadMore() {
    const next = page + 1;
    setPage(next);
    fetchCoins(next, true);
  }


  const filteredCoins = coins
    .filter((coin) =>
      coin.name.toLowerCase().includes(search.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) =>
      sortOrder === "desc"
        ? b.market_cap - a.market_cap
        : a.market_cap - b.market_cap
    );


  return (
    <div>

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

        <h2 className="text-2xl font-bold">
          Top Cryptocurrencies
        </h2>

        {lastUpdated && (
          <span className="text-slate-400 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        )}

      </div>


      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">

        <input
          type="text"
          placeholder="Search by name or symbol..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="
            flex-1
            px-4
            py-3
            rounded-xl
            bg-slate-900/70
            border
            border-white/10
            text-sm
            placeholder-slate-500
            focus:outline-none
            focus:border-blue-500
            transition
          "
        />


        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="
            px-4
            py-3
            rounded-xl
            bg-slate-900/70
            border
            border-white/10
            text-sm
            focus:outline-none
            focus:border-blue-500
          "
        >
          <option value="desc">
            Highest Market Cap
          </option>

          <option value="asc">
            Lowest Market Cap
          </option>

        </select>

      </div>


      {/* Table */}
      <div className="overflow-x-auto">

        <div className="
          min-w-[850px]
          rounded-2xl
          overflow-hidden
          border
          border-white/10
          bg-slate-900/50
          backdrop-blur-xl
        ">


          {/* Header */}
          <div className="
            grid
            grid-cols-6
            gap-4
            px-4
            py-3
            bg-slate-800/50
            text-xs
            font-semibold
            text-slate-300
            uppercase
            tracking-wider
          ">

            <p>Coin</p>
            <p>Price</p>
            <p>Market Cap</p>
            <p>24h Change</p>
            <p>7d Chart</p>
            <p>Watch</p>

          </div>



          {/* Error */}
          {error && (
            <div className="px-4 py-8 text-center">

              <p className="text-red-400 text-sm mb-3">
                Unable to load coins.
              </p>

              <button
                onClick={() => fetchCoins(1)}
                className="
                  text-blue-400
                  hover:text-blue-300
                  text-sm
                  underline
                "
              >
                Try again
              </button>

            </div>
          )}



          {/* Loading */}
          {loading &&
            !error &&
            [...Array(10)].map((_, i) => (
              <SkeletonRow key={i} />
            ))
          }



          {/* Coins */}
          {!loading &&
            !error &&
            filteredCoins.map((coin) => {

              const positive =
                coin.price_change_percentage_24h >= 0;

              const inWatchlist =
                watchlist.includes(coin.id);


              return (

                <div
                  key={coin.id}
                  className="
                    grid
                    grid-cols-6
                    gap-4
                    px-4
                    py-4
                    border-t
                    border-white/10
                    items-center
                    hover:bg-blue-500/5
                    transition
                    group
                  "
                >

                  <div className="flex items-center gap-3 min-w-0">

                    <span className="text-slate-500 text-xs w-5">
                      {coin.market_cap_rank}
                    </span>


                    <img
                      src={coin.image}
                      alt={coin.name}
                      className="w-8 h-8 rounded-full"
                    />


                    <div className="min-w-0">

                      <p className="font-semibold text-sm truncate">
                        {coin.name}
                      </p>

                      <p className="text-xs text-slate-400 uppercase">
                        {coin.symbol}
                      </p>

                    </div>

                  </div>


                  <p className="font-semibold text-sm">
                    ${coin.current_price.toLocaleString()}
                  </p>


                  <p className="text-sm text-slate-300">
                    ${(coin.market_cap / 1_000_000_000).toFixed(2)}B
                  </p>


                  <div
                    className={`text-sm font-medium ${
                      positive
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >

                    {positive ? "▲" : "▼"}
                    {" "}
                    {Math.abs(
                      coin.price_change_percentage_24h ?? 0
                    ).toFixed(2)}%

                  </div>


                  <Sparkline
                    prices={
                      coin.sparkline_in_7d?.price ?? []
                    }
                    positive={positive}
                  />


                  <button
                    onClick={() =>
                      onToggleWatchlist(coin.id)
                    }
                    className={`
                      text-lg
                      transition
                      hover:scale-125
                      ${
                        inWatchlist
                          ? "text-yellow-400"
                          : "text-slate-600 group-hover:text-slate-400"
                      }
                    `}
                  >
                    {inWatchlist ? "⭐" : "☆"}
                  </button>


                </div>

              );
            })
          }



          {!loading &&
            !error &&
            filteredCoins.length === 0 && (
              <div className="py-12 text-center text-slate-500 text-sm">
                No coins match your search.
              </div>
            )
          }


        </div>

      </div>



      {/* Load More */}
      {!loading &&
        !error &&
        filteredCoins.length > 0 && (

          <div className="flex justify-center mt-6">

            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="
                px-6
                py-3
                rounded-xl
                bg-blue-500
                hover:bg-blue-600
                text-white
                text-sm
                font-medium
                transition
                disabled:opacity-50
              "
            >

              {loadingMore
                ? "Loading..."
                : "Load More Coins"}

            </button>

          </div>

        )
      }


    </div>
  );
}


export default CoinTable;