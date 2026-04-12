import { useState, useEffect, useCallback } from "react";
import translations, { type Lang } from "./translations";

const FONT = "'Inter', system-ui, -apple-system, sans-serif";
const API_BASE = import.meta.env.VITE_API_URL || "/api";

const US_HOLIDAYS = [
  "01-01", "01-20", "02-17", "04-18", "05-26", "06-19",
  "07-04", "09-01", "11-27", "11-28", "12-25",
];

interface Asset {
  id: string;
  name: string;
  ticker: string;
  icon: string;
  riskKey: keyof typeof translations.sandbox;
  riskColor: string;
  type: "stock" | "realestate" | "cd";
  price: number;
  change: number;
  history: number[];
  frozen: boolean;
}

interface Holding {
  assetId: string;
  shares: number;
  avgCost: number;
}

function isMarketClosed(): boolean {
  const now = new Date();
  const day = now.getDay();
  if (day === 0 || day === 6) return true;
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  return US_HOLIDAYS.includes(mmdd);
}

function getSimulatedAsset(
  id: string,
  name: string,
  icon: string,
  annualRate: number,
  riskKey: keyof typeof translations.sandbox,
  riskColor: string,
  type: "realestate" | "cd",
  basePrice: number
): Asset {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const dailyRate = annualRate / 365;
  const price = Math.round(basePrice * (1 + dailyRate * dayOfYear) * 100) / 100;

  const history: number[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = dayOfYear - i;
    history.push(Math.round(basePrice * (1 + dailyRate * Math.max(0, d)) * 100) / 100);
  }

  const prev = history.length > 1 ? history[history.length - 2] : price;
  const change = prev > 0 ? Math.round(((price - prev) / prev) * 100 * 100) / 100 : 0;

  return { id, name, ticker: "", icon, riskKey, riskColor, type, price, change, history, frozen: false };
}

function Sparkline({ data, color, width = 120, height = 40 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height * 0.8) - height * 0.1;
    return `${x},${y}`;
  });

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`sg-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${height} ${points.join(" ")} ${width},${height}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface SandboxProps {
  lang: Lang;
  moolies: number;
  onSpend: (amount: number) => void;
  onEarn: (amount: number) => void;
  onClose: () => void;
}

export default function Sandbox({ lang, moolies, onSpend, onEarn, onClose }: SandboxProps) {
  const t = translations.sandbox;
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdings, setHoldings] = useState<Holding[]>(() => {
    try { return JSON.parse(localStorage.getItem("ws_portfolio") || "[]"); } catch { return []; }
  });
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [buyQty, setBuyQty] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [tab, setTab] = useState<"market" | "portfolio">("market");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    localStorage.setItem("ws_portfolio", JSON.stringify(holdings));
  }, [holdings]);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    const marketClosed = isMarketClosed();

    const stockMeta: { id: string; name: string; ticker: string; icon: string; riskKey: keyof typeof translations.sandbox; riskColor: string }[] = [
      { id: "KO", name: "Coca-Cola", ticker: "KO", icon: "🥤", riskKey: "lowRisk", riskColor: "#4CAF50" },
      { id: "AAPL", name: "Apple", ticker: "AAPL", icon: "🍎", riskKey: "growth", riskColor: "#2196F3" },
      { id: "MSFT", name: "Microsoft", ticker: "MSFT", icon: "💻", riskKey: "growth", riskColor: "#2196F3" },
      { id: "AMZN", name: "Amazon", ticker: "AMZN", icon: "📦", riskKey: "growth", riskColor: "#2196F3" },
      { id: "WEN", name: "Wendy's", ticker: "WEN", icon: "🍔", riskKey: "midRisk", riskColor: "#FF9800" },
      { id: "NVDA", name: "Nvidia", ticker: "NVDA", icon: "🎮", riskKey: "highGrowth", riskColor: "#9C27B0" },
    ];

    let stockData: Record<string, { price: number; change: number; history: number[] }> = {};
    try {
      const resp = await fetch(`${API_BASE}/stocks/prices`);
      if (resp.ok) stockData = await resp.json();
    } catch (err) {
      console.error("[Sandbox] Failed to fetch stock prices:", err);
    }

    const stockAssets: Asset[] = stockMeta.map((m) => {
      const data = stockData[m.ticker] || { price: 100, change: 0, history: [100, 100, 100, 100, 100] };
      return {
        ...m,
        type: "stock" as const,
        price: data.price,
        change: marketClosed ? 0 : data.change,
        history: data.history,
        frozen: marketClosed,
      };
    });

    const realEstate = getSimulatedAsset(
      "REALESTATE", "City Apartment", "🏙️", 0.06,
      "midRisk", "#FF9800", "realestate", 500
    );

    const cd = getSimulatedAsset(
      "CD", "Moolab 5% CD", "🏦", 0.05,
      "guaranteed", "#4CAF50", "cd", 100
    );

    setAssets([...stockAssets, realEstate, cd]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);

  const getHolding = (assetId: string) => holdings.find((h) => h.assetId === assetId);

  const handleBuy = () => {
    if (!selectedAsset) return;
    const totalCost = Math.round(selectedAsset.price * buyQty * 100) / 100;
    if (totalCost > moolies) {
      showToast(t.notEnough[lang]);
      return;
    }
    onSpend(totalCost);
    setHoldings((prev) => {
      const existing = prev.find((h) => h.assetId === selectedAsset.id);
      if (existing) {
        const totalShares = existing.shares + buyQty;
        const totalSpent = existing.avgCost * existing.shares + totalCost;
        return prev.map((h) =>
          h.assetId === selectedAsset.id
            ? { ...h, shares: totalShares, avgCost: Math.round((totalSpent / totalShares) * 100) / 100 }
            : h
        );
      }
      return [...prev, { assetId: selectedAsset.id, shares: buyQty, avgCost: selectedAsset.price }];
    });
    showToast(t.purchased[lang]);
    setSelectedAsset(null);
    setBuyQty(1);
  };

  const handleSell = (assetId: string) => {
    const holding = holdings.find((h) => h.assetId === assetId);
    const asset = assets.find((a) => a.id === assetId);
    if (!holding || !asset) return;
    const revenue = Math.round(asset.price * holding.shares * 100) / 100;
    onEarn(revenue);
    setHoldings((prev) => prev.filter((h) => h.assetId !== assetId));
    showToast(t.sold[lang]);
  };

  const portfolioValue = holdings.reduce((sum, h) => {
    const asset = assets.find((a) => a.id === h.assetId);
    return sum + (asset ? asset.price * h.shares : 0);
  }, 0);

  const maxBuyable = selectedAsset ? Math.floor(moolies / selectedAsset.price) : 0;

  return (
    <div style={{
      position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 300,
      background: "linear-gradient(180deg, #091e30 0%, #0c2d48 40%, #091e30 100%)",
      display: "flex", flexDirection: "column", fontFamily: FONT, overflow: "hidden",
    }}>
      <style>{`
        @keyframes sandboxSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastSlide {
          0% { opacity: 0; transform: translate(-50%, 20px); }
          15% { opacity: 1; transform: translate(-50%, 0); }
          85% { opacity: 1; transform: translate(-50%, 0); }
          100% { opacity: 0; transform: translate(-50%, -10px); }
        }
      `}</style>

      <div style={{
        padding: "16px 20px 12px", display: "flex", alignItems: "center", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <button onClick={onClose} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "50%", width: 36, height: 36, color: "#fff", fontSize: "1rem",
          cursor: "pointer", fontFamily: FONT, flexShrink: 0,
        }}>✕</button>
        <div style={{ flex: 1 }}>
          <h1 style={{
            margin: 0, fontSize: "1.1rem", fontWeight: 900, letterSpacing: "0.08em",
            background: "linear-gradient(135deg, #2e8bc0, #b1d4e0)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>{t.title[lang]}</h1>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 20,
          background: "linear-gradient(135deg, rgba(255,215,0,0.1), rgba(255,165,0,0.06))",
          border: "1px solid rgba(255,215,0,0.2)",
        }}>
          <img src="/moolie-coin.png" alt="" style={{ width: 18, height: 18 }} />
          <span style={{ fontSize: "0.8rem", fontWeight: 900, color: "#FFD700" }}>
            {Math.round(moolies).toLocaleString()}
          </span>
        </div>
      </div>

      <div style={{
        display: "flex", gap: 4, padding: "8px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        {(["market", "portfolio"] as const).map((t2) => (
          <button key={t2} onClick={() => setTab(t2)} style={{
            flex: 1, padding: "10px 0", borderRadius: 12, border: "none", fontFamily: FONT,
            fontWeight: 800, fontSize: "0.7rem", letterSpacing: "0.08em", cursor: "pointer",
            background: tab === t2 ? "rgba(46,139,192,0.15)" : "transparent",
            color: tab === t2 ? "#2e8bc0" : "rgba(255,255,255,0.35)",
            transition: "all 0.2s ease",
          }}>
            {t2 === "market" ? "📊 MARKET" : `💼 ${t.portfolio[lang].toUpperCase()}`}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "12px 16px 80px" }}>
        {loading ? (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", height: 200, gap: 12,
          }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              border: "2px solid rgba(46,139,192,0.2)", borderTopColor: "#2e8bc0",
              animation: "ldSpin 0.7s linear infinite",
            }} />
            <span style={{ color: "rgba(177,212,224,0.4)", fontSize: "0.7rem", fontWeight: 700 }}>
              Loading market data...
            </span>
          </div>
        ) : tab === "market" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assets.map((asset, idx) => {
              const holding = getHolding(asset.id);
              const changeColor = asset.change > 0 ? "#4CAF50" : asset.change < 0 ? "#f44336" : "rgba(255,255,255,0.3)";
              const changeText = asset.change > 0 ? `+${asset.change}%` : `${asset.change}%`;
              return (
                <div
                  key={asset.id}
                  onClick={() => { setSelectedAsset(asset); setBuyQty(1); }}
                  style={{
                    animation: `sandboxSlideUp 0.4s ease-out ${idx * 0.05}s both`,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 18, padding: "14px 16px",
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", transition: "all 0.2s ease",
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 14,
                    background: "rgba(255,255,255,0.05)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "1.5rem", flexShrink: 0,
                  }}>{asset.icon}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 800 }}>{asset.name}</span>
                      {asset.ticker && (
                        <span style={{ color: "rgba(177,212,224,0.3)", fontSize: "0.6rem", fontWeight: 700 }}>{asset.ticker}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                      <span style={{
                        fontSize: "0.55rem", fontWeight: 800, padding: "2px 8px",
                        borderRadius: 8, background: `${asset.riskColor}15`,
                        color: asset.riskColor, letterSpacing: "0.04em",
                      }}>{(t[asset.riskKey] as { en: string; es: string })[lang]}</span>
                      {asset.frozen && (
                        <span style={{
                          fontSize: "0.5rem", fontWeight: 800, padding: "2px 8px",
                          borderRadius: 8, background: "rgba(255,152,0,0.1)",
                          color: "#FF9800", letterSpacing: "0.04em",
                        }}>{t.marketClosed[lang]}</span>
                      )}
                      {holding && (
                        <span style={{
                          fontSize: "0.5rem", fontWeight: 800, padding: "2px 8px",
                          borderRadius: 8, background: "rgba(46,139,192,0.1)",
                          color: "#2e8bc0",
                        }}>{holding.shares} {t.shares[lang]}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end",
                    }}>
                      <img src="/moolie-coin.png" alt="" style={{ width: 13, height: 13 }} />
                      <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 900 }}>
                        {Math.round(asset.price)}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "0.65rem", fontWeight: 800, color: changeColor,
                    }}>{asset.frozen ? "—" : changeText}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{
              background: "rgba(46,139,192,0.08)", border: "1px solid rgba(46,139,192,0.15)",
              borderRadius: 18, padding: "18px 20px", textAlign: "center",
              animation: "sandboxSlideUp 0.4s ease-out both",
            }}>
              <div style={{
                fontSize: "0.5rem", fontWeight: 800, letterSpacing: "0.12em",
                color: "rgba(177,212,224,0.4)", marginBottom: 6,
              }}>{t.totalValue[lang]}</div>
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
                <img src="/moolie-coin.png" alt="" style={{ width: 24, height: 24 }} />
                <span style={{
                  fontSize: "1.8rem", fontWeight: 900,
                  background: "linear-gradient(135deg, #FFD700, #FFA500)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{Math.round(portfolioValue).toLocaleString()}</span>
              </div>
            </div>

            {holdings.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px 20px",
                color: "rgba(177,212,224,0.3)", fontSize: "0.75rem", fontWeight: 600,
              }}>{t.noHoldings[lang]}</div>
            ) : holdings.map((h, idx) => {
              const asset = assets.find((a) => a.id === h.assetId);
              if (!asset) return null;
              const currentVal = asset.price * h.shares;
              const costBasis = h.avgCost * h.shares;
              const pnl = currentVal - costBasis;
              const pnlPct = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              const pnlColor = pnl >= 0 ? "#4CAF50" : "#f44336";
              return (
                <div key={h.assetId} style={{
                  animation: `sandboxSlideUp 0.4s ease-out ${idx * 0.05}s both`,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 18, padding: "14px 16px",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                    <span style={{ fontSize: "1.3rem" }}>{asset.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ color: "#fff", fontSize: "0.8rem", fontWeight: 800 }}>{asset.name}</div>
                      <div style={{ color: "rgba(177,212,224,0.4)", fontSize: "0.6rem", fontWeight: 600 }}>
                        {h.shares} {t.shares[lang]} · avg {Math.round(h.avgCost)}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 3, justifyContent: "flex-end",
                      }}>
                        <img src="/moolie-coin.png" alt="" style={{ width: 12, height: 12 }} />
                        <span style={{ color: "#fff", fontSize: "0.85rem", fontWeight: 900 }}>
                          {Math.round(currentVal)}
                        </span>
                      </div>
                      <span style={{ fontSize: "0.6rem", fontWeight: 800, color: pnlColor }}>
                        {pnl >= 0 ? "+" : ""}{Math.round(pnl)} ({pnlPct >= 0 ? "+" : ""}{pnlPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <Sparkline data={asset.history} color={pnlColor} width={280} height={30} />
                  <button onClick={(e) => { e.stopPropagation(); handleSell(h.assetId); }} style={{
                    width: "100%", marginTop: 10, padding: "10px 0", borderRadius: 12,
                    border: "1px solid rgba(244,67,54,0.25)", background: "rgba(244,67,54,0.08)",
                    color: "#f44336", fontWeight: 800, fontSize: "0.65rem", letterSpacing: "0.08em",
                    cursor: "pointer", fontFamily: FONT,
                  }}>{t.sell[lang]} ({Math.round(currentVal)} Moolies)</button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selectedAsset && (
        <div style={{
          position: "absolute", inset: 0, zIndex: 310,
          background: "rgba(0,0,0,0.7)", backdropFilter: "blur(10px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 20, animation: "sandboxSlideUp 0.3s ease-out both",
        }} onClick={() => setSelectedAsset(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{
            width: "100%", maxWidth: 360, background: "#0f2a3f",
            borderRadius: 24, padding: 24, border: "1px solid rgba(255,255,255,0.08)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{
                width: 50, height: 50, borderRadius: 16,
                background: "rgba(255,255,255,0.06)", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "1.8rem",
              }}>{selectedAsset.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ color: "#fff", fontSize: "1rem", fontWeight: 900 }}>{selectedAsset.name}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                  {selectedAsset.ticker && (
                    <span style={{ color: "rgba(177,212,224,0.4)", fontSize: "0.65rem", fontWeight: 700 }}>{selectedAsset.ticker}</span>
                  )}
                  <span style={{
                    fontSize: "0.55rem", fontWeight: 800, padding: "2px 8px",
                    borderRadius: 8, background: `${selectedAsset.riskColor}15`,
                    color: selectedAsset.riskColor,
                  }}>{(t[selectedAsset.riskKey] as { en: string; es: string })[lang]}</span>
                </div>
              </div>
              <button onClick={() => setSelectedAsset(null)} style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%", width: 32, height: 32, color: "#fff",
                fontSize: "0.9rem", cursor: "pointer", fontFamily: FONT,
              }}>✕</button>
            </div>

            <div style={{
              background: "rgba(255,255,255,0.02)", borderRadius: 16,
              padding: "14px 16px", marginBottom: 16,
              border: "1px solid rgba(255,255,255,0.04)",
            }}>
              <div style={{
                fontSize: "0.5rem", fontWeight: 800, color: "rgba(177,212,224,0.4)",
                letterSpacing: "0.1em", marginBottom: 8,
              }}>{t.day7[lang]}</div>
              <Sparkline
                data={selectedAsset.history}
                color={selectedAsset.change >= 0 ? "#4CAF50" : "#f44336"}
                width={280}
                height={60}
              />
              <div style={{
                display: "flex", justifyContent: "space-between", marginTop: 8,
              }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 4,
                }}>
                  <img src="/moolie-coin.png" alt="" style={{ width: 16, height: 16 }} />
                  <span style={{ color: "#fff", fontSize: "1.1rem", fontWeight: 900 }}>
                    {selectedAsset.price.toFixed(2)}
                  </span>
                  <span style={{ color: "rgba(177,212,224,0.3)", fontSize: "0.6rem", fontWeight: 600 }}>
                    {t.perShare[lang]}
                  </span>
                </div>
                <span style={{
                  fontSize: "0.8rem", fontWeight: 800,
                  color: selectedAsset.change >= 0 ? "#4CAF50" : "#f44336",
                }}>
                  {selectedAsset.change > 0 ? "+" : ""}{selectedAsset.change}%
                </span>
              </div>
            </div>

            {selectedAsset.frozen && selectedAsset.type === "stock" && (
              <div style={{
                background: "rgba(255,152,0,0.08)", border: "1px solid rgba(255,152,0,0.2)",
                borderRadius: 12, padding: "10px 14px", marginBottom: 16,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span style={{ fontSize: "1rem" }}>⏸️</span>
                <span style={{ color: "#FF9800", fontSize: "0.7rem", fontWeight: 700 }}>
                  {t.marketClosed[lang]}
                </span>
              </div>
            )}

            <div style={{
              display: "flex", flexDirection: "column", gap: 12,
            }}>
              <div style={{
                fontSize: "0.5rem", fontWeight: 800, color: "rgba(177,212,224,0.4)",
                letterSpacing: "0.1em",
              }}>{t.quantity[lang]}</div>

              <div style={{
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <button onClick={() => setBuyQty((q) => Math.max(1, q - 1))} style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "1.2rem", cursor: "pointer", fontFamily: FONT,
                }}>−</button>
                <div style={{
                  flex: 1, textAlign: "center", padding: "10px 0",
                  borderRadius: 12, background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <span style={{ color: "#fff", fontSize: "1.2rem", fontWeight: 900 }}>{buyQty}</span>
                  <span style={{ color: "rgba(177,212,224,0.3)", fontSize: "0.6rem", fontWeight: 600, marginLeft: 6 }}>
                    {t.shares[lang]}
                  </span>
                </div>
                <button onClick={() => setBuyQty((q) => Math.min(maxBuyable, q + 1))} style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", fontSize: "1.2rem", cursor: "pointer", fontFamily: FONT,
                }}>+</button>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "10px 16px", borderRadius: 14,
                background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
              }}>
                <span style={{ color: "rgba(177,212,224,0.5)", fontSize: "0.7rem", fontWeight: 700 }}>
                  {t.total[lang]}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <img src="/moolie-coin.png" alt="" style={{ width: 16, height: 16 }} />
                  <span style={{
                    fontSize: "1rem", fontWeight: 900,
                    color: (selectedAsset.price * buyQty) > moolies ? "#f44336" : "#FFD700",
                  }}>
                    {Math.round(selectedAsset.price * buyQty).toLocaleString()}
                  </span>
                </div>
              </div>

              <button onClick={handleBuy} disabled={buyQty < 1 || (selectedAsset.price * buyQty) > moolies} style={{
                width: "100%", padding: "14px 0", borderRadius: 16, border: "none",
                background: (selectedAsset.price * buyQty) > moolies
                  ? "rgba(255,255,255,0.04)"
                  : "linear-gradient(135deg, #2e8bc0, #145374)",
                color: (selectedAsset.price * buyQty) > moolies ? "rgba(255,255,255,0.2)" : "#fff",
                fontWeight: 900, fontSize: "0.8rem", letterSpacing: "0.08em",
                cursor: (selectedAsset.price * buyQty) > moolies ? "not-allowed" : "pointer",
                fontFamily: FONT,
                boxShadow: (selectedAsset.price * buyQty) > moolies ? "none" : "0 4px 20px rgba(46,139,192,0.3)",
                transition: "all 0.3s ease",
              }}>
                {t.confirm[lang]}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{
          position: "absolute", bottom: 60, left: "50%", transform: "translateX(-50%)",
          padding: "12px 24px", borderRadius: 14, fontWeight: 800, fontSize: "0.8rem",
          fontFamily: FONT, zIndex: 320, animation: "toastSlide 2.5s ease-out both",
          boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          background: toast === t.notEnough[lang] ? "rgba(231,111,81,0.95)" : "rgba(46,139,192,0.95)",
          color: "#fff",
        }}>{toast}</div>
      )}
    </div>
  );
}
