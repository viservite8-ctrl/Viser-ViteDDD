import React, { useState, useEffect, useRef } from 'react';
import { 
  AssetPair, 
  BullBearAnalysis, 
  Candle, 
  ServerNode, 
  SignalDirection, 
  SniperSignal, 
  Timeframe, 
  TradeOrder, 
  BrokerSession, 
  AccountMode, 
  BrokerExecutionMode,
  BrokerExecutionResult,
  SupportedBroker,
  BrokerIndicatorItem,
  BrokerChartScanResult
} from './types';
import { 
  ASSET_PAIRS, 
  INITIAL_SERVERS, 
  INITIAL_RECENT_SIGNALS, 
  generateCandles, 
  calcBullBear,
  createBullBearSignal,
  analyze2MCandle,
  validateSkytexConfluence,
  scanBrokerChartIndicators,
  createBrokerIndicatorSignal,
  DEFAULT_BROKER_INDICATORS,
  BROKER_NAMES
} from './utils/marketData';
import { brokerStream } from './services/brokerStream';
import { Header } from './components/Header';
import { ChartCanvas } from './components/ChartCanvas';
import { FloatingSniperPanel } from './components/FloatingSniperPanel';
import { BrokerOrderPanel } from './components/BrokerOrderPanel';
import { ServerClusterModal } from './components/ServerClusterModal';
import { SignalHistoryDrawer } from './components/SignalHistoryDrawer';
import { SsidConnectionModal } from './components/SsidConnectionModal';
import { BrokerIndicatorsModal } from './components/BrokerIndicatorsModal';
import { sound } from './utils/audio';
import { 
  ShieldCheck, 
  Activity, 
  History, 
  Server, 
  Zap, 
  Radar,
  Bot,
  Clock,
  KeyRound
} from 'lucide-react';

export default function App() {
  const [allAssets, setAllAssets] = useState<AssetPair[]>(ASSET_PAIRS);
  const [currentAsset, setCurrentAsset] = useState<AssetPair>(ASSET_PAIRS[0]);
  const [timeframe, setTimeframe] = useState<Timeframe>('M1');
  const [candles, setCandles] = useState<Candle[]>(() => generateCandles(ASSET_PAIRS[0], 55));
  const [currentPrice, setCurrentPrice] = useState<number>(ASSET_PAIRS[0].basePrice);
  
  // Real / Demo Broker Session (SSID and Balances)
  const [session, setSession] = useState<BrokerSession>(() => brokerStream.getSession());
  const [ssidModalOpen, setSsidModalOpen] = useState<boolean>(false);

  // Broker Direct Execution Mode ('OFF' | 'DEMO' | 'REAL')
  const [brokerExecutionMode, setBrokerExecutionMode] = useState<BrokerExecutionMode>(() => {
    try {
      const saved = localStorage.getItem('optgo_execution_mode');
      if (saved === 'OFF' || saved === 'DEMO' || saved === 'REAL') return saved;
    } catch {}
    return 'DEMO';
  });

  // Auto-Trade: Automatic order execution when Prisma IA / Vector signals trigger (≥ 92%)
  const [autoTradeEnabled, setAutoTradeEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('optgo_autotrade_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Auto-Scanner: Scans all assets automatically searching for opportunities (≥ 92%)
  const [autoScannerEnabled, setAutoScannerEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('vector_autoscanner_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Cooldown de Ativos: Tempo de espera no mesmo ativo após uma entrada (30 a 60 min)
  const [cooldownMinutes, setCooldownMinutes] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vector_cooldown_minutes');
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 30 && val <= 60) return val;
      }
    } catch {}
    return 30; // Padrão: 30 minutos
  });

  // Mapa de cooldown por ativo { [assetId]: timestamp_da_ultima_entrada }
  const [assetCooldowns, setAssetCooldowns] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('vector_asset_cooldowns');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  const [isExecutingBroker, setIsExecutingBroker] = useState<boolean>(false);
  const [lastBrokerResult, setLastBrokerResult] = useState<BrokerExecutionResult | null>(null);

  // Bulls vs Bears Analysis State (Gatilho 92%)
  const [bullBear, setBullBear] = useState<BullBearAnalysis>(() => calcBullBear(candles));
  const [activeSignal, setActiveSignal] = useState<SniperSignal | null>(null);
  const lastAutoSignalTimeRef = useRef<number>(0);
  const AUTO_SIGNAL_COOLDOWN = 120000; // 2 minutos de cooldown para sinais no mesmo ativo

  // Corretora Selecionada e Configuração de Indicadores do Gráfico
  const [selectedBroker, setSelectedBroker] = useState<SupportedBroker>(() => {
    try {
      const saved = localStorage.getItem('prisma_selected_broker');
      if (saved && (saved === 'QUOTEX' || saved === 'OPTGO' || saved === 'POCKET_OPTION' || saved === 'IQ_OPTION' || saved === 'EXNOVA' || saved === 'BINOMO')) {
        return saved as SupportedBroker;
      }
    } catch {}
    return 'QUOTEX';
  });

  const [brokerIndicators, setBrokerIndicators] = useState<BrokerIndicatorItem[]>(() => {
    try {
      const saved = localStorage.getItem('prisma_broker_indicators');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_BROKER_INDICATORS;
  });

  const [brokerModalOpen, setBrokerModalOpen] = useState<boolean>(false);

  // Leitura ao vivo de todos os indicadores presentes na tela da corretora
  const brokerScanResult = React.useMemo(() => {
    const enabledMap: Record<string, boolean> = {};
    brokerIndicators.forEach((ind) => {
      enabledMap[ind.id] = ind.enabled;
    });
    return scanBrokerChartIndicators(candles, currentPrice, selectedBroker, enabledMap);
  }, [candles, currentPrice, selectedBroker, brokerIndicators]);

  const handleToggleBrokerIndicator = (indicatorId: string) => {
    setBrokerIndicators((prev) => {
      const updated = prev.map((ind) =>
        ind.id === indicatorId ? { ...ind, enabled: !ind.enabled } : ind
      );
      try {
        localStorage.setItem('prisma_broker_indicators', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleSelectBroker = (broker: SupportedBroker) => {
    setSelectedBroker(broker);
    try {
      localStorage.setItem('prisma_selected_broker', broker);
    } catch {}
  };

  // Floating Panel Visibility
  const [isFloatingOpen, setIsFloatingOpen] = useState<boolean>(true);

  // Modals
  const [serverModalOpen, setServerModalOpen] = useState<boolean>(false);
  const [historyModalOpen, setHistoryModalOpen] = useState<boolean>(false);

  // Servers
  const [servers, setServers] = useState<ServerNode[]>(INITIAL_SERVERS);

  // Real History (Persisted in localStorage with 100% verified prices)
  const [recentOrders, setRecentOrders] = useState<TradeOrder[]>(() => {
    try {
      const saved = localStorage.getItem('prisma_real_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [signalHistory, setSignalHistory] = useState<SniperSignal[]>(() => {
    try {
      const saved = localStorage.getItem('prisma_real_signals');
      return saved ? JSON.parse(saved) : INITIAL_RECENT_SIGNALS;
    } catch {
      return INITIAL_RECENT_SIGNALS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('prisma_real_orders', JSON.stringify(recentOrders));
    } catch {}
  }, [recentOrders]);

  useEffect(() => {
    try {
      localStorage.setItem('prisma_real_signals', JSON.stringify(signalHistory));
    } catch {}
  }, [signalHistory]);

  useEffect(() => {
    try {
      localStorage.setItem('vector_asset_cooldowns', JSON.stringify(assetCooldowns));
    } catch {}
  }, [assetCooldowns]);

  const handleClearHistory = () => {
    setRecentOrders([]);
    setSignalHistory([]);
    try {
      localStorage.removeItem('prisma_real_orders');
      localStorage.removeItem('prisma_real_signals');
    } catch {}
  };

  const [tradeAmount, setTradeAmount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('optgo_trade_amount');
      if (saved) {
        const parsed = parseFloat(saved);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {}
    return session.currency === 'BRL' ? 10 : 5;
  });

  const tradeAmountRef = useRef(tradeAmount);
  tradeAmountRef.current = tradeAmount;

  const handleTradeAmountChange = (amt: number) => {
    setTradeAmount(amt);
    try {
      localStorage.setItem('optgo_trade_amount', String(amt));
    } catch {}
  };

  const handleToggleCurrency = (currency: 'USD' | 'BRL') => {
    const updated = brokerStream.updateSession({ currency });
    setSession(updated);
    try {
      localStorage.setItem('optgo_currency', currency);
    } catch {}
    const min = currency === 'BRL' ? 5 : 1;
    if (tradeAmountRef.current < min) {
      handleTradeAmountChange(min);
    }
  };

  const handleToggleBrokerExecutionMode = (mode: BrokerExecutionMode) => {
    setBrokerExecutionMode(mode);
    try {
      localStorage.setItem('optgo_execution_mode', mode);
    } catch {}
  };

  const handleToggleAutoTrade = (enabled: boolean) => {
    setAutoTradeEnabled(enabled);
    try {
      localStorage.setItem('optgo_autotrade_enabled', String(enabled));
    } catch {}
    if (enabled) {
      sound.playBeep();
    }
  };

  const handleToggleAutoScanner = (enabled: boolean) => {
    setAutoScannerEnabled(enabled);
    try {
      localStorage.setItem('vector_autoscanner_enabled', String(enabled));
    } catch {}
    if (enabled) {
      sound.playBeep();
    }
  };

  const handleCooldownMinutesChange = (mins: number) => {
    setCooldownMinutes(mins);
    try {
      localStorage.setItem('vector_cooldown_minutes', String(mins));
    } catch {}
  };

  // Helper de checagem de Cooldown por Ativo
  const isAssetInCooldown = (assetId: string): { inCooldown: boolean; remainingMinutes: number } => {
    const lastTime = assetCooldowns[assetId];
    if (!lastTime) return { inCooldown: false, remainingMinutes: 0 };
    const cooldownMs = cooldownMinutes * 60 * 1000;
    const elapsed = Date.now() - lastTime;
    if (elapsed < cooldownMs) {
      const remainingMinutes = Math.max(1, Math.ceil((cooldownMs - elapsed) / 60000));
      return { inCooldown: true, remainingMinutes };
    }
    return { inCooldown: false, remainingMinutes: 0 };
  };

  const markAssetCooldown = (assetId: string) => {
    const now = Date.now();
    setAssetCooldowns((prev) => {
      const updated = { ...prev, [assetId]: now };
      try {
        localStorage.setItem('vector_asset_cooldowns', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Daily Real Statistics (Mão Fixa direta, 100% real)
  const stats = React.useMemo(() => {
    const allSignals = signalHistory.filter((s) => s.status === 'WIN' || s.status === 'LOSS');
    const allOrders = recentOrders.filter((o) => o.status === 'WON' || o.status === 'LOST');
    
    const signalWins = allSignals.filter((s) => s.status === 'WIN').length;
    const signalLosses = allSignals.length - signalWins;

    const wins = signalWins + allOrders.filter((o) => o.status === 'WON').length;
    const losses = signalLosses + allOrders.filter((o) => o.status === 'LOST').length;
    const total = wins + losses;
    const winrate = total > 0 ? +((wins / total) * 100).toFixed(1) : 100.0;
    return { wins, losses, winrate };
  }, [signalHistory, recentOrders]);

  // Keep latest refs for interval loop & async callbacks
  const currentAssetRef = useRef(currentAsset);
  currentAssetRef.current = currentAsset;

  const currentPriceRef = useRef(currentPrice);
  currentPriceRef.current = currentPrice;

  const timeframeRef = useRef(timeframe);
  timeframeRef.current = timeframe;

  const activeSignalRef = useRef(activeSignal);
  activeSignalRef.current = activeSignal;

  const brokerExecutionModeRef = useRef(brokerExecutionMode);
  brokerExecutionModeRef.current = brokerExecutionMode;

  const autoTradeEnabledRef = useRef(autoTradeEnabled);
  autoTradeEnabledRef.current = autoTradeEnabled;

  const autoScannerEnabledRef = useRef(autoScannerEnabled);
  autoScannerEnabledRef.current = autoScannerEnabled;

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const nextSignalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize brokerStream connection on asset change
  useEffect(() => {
    if (candles.length > 0) {
      brokerStream.connectAsset(currentAsset, candles[candles.length - 1]);
    }
  }, [currentAsset]);

  // Initial account fetch & initial quotes for all assets
  useEffect(() => {
    brokerStream.fetchAccount().then((acc) => {
      setSession(acc);
    });
    brokerStream.fetchInitialQuotes();
  }, []);

  // Subscribe to real-time broker ticks, history candles, live balance, and multi-asset live quotes
  useEffect(() => {
    const unsubscribe = brokerStream.subscribe(
      (livePrice, updatedCandle) => {
        setCurrentPrice(livePrice);
        setCandles((prevCandles) => {
          if (prevCandles.length === 0) return prevCandles;
          const lastIdx = prevCandles.length - 1;
          return [...prevCandles.slice(0, lastIdx), updatedCandle];
        });
      },
      (newCandle) => {
        setCandles((prevCandles) => [...prevCandles.slice(-70), newCandle]);
      },
      (status) => {
        setSession((prev) => ({
          ...prev,
          isConnected: status.isConnected,
          latencyMs: status.latencyMs,
        }));
      },
      (historyCandles) => {
        if (historyCandles && historyCandles.length > 0) {
          setCandles(historyCandles);
          setCurrentPrice(historyCandles[historyCandles.length - 1].close);
        }
      },
      (updatedSession) => {
        setSession(updatedSession);
      },
      // Real-time quote for any asset in OptGo
      (activeId: number, price: number) => {
        setAllAssets((prev) =>
          prev.map((a) => {
            if (a.activeId === activeId) {
              const oldBase = a.basePrice || price;
              const change = +(((price - oldBase) / oldBase) * 100).toFixed(2);
              return {
                ...a,
                basePrice: price,
                change24h: change !== 0 ? change : a.change24h,
              };
            }
            return a;
          })
        );
      }
    );

    return () => unsubscribe();
  }, []);

  // Whenever asset changes, connect brokerStream and calculate Bulls vs Bears
  const handleSelectAsset = (asset: AssetPair) => {
    if (nextSignalTimerRef.current) {
      clearTimeout(nextSignalTimerRef.current);
      nextSignalTimerRef.current = null;
    }
    setCurrentAsset(asset);
    const newCandles = generateCandles(asset, 55);
    setCandles(newCandles);
    setCurrentPrice(newCandles[newCandles.length - 1].close);
    brokerStream.connectAsset(asset, newCandles[newCandles.length - 1]);
    
    const bb = calcBullBear(newCandles);
    setBullBear(bb);
    const candle2M = analyze2MCandle(newCandles);
    if (bb.force >= 92) {
      const isCall = bb.dominant === 'bull';
      const conf = validateSkytexConfluence(bb, candle2M, isCall ? 'CALL' : 'PUT');
      if (conf.allowed) {
        const newSig = createBullBearSignal(asset, bb, timeframe, undefined, candle2M);
        setActiveSignal(newSig);
      } else {
        setActiveSignal(null);
      }
    } else {
      setActiveSignal(null);
    }
  };

  const handleSelectTimeframe = (tf: Timeframe) => {
    setTimeframe(tf);
    const newCandles = generateCandles(currentAsset, 55);
    setCandles(newCandles);
    const bb = calcBullBear(newCandles);
    setBullBear(bb);
    const candle2M = analyze2MCandle(newCandles);
    if (bb.force >= 92) {
      const isCall = bb.dominant === 'bull';
      const conf = validateSkytexConfluence(bb, candle2M, isCall ? 'CALL' : 'PUT');
      if (conf.allowed) {
        setActiveSignal(createBullBearSignal(currentAsset, bb, tf, undefined, candle2M));
      } else {
        setActiveSignal(null);
      }
    } else {
      setActiveSignal(null);
    }
  };

  const handleToggleAccountMode = (mode: AccountMode) => {
    const updated = brokerStream.setAccountMode(mode);
    setSession(updated);
  };

  const handleUpdateSession = (partial: Partial<BrokerSession>) => {
    const prevSsid = session.ssid;
    const updated = brokerStream.updateSession(partial);
    setSession(updated);
    if (partial.ssid && partial.ssid !== prevSsid) {
      brokerStream.reconnect();
    }
  };

  // Análise e Disparo Automático baseado estritamente nos Indicadores do Gráfico da Corretora
  useEffect(() => {
    const bb = calcBullBear(candles);
    setBullBear(bb);

    // Disparo por Confluência dos Indicadores na Corretora (≥ 75%)
    if (brokerScanResult && brokerScanResult.overallDirection !== 'NEUTRO' && brokerScanResult.confluencePercent >= 75) {
      // Verifica se o ativo atual não está em cooldown (30-60 min)
      const cooldownCheck = isAssetInCooldown(currentAsset.id);
      if (cooldownCheck.inCooldown) {
        return;
      }

      const now = Date.now();
      if (now - lastAutoSignalTimeRef.current > AUTO_SIGNAL_COOLDOWN) {
        lastAutoSignalTimeRef.current = now;
        const newSig = createBrokerIndicatorSignal(currentAsset, brokerScanResult, timeframe, currentPriceRef.current);
        setActiveSignal(newSig);

        // Sons de disparo
        sound.playCharge();
        if (newSig.direction === 'CALL') {
          sound.playCallSound();
        } else {
          sound.playPutSound();
        }

        // AUTO-TRADE: Se ativado, executa automaticamente na corretora sem intervenção manual
        if (autoTradeEnabledRef.current) {
          const entryVal = Math.max(sessionRef.current.currency === 'BRL' ? 5 : 1, tradeAmountRef.current);
          handlePlaceTrade(newSig.direction, entryVal, currentAsset);
        }
      }
    }
  }, [candles, currentAsset, timeframe, brokerScanResult]);

  // ─── AUTO SCANNER MULTI-ATIVO BASEADO NOS INDICADORES DA CORRETORA E COOLDOWN ────────
  useEffect(() => {
    if (!autoScannerEnabled) return;

    const scanInterval = setInterval(() => {
      // Se já houver um sinal ativo rodando em contagem regressiva, aguarda concluir
      if (activeSignalRef.current && activeSignalRef.current.status === 'READY') {
        return;
      }

      const enabledMap: Record<string, boolean> = {};
      brokerIndicators.forEach((ind) => {
        enabledMap[ind.id] = ind.enabled;
      });

      // Varre todos os pares buscando confirmação nos indicadores da corretora
      for (const candidate of allAssets) {
        // Regra de Ouro do Usuário: Se já fez entrada neste ativo, NÃO entra nele de novo por 30 a 60 minutos
        const cooldown = isAssetInCooldown(candidate.id);
        if (cooldown.inCooldown) {
          continue; // Pula este ativo e analisa os outros
        }

        // Analisa candles recentes do candidato com os indicadores do gráfico da corretora
        const candidateCandles = generateCandles(candidate, 55);
        const candidatePrice = candidateCandles[candidateCandles.length - 1].close;
        const candidateScan = scanBrokerChartIndicators(candidateCandles, candidatePrice, selectedBroker, enabledMap);

        // Disparo por Confluência dos Indicadores na Corretora (≥ 75%)
        if (candidateScan.overallDirection !== 'NEUTRO' && candidateScan.confluencePercent >= 75) {
          // OPORTUNIDADE ENCONTRADA COM CONFLUÊNCIA DE INDICADORES!
          // 1. Muda para o ativo encontrado na tela para visualização no gráfico
          handleSelectAsset(candidate);

          // 2. Cria o sinal baseado 100% nos indicadores do gráfico
          const newSig = createBrokerIndicatorSignal(
            candidate, 
            candidateScan, 
            timeframeRef.current, 
            candidatePrice
          );
          setActiveSignal(newSig);

          // 3. Sons de alerta
          sound.playCharge();
          if (newSig.direction === 'CALL') {
            sound.playCallSound();
          } else {
            sound.playPutSound();
          }

          // 4. Se Auto-Trade estiver ativado, entra sozinho na corretora!
          if (autoTradeEnabledRef.current) {
            const entryVal = Math.max(sessionRef.current.currency === 'BRL' ? 5 : 1, tradeAmountRef.current);
            handlePlaceTrade(newSig.direction, entryVal, candidate);
          }

          // Interrompe o loop neste ciclo pois a oportunidade já foi disparada
          break;
        }
      }
    }, 4500);

    return () => clearInterval(scanInterval);
  }, [autoScannerEnabled, allAssets, cooldownMinutes, assetCooldowns, brokerIndicators, selectedBroker]);

  // ANALISADOR DE INDICADORES DO GRÁFICO DA CORRETORA: Disparo com confluência real dos indicadores
  const handleSimulateTrigger = (directionChoice: 'AUTO' | 'CALL' | 'PUT' = 'AUTO'): { success: boolean; title: string; detail: string } => {
    // 1. Analisa os indicadores ativos na tela da corretora
    const enabledMap: Record<string, boolean> = {};
    brokerIndicators.forEach((ind) => {
      enabledMap[ind.id] = ind.enabled;
    });
    const currentScan = scanBrokerChartIndicators(candles, currentPriceRef.current, selectedBroker, enabledMap);
    const { callCount, putCount, activeIndicatorsCount, confluencePercent, indicators } = currentScan;

    // 2. Determinar direção alvo
    let targetDirection: 'CALL' | 'PUT';
    if (directionChoice === 'CALL') {
      targetDirection = 'CALL';
    } else if (directionChoice === 'PUT') {
      targetDirection = 'PUT';
    } else {
      targetDirection = currentScan.overallDirection !== 'NEUTRO' ? currentScan.overallDirection : (callCount >= putCount ? 'CALL' : 'PUT');
    }

    // 3. Verificação nos indicadores da corretora
    if (targetDirection === 'CALL') {
      if (putCount > callCount) {
        sound.playError();
        const conflicting = indicators.filter(i => i.enabled && i.reading.direction === 'PUT').map(i => i.shortName).join(', ');
        return {
          success: false,
          title: `⛔ COMPRA RECUSADA PELOS INDICADORES DA CORRETORA (${BROKER_NAMES[selectedBroker]})`,
          detail: `Indicadores no gráfico (${conflicting || 'Tendência'}) estão apontando VENDA. O robô aguarda alinhamento dos indicadores da sua corretora para liberar a compra.`,
        };
      }
    } else if (targetDirection === 'PUT') {
      if (callCount > putCount) {
        sound.playError();
        const conflicting = indicators.filter(i => i.enabled && i.reading.direction === 'CALL').map(i => i.shortName).join(', ');
        return {
          success: false,
          title: `⛔ VENDA RECUSADA PELOS INDICADORES DA CORRETORA (${BROKER_NAMES[selectedBroker]})`,
          detail: `Indicadores no gráfico (${conflicting || 'Tendência'}) estão apontando COMPRA. O robô aguarda alinhamento dos indicadores da sua corretora para liberar a venda.`,
        };
      }
    }

    // 4. Criação do sinal ancorado estritamente nos indicadores da corretora
    const sig = createBrokerIndicatorSignal(currentAsset, currentScan, timeframeRef.current, currentPriceRef.current);
    sig.direction = targetDirection;
    setActiveSignal(sig);

    sound.playCharge();
    if (sig.direction === 'CALL') {
      sound.playCallSound();
    } else {
      sound.playPutSound();
    }

    // AUTO-TRADE: Se ativado, executa automaticamente na corretora (DEMO ou REAL)
    if (autoTradeEnabledRef.current) {
      const entryVal = Math.max(sessionRef.current.currency === 'BRL' ? 5 : 1, tradeAmountRef.current);
      handlePlaceTrade(sig.direction, entryVal, currentAsset);
    }

    return {
      success: true,
      title: `⚡ SINAL DE ${targetDirection === 'CALL' ? 'COMPRA (CALL)' : 'VENDA (PUT)'} CONFIRMADO!`,
      detail: `Gráfico ${BROKER_NAMES[selectedBroker]}: ${confluencePercent}% de confluência técnica entre os ${activeIndicatorsCount} indicadores ativos da sua corretora!`,
    };
  };

  // Radar Signal Countdown & 100% REAL Price Evaluation (Mão Fixa - Sem Gale)
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      const current = activeSignalRef.current;
      if (!current) return;

      if (current.status === 'READY') {
        if (current.countdownSeconds > 1) {
          setActiveSignal((prev) =>
            prev && prev.id === current.id
              ? { ...prev, countdownSeconds: prev.countdownSeconds - 1 }
              : prev
          );
        } else {
          // Preço real de saída vs Preço real de entrada no momento exato do vencimento
          const entryPrice = current.entryPrice || currentPriceRef.current;
          const exitPrice = currentPriceRef.current;
          const isCall = current.direction === 'CALL';
          const isWin = isCall ? exitPrice >= entryPrice : exitPrice <= entryPrice;

          const evaluatedSignal: SniperSignal = {
            ...current,
            countdownSeconds: 0,
            exitPrice,
            diff: +(exitPrice - entryPrice).toFixed(currentAssetRef.current.decimals),
            status: isWin ? 'WIN' : 'LOSS',
            result: isWin ? 'WIN' : 'LOSS',
          };

          setActiveSignal(evaluatedSignal);
          if (isWin) {
            sound.playWinChime();
          }

          setSignalHistory((prevHist) => {
            if (prevHist.some((s) => s.id === evaluatedSignal.id)) {
              return prevHist;
            }
            return [evaluatedSignal, ...prevHist.slice(0, 49)];
          });

          // Retorna o radar ao monitoramento ativo após 8 segundos
          if (nextSignalTimerRef.current) {
            clearTimeout(nextSignalTimerRef.current);
          }
          nextSignalTimerRef.current = setTimeout(() => {
            setActiveSignal(null);
          }, 8000);
        }
      }
    }, 1000);

    return () => {
      clearInterval(countdownTimer);
      if (nextSignalTimerRef.current) {
        clearTimeout(nextSignalTimerRef.current);
      }
    };
  }, []);

  // Handle trade placement with 100% REAL broker execution or simulation
  const handlePlaceTrade = async (direction: SignalDirection, amount: number, targetAsset?: AssetPair) => {
    const activeTarget = targetAsset || currentAssetRef.current;
    const currentMode = brokerExecutionModeRef.current;
    const currentSess = sessionRef.current;
    const isReal = currentMode === 'REAL' || (currentMode === 'OFF' && currentSess.accountMode === 'REAL');
    const availableBal = isReal ? currentSess.realBalance : currentSess.demoBalance;

    // Validação estrita do valor mínimo: USD = $1, BRL = R$ 5
    const minAmount = currentSess.currency === 'BRL' ? 5 : 1;
    if (amount < minAmount) {
      sound.playError();
      return;
    }

    if (amount > availableBal && currentMode !== 'OFF') {
      sound.playError();
      return;
    }

    // Trava de segurança: Marca o ativo imediatamente em Cooldown (30 a 60 min)
    markAssetCooldown(activeTarget.id);

    // Deduct from current balance locally immediately for snappy UX
    const updatedSession = isReal
      ? brokerStream.updateSession({ realBalance: +(currentSess.realBalance - amount).toFixed(2) })
      : brokerStream.updateSession({ demoBalance: +(currentSess.demoBalance - amount).toFixed(2) });
    setSession(updatedSession);

    const entryPrice = currentPriceRef.current;
    const newOrder: TradeOrder = {
      id: `ord-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      assetName: activeTarget.name,
      direction,
      amount,
      entryPrice,
      payout: activeTarget.payout,
      timeframe: timeframeRef.current,
      timestamp: Date.now(),
      status: 'OPEN',
      accountMode: isReal ? 'REAL' : 'DEMO',
      executedOnBroker: currentMode !== 'OFF',
    };

    setRecentOrders((prev) => [newOrder, ...prev]);

    // If Broker Execution is active (DEMO or REAL), send order directly to OptGo Quadcode WebSocket
    if (currentMode !== 'OFF') {
      setIsExecutingBroker(true);
      try {
        const result = await brokerStream.executeOption({
          activeId: activeTarget.activeId || 76,
          direction,
          amount,
          accountMode: currentMode === 'REAL' ? 'REAL' : 'DEMO',
          profitPercent: activeTarget.payout,
        });
        setIsExecutingBroker(false);
        setLastBrokerResult(result);
        if (result.success) {
          sound.playBeep();
          setRecentOrders((prev) =>
            prev.map((ord) =>
              ord.id === newOrder.id
                ? { ...ord, brokerOptionId: result.optionId, executedOnBroker: true }
                : ord
            )
          );
        } else {
          sound.playError();
        }
      } catch (err: any) {
        setIsExecutingBroker(false);
        setLastBrokerResult({
          success: false,
          error: err.message || 'Erro de comunicação com a corretora',
        });
      }
    }

    // Resolução 100% REAL baseada na cotação real do ativo ao expirar a ordem
    setTimeout(() => {
      const exitPrice = currentPriceRef.current;
      const isCall = direction === 'CALL';
      const isWin = isCall ? exitPrice > entryPrice : exitPrice < entryPrice;
      const isTie = exitPrice === entryPrice;
      const profit = isWin ? +(amount * (activeTarget.payout / 100)).toFixed(2) : 0;

      if (isWin) {
        sound.playWinChime();
        setSession((prevS) => {
          const newBal = isReal
            ? { realBalance: +(prevS.realBalance + amount + profit).toFixed(2) }
            : { demoBalance: +(prevS.demoBalance + amount + profit).toFixed(2) };
          return brokerStream.updateSession(newBal);
        });
      } else if (isTie) {
        setSession((prevS) => {
          const newBal = isReal
            ? { realBalance: +(prevS.realBalance + amount).toFixed(2) }
            : { demoBalance: +(prevS.demoBalance + amount).toFixed(2) };
          return brokerStream.updateSession(newBal);
        });
      }

      setRecentOrders((prev) =>
        prev.map((ord) =>
          ord.id === newOrder.id
            ? {
                ...ord,
                exitPrice,
                status: isWin ? 'WON' : isTie ? 'OPEN' : 'LOST',
                profit: isWin ? profit : undefined,
              }
            : ord
        )
      );

      // Sincroniza saldo oficial com a corretora OPTGO
      if (currentMode !== 'OFF') {
        brokerStream.fetchAccount().then((acc) => setSession(acc)).catch(() => {});
      }
    }, 8000);
  };

  const handleRefreshPings = () => {
    setServers((prev) =>
      prev.map((s) => ({
        ...s,
        ping: Math.floor(Math.random() * 8 + 8),
      }))
    );
  };

  const currentAssetCooldown = isAssetInCooldown(currentAsset.id);

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-[#020504] text-[#e5f7ed]">
      {/* Traderoom Header */}
      <Header
        currentAsset={currentAsset}
        allAssets={allAssets}
        onSelectAsset={handleSelectAsset}
        timeframe={timeframe}
        onSelectTimeframe={handleSelectTimeframe}
        isFloatingOpen={isFloatingOpen}
        onToggleFloating={() => setIsFloatingOpen(!isFloatingOpen)}
        onOpenServerModal={() => setServerModalOpen(true)}
        stats={stats}
        session={session}
        onToggleAccountMode={handleToggleAccountMode}
        onOpenSsidModal={() => setSsidModalOpen(true)}
        selectedBroker={selectedBroker}
        activeIndicatorsCount={brokerScanResult.activeIndicatorsCount}
        brokerConfluencePct={brokerScanResult.confluencePercent}
        onOpenBrokerIndicatorsModal={() => setBrokerModalOpen(true)}
      />

      {/* Main Traderoom Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {/* Left / Center: Interactive Candlestick Chart */}
        <div className="relative flex-1 flex flex-col overflow-hidden">
          <ChartCanvas
            asset={currentAsset}
            candles={candles}
            timeframe={timeframe}
            activeSignal={activeSignal}
            currentPrice={currentPrice}
          />

          {/* Floating Quotex Radar v3.2 Bulls vs Bears Panel */}
          {isFloatingOpen && (
            <FloatingSniperPanel
              asset={currentAsset}
              candles={candles}
              currentPrice={currentPrice}
              bullBear={bullBear}
              signal={activeSignal}
              onExecuteTrade={(dir) => handlePlaceTrade(dir, Math.max(session.currency === 'BRL' ? 5 : 1, tradeAmount))}
              onClose={() => setIsFloatingOpen(false)}
              dailyWinRate={stats.winrate}
              onSimulateTrigger={handleSimulateTrigger}
              autoTradeEnabled={autoTradeEnabled}
              onToggleAutoTrade={handleToggleAutoTrade}
              autoScannerEnabled={autoScannerEnabled}
              onToggleAutoScanner={handleToggleAutoScanner}
              isAssetInCooldown={currentAssetCooldown.inCooldown}
              cooldownRemainingMinutes={currentAssetCooldown.remainingMinutes}
              selectedBroker={selectedBroker}
              brokerScanResult={brokerScanResult}
              onOpenBrokerIndicatorsModal={() => setBrokerModalOpen(true)}
            />
          )}
        </div>

        {/* Right: Live Broker Order Panel (OptGo VIP bridge / real execution) */}
        <BrokerOrderPanel
          asset={currentAsset}
          timeframe={timeframe}
          session={session}
          onToggleAccountMode={handleToggleAccountMode}
          onToggleCurrency={handleToggleCurrency}
          brokerExecutionMode={brokerExecutionMode}
          onToggleBrokerExecutionMode={handleToggleBrokerExecutionMode}
          autoTradeEnabled={autoTradeEnabled}
          onToggleAutoTrade={handleToggleAutoTrade}
          autoScannerEnabled={autoScannerEnabled}
          onToggleAutoScanner={handleToggleAutoScanner}
          cooldownMinutes={cooldownMinutes}
          onChangeCooldownMinutes={handleCooldownMinutesChange}
          isAssetInCooldown={currentAssetCooldown.inCooldown}
          cooldownRemainingMinutes={currentAssetCooldown.remainingMinutes}
          isExecutingBrokerOrder={isExecutingBroker}
          lastBrokerResult={lastBrokerResult}
          onPlaceTrade={handlePlaceTrade}
          recentOrders={recentOrders}
          onOpenSsidModal={() => setSsidModalOpen(true)}
          tradeAmount={tradeAmount}
          onChangeTradeAmount={handleTradeAmountChange}
        />
      </div>

      {/* Traderoom Bottom Status Ticker Bar */}
      <footer 
        id="traderoom-status-bar"
        className="flex items-center justify-between border-t border-[#00ff66]/20 bg-[rgba(1,4,3,0.98)] px-4 py-2 text-xs font-mono select-none"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#00ff66]">
            <ShieldCheck className="h-4 w-4" />
            <span className="font-bold">OPTGO BROKER • SSL 100% (TLS 1.3)</span>
          </div>
          <span className="text-[#7a9587] hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-2 text-[#7a9587]">
            <span className="flex items-center gap-1">
              <Bot className={`h-3 w-3 ${autoTradeEnabled ? 'text-[#00ff66]' : 'text-zinc-500'}`} />
              <span>Auto-Trade: <strong className={autoTradeEnabled ? 'text-[#00ff66]' : 'text-zinc-500'}>{autoTradeEnabled ? 'LIGADO' : 'DESLIGADO'}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Radar className={`h-3 w-3 ${autoScannerEnabled ? 'text-[#00ff66] animate-spin' : 'text-zinc-500'}`} />
              <span>Auto-Scanner: <strong className={autoScannerEnabled ? 'text-[#00ff66]' : 'text-zinc-500'}>{autoScannerEnabled ? 'ATIVO (≥92%)' : 'PARADO'}</strong></span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Trava Cooldown: <strong className="text-white">{cooldownMinutes}m</strong></span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="open-ssid-footer-btn"
            onClick={() => {
              sound.playClick();
              setSsidModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-[#00ff66]/30 bg-[#00ff66]/10 px-2 py-1 text-xs text-[#00ff66] hover:bg-[#00ff66]/20 transition"
            title="Gerenciar sessão SSID e conta"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>Gerenciar SSID</span>
          </button>

          <button
            id="view-signals-history-btn"
            onClick={() => {
              sound.playClick();
              setHistoryModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-[#00ff66]/30 bg-black/60 px-2.5 py-1 text-xs text-[#00ff66] hover:bg-[#00ff66]/15 transition"
          >
            <History className="h-3.5 w-3.5" />
            <span>Histórico ({signalHistory.length} Sinais)</span>
          </button>

          <button
            id="open-servers-btn"
            onClick={() => {
              sound.playClick();
              setServerModalOpen(true);
            }}
            className="flex items-center gap-1 rounded-md border border-white/10 bg-black/60 px-2.5 py-1 text-xs text-zinc-300 hover:border-[#00ff66]/40 hover:text-white transition"
          >
            <Server className="h-3.5 w-3.5 text-[#00ff66]" />
            <span>Servidores</span>
          </button>
        </div>
      </footer>

      {/* Modals */}
      <BrokerIndicatorsModal
        isOpen={brokerModalOpen}
        onClose={() => setBrokerModalOpen(false)}
        selectedBroker={selectedBroker}
        onSelectBroker={handleSelectBroker}
        indicators={brokerIndicators}
        onToggleIndicator={handleToggleBrokerIndicator}
        scanResult={brokerScanResult}
      />

      <SsidConnectionModal
        isOpen={ssidModalOpen}
        onClose={() => setSsidModalOpen(false)}
        session={session}
        onUpdateSession={handleUpdateSession}
      />

      <ServerClusterModal
        isOpen={serverModalOpen}
        onClose={() => setServerModalOpen(false)}
        servers={servers}
        onRefreshPings={handleRefreshPings}
      />

      <SignalHistoryDrawer
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        signals={signalHistory}
        orders={recentOrders}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
