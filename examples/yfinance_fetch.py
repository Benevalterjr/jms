#!/usr/bin/env python3
"""Fetch asset data from Yahoo Finance using yfinance and save as JSON for JMS demos."""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path
from typing import List

import yfinance as yf


@dataclass
class AssetSnapshot:
    symbol: str
    close: float
    sma_5: float
    sma_20: float
    daily_return_pct: float
    volatility_20d_pct: float
    volume: float


def compute_snapshot(symbol: str, period: str, interval: str) -> AssetSnapshot:
    history = yf.Ticker(symbol).history(period=period, interval=interval)
    if history.empty or len(history) < 25:
        raise ValueError(f"Not enough history for {symbol}. Try a longer period.")

    close = history["Close"]
    returns = close.pct_change().dropna()

    latest_close = float(close.iloc[-1])
    sma_5 = float(close.tail(5).mean())
    sma_20 = float(close.tail(20).mean())
    daily_return_pct = float(returns.iloc[-1] * 100)
    volatility_20d_pct = float(returns.tail(20).std() * (20 ** 0.5) * 100)
    volume = float(history["Volume"].iloc[-1])

    return AssetSnapshot(
        symbol=symbol,
        close=latest_close,
        sma_5=sma_5,
        sma_20=sma_20,
        daily_return_pct=daily_return_pct,
        volatility_20d_pct=volatility_20d_pct,
        volume=volume,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fetch Yahoo Finance market data for JMS demos")
    parser.add_argument("--symbols", nargs="+", required=True, help="Ticker symbols, e.g. PETR4.SA VALE3.SA AAPL")
    parser.add_argument("--period", default="6mo", help="History period (default: 6mo)")
    parser.add_argument("--interval", default="1d", help="Candle interval (default: 1d)")
    parser.add_argument("--out", default="examples/data/assets.json", help="Output JSON file")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    snapshots: List[AssetSnapshot] = [compute_snapshot(sym, args.period, args.interval) for sym in args.symbols]

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps([asdict(s) for s in snapshots], indent=2), encoding="utf-8")

    print(f"Saved {len(snapshots)} asset snapshots to {out_path}")


if __name__ == "__main__":
    main()
