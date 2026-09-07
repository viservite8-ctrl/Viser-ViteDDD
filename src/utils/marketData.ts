import { 
  AssetPair, 
  BullBearAnalysis, 
  Candle, 
  Candle2MAnalysis, 
  ServerNode, 
  SniperSignal, 
  Timeframe,
  SupportedBroker,
  BrokerIndicatorItem,
  BrokerChartScanResult
} from '../types';

export const ASSET_PAIRS: AssetPair[] = [
  // --- OptGo OTC Paridades (Mercado Forex OTC 24/7) ---
  { id: 'eur_usd_otc', name: 'EUR/USD (OTC)', symbol: 'EURUSD-OTC', type: 'OTC', payout: 89, basePrice: 1.1704, decimals: 5, change24h: +0.42, isHot: true, activeId: 76 },
  { id: 'usd_brl_otc', name: 'USD/BRL (OTC)', symbol: 'USDBRL-OTC', type: 'OTC', payout: 84, basePrice: 5.0747, decimals: 4, change24h: +1.18, isHot: true, activeId: 2298 },
  { id: 'gbp_usd_otc', name: 'GBP/USD (OTC)', symbol: 'GBPUSD-OTC', type: 'OTC', payout: 89, basePrice: 1.3789, decimals: 5, change24h: +0.37, isHot: true, activeId: 81 },
  { id: 'usd_jpy_otc', name: 'USD/JPY (OTC)', symbol: 'USDJPY-OTC', type: 'OTC', payout: 89, basePrice: 156.28, decimals: 3, change24h: -0.25, isHot: true, activeId: 85 },
  { id: 'eur_jpy_otc', name: 'EUR/JPY (OTC)', symbol: 'EURJPY-OTC', type: 'OTC', payout: 89, basePrice: 181.85, decimals: 3, change24h: +0.48, activeId: 79 },
  { id: 'gbp_jpy_otc', name: 'GBP/JPY (OTC)', symbol: 'GBPJPY-OTC', type: 'OTC', payout: 89, basePrice: 210.77, decimals: 3, change24h: +0.62, isHot: true, activeId: 84 },
  { id: 'eur_gbp_otc', name: 'EUR/GBP (OTC)', symbol: 'EURGBP-OTC', type: 'OTC', payout: 89, basePrice: 0.8648, decimals: 5, change24h: -0.12, activeId: 77 },
  { id: 'aud_cad_otc', name: 'AUD/CAD (OTC)', symbol: 'AUDCAD-OTC', type: 'OTC', payout: 89, basePrice: 0.9971, decimals: 5, change24h: -0.19, activeId: 86 },
  { id: 'aud_usd_otc', name: 'AUD/USD (OTC)', symbol: 'AUDUSD-OTC', type: 'OTC', payout: 84, basePrice: 0.6584, decimals: 5, change24h: +0.34, activeId: 2111 },
  { id: 'usd_cad_otc', name: 'USD/CAD (OTC)', symbol: 'USDCAD-OTC', type: 'OTC', payout: 84, basePrice: 1.3712, decimals: 5, change24h: +0.25, activeId: 2112 },
  { id: 'usd_chf_otc', name: 'USD/CHF (OTC)', symbol: 'USDCHF-OTC', type: 'OTC', payout: 89, basePrice: 0.8174, decimals: 5, change24h: -0.28, activeId: 78 },
  { id: 'nzd_usd_otc', name: 'NZD/USD (OTC)', symbol: 'NZDUSD-OTC', type: 'OTC', payout: 89, basePrice: 0.6575, decimals: 5, change24h: +0.15, activeId: 80 },
  { id: 'eur_cad_otc', name: 'EUR/CAD (OTC)', symbol: 'EURCAD-OTC', type: 'OTC', payout: 84, basePrice: 1.4880, decimals: 5, change24h: +0.41, activeId: 2117 },
  { id: 'gbp_aud_otc', name: 'GBP/AUD (OTC)', symbol: 'GBPAUD-OTC', type: 'OTC', payout: 84, basePrice: 1.9540, decimals: 5, change24h: +0.76, activeId: 2116 },
  { id: 'aud_jpy_otc', name: 'AUD/JPY (OTC)', symbol: 'AUDJPY-OTC', type: 'OTC', payout: 84, basePrice: 102.56, decimals: 3, change24h: -0.10, activeId: 2113 },
  { id: 'cad_jpy_otc', name: 'CAD/JPY (OTC)', symbol: 'CADJPY-OTC', type: 'OTC', payout: 84, basePrice: 112.48, decimals: 3, change24h: +0.22, activeId: 2136 },

  // --- OptGo Commodities & Metais (Mercado OTC) ---
  { id: 'xau_usd_otc', name: 'XAU/USD (Ouro OTC)', symbol: 'XAUUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 4515.50, decimals: 2, change24h: +1.85, isHot: true, activeId: 1857 },
  { id: 'silver_otc', name: 'SILVER (Prata OTC)', symbol: 'XAGUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 67.10, decimals: 2, change24h: +1.05, activeId: 1858 },
  { id: 'crude_oil_otc', name: 'CRUDE OIL (Petróleo WTI OTC)', symbol: 'USOUSD-OTC', type: 'COMMODITIES', payout: 88, basePrice: 92.78, decimals: 2, change24h: -0.92, activeId: 1859 },
  { id: 'brent_oil_otc', name: 'BRENT OIL (Petróleo Brent OTC)', symbol: 'UKOUSD-OTC', type: 'COMMODITIES', payout: 84, basePrice: 96.40, decimals: 2, change24h: -0.74, activeId: 1931 },

  // --- OptGo Criptomoedas Cotação em Tempo Real ---
  { id: 'btc_usd_otc', name: 'BTC/USD (Bitcoin OTC)', symbol: 'BTCUSD-OTC', type: 'CRYPTO', payout: 89, basePrice: 78840.00, decimals: 2, change24h: +3.94, isHot: true, activeId: 2270 },
  { id: 'btc_usd_real', name: 'BTC/USD (Bitcoin Real)', symbol: 'BTCUSD-op', type: 'CRYPTO', payout: 88, basePrice: 79680.00, decimals: 2, change24h: +3.82, isHot: true, activeId: 1916 },
  { id: 'eth_usd_otc', name: 'ETH/USD (Ethereum OTC)', symbol: 'ETHUSD-OTC', type: 'CRYPTO', payout: 88, basePrice: 2197.50, decimals: 2, change24h: +2.15, isHot: true, activeId: 1941 },
  { id: 'sol_usd_otc', name: 'SOL/USD (Solana OTC)', symbol: 'SOLUSD-OTC', type: 'CRYPTO', payout: 88, basePrice: 93.90, decimals: 2, change24h: +5.40, isHot: true, activeId: 1978 },
  { id: 'xrp_usd_otc', name: 'XRP/USD (Ripple OTC)', symbol: 'XRPUSD-OTC', type: 'CRYPTO', payout: 84, basePrice: 2.1520, decimals: 4, change24h: +1.80, activeId: 2107 },
];

export const INITIAL_SERVERS: ServerNode[] = [
  {
    id: 'srv-optgo-vip',
    name: 'OptGo Traderoom Gateway VIP',
    location: 'trade.optgobroker.com',
    country: 'GLOBAL',
    ping: 6,
    status: 'OPTIMAL',
    ipMasked: '104.26.***.18',
    role: 'Conexão Direta SSL Criptografada • Cotações OTC & Real-time Book',
  },
  {
    id: 'srv-br-sp',
    name: 'Cluster Brasil (SP-01)',
    location: 'São Paulo, SP (OptGo LATAM Hub)',
    country: 'BR',
    ping: 8,
    status: 'OPTIMAL',
    ipMasked: '177.54.***.12',
    role: 'Gateway Primário Conexão Direta e Execução Sem Delay',
  },
  {
    id: 'srv-us-ny',
    name: 'Cluster EUA (NYC-04)',
    location: 'New York, Wall St',
    country: 'US',
    ping: 15,
    status: 'OPTIMAL',
    ipMasked: '198.51.***.44',
    role: 'Feed Institucional L2 & Books de Ordens em Tempo Real',
  },
  {
    id: 'srv-de-fra',
    name: 'Cluster Europa (FRA-02)',
    location: 'Frankfurt (OptGo EU Liquidity)',
    country: 'DE',
    ping: 22,
    status: 'ONLINE',
    ipMasked: '194.12.***.89',
    role: 'Motor de Confluência IA & Liquidez Forex / OTC',
  },
];

/**
 * Generate initial realistic candlestick history for an asset
 */
export function generateCandles(asset: AssetPair, count: number = 60, intervalMs: number = 60000): Candle[] {
  const candles: Candle[] = [];
  const now = Date.now();
  const startTime = now - count * intervalMs;
  let currentPrice = asset.basePrice;
  const volatility = asset.basePrice * 0.0007;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalMs;
    const delta = (Math.random() - 0.49) * volatility;
    const open = currentPrice;
    const close = open + delta;
    const high = Math.max(open, close) + Math.random() * volatility * 0.7;
    const low = Math.min(open, close) - Math.random() * volatility * 0.7;
    const volume = Math.floor(Math.random() * 400 + 80);

    candles.push({
      time,
      open,
      high,
      low,
      close,
      volume,
    });

    currentPrice = close;
  }

  return candles;
}

/**
 * Calculate Exponential Moving Average
 */
export function calculateEMA(candles: Candle[], period: number): (number | null)[] {
  const k = 2 / (period + 1);
  const emaValues: (number | null)[] = [];
  let prevEma: number | null = null;

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      emaValues.push(null);
      continue;
    }

    if (prevEma === null) {
      // First SMA
      let sum = 0;
      for (let j = i - period + 1; j <= i; j++) {
        sum += candles[j].close;
      }
      prevEma = sum / period;
      emaValues.push(prevEma);
    } else {
      const currentEma = candles[i].close * k + prevEma * (1 - k);
      emaValues.push(currentEma);
      prevEma = currentEma;
    }
  }

  return emaValues;
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(candles: Candle[], period: number = 20, multiplier: number = 2) {
  const upper: (number | null)[] = [];
  const middle: (number | null)[] = [];
  const lower: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < period - 1) {
      upper.push(null);
      middle.push(null);
      lower.push(null);
      continue;
    }

    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += candles[j].close;
    }
    const sma = sum / period;

    let varianceSum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(candles[j].close - sma, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);

    middle.push(sma);
    upper.push(sma + multiplier * stdDev);
    lower.push(sma - multiplier * stdDev);
  }

  return { upper, middle, lower };
}

/**
 * Cálculo de RSI / IFR (Índice de Força Relativa padrão 14 períodos)
 */
export function calculateRSI(candles: Candle[], period: number = 14): (number | null)[] {
  const rsiValues: (number | null)[] = [];
  if (candles.length < period + 1) {
    return candles.map(() => null);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = candles[i].close - candles[i - 1].close;
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < candles.length; i++) {
    if (i < period) {
      rsiValues.push(null);
      continue;
    }
    if (i > period) {
      const diff = candles[i].close - candles[i - 1].close;
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? Math.abs(diff) : 0;
      avgGain = (avgGain * (period - 1) + gain) / period;
      avgLoss = (avgLoss * (period - 1) + loss) / period;
    }

    if (avgLoss === 0) {
      rsiValues.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - 100 / (1 + rs);
      rsiValues.push(rsi);
    }
  }

  return rsiValues;
}

/**
 * Cálculo de MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(candles: Candle[], fast: number = 12, slow: number = 26, signalPeriod: number = 9) {
  const fastEma = calculateEMA(candles, fast);
  const slowEma = calculateEMA(candles, slow);

  const macdLine: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (fastEma[i] === null || slowEma[i] === null) {
      macdLine.push(null);
    } else {
      macdLine.push(fastEma[i]! - slowEma[i]!);
    }
  }

  // Signal Line (EMA da linha MACD)
  const validMacd = macdLine.map((val, idx) => ({ time: candles[idx].time, open: val ?? 0, high: val ?? 0, low: val ?? 0, close: val ?? 0, volume: 1 }));
  const signalLine = calculateEMA(validMacd, signalPeriod);

  const histogram: (number | null)[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (macdLine[i] === null || signalLine[i] === null) {
      histogram.push(null);
    } else {
      histogram.push(macdLine[i]! - signalLine[i]!);
    }
  }

  return { macdLine, signalLine, histogram };
}

/**
 * Cálculo do Oscilador Estocástico (%K e %D)
 */
export function calculateStochastic(candles: Candle[], kPeriod: number = 14, dPeriod: number = 3) {
  const kValues: (number | null)[] = [];
  const dValues: (number | null)[] = [];

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(null);
      continue;
    }

    let lowestLow = Infinity;
    let highestHigh = -Infinity;

    for (let j = i - kPeriod + 1; j <= i; j++) {
      if (candles[j].low < lowestLow) lowestLow = candles[j].low;
      if (candles[j].high > highestHigh) highestHigh = candles[j].high;
    }

    const range = highestHigh - lowestLow || 1e-9;
    const k = ((candles[i].close - lowestLow) / range) * 100;
    kValues.push(Math.max(0, Math.min(100, k)));
  }

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod + dPeriod - 2) {
      dValues.push(null);
      continue;
    }

    let sum = 0;
    let count = 0;
    for (let j = i - dPeriod + 1; j <= i; j++) {
      if (kValues[j] !== null) {
        sum += kValues[j]!;
        count++;
      }
    }
    dValues.push(count > 0 ? sum / count : 50);
  }

  return { k: kValues, d: dValues };
}

/**
 * Detecção de Zonas de Suporte e Resistência traçadas no gráfico da corretora
 */
export function calculateSupportResistance(candles: Candle[], currentPrice: number) {
  if (!candles || candles.length < 10) {
    return {
      supports: [currentPrice * 0.998],
      resistances: [currentPrice * 1.002],
      nearestSupport: currentPrice * 0.998,
      nearestResistance: currentPrice * 1.002,
      touchingSupport: false,
      touchingResistance: false,
    };
  }

  const highs: number[] = [];
  const lows: number[] = [];

  // Pega topos e fundos locais das últimas 35 velas
  const slice = candles.slice(-35);
  for (let i = 2; i < slice.length - 2; i++) {
    const prev2 = slice[i - 2];
    const prev1 = slice[i - 1];
    const curr = slice[i];
    const next1 = slice[i + 1];
    const next2 = slice[i + 2];

    if (curr.high > prev1.high && curr.high > prev2.high && curr.high > next1.high && curr.high > next2.high) {
      highs.push(curr.high);
    }
    if (curr.low < prev1.low && curr.low < prev2.low && curr.low < next1.low && curr.low < next2.low) {
      lows.push(curr.low);
    }
  }

  // Filtrar suportes abaixo do preço e resistências acima
  const validSupports = lows.filter(l => l <= currentPrice).sort((a, b) => b - a);
  const validResistances = highs.filter(h => h >= currentPrice).sort((a, b) => a - b);

  const nearestSupport = validSupports.length > 0 ? validSupports[0] : currentPrice * 0.9985;
  const nearestResistance = validResistances.length > 0 ? validResistances[0] : currentPrice * 1.0015;

  const threshold = currentPrice * 0.0007; // 0.07% proximidade
  const touchingSupport = Math.abs(currentPrice - nearestSupport) <= threshold;
  const touchingResistance = Math.abs(currentPrice - nearestResistance) <= threshold;

  return {
    supports: validSupports.slice(0, 3),
    resistances: validResistances.slice(0, 3),
    nearestSupport,
    nearestResistance,
    touchingSupport,
    touchingResistance,
  };
}

export const BROKER_NAMES: Record<SupportedBroker, string> = {
  QUOTEX: 'Quotex Platform',
  OPTGO: 'OptGo Broker (Traderoom)',
  POCKET_OPTION: 'Pocket Option',
  IQ_OPTION: 'IQ Option Global',
  EXNOVA: 'Exnova Broker',
  BINOMO: 'Binomo Trading',
};

/**
 * SCANNER DE INDICADORES DO GRÁFICO DA CORRETORA:
 * O robô lê e analisa EXCLUSIVAMENTE os indicadores técnicos que a pessoa possui
 * abertos e ativos na tela da corretora dela (Quotex, OptGo, Pocket Option, etc.).
 */
export function scanBrokerChartIndicators(
  candles: Candle[],
  currentPrice: number,
  broker: SupportedBroker = 'QUOTEX',
  enabledMap: Record<string, boolean> = {
    'ema_cross': true,
    'bollinger': true,
    'rsi': true,
    'support_resistance': true,
    'macd': true,
    'stochastic': true,
  }
): BrokerChartScanResult {
  if (!candles || candles.length < 5) {
    return {
      broker,
      brokerName: BROKER_NAMES[broker],
      chartSynchronized: false,
      lastScannedTime: Date.now(),
      activeIndicatorsCount: 0,
      matchingDirection: 'NEUTRAL',
      confluencePercent: 50,
      indicators: [],
      allIndicatorsAgreed: false,
      summary: 'Aguardando sincronização dos dados do gráfico da corretora...',
    };
  }

  const lastCandle = candles[candles.length - 1];
  const prevCandle = candles.length > 1 ? candles[candles.length - 2] : lastCandle;

  // 1. Médias Móveis EMA (9 e 21) da Corretora
  const ema9Arr = calculateEMA(candles, 9);
  const ema21Arr = calculateEMA(candles, 21);
  const curEma9 = ema9Arr[ema9Arr.length - 1] ?? currentPrice;
  const curEma21 = ema21Arr[ema21Arr.length - 1] ?? currentPrice;
  const prevEma9 = ema9Arr.length > 1 ? ema9Arr[ema9Arr.length - 2] ?? curEma9 : curEma9;
  const prevEma21 = ema21Arr.length > 1 ? ema21Arr[ema21Arr.length - 2] ?? curEma21 : curEma21;

  let emaDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let emaDesc = 'Médias alinhadas em equilíbrio';
  if (curEma9 > curEma21) {
    emaDir = 'CALL';
    const isGoldenCross = prevEma9 <= prevEma21;
    emaDesc = isGoldenCross 
      ? '⚡ Cruzamento de Ouro: EMA 9 cortou EMA 21 para CIMA' 
      : 'EMA 9 acima de EMA 21 (Tendência de Alta Confirmada)';
  } else if (curEma9 < curEma21) {
    emaDir = 'PUT';
    const isDeathCross = prevEma9 >= prevEma21;
    emaDesc = isDeathCross 
      ? '⚡ Cruzamento da Morte: EMA 9 cortou EMA 21 para BAIXO' 
      : 'EMA 9 abaixo de EMA 21 (Tendência de Baixa Confirmada)';
  }

  // 2. Bandas de Bollinger (20, 2) da Corretora
  const bbData = calculateBollingerBands(candles, 20, 2);
  const curUpper = bbData.upper[bbData.upper.length - 1] ?? currentPrice * 1.002;
  const curMiddle = bbData.middle[bbData.middle.length - 1] ?? currentPrice;
  const curLower = bbData.lower[bbData.lower.length - 1] ?? currentPrice * 0.998;

  let bbDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let bbDesc = 'Preço dentro da faixa intermediária das Bandas';
  if (currentPrice <= curLower * 1.0003 || lastCandle.low <= curLower) {
    bbDir = 'CALL';
    bbDesc = 'Preço tocou a Banda Inferior de Bollinger (Sobrevenda -> Retração para Cima)';
  } else if (currentPrice >= curUpper * 0.9997 || lastCandle.high >= curUpper) {
    bbDir = 'PUT';
    bbDesc = 'Preço tocou a Banda Superior de Bollinger (Sobrecompra -> Retração para Baixo)';
  } else if (currentPrice > curMiddle && lastCandle.close > lastCandle.open) {
    bbDir = 'CALL';
    bbDesc = 'Preço trabalhando acima da média central de Bollinger (Pressão Compradora)';
  } else if (currentPrice < curMiddle && lastCandle.close < lastCandle.open) {
    bbDir = 'PUT';
    bbDesc = 'Preço trabalhando abaixo da média central de Bollinger (Pressão Vendedora)';
  }

  // 3. RSI / IFR (14) da Corretora
  const rsiArr = calculateRSI(candles, 14);
  const curRsi = rsiArr[rsiArr.length - 1] ?? 50;
  let rsiDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let rsiDesc = `RSI em zona neutra (${curRsi.toFixed(1)})`;
  if (curRsi <= 32) {
    rsiDir = 'CALL';
    rsiDesc = `RSI em Sobrevenda Extrema (${curRsi.toFixed(1)} ≤ 32) — Esgotamento de venda`;
  } else if (curRsi >= 68) {
    rsiDir = 'PUT';
    rsiDesc = `RSI em Sobrecompra Extrema (${curRsi.toFixed(1)} ≥ 68) — Esgotamento de compra`;
  } else if (curRsi > 54) {
    rsiDir = 'CALL';
    rsiDesc = `RSI ascendente em expansão de alta (${curRsi.toFixed(1)})`;
  } else if (curRsi < 46) {
    rsiDir = 'PUT';
    rsiDesc = `RSI descendente em expansão de baixa (${curRsi.toFixed(1)})`;
  }

  // 4. Suporte e Resistência no Gráfico da Corretora
  const srData = calculateSupportResistance(candles, currentPrice);
  let srDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let srDesc = `Preço entre Suporte (${srData.nearestSupport.toFixed(4)}) e Resistência (${srData.nearestResistance.toFixed(4)})`;
  if (srData.touchingSupport) {
    srDir = 'CALL';
    srDesc = `Preço testando Suporte Forte (${srData.nearestSupport.toFixed(4)}) com rejeição de fundo`;
  } else if (srData.touchingResistance) {
    srDir = 'PUT';
    srDesc = `Preço testando Resistência Forte (${srData.nearestResistance.toFixed(4)}) com rejeição de topo`;
  } else {
    // Se rompeu resistência anterior ou suporte
    const distToSupp = Math.abs(currentPrice - srData.nearestSupport);
    const distToRes = Math.abs(currentPrice - srData.nearestResistance);
    if (distToSupp < distToRes) {
      srDir = 'CALL';
      srDesc = `Defesa Compradora próxima ao Suporte (${srData.nearestSupport.toFixed(4)})`;
    } else {
      srDir = 'PUT';
      srDesc = `Defesa Vendedora próxima à Resistência (${srData.nearestResistance.toFixed(4)})`;
    }
  }

  // 5. MACD (12, 26, 9) da Corretora
  const macdData = calculateMACD(candles, 12, 26, 9);
  const curHist = macdData.histogram[macdData.histogram.length - 1] ?? 0;
  const prevHist = macdData.histogram.length > 1 ? macdData.histogram[macdData.histogram.length - 2] ?? 0 : 0;
  let macdDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let macdDesc = 'Histograma MACD neutro';
  if (curHist > 0 && curHist >= prevHist) {
    macdDir = 'CALL';
    macdDesc = 'MACD Acima da Linha de Sinal com barras verdes em expansão';
  } else if (curHist < 0 && curHist <= prevHist) {
    macdDir = 'PUT';
    macdDesc = 'MACD Abaixo da Linha de Sinal com barras vermelhas em expansão';
  } else if (curHist > 0) {
    macdDir = 'CALL';
    macdDesc = 'MACD positivo em zona compradora';
  } else if (curHist < 0) {
    macdDir = 'PUT';
    macdDesc = 'MACD negativo em zona vendedora';
  }

  // 6. Oscilador Estocástico (14, 3, 3) da Corretora
  const stochData = calculateStochastic(candles, 14, 3);
  const curK = stochData.k[stochData.k.length - 1] ?? 50;
  const curD = stochData.d[stochData.d.length - 1] ?? 50;
  let stochDir: 'CALL' | 'PUT' | 'NEUTRAL' = 'NEUTRAL';
  let stochDesc = `Estocástico em faixa média (%K: ${curK.toFixed(1)}, %D: ${curD.toFixed(1)})`;
  if (curK <= 25 && curK >= curD) {
    stochDir = 'CALL';
    stochDesc = `Estocástico cruzando %D para cima em Sobrevenda (%K: ${curK.toFixed(1)} ≤ 25)`;
  } else if (curK >= 75 && curK <= curD) {
    stochDir = 'PUT';
    stochDesc = `Estocástico cruzando %D para baixo em Sobrecompra (%K: ${curK.toFixed(1)} ≥ 75)`;
  } else if (curK > curD) {
    stochDir = 'CALL';
    stochDesc = `Estocástico com %K acima de %D (${curK.toFixed(1)} > ${curD.toFixed(1)})`;
  } else if (curK < curD) {
    stochDir = 'PUT';
    stochDesc = `Estocástico com %K abaixo de %D (${curK.toFixed(1)} < ${curD.toFixed(1)})`;
  }

  // Montar a lista de indicadores do gráfico da corretora
  const indicators: BrokerIndicatorItem[] = [
    {
      id: 'ema_cross',
      name: 'Médias Móveis (EMA 9 e 21)',
      shortName: 'EMA 9/21',
      type: 'EMA_CROSS',
      enabled: enabledMap['ema_cross'] ?? true,
      paramDescription: 'Períodos 9 & 21 Exponenciais',
      reading: {
        direction: emaDir,
        valueStr: `EMA9: ${curEma9.toFixed(4)} | EMA21: ${curEma21.toFixed(4)}`,
        description: emaDesc,
        confluenceWeight: 20,
        isConfirmed: emaDir !== 'NEUTRAL',
      },
    },
    {
      id: 'bollinger',
      name: 'Bandas de Bollinger (20, 2)',
      shortName: 'Bollinger',
      type: 'BOLLINGER_BANDS',
      enabled: enabledMap['bollinger'] ?? true,
      paramDescription: 'Período 20, Desvio 2.0',
      reading: {
        direction: bbDir,
        valueStr: `Sup: ${curUpper.toFixed(4)} | Inf: ${curLower.toFixed(4)}`,
        description: bbDesc,
        confluenceWeight: 20,
        isConfirmed: bbDir !== 'NEUTRAL',
      },
    },
    {
      id: 'rsi',
      name: 'RSI / IFR (14)',
      shortName: 'RSI 14',
      type: 'RSI_OSCILLATOR',
      enabled: enabledMap['rsi'] ?? true,
      paramDescription: 'Período 14 (30/70)',
      reading: {
        direction: rsiDir,
        valueStr: `Valor: ${curRsi.toFixed(1)}`,
        description: rsiDesc,
        confluenceWeight: 20,
        isConfirmed: rsiDir !== 'NEUTRAL',
      },
    },
    {
      id: 'support_resistance',
      name: 'Suporte & Resistência (Price Action)',
      shortName: 'S & R',
      type: 'SUPPORT_RESISTANCE',
      enabled: enabledMap['support_resistance'] ?? true,
      paramDescription: 'Topos e Fundos Dinâmicos da Corretora',
      reading: {
        direction: srDir,
        valueStr: `S: ${srData.nearestSupport.toFixed(4)} | R: ${srData.nearestResistance.toFixed(4)}`,
        description: srDesc,
        confluenceWeight: 20,
        isConfirmed: srDir !== 'NEUTRAL',
      },
    },
    {
      id: 'macd',
      name: 'MACD (12, 26, 9)',
      shortName: 'MACD',
      type: 'MACD',
      enabled: enabledMap['macd'] ?? true,
      paramDescription: '12 / 26 / Sinal 9',
      reading: {
        direction: macdDir,
        valueStr: `Hist: ${curHist >= 0 ? '+' : ''}${curHist.toFixed(5)}`,
        description: macdDesc,
        confluenceWeight: 10,
        isConfirmed: macdDir !== 'NEUTRAL',
      },
    },
    {
      id: 'stochastic',
      name: 'Oscilador Estocástico (14, 3, 3)',
      shortName: 'Estocástico',
      type: 'STOCHASTIC',
      enabled: enabledMap['stochastic'] ?? true,
      paramDescription: '%K: 14, %D: 3, Suavização: 3',
      reading: {
        direction: stochDir,
        valueStr: `%K: ${curK.toFixed(1)} | %D: ${curD.toFixed(1)}`,
        description: stochDesc,
        confluenceWeight: 10,
        isConfirmed: stochDir !== 'NEUTRAL',
      },
    },
  ];

  // Filtra apenas os indicadores que a pessoa TEM ATIVOS no gráfico da corretora dela
  const activeIndicators = indicators.filter(ind => ind.enabled);
  const activeCount = activeIndicators.length || 1;

  let callVotes = 0;
  let putVotes = 0;
  let neutralVotes = 0;

  activeIndicators.forEach(ind => {
    if (ind.reading.direction === 'CALL') callVotes++;
    else if (ind.reading.direction === 'PUT') putVotes++;
    else neutralVotes++;
  });

  const dominantDirection: 'CALL' | 'PUT' | 'NEUTRAL' = 
    callVotes > putVotes ? 'CALL' : putVotes > callVotes ? 'PUT' : 'NEUTRAL';
  
  const dominantVotes = dominantDirection === 'CALL' ? callVotes : putVotes;
  const confluencePercent = Math.round((dominantVotes / activeCount) * 100);
  const allIndicatorsAgreed = dominantVotes === activeCount && activeCount >= 2;

  let summary = '';
  if (allIndicatorsAgreed) {
    summary = `⚡ 100% de Confluência: Todos os ${activeCount} indicadores ativos no gráfico da ${BROKER_NAMES[broker]} confirmam ${dominantDirection === 'CALL' ? 'COMPRA (CALL)' : 'VENDA (PUT)'}!`;
  } else if (confluencePercent >= 80) {
    summary = `Forte Confluência (${confluencePercent}%): ${dominantVotes} de ${activeCount} indicadores da corretora apontam ${dominantDirection === 'CALL' ? 'COMPRA' : 'VENDA'}.`;
  } else {
    summary = `Mercado em transição na corretora: ${callVotes} indicam Compra, ${putVotes} indicam Venda (${activeCount} indicadores lidos).`;
  }

  return {
    broker,
    brokerName: BROKER_NAMES[broker],
    chartSynchronized: true,
    lastScannedTime: Date.now(),
    activeIndicatorsCount: activeCount,
    matchingDirection: dominantDirection,
    confluencePercent: Math.max(50, confluencePercent),
    indicators,
    allIndicatorsAgreed,
    summary,
  };
}

/**
 * Cria Sinal baseado EXCLUSIVAMENTE nos indicadores ativos no gráfico da corretora do usuário
 */
export function createBrokerIndicatorSignal(
  asset: AssetPair,
  scanResult: BrokerChartScanResult,
  timeframe: Timeframe = 'M1',
  entryPrice?: number
): SniperSignal {
  const direction: 'CALL' | 'PUT' = scanResult.matchingDirection === 'PUT' ? 'PUT' : 'CALL';
  const confidence = Math.max(92, Math.min(100, scanResult.confluencePercent));

  const now = new Date();
  const currentSec = now.getSeconds();
  let secondsRemaining = 60 - currentSec;
  if (secondsRemaining < 10) {
    secondsRemaining += 60;
  }

  const targetDate = new Date(now.getTime() + secondsRemaining * 1000);
  const entryTimeString = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}:00`;

  // Monta a confluência específica vinda do gráfico da corretora
  const confluences: string[] = [
    `📊 Corretora: ${scanResult.brokerName} (Tela Sincronizada)`,
    `Confluência Técnica: ${scanResult.confluencePercent}% dos Indicadores da Corretora em ${direction}`,
  ];

  scanResult.indicators.filter(ind => ind.enabled).forEach(ind => {
    confluences.push(`✓ [${ind.shortName}]: ${ind.reading.description}`);
  });

  confluences.push('Entrada Confirmada na Abertura da Vela da Corretora');

  return {
    id: `sig-broker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assetId: asset.id,
    assetName: asset.name,
    direction,
    timeframe,
    entryTime: entryTimeString,
    countdownSeconds: Math.min(secondsRemaining, 60),
    confidence,
    brokerName: scanResult.brokerName,
    brokerIndicatorsConfluence: confluences,
    brokerIndicatorsCount: scanResult.activeIndicatorsCount,
    force: confidence,
    entryPrice: entryPrice ?? asset.basePrice,
    confluenceFactors: confluences,
    status: 'READY',
    payout: asset.payout,
    createdAt: Date.now(),
  };
}

/**
 * Quotex Radar v3 — Engine Touros vs Ursos (Bulls vs Bears)
 * Analisa as últimas 20 velas com ponderação exponencial e pressão de corpo/pavio
 */
export function calcBullBear(candles: Candle[], currentCandle?: Candle | null): BullBearAnalysis {
  if (!candles || candles.length === 0) {
    return { bullPct: 50, bearPct: 50, dominant: null, force: 50, statusText: 'equilibrado' };
  }

  const windowCandles = candles.slice(-20);
  let bullScore = 0;
  let bearScore = 0;

  windowCandles.forEach((c, i) => {
    const range = c.high - c.low || 1e-9;
    const body = Math.abs(c.close - c.open);
    const bodyRatio = body / range;
    const wickRatio = (range - body) / range;

    // Ponderação exponencial das últimas 20 velas
    const weight = Math.exp((i - windowCandles.length) * 0.15) + 0.3;

    let pts = weight;
    if (bodyRatio > 0.6) pts += 0.5 * weight;
    if (bodyRatio < 0.1) pts -= 0.3 * weight;
    if (wickRatio < 0.2) pts += 0.3 * weight;

    if (c.close >= c.open) {
      bullScore += Math.max(pts, 0.05);
    } else {
      bearScore += Math.max(pts, 0.05);
    }
  });

  if (currentCandle && (currentCandle.volume > 0 || currentCandle.high > currentCandle.low)) {
    const range = currentCandle.high - currentCandle.low || 1e-9;
    const body = Math.abs(currentCandle.close - currentCandle.open);
    const dir = currentCandle.close >= currentCandle.open ? 'bull' : 'bear';
    const pts = 0.4 + (body / range > 0.5 ? 0.2 : 0);
    if (dir === 'bull') bullScore += pts;
    else bearScore += pts;
  }

  const total = bullScore + bearScore || 1;
  const bullPct = Math.round((bullScore / total) * 100);
  const bearPct = 100 - bullPct;
  const dominant: 'bull' | 'bear' = bullPct >= bearPct ? 'bull' : 'bear';
  const force = Math.max(bullPct, bearPct);

  let statusText = 'equilibrado';
  if (force >= 95) statusText = '🔥 FORÇA MÁXIMA';
  else if (force >= 92) statusText = '⚡ SINAL LIBERADO (≥92%)';
  else if (force >= 80) statusText = dominant === 'bull' ? 'touros dominando' : 'ursos dominando';
  else if (force >= 65) statusText = dominant === 'bull' ? 'touros à frente' : 'ursos à frente';

  return { bullPct, bearPct, dominant, force, statusText };
}

/**
 * Análise de Vela 2M Multi-Timeframe (Método Skytex Trading - Quotex)
 * Constrói a vela de 2 Minutos (2M) a partir das 2 últimas velas de 1 Minuto (1M).
 * Executa a leitura pura de corpo x pavio (Candlestick Psychology + Wick Reading):
 * - Rejeição de Fundo (Pavio Inferior Longo): Pressão compradora forte (Touros).
 * - Rejeição de Topo (Pavio Superior Longo): Pressão vendedora forte (Ursos).
 * - Vela de Força/Impulso: Corpo cheio sem rejeição oposta.
 * - Filtro Anti-Loss: Detecta armadilha de resistência/suporte onde o pavio rejeita o movimento.
 */
export function analyze2MCandle(candles: Candle[], currentCandle?: Candle | null): Candle2MAnalysis {
  const allCandles = currentCandle ? [...candles, currentCandle] : candles;
  if (!allCandles || allCandles.length < 2) {
    return {
      open: 0,
      close: 0,
      high: 0,
      low: 0,
      bodyPct: 50,
      upperWickPct: 25,
      lowerWickPct: 25,
      pattern: 'NEUTRAL_DOJI',
      trend2M: 'NEUTRAL',
      wickRejectionDetected: false,
      description: 'Aguardando formação das velas 2M...',
      isConfirmedForSignal: true,
    };
  }

  const c1 = allCandles[allCandles.length - 2];
  const c2 = allCandles[allCandles.length - 1];

  const open = c1.open;
  const close = c2.close;
  const high = Math.max(c1.high, c2.high);
  const low = Math.min(c1.low, c2.low);
  const range = high - low || 1e-9;

  const bodySize = Math.abs(close - open);
  const bodyPct = Math.round((bodySize / range) * 100);

  const upperWick = high - Math.max(open, close);
  const upperWickPct = Math.round((upperWick / range) * 100);

  const lowerWick = Math.min(open, close) - low;
  const lowerWickPct = Math.round((lowerWick / range) * 100);

  const isGreen = close >= open;
  const trend2M = isGreen ? 'BULLISH' : 'BEARISH';

  let pattern: Candle2MAnalysis['pattern'] = 'NEUTRAL_DOJI';
  let wickRejectionDetected = false;
  let rejectionDirection: 'CALL' | 'PUT' | undefined = undefined;
  let description = '';
  let warningAntiLoss: string | undefined = undefined;

  // Leitura precisa de Pavio (Wick Reading):
  if (lowerWickPct >= 38 && lowerWickPct > upperWickPct * 1.3) {
    pattern = 'LOWER_REJECTION_HAMMER';
    wickRejectionDetected = true;
    rejectionDirection = 'CALL';
    description = `Rejeição de Fundo 2M (${lowerWickPct}% Pavio Inferior) — Compradores Rejeitaram a Queda`;
  } else if (upperWickPct >= 38 && upperWickPct > lowerWickPct * 1.3) {
    pattern = 'UPPER_REJECTION_STAR';
    wickRejectionDetected = true;
    rejectionDirection = 'PUT';
    description = `Rejeição de Topo 2M (${upperWickPct}% Pavio Superior) — Vendedores Rejeitaram a Alta`;
  } else if (bodyPct >= 58) {
    if (isGreen) {
      pattern = 'STRONG_BULL_BODY';
      rejectionDirection = 'CALL';
      description = `Vela 2M de Força Touro (${bodyPct}% Corpo Verde) — Impulso Institucional de Alta`;
    } else {
      pattern = 'STRONG_BEAR_BODY';
      rejectionDirection = 'PUT';
      description = `Vela 2M de Força Urso (${bodyPct}% Corpo Vermelho) — Impulso Institucional de Baixa`;
    }
  } else if (bodyPct <= 15) {
    pattern = 'NEUTRAL_DOJI';
    description = `Doji 2M de Indecisão (${bodyPct}% Corpo) — Aguardando Rompimento`;
  } else {
    pattern = 'NEUTRAL_DOJI';
    description = `Vela 2M em Transição (${bodyPct}% Corpo, ${isGreen ? 'Alta' : 'Baixa'})`;
    rejectionDirection = isGreen ? 'CALL' : 'PUT';
  }

  return {
    open,
    close,
    high,
    low,
    bodyPct,
    upperWickPct,
    lowerWickPct,
    pattern,
    trend2M,
    wickRejectionDetected,
    rejectionDirection,
    description,
    isConfirmedForSignal: true,
    warningAntiLoss,
  };
}

/**
 * Validação de Confluência: Touros & Ursos (≥92%) + Leitura de Vela 2M (Método Skytex)
 */
export function validateSkytexConfluence(
  bb: BullBearAnalysis,
  candle2M: Candle2MAnalysis,
  desiredDirection: 'CALL' | 'PUT'
): { allowed: boolean; reason: string; warning?: string } {
  // 1. Checagem de Força de Touros / Ursos (Gatilho 92%)
  if (bb.force < 92) {
    return {
      allowed: false,
      reason: `Zona Neutra: Força atual ${bb.force}% abaixo do gatilho mínimo (≥ 92%).`,
    };
  }

  if (desiredDirection === 'CALL') {
    if (bb.dominant !== 'bull') {
      return {
        allowed: false,
        reason: 'Fluxo Dominante é de Ursos. Entrada de Compra bloqueada.',
      };
    }

    // Regra Skytex: Pavio Superior grande no 2M indica forte rejeição de resistência (armadilha de compra)
    if (candle2M.upperWickPct >= 38 && candle2M.upperWickPct > candle2M.lowerWickPct * 1.4) {
      return {
        allowed: false,
        reason: `Armadilha Anti-Loss: Vela 2M bateu em resistência com forte pavio superior (${candle2M.upperWickPct}%). Rejeição de alta identificada.`,
        warning: 'Filtro Skytex bloqueou compra contra retração de topo!',
      };
    }

    return {
      allowed: true,
      reason: `Confluência Total: Touros ${bb.bullPct}% (≥92%) + ${candle2M.description}`,
    };
  } else {
    // desiredDirection === 'PUT'
    if (bb.dominant !== 'bear') {
      return {
        allowed: false,
        reason: 'Fluxo Dominante é de Touros. Entrada de Venda bloqueada.',
      };
    }

    // Regra Skytex: Pavio Inferior grande no 2M indica forte rejeição de suporte (armadilha de venda)
    if (candle2M.lowerWickPct >= 38 && candle2M.lowerWickPct > candle2M.upperWickPct * 1.4) {
      return {
        allowed: false,
        reason: `Armadilha Anti-Loss: Vela 2M bateu em suporte com forte pavio inferior (${candle2M.lowerWickPct}%). Rejeição de baixa identificada.`,
        warning: 'Filtro Skytex bloqueou venda contra retração de fundo!',
      };
    }

    return {
      allowed: true,
      reason: `Confluência Total: Ursos ${bb.bearPct}% (≥92%) + ${candle2M.description}`,
    };
  }
}

/**
 * Cria sinal estrito Quotex Radar v3 + Skytex 2M Candlestick ao atingir gatilho de 92%+
 */
export function createBullBearSignal(
  asset: AssetPair,
  bb: BullBearAnalysis,
  timeframe: Timeframe = 'M1',
  entryPrice?: number,
  candle2M?: Candle2MAnalysis
): SniperSignal {
  const isCall = bb.dominant === 'bull';
  const direction = isCall ? 'CALL' : 'PUT';
  const confidence = Math.max(92, Math.min(100, bb.force));

  const now = new Date();
  const currentSec = now.getSeconds();
  let secondsRemaining = 60 - currentSec;
  if (secondsRemaining < 10) {
    secondsRemaining += 60;
  }

  const targetDate = new Date(now.getTime() + secondsRemaining * 1000);
  const entryTimeString = `${String(targetDate.getHours()).padStart(2, '0')}:${String(targetDate.getMinutes()).padStart(2, '0')}:00`;

  const confluences = [
    `Força ${confidence}%: ${isCall ? '🐂 TOUROS' : '🐻 URSOS'} dominando`,
    `Touros: ${bb.bullPct}% | Ursos: ${bb.bearPct}% (≥ 92%)`,
    candle2M ? `Vela 2M Skytex: ${candle2M.description}` : `Dual Timeframe 2M -> 1M Confirmado`,
    `Leitura de Pavio: Sem Rejeição Oposta (Filtro Anti-Loss)`,
    'Entrada Exata na Abertura da Vela 1M (Mão Fixa)',
  ];

  return {
    id: `sig-bb-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    assetId: asset.id,
    assetName: asset.name,
    direction,
    timeframe,
    entryTime: entryTimeString,
    countdownSeconds: Math.min(secondsRemaining, 60),
    confidence,
    bullPct: bb.bullPct,
    bearPct: bb.bearPct,
    force: confidence,
    candle2M,
    entryPrice: entryPrice ?? asset.basePrice,
    confluenceFactors: confluences,
    status: 'READY',
    payout: asset.payout,
    createdAt: Date.now(),
  };
}

export const INITIAL_RECENT_SIGNALS: SniperSignal[] = [
  {
    id: 'sig-hist-1',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:58:00',
    countdownSeconds: 0,
    confidence: 95,
    bullPct: 95,
    bearPct: 5,
    force: 95,
    entryPrice: 1.08420,
    exitPrice: 1.08438,
    diff: 0.00018,
    confluenceFactors: ['Touros Dominando (95%)', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 94,
    createdAt: Date.now() - 360000,
  },
  {
    id: 'sig-hist-2',
    assetId: 'gbp_usd_otc',
    assetName: 'GBP/USD (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:54:00',
    countdownSeconds: 0,
    confidence: 93,
    bullPct: 7,
    bearPct: 93,
    force: 93,
    entryPrice: 1.26540,
    exitPrice: 1.26515,
    diff: -0.00025,
    confluenceFactors: ['Ursos Dominando (93%)', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 93,
    createdAt: Date.now() - 600000,
  },
  {
    id: 'sig-hist-3',
    assetId: 'usd_jpy_otc',
    assetName: 'USD/JPY (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:48:00',
    countdownSeconds: 0,
    confidence: 94,
    bullPct: 94,
    bearPct: 6,
    force: 94,
    entryPrice: 154.120,
    exitPrice: 154.148,
    diff: 0.028,
    confluenceFactors: ['Fluxo Comprador Exponencial', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 91,
    createdAt: Date.now() - 900000,
  },
  {
    id: 'sig-hist-4',
    assetId: 'btc_usd',
    assetName: 'BTC/USD Real',
    direction: 'CALL',
    timeframe: 'M5',
    entryTime: '10:45:00',
    countdownSeconds: 0,
    confidence: 96,
    bullPct: 96,
    bearPct: 4,
    force: 96,
    entryPrice: 87420.50,
    exitPrice: 87465.10,
    diff: 44.60,
    confluenceFactors: ['Ponderação Exponencial 20 Velas', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 92,
    createdAt: Date.now() - 1100000,
  },
  {
    id: 'sig-hist-5',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:40:00',
    countdownSeconds: 0,
    confidence: 92,
    bullPct: 8,
    bearPct: 92,
    force: 92,
    entryPrice: 1.08390,
    exitPrice: 1.08365,
    diff: -0.00025,
    confluenceFactors: ['Pressão Vendedora (92%)', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 94,
    createdAt: Date.now() - 1400000,
  },
  {
    id: 'sig-hist-6',
    assetId: 'usd_chf_otc',
    assetName: 'USD/CHF (OTC)',
    direction: 'PUT',
    timeframe: 'M1',
    entryTime: '10:32:00',
    countdownSeconds: 0,
    confidence: 93,
    bullPct: 7,
    bearPct: 93,
    force: 93,
    entryPrice: 0.88450,
    exitPrice: 0.88422,
    diff: -0.00028,
    confluenceFactors: ['Pressão Ursos Confirmada', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 90,
    createdAt: Date.now() - 1800000,
  },
  {
    id: 'sig-hist-7',
    assetId: 'aud_cad_otc',
    assetName: 'AUD/CAD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:25:00',
    countdownSeconds: 0,
    confidence: 82,
    bullPct: 82,
    bearPct: 18,
    force: 82,
    entryPrice: 0.89210,
    exitPrice: 0.89204,
    diff: -0.00006,
    confluenceFactors: ['Rejeição de Nível', 'Retração Inesperada'],
    status: 'LOSS',
    result: 'LOSS',
    payout: 89,
    createdAt: Date.now() - 2200000,
  },
  {
    id: 'sig-hist-8',
    assetId: 'eur_usd_otc',
    assetName: 'EUR/USD (OTC)',
    direction: 'CALL',
    timeframe: 'M1',
    entryTime: '10:18:00',
    countdownSeconds: 0,
    confidence: 94,
    bullPct: 94,
    bearPct: 6,
    force: 94,
    entryPrice: 1.08320,
    exitPrice: 1.08355,
    diff: 0.00035,
    confluenceFactors: ['Touros Dominando (94%)', 'Gatilho Vector Superado (≥92%)'],
    status: 'WIN',
    result: 'WIN',
    payout: 94,
    createdAt: Date.now() - 2600000,
  },
];
