import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Crosshair, 
  ChevronDown, 
  Minus, 
  Volume2, 
  Copy, 
  Check, 
  Zap, 
  GripHorizontal,
  ArrowUpRight,
  ArrowDownRight, 
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Radar,
  Clock,
  ShieldCheck,
  Flame,
  Layers,
  Sliders
} from 'lucide-react';
import { 
  AssetPair, 
  BullBearAnalysis, 
  Candle, 
  Candle2MAnalysis, 
  SniperSignal,
  SupportedBroker,
  BrokerChartScanResult
} from '../types';
import { analyze2MCandle, BROKER_NAMES } from '../utils/marketData';
import { sound } from '../utils/audio';

interface FloatingSniperPanelProps {
  asset: AssetPair;
  candles: Candle[];
  currentPrice: number;
  bullBear: BullBearAnalysis;
  signal: SniperSignal | null;
  onExecuteTrade: (direction: 'CALL' | 'PUT') => void;
  onClose: () => void;
  dailyWinRate: number;
  onSimulateTrigger?: (directionChoice?: 'AUTO' | 'CALL' | 'PUT') => { success: boolean; title: string; detail: string } | void;
  autoTradeEnabled?: boolean;
  onToggleAutoTrade?: (enabled: boolean) => void;
  autoScannerEnabled?: boolean;
  onToggleAutoScanner?: (enabled: boolean) => void;
  cooldownRemainingMinutes?: number;
  isAssetInCooldown?: boolean;
  selectedBroker?: SupportedBroker;
  brokerScanResult?: BrokerChartScanResult;
  onOpenBrokerIndicatorsModal?: () => void;
}

export const FloatingSniperPanel: React.FC<FloatingSniperPanelProps> = ({
  asset,
  candles,
  currentPrice,
  bullBear,
  signal,
  onExecuteTrade,
  dailyWinRate,
  onSimulateTrigger,
  autoTradeEnabled = false,
  onToggleAutoTrade,
  autoScannerEnabled = false,
  onToggleAutoScanner,
  cooldownRemainingMinutes = 0,
  isAssetInCooldown = false,
  selectedBroker = 'QUOTEX',
  brokerScanResult,
  onOpenBrokerIndicatorsModal,
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [vectorFeedback, setVectorFeedback] = useState<{
    type: 'approved' | 'blocked';
    title: string;
    detail: string;
  } | null>(null);

  const handleRunVectorAnalyzer = (choice: 'AUTO' | 'CALL' | 'PUT' = 'AUTO') => {
    sound.playRadarPing();
    if (onSimulateTrigger) {
      const res = onSimulateTrigger(choice);
      if (res && typeof res === 'object' && 'success' in res) {
        setVectorFeedback({
          type: res.success ? 'approved' : 'blocked',
          title: res.title,
          detail: res.detail,
        });
        setTimeout(() => {
          setVectorFeedback((prev) => (prev?.title === res.title ? null : prev));
        }, 6500);
      }
    }
  };

  // Draggable window state
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    try {
      const saved = localStorage.getItem('radar_panel_pos_v3');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    const initX = Math.max(16, window.innerWidth - 325);
    return { x: initX, y: 70 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    setIsDragging(true);
    dragOffsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button')) return;
    const touch = e.touches[0];
    setIsDragging(true);
    dragOffsetRef.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = Math.max(8, Math.min(window.innerWidth - 300, e.clientX - dragOffsetRef.current.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, e.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const newX = Math.max(8, Math.min(window.innerWidth - 300, touch.clientX - dragOffsetRef.current.x));
      const newY = Math.max(8, Math.min(window.innerHeight - 80, touch.clientY - dragOffsetRef.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleEnd = () => {
      setIsDragging(false);
      try {
        localStorage.setItem('radar_panel_pos_v3', JSON.stringify(position));
      } catch {}
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, position]);

  const handleResetPosition = () => {
    const initX = Math.max(16, window.innerWidth - 325);
    const pos = { x: initX, y: 70 };
    setPosition(pos);
    try {
      localStorage.setItem('radar_panel_pos_v3', JSON.stringify(pos));
    } catch {}
  };

  // Sparkline Canvas
  const sparklineRef = useRef<HTMLCanvasElement>(null);
  const priceHistoryRef = useRef<number[]>([]);

  useEffect(() => {
    if (!currentPrice) return;
    const history = priceHistoryRef.current;
    history.push(currentPrice);
    if (history.length > 30) history.shift();

    const canvas = sparklineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    if (history.length < 2) return;

    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 0.0001;

    ctx.beginPath();
    history.forEach((val, i) => {
      const x = (i / (history.length - 1)) * (w - 4) + 2;
      const y = h - ((val - min) / range) * (h - 8) - 4;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const isUp = history[history.length - 1] >= history[0];
    ctx.strokeStyle = isUp ? '#00ff66' : '#ff4444';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = isUp ? 'rgba(0,255,102,0.8)' : 'rgba(255,68,68,0.8)';
    ctx.shadowBlur = 6;
    ctx.stroke();

    const lastX = w - 2;
    const lastY = h - ((history[history.length - 1] - min) / range) * (h - 8) - 4;
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }, [currentPrice]);

  // Delta calculation
  const prevPriceRef = useRef(currentPrice);
  const [priceDelta, setPriceDelta] = useState<{ text: string; isUp: boolean } | null>(null);

  useEffect(() => {
    if (prevPriceRef.current && currentPrice !== prevPriceRef.current) {
      const diff = currentPrice - prevPriceRef.current;
      const pct = (diff / prevPriceRef.current) * 100;
      setPriceDelta({
        text: `${diff >= 0 ? '+' : ''}${pct.toFixed(3)}%`,
        isUp: diff >= 0,
      });
      prevPriceRef.current = currentPrice;
    }
  }, [currentPrice]);

  const bullPct = bullBear.bullPct;
  const bearPct = bullBear.bearPct;
  const force = bullBear.force;
  const isBull = bullBear.dominant === 'bull';

  // Gatilho oficial Vector: 92%
  const TRIGGER_FORCE = 92;

  let statusLabel = 'NEUTRO';
  if (force >= TRIGGER_FORCE) {
    statusLabel = isBull ? '🔥 FORÇA TOUROS (≥92%)' : '🔥 FORÇA URSOS (≥92%)';
  } else if (force >= 80) {
    statusLabel = isBull ? '▲ TOUROS DOMINANDO' : '▼ URSOS DOMINANDO';
  } else if (force >= 65) {
    statusLabel = isBull ? '▲ TOUROS À FRENTE' : '▼ URSOS À FRENTE';
  }

  const offset = Math.abs(bullPct - 50);
  const barWidth = Math.min(50, offset);

  // Mini candles (últimas 20 velas)
  const miniCandles = candles.slice(-20);
  const candleMax = Math.max(...miniCandles.map((c) => c.high), 1);
  const candleMin = Math.min(...miniCandles.map((c) => c.low), 0);
  const candleRange = candleMax - candleMin || 0.0001;

  // Análise Multi-Timeframe de Vela 2M (Método Skytex)
  const candle2M = useMemo(() => analyze2MCandle(candles), [candles]);

  const isSignalCall = signal?.direction === 'CALL';

  const handleCopySignal = () => {
    if (!signal) return;
    const text = `🎯 PRISMA IA - SINAL VECTOR-OTC
Ativo: ${signal.assetName}
Direção: ${signal.direction === 'CALL' ? 'COMPRA (CALL)' : 'VENDA (PUT)'}
Força: ${signal.confidence}% (≥92%)
Vela 1M: Entrada na Abertura
Vela 2M (Skytex): ${signal.candle2M?.description || candle2M.description}
Assertividade: ${dailyWinRate}%`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    sound.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      ref={panelRef}
      id="floating-sniper-radar"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className={`fixed top-0 left-0 z-50 w-[290px] select-none rounded-2xl border-2 font-mono transition-shadow duration-200 ${
        isDragging
          ? 'shadow-[0_0_50px_rgba(0,255,102,0.5)] cursor-grabbing'
          : 'shadow-[0_0_35px_rgba(0,255,102,0.3),_0_20px_45px_rgba(0,0,0,0.9)]'
      } border-[#00ff66]/70 bg-gradient-to-b from-[#052b14]/98 via-[#021f0e]/98 to-[#011409]/98 backdrop-blur-2xl text-white`}
    >
      {/* 1. Header com alça de arrastar e LOGO Cyber Hacker */}
      <div
        id="rp-drag-handle"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        title="Clique/toque e arraste para qualquer lugar da tela"
        className="flex cursor-grab active:cursor-grabbing items-center justify-between border-b border-[#00ff66]/40 bg-gradient-to-r from-[#07381b] via-[#052b15] to-[#031e0e] px-3 py-2 rounded-t-2xl shadow-[inset_0_1px_0_rgba(0,255,102,0.4)]"
      >
        <div className="flex items-center gap-1.5 pointer-events-none">
          <GripHorizontal className="h-3.5 w-3.5 text-[#00ff66]" />
          <img 
            src="/assets/prisma_vector_logo.jpg" 
            alt="Vector OTC" 
            className="h-5 w-5 rounded object-cover border border-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.6)]"
            referrerPolicy="no-referrer"
          />
          <span className="text-[10px] font-black tracking-widest text-[#00ff66] drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]">
            ◈ PRISMA IA — VECTOR-OTC
          </span>
        </div>

        <div className="flex items-center gap-1">
          <span className="flex items-center gap-1 text-[9px] font-bold text-[#00ff66] animate-pulse pointer-events-none">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ff66]" /> LIVE
          </span>
          <button
            onClick={handleResetPosition}
            className="rounded p-1 text-[#7a9587] hover:text-[#00ff66] transition"
            title="Redefinir posição inicial do painel"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
          <button
            onClick={() => handleRunVectorAnalyzer('AUTO')}
            className="rounded p-1 text-[#00ff66] hover:bg-[#00ff66]/20 transition"
            title="ANALISADOR MODO VECTOR (Disparo Inteligente)"
          >
            <Zap className="h-3 w-3 fill-current" />
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="rounded p-1 text-[#7a9587] hover:text-white transition"
          >
            {isMinimized ? <ChevronDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          </button>
        </div>
      </div>

      {/* Asset Name Banner & Cooldown alert */}
      <div className="border-b border-[#00ff66]/25 px-3 py-1.5 flex items-center justify-between bg-[#042412]/80 text-xs">
        <span className="font-extrabold tracking-wider text-white flex items-center gap-1.5">
          {asset.name}
          <span className="text-[9px] font-extrabold text-[#00ff66] bg-[#00ff66]/20 px-1.5 py-0.2 rounded border border-[#00ff66]/40 shadow-[0_0_8px_rgba(0,255,102,0.2)]">
            {asset.payout}%
          </span>
        </span>
        <span className="text-[10px] text-[#a3d9b5]">
          Assert: <strong className="text-[#00ff66]">{dailyWinRate}%</strong>
        </span>
      </div>

      {/* Se o ativo atual estiver em COOLDOWN, exibe o aviso claro */}
      {isAssetInCooldown && (
        <div className="bg-amber-950/80 border-b border-amber-500/50 px-3 py-1 text-[9px] font-mono flex items-center justify-between text-amber-300 animate-pulse">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3 text-amber-400" />
            <span>COOLDOWN: <strong>{cooldownRemainingMinutes}m restantes</strong></span>
          </span>
          <span className="text-[8px] text-zinc-300">Robô analisando outros pares</span>
        </div>
      )}

      {!isMinimized && (
        <div>
          {/* Sincronização e Status do Gráfico da Corretora */}
          <div className="border-b border-[#00ff66]/30 px-3 py-1.5 bg-[#02180c] flex items-center justify-between text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00ff66]" />
              </span>
              <span className="text-white font-bold">
                Corretora: <strong className="text-[#00ff66]">{BROKER_NAMES[selectedBroker]}</strong>
              </span>
            </div>
            <button
              onClick={() => {
                sound.playClick();
                onOpenBrokerIndicatorsModal?.();
              }}
              className="text-[8px] px-2 py-0.5 rounded bg-[#00ff66]/20 hover:bg-[#00ff66]/30 text-[#00ff66] border border-[#00ff66]/40 flex items-center gap-1 transition cursor-pointer"
              title="Configurar quais indicadores você tem no gráfico da corretora"
            >
              <Sliders className="h-2.5 w-2.5" />
              <span>{brokerScanResult?.activeIndicatorsCount ?? 4} Indicadores</span>
            </button>
          </div>

          {/* 1. BOTÃO DO ANALISADOR DE INDICADORES NO TOPO DO PAINEL */}
          {onSimulateTrigger && (
            <div className="border-b border-[#00ff66]/40 p-2.5 bg-gradient-to-r from-[#032b16] via-[#021f0e] to-[#032b16] space-y-1.5 shadow-[inset_0_1px_0_rgba(0,255,102,0.3)]">
              <div className="flex items-center justify-between text-[9px] font-black">
                <span className="text-[#00ff66] flex items-center gap-1">
                  <Layers className="h-3 w-3 text-[#00ff66] animate-pulse" />
                  <span>ANALISADOR DE INDICADORES DA CORRETORA</span>
                </span>
                <span className="text-[8px] bg-black/70 px-1.5 py-0.5 rounded border border-[#00ff66]/40 text-[#a3d9b5] font-bold">
                  {brokerScanResult?.confluencePercent ?? 96}% Confluência
                </span>
              </div>

              {/* Botão Principal de Análise no Topo */}
              <button
                id="top-vector-analyzer-btn"
                onClick={() => handleRunVectorAnalyzer('AUTO')}
                className="w-full rounded-xl border-2 border-[#00ff66] bg-gradient-to-r from-[#00ff66]/35 via-[#00ff66]/20 to-[#00ff66]/35 py-2 text-[10px] font-black text-[#00ff66] hover:brightness-125 transition shadow-[0_0_20px_rgba(0,255,102,0.4)] flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
              >
                <Zap className="h-3.5 w-3.5 fill-current text-[#00ff66]" />
                <span>⚡ ANALISAR INDICADORES DA CORRETORA</span>
              </button>

              {/* Sub-botões Direcionais Compra e Venda */}
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  id="top-analyze-call-btn"
                  onClick={() => handleRunVectorAnalyzer('CALL')}
                  title="Analisar oportunidade de Compra pelos indicadores da corretora"
                  className="rounded-lg border border-[#00ff66]/50 bg-[#00ff66]/10 py-1.5 text-[8.5px] font-black text-[#00ff66] hover:bg-[#00ff66]/25 transition flex items-center justify-center gap-1 active:scale-95 shadow-[0_0_8px_rgba(0,255,102,0.2)] cursor-pointer"
                >
                  <ArrowUpRight className="h-3 w-3" />
                  <span>Entrada Compra (CALL)</span>
                </button>
                <button
                  id="top-analyze-put-btn"
                  onClick={() => handleRunVectorAnalyzer('PUT')}
                  title="Analisar oportunidade de Venda pelos indicadores da corretora"
                  className="rounded-lg border border-rose-500/50 bg-rose-500/10 py-1.5 text-[8.5px] font-black text-rose-400 hover:bg-rose-500/25 transition flex items-center justify-center gap-1 active:scale-95 shadow-[0_0_8px_rgba(244,63,94,0.2)] cursor-pointer"
                >
                  <ArrowDownRight className="h-3 w-3" />
                  <span>Entrada Venda (PUT)</span>
                </button>
              </div>

              {/* Feedback e Diagnóstico do Analisador no Topo */}
              {vectorFeedback && (
                <div
                  className={`p-2 text-left rounded-lg border text-[9px] space-y-0.5 transition-all ${
                    vectorFeedback.type === 'blocked'
                      ? 'bg-rose-950/90 border-rose-500/60 text-rose-200'
                      : 'bg-emerald-950/90 border-[#00ff66]/60 text-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-black">
                    <div className="flex items-center gap-1">
                      {vectorFeedback.type === 'blocked' ? (
                        <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 text-[#00ff66] shrink-0" />
                      )}
                      <span>{vectorFeedback.title}</span>
                    </div>
                    <button
                      onClick={() => setVectorFeedback(null)}
                      className="text-white/60 hover:text-white text-[10px] ml-1"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[8px] opacity-90 leading-tight">
                    {vectorFeedback.detail}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* PAINEL DE LEITURA DOS INDICADORES DO GRÁFICO DA CORRETORA */}
          {brokerScanResult && (
            <div className="border-b border-[#00ff66]/30 p-2.5 bg-[#032011]/90 space-y-2">
              <div className="flex items-center justify-between text-[9px] font-black">
                <span className="text-white flex items-center gap-1">
                  <Activity className="h-3 w-3 text-[#00ff66]" />
                  <span>INDICADORES NA TELA ({brokerScanResult.activeIndicatorsCount})</span>
                </span>
                <span className="text-[8px] text-[#00ff66] font-bold">
                  {brokerScanResult.confluencePercent}% CONFLUÊNCIA
                </span>
              </div>

              {/* Chips de Indicadores Ativos na Corretora */}
              <div className="grid grid-cols-2 gap-1 text-[8px]">
                {brokerScanResult.indicators
                  .filter((ind) => ind.enabled)
                  .map((ind) => {
                    const isIndCall = ind.reading.direction === 'CALL';
                    const isIndPut = ind.reading.direction === 'PUT';
                    return (
                      <div
                        key={ind.id}
                        className={`p-1 rounded-md border flex items-center justify-between gap-1 ${
                          isIndCall
                            ? 'bg-[#00ff66]/15 border-[#00ff66]/50 text-[#00ff66]'
                            : isIndPut
                            ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                            : 'bg-black/50 border-white/10 text-zinc-400'
                        }`}
                        title={ind.reading.description}
                      >
                        <span className="font-bold truncate text-[8px] text-white">
                          {ind.shortName}
                        </span>
                        <span className="font-black text-[7.5px] shrink-0">
                          {isIndCall ? '▲ CALL' : isIndPut ? '▼ PUT' : '●'}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <div className="text-[7.5px] text-[#a3d9b5] bg-black/40 p-1 rounded border border-white/5 leading-tight">
                {brokerScanResult.summary}
              </div>
            </div>
          )}

          {/* 2. Preço ao Vivo & Delta */}
          <div className="flex items-baseline justify-between border-b border-[#00ff66]/30 px-3 py-2 bg-[#021c0e]/90">
            <div className="text-lg font-black tracking-wider text-[#00ff66] font-mono tabular-nums drop-shadow-[0_0_8px_rgba(0,255,102,0.4)]">
              {currentPrice.toFixed(asset.decimals)}
            </div>
            {priceDelta && (
              <div
                className={`text-[10px] font-extrabold ${
                  priceDelta.isUp ? 'text-[#00ff66]' : 'text-[#ff4444]'
                }`}
              >
                {priceDelta.text}
              </div>
            )}
          </div>

          {/* 3. Sparkline */}
          <div className="border-b border-[#00ff66]/30 px-3 py-1.5 bg-[#031f10]/95">
            <canvas ref={sparklineRef} width={258} height={34} className="block w-full" />
          </div>

          {/* 4. TERMÔMETRO BULLS vs BEARS (Gatilho 92%) */}
          <div className="border-b border-[#00ff66]/30 p-3 space-y-2 bg-[#042412]/50">
            {/* Header Força de Mercado */}
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-[#00ff66] font-bold tracking-wider uppercase">
                Força de Mercado
              </span>
              <span
                className={`font-black tracking-wider px-1.5 py-0.5 rounded text-[9px] ${
                  force >= TRIGGER_FORCE
                    ? isBull
                      ? 'bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/60 shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                      : 'bg-[#ff4444]/20 text-[#ff4444] border border-[#ff4444]/60 shadow-[0_0_12px_rgba(255,68,68,0.4)]'
                    : 'text-[#a3d9b5] bg-[#021a0d]/80 border border-[#00ff66]/20'
                }`}
              >
                {force >= TRIGGER_FORCE
                  ? `${force}% ${isBull ? '▲ BULL' : '▼ BEAR'}`
                  : force >= 80
                  ? `${force}% ${isBull ? '▲ BULL' : '▼ BEAR'}`
                  : 'AGUARDAR 92%'}
              </span>
            </div>

            {/* Escala 0 25 50 92 100 */}
            <div className="flex justify-between text-[8px] text-[#7a9587] px-0.5 font-bold">
              <span>0</span>
              <span>25</span>
              <span>50</span>
              <span className="text-[#ffe600] font-black">92%</span>
              <span>100</span>
            </div>

            {/* Barra Touros (▲) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#00ff66] w-3.5">▲</span>
              <div className="relative flex-1 h-3.5 rounded-full overflow-hidden bg-[#031d0f] border border-[#00ff66]/40 shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00aa44] via-[#00ff66] to-[#66ff99] transition-all duration-500 relative shadow-[0_0_10px_rgba(0,255,102,0.5)]"
                  style={{ width: `${bullPct}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-1 bg-white/60 rounded-r-full" />
                </div>
                {/* Marcador 92% */}
                <div className="absolute left-[92%] top-0 h-full w-px bg-[#ffe600]" title="Gatilho 92%" />
              </div>
              <span className="text-[11px] font-black text-[#00ff66] w-8 text-right drop-shadow-[0_0_4px_rgba(0,255,102,0.5)]">
                {bullPct}%
              </span>
            </div>

            {/* Barra Ursos (▼) */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black text-[#ff4444] w-3.5">▼</span>
              <div className="relative flex-1 h-3.5 rounded-full overflow-hidden bg-[#1f0a0a] border border-[#ff4444]/40 shadow-[inset_0_0_6px_rgba(0,0,0,0.6)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#aa2222] to-[#ff4444] transition-all duration-500 relative shadow-[0_0_10px_rgba(255,68,68,0.5)]"
                  style={{ width: `${bearPct}%` }}
                >
                  <div className="absolute right-0 top-0 h-full w-1 bg-white/60 rounded-r-full" />
                </div>
                {/* Marcador 92% */}
                <div className="absolute left-[92%] top-0 h-full w-px bg-[#ffe600]" title="Gatilho 92%" />
              </div>
              <span className="text-[11px] font-black text-[#ff4444] w-8 text-right drop-shadow-[0_0_4px_rgba(255,68,68,0.5)]">
                {bearPct}%
              </span>
            </div>

            {/* Termômetro Central de Força com Marcador 92% */}
            <div className="pt-1 space-y-1">
              <div className="text-[8px] text-[#00ff66]/80 uppercase tracking-widest font-bold">
                Termômetro de Força Vector (≥92%)
              </div>
              <div className="relative h-6 rounded-full overflow-hidden border border-[#00ff66]/30 bg-[#02180c]">
                <div className="absolute left-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#200808] to-[#120505]" />
                <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-r from-[#031a0e] to-[#07361a]" />
                <div className="absolute left-1/2 top-1 h-4 w-px bg-white/30" />
                {/* Linhas de Gatilho 92% */}
                <div className="absolute left-[8%] top-1 h-4 w-px bg-[#ffe600]/80" title="Gatilho Ursos 92%" />
                <div className="absolute right-[8%] top-1 h-4 w-px bg-[#ffe600]/80" title="Gatilho Touros 92%" />

                {/* Barra deslizante */}
                <div
                  className={`absolute top-1 h-4 rounded-full transition-all duration-500 ${
                    isBull
                      ? 'left-1/2 bg-gradient-to-r from-[#00aa44] to-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.8)]'
                      : 'right-1/2 bg-gradient-to-l from-[#aa2222] to-[#ff4444] shadow-[0_0_12px_rgba(255,68,68,0.8)]'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-4 bg-white rounded-sm z-10 shadow-[0_0_6px_white]" />

                <div
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-black z-20 whitespace-nowrap drop-shadow-[0_0_4px_black] ${
                    force >= TRIGGER_FORCE
                      ? 'text-white'
                      : force >= 80
                      ? isBull
                        ? 'text-[#00ff66]'
                        : 'text-[#ff4444]'
                      : 'text-zinc-300'
                  }`}
                >
                  {force}%
                </div>
              </div>

              {/* Legendas de extremidade */}
              <div className="flex justify-between text-[8px] px-1 font-bold">
                <span className="text-[#ff4444]">← URSOS</span>
                <span
                  className={
                    force >= TRIGGER_FORCE
                      ? isBull
                        ? 'text-[#00ff66]'
                        : 'text-[#ff4444]'
                      : 'text-[#a3d9b5]'
                  }
                >
                  {statusLabel}
                </span>
                <span className="text-[#00ff66]">TOUROS →</span>
              </div>
            </div>

            {/* Zona de Disparo Indicador (≥ 92%) */}
            <div
              className={`p-2 rounded-lg text-center text-[9px] font-black tracking-wider transition-all duration-300 ${
                force >= TRIGGER_FORCE
                  ? isBull
                    ? 'bg-[#00ff66]/20 border border-[#00ff66] text-[#00ff66] shadow-[0_0_20px_rgba(0,255,102,0.4)] animate-pulse'
                    : 'bg-[#ff4444]/20 border border-[#ff4444] text-[#ff4444] shadow-[0_0_20px_rgba(255,68,68,0.4)] animate-pulse'
                  : force >= 80
                  ? 'bg-[#ffe600]/15 border border-[#ffe600]/50 text-[#ffe600]'
                  : 'bg-[#02180c]/80 border border-[#00ff66]/20 text-[#a3d9b5]'
              }`}
            >
              {force >= TRIGGER_FORCE
                ? '🎯 ZONA DE ENTRADA — SINAL LIBERADO (≥ 92%)'
                : force >= 80
                ? `⚡ CARREGANDO... ${force}% — AGUARDAR 92%`
                : `ZONA NEUTRA — ${force}% (AGUARDAR 92%)`}
            </div>
          </div>

          {/* 5. Mini-Velas 1M */}
          <div className="border-b border-[#00ff66]/30 px-3 py-2 bg-[#021b0d]/70">
            <div className="flex justify-between items-center text-[8px] text-[#00ff66] mb-1.5 uppercase tracking-wider font-bold">
              <span>Velas 1M (Últimas 20)</span>
              <span className="text-[#7a9587]">{miniCandles.length} analisadas</span>
            </div>
            <div className="flex items-end gap-1 h-6">
              {miniCandles.map((c, i) => {
                const isGreen = c.close >= c.open;
                const heightRatio = Math.max(3, Math.round(((c.high - c.low) / candleRange) * 22));
                return (
                  <div
                    key={i}
                    title={`O:${c.open} C:${c.close}`}
                    style={{ height: `${heightRatio}px` }}
                    className={`flex-1 rounded-[1px] ${
                      isGreen ? 'bg-[#00ff66] shadow-[0_0_4px_rgba(0,255,102,0.4)]' : 'bg-[#ff4444]'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* 5.1 LEITURA DE VELA 2M — MÉTODO SKYTEX (DUAL TIMEFRAME 2M -> 1M) */}
          <div className="border-b border-[#00ff66]/30 p-2.5 bg-[#031d0e]/85 space-y-2">
            <div className="flex items-center justify-between text-[9px]">
              <span className="text-[#00ff66] font-bold uppercase tracking-wider flex items-center gap-1">
                <Flame className="h-3 w-3 text-amber-400" />
                <span>LEITURA VELA 2M (SKYTEX)</span>
              </span>
              <span className="text-[8px] bg-black/60 px-1.5 py-0.5 rounded border border-[#00ff66]/30 text-[#a3d9b5]">
                2 Velas 1M = 1 Vela 2M
              </span>
            </div>

            {/* Card de Análise de Corpo vs Pavio */}
            <div className="flex items-center gap-2.5 bg-black/70 rounded-xl p-2 border border-white/10">
              {/* Mini Ilustração Candlestick 2M */}
              <div className="relative w-9 h-[70px] flex flex-col items-center justify-center shrink-0 bg-[#02140a] rounded-lg border border-[#00ff66]/30 p-0.5">
                {/* Pavio Superior */}
                <div 
                  className="w-0.5 bg-amber-400/90 transition-all duration-300"
                  style={{ height: `${Math.max(3, Math.min(18, (candle2M.upperWickPct / 100) * 30))}px` }}
                  title={`Pavio Superior: ${candle2M.upperWickPct}%`}
                />
                {/* Corpo da Vela 2M */}
                <div 
                  className={`w-5 rounded-[1px] transition-all duration-300 flex items-center justify-center text-[7px] font-black ${
                    candle2M.trend2M === 'BULLISH'
                      ? 'bg-[#00ff66] text-black shadow-[0_0_8px_rgba(0,255,102,0.8)]'
                      : 'bg-[#ff4444] text-white shadow-[0_0_8px_rgba(255,68,68,0.8)]'
                  }`}
                  style={{ height: `${Math.max(10, Math.min(36, (candle2M.bodyPct / 100) * 38))}px` }}
                  title={`Corpo 2M: ${candle2M.bodyPct}%`}
                >
                  {candle2M.bodyPct}%
                </div>
                {/* Pavio Inferior */}
                <div 
                  className="w-0.5 bg-amber-400/90 transition-all duration-300"
                  style={{ height: `${Math.max(3, Math.min(18, (candle2M.lowerWickPct / 100) * 30))}px` }}
                  title={`Pavio Inferior: ${candle2M.lowerWickPct}%`}
                />
              </div>

              {/* Métricas e Psicologia da Vela 2M */}
              <div className="flex-1 text-[8.5px] space-y-1">
                <div className="flex items-center justify-between text-[7.5px] text-[#7a9587]">
                  <span>Pavio Topo: <strong className="text-white">{candle2M.upperWickPct}%</strong></span>
                  <span>Pavio Fundo: <strong className="text-white">{candle2M.lowerWickPct}%</strong></span>
                </div>

                <div className={`p-1 rounded font-black text-[7.5px] leading-snug border ${
                  candle2M.pattern === 'LOWER_REJECTION_HAMMER'
                    ? 'bg-[#00ff66]/20 border-[#00ff66] text-[#00ff66]'
                    : candle2M.pattern === 'UPPER_REJECTION_STAR'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                    : candle2M.pattern === 'STRONG_BULL_BODY'
                    ? 'bg-[#00ff66]/15 border-[#00ff66]/50 text-[#00ff66]'
                    : candle2M.pattern === 'STRONG_BEAR_BODY'
                    ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                    : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                }`}>
                  {candle2M.description}
                </div>

                {/* Status de Confluência: Touros/Ursos + Skytex */}
                <div className="flex items-center justify-between text-[7.5px] pt-0.5 text-[#a3d9b5]">
                  <span className="flex items-center gap-0.5 text-[#00ff66]">
                    <Check className="h-2.5 w-2.5" /> Touros/Ursos (≥92%)
                  </span>
                  <span className="flex items-center gap-0.5 text-[#00ff66]">
                    <Check className="h-2.5 w-2.5" /> Skytex 2M Pavio
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 6. CONTROLES RÁPIDOS: ENTRADA AUTOMÁTICA & AUTO SCANNER MULTI-ATIVOS */}
          <div className="border-b border-[#00ff66]/30 p-2.5 bg-[#02140a]/90 space-y-2">
            {/* Linha de Automação Total */}
            <div className="flex items-center justify-between bg-black/60 rounded-lg p-2 border border-white/10">
              <div className="flex items-center gap-1.5">
                <Bot className={`h-4 w-4 ${autoTradeEnabled ? 'text-[#00ff66] animate-pulse' : 'text-zinc-400'}`} />
                <div>
                  <div className="text-[10px] font-black text-white">ENTRADAS AUTOMÁTICAS</div>
                  <div className="text-[8px] text-[#7a9587]">Entra sozinho na corretora</div>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleAutoTrade?.(!autoTradeEnabled);
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-black transition ${
                  autoTradeEnabled
                    ? 'bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {autoTradeEnabled ? 'LIGADO' : 'DESLIGADO'}
              </button>
            </div>

            {/* Linha do Auto Scanner Multi-Ativo */}
            <div className="flex items-center justify-between bg-black/60 rounded-lg p-2 border border-white/10">
              <div className="flex items-center gap-1.5">
                <Radar className={`h-4 w-4 ${autoScannerEnabled ? 'text-[#00ff66] animate-spin' : 'text-zinc-400'}`} />
                <div>
                  <div className="text-[10px] font-black text-white">AUTO SCANNER OTC</div>
                  <div className="text-[8px] text-[#7a9587]">Varre todos os ativos (≥ 92%)</div>
                </div>
              </div>
              <button
                onClick={() => {
                  sound.playClick();
                  onToggleAutoScanner?.(!autoScannerEnabled);
                }}
                className={`px-2.5 py-1 rounded text-[9px] font-black transition ${
                  autoScannerEnabled
                    ? 'bg-[#00ff66] text-black shadow-[0_0_12px_rgba(0,255,102,0.4)]'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                {autoScannerEnabled ? 'ATIVO' : 'PARADO'}
              </button>
            </div>
          </div>

          {/* 7. SINAL GERADO AUTOMATICAMENTE OU ÁREA DE MONITORAMENTO */}
          {signal ? (
            <div className="p-3 space-y-2 bg-gradient-to-b from-[#063319]/95 to-[#021f0e]/95 rounded-b-2xl border-t border-[#00ff66]/40 shadow-[inset_0_1px_0_rgba(0,255,102,0.3)]">
              <div className="text-[9px] text-[#00ff66] text-center font-extrabold tracking-wider drop-shadow-[0_0_6px_rgba(0,255,102,0.4)]">
                ⚡ SINAL DISPARADO VECTOR-OTC (≥ 92%)
              </div>

              {/* Big Direction Callout */}
              <div
                className={`flex items-center justify-between p-2.5 rounded-xl border-2 ${
                  isSignalCall
                    ? 'border-[#00ff66] bg-[#00ff66]/20 text-[#00ff66] shadow-[0_0_25px_rgba(0,255,102,0.35)]'
                    : 'border-[#ff4444] bg-[#ff4444]/20 text-[#ff4444] shadow-[0_0_25px_rgba(255,68,68,0.35)]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg font-black ${
                      isSignalCall ? 'bg-[#00ff66] text-black shadow-[0_0_10px_rgba(0,255,102,0.8)]' : 'bg-[#ff4444] text-white shadow-[0_0_10px_rgba(255,68,68,0.8)]'
                    }`}
                  >
                    {isSignalCall ? (
                      <ArrowUpRight className="h-5 w-5 stroke-[3]" />
                    ) : (
                      <ArrowDownRight className="h-5 w-5 stroke-[3]" />
                    )}
                  </div>
                  <div>
                    <div className="text-lg font-black tracking-tight leading-none">
                      {isSignalCall ? '▲ CALL' : '▼ PUT'}
                    </div>
                    <div className="text-[8.5px] font-bold text-white/95 mt-0.5">
                      Expiração {signal.timeframe} • Abertura da Vela
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[8px] text-[#a3d9b5] font-bold">FORÇA</div>
                  <div className="text-lg font-black text-white drop-shadow-[0_0_6px_rgba(0,255,102,0.5)]">{signal.confidence}%</div>
                </div>
              </div>

              {/* Detalhes do Sinal Quotex Radar com Indicadores da Corretora */}
              <div className="rounded-lg bg-[#032412]/90 border border-[#00ff66]/30 p-2 text-[9px] text-[#a3d9b5] space-y-0.5">
                <div>
                  ◆ Corretora: <strong className="text-white">{signal.brokerName || BROKER_NAMES[selectedBroker]}</strong>
                </div>
                <div>
                  ◆ Ativo: <strong className="text-white">{signal.assetName}</strong> ({signal.entryTime})
                </div>
                {signal.brokerIndicatorsConfluence && signal.brokerIndicatorsConfluence.length > 0 ? (
                  <div className="pt-1 space-y-0.5">
                    <div className="text-[8px] font-black text-[#00ff66] uppercase">Indicadores da Corretora Confirmando:</div>
                    {signal.brokerIndicatorsConfluence.slice(1, 5).map((conf, idx) => (
                      <div key={idx} className="text-[7.5px] text-zinc-300 leading-tight">
                        {conf}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    ◆ Touros: <strong className="text-[#00ff66]">{signal.bullPct || bullPct}%</strong> &nbsp;|&nbsp;
                    Ursos: <strong className="text-[#ff4444]">{signal.bearPct || bearPct}%</strong>
                  </div>
                )}
                {autoTradeEnabled && (
                  <div className="text-[#00ff66] font-bold flex items-center gap-1 pt-0.5">
                    <ShieldCheck className="h-3 w-3" />
                    <span>Robô executou automaticamente na corretora!</span>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <button
                  id="rp-copy-btn"
                  onClick={handleCopySignal}
                  className="flex items-center justify-center gap-1 rounded-lg border border-[#00ff66]/50 bg-[#053319] py-1.5 text-[9px] font-bold text-[#00ff66] hover:bg-[#00ff66]/25 transition"
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-[#00ff66]" />
                      <span className="text-[#00ff66] font-extrabold">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-[#00ff66]" />
                      <span>Copiar Sinal</span>
                    </>
                  )}
                </button>

                <button
                  id="rp-execute-btn"
                  onClick={() => {
                    sound.playClick();
                    onExecuteTrade(signal.direction);
                  }}
                  className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[9px] font-black uppercase transition shadow-lg ${
                    isSignalCall
                      ? 'bg-[#00ff66] text-black hover:bg-[#00ff88] shadow-[0_0_15px_rgba(0,255,102,0.4)]'
                      : 'bg-[#ff4444] text-white hover:bg-[#ff5555] shadow-[0_0_15px_rgba(255,68,68,0.4)]'
                  }`}
                >
                  <Zap className="h-3 w-3 fill-current" />
                  <span>Manual {signal.direction}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 text-center space-y-1.5 bg-[#032412]/80 rounded-b-2xl border-t border-[#00ff66]/25">
              <div className="flex items-center justify-center gap-1.5 text-[9px] text-[#00ff66] font-black tracking-wider">
                <Crosshair className="h-3.5 w-3.5 text-[#00ff66] animate-spin" />
                <span>RADAR VECTOR-OTC MONITORANDO</span>
              </div>
              <p className="text-[8px] text-[#a3d9b5]">
                Aguardando Gatilho Vector: Força ≥ 92% com confluência de Vela 2M Skytex.
              </p>
              <div className="flex items-center justify-center gap-1 text-[8px] text-zinc-400 pt-0.5">
                <ShieldCheck className="h-3 w-3 text-[#00ff66]" />
                <span>Analisador e disparos disponíveis no topo do painel</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
