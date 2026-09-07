import React, { useState } from 'react';
import { 
  X, 
  Check, 
  RefreshCw, 
  Layers, 
  Activity, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sliders, 
  CheckCircle2, 
  Info,
  Laptop,
  Flame,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SupportedBroker, BrokerChartScanResult } from '../types';
import { BROKER_NAMES } from '../utils/marketData';
import { sound } from '../utils/audio';

interface BrokerIndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBroker: SupportedBroker;
  onSelectBroker: (broker: SupportedBroker) => void;
  scanResult: BrokerChartScanResult;
  indicatorConfig: Record<string, boolean>;
  onToggleIndicator: (id: string) => void;
  onResync: () => void;
}

const BROKER_OPTIONS: { id: SupportedBroker; name: string; badge: string; color: string }[] = [
  { id: 'QUOTEX', name: 'Quotex Platform', badge: 'Popular OTC', color: 'from-blue-500/20 to-emerald-500/20' },
  { id: 'OPTGO', name: 'OptGo Traderoom', badge: 'API VIP', color: 'from-emerald-500/20 to-teal-500/20' },
  { id: 'POCKET_OPTION', name: 'Pocket Option', badge: 'Fast OTC', color: 'from-cyan-500/20 to-blue-500/20' },
  { id: 'IQ_OPTION', name: 'IQ Option Global', badge: 'Forex / Opções', color: 'from-amber-500/20 to-orange-500/20' },
  { id: 'EXNOVA', name: 'Exnova Broker', badge: 'Alta Liquidez', color: 'from-purple-500/20 to-pink-500/20' },
  { id: 'BINOMO', name: 'Binomo Trading', badge: 'Plataforma Web', color: 'from-yellow-500/20 to-amber-500/20' },
];

export const BrokerIndicatorsModal: React.FC<BrokerIndicatorsModalProps> = ({
  isOpen,
  onClose,
  selectedBroker,
  onSelectBroker,
  scanResult,
  indicatorConfig,
  onToggleIndicator,
  onResync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);

  if (!isOpen) return null;

  const handleSyncNow = () => {
    sound.playRadarPing();
    setIsSyncing(true);
    onResync();
    setTimeout(() => {
      setIsSyncing(false);
      sound.playClick();
    }, 900);
  };

  const activeCount = scanResult.activeIndicatorsCount;
  const isCall = scanResult.matchingDirection === 'CALL';
  const isPut = scanResult.matchingDirection === 'PUT';

  return (
    <div 
      id="broker-indicators-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in"
    >
      <div 
        id="broker-indicators-modal-content"
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border-2 border-[#00ff66]/50 bg-[#021309] text-white shadow-[0_0_50px_rgba(0,255,102,0.25)] overflow-hidden font-mono"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#00ff66]/30 bg-gradient-to-r from-[#06331a] via-[#032010] to-[#06331a] px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#00ff66]/20 border border-[#00ff66]/50 shadow-[0_0_12px_rgba(0,255,102,0.3)]">
              <Layers className="h-5 w-5 text-[#00ff66]" />
            </div>
            <div>
              <h2 className="font-display text-base font-black tracking-wide text-white flex items-center gap-2">
                INDICADORES DO GRÁFICO DA CORRETORA
              </h2>
              <p className="text-[10px] text-[#a3d9b5]">
                O Robô lê e gera sinais EXCLUSIVAMENTE baseado no gráfico e indicadores da sua corretora
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-white/10 hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Banner de Sincronização e Status */}
          <div className="rounded-xl border border-[#00ff66]/40 bg-gradient-to-r from-[#00ff66]/15 via-[#032b16] to-[#00ff66]/15 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_20px_rgba(0,255,102,0.1)]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00ff66] opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00ff66]" />
              </span>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>CORRETORA: <strong className="text-[#00ff66]">{BROKER_NAMES[selectedBroker]}</strong></span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#00ff66]/20 text-[#00ff66] border border-[#00ff66]/40">
                    SINCRONIZADO
                  </span>
                </div>
                <div className="text-[10px] text-[#a3d9b5]">
                  Leitura ao vivo das velas e confluência técnica de {activeCount} indicadores ativos
                </div>
              </div>
            </div>

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg border border-[#00ff66]/70 bg-[#00ff66]/25 hover:bg-[#00ff66]/40 text-[#00ff66] text-xs font-black flex items-center gap-1.5 transition active:scale-95 cursor-pointer self-stretch sm:self-auto justify-center"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Escaneando Tela...' : 'Sincronizar Agora'}</span>
            </button>
          </div>

          {/* 1. Escolha da Corretora do Usuário */}
          <div>
            <div className="text-xs font-black text-[#00ff66] mb-2 flex items-center gap-1.5">
              <Laptop className="h-3.5 w-3.5" />
              <span>1. QUAL É A SUA CORRETORA?</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {BROKER_OPTIONS.map((broker) => {
                const isSelected = selectedBroker === broker.id;
                return (
                  <button
                    key={broker.id}
                    onClick={() => {
                      sound.playClick();
                      onSelectBroker(broker.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#00ff66] bg-[#00ff66]/20 shadow-[0_0_15px_rgba(0,255,102,0.25)]'
                        : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-black ${isSelected ? 'text-[#00ff66]' : 'text-white'}`}>
                        {broker.name}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-[#00ff66]" />}
                    </div>
                    <span className="text-[9px] text-[#7a9587]">
                      {broker.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Seleção e Leitura dos Indicadores da Corretora */}
          <div>
            <div className="text-xs font-black text-[#00ff66] mb-2 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5" />
                <span>2. QUAIS INDICADORES VOCÊ TEM NA TELA DA CORRETORA?</span>
              </div>
              <span className="text-[10px] text-[#a3d9b5]">
                {activeCount} de {scanResult.indicators.length} Ativos
              </span>
            </div>

            <div className="space-y-2">
              {scanResult.indicators.map((ind) => {
                const isEnabled = indicatorConfig[ind.id] ?? ind.enabled;
                const readingDir = ind.reading.direction;
                const isIndCall = readingDir === 'CALL';
                const isIndPut = readingDir === 'PUT';

                return (
                  <div
                    key={ind.id}
                    className={`p-3 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                      isEnabled
                        ? 'border-[#00ff66]/40 bg-gradient-to-r from-[#032412] to-[#02180c]'
                        : 'border-white/5 bg-black/40 opacity-60'
                    }`}
                  >
                    {/* Indicador Info & Checkbox */}
                    <div className="flex items-start sm:items-center gap-3">
                      <input
                        type="checkbox"
                        id={`ind-check-${ind.id}`}
                        checked={isEnabled}
                        onChange={() => {
                          sound.playClick();
                          onToggleIndicator(ind.id);
                        }}
                        className="mt-1 sm:mt-0 h-4 w-4 rounded accent-[#00ff66] cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white">{ind.name}</span>
                          <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-zinc-300">
                            {ind.paramDescription}
                          </span>
                        </div>
                        <div className="text-[10px] text-[#a3d9b5] mt-0.5">
                          {ind.reading.description}
                        </div>
                      </div>
                    </div>

                    {/* Voto e Leitura Técnica em Tempo Real */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[10px] font-mono text-zinc-400 hidden md:inline">
                        {ind.reading.valueStr}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-lg text-[9px] font-black tracking-wider flex items-center gap-1 ${
                          isIndCall
                            ? 'bg-[#00ff66]/25 border border-[#00ff66] text-[#00ff66] shadow-[0_0_8px_rgba(0,255,102,0.3)]'
                            : isIndPut
                            ? 'bg-rose-500/25 border border-rose-500 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.3)]'
                            : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                        }`}
                      >
                        {isIndCall ? (
                          <>
                            <ArrowUpRight className="h-3 w-3" />
                            <span>COMPRA</span>
                          </>
                        ) : isIndPut ? (
                          <>
                            <ArrowDownRight className="h-3 w-3" />
                            <span>VENDA</span>
                          </>
                        ) : (
                          <span>NEUTRO</span>
                        )}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Confluência do Gráfico da Corretora */}
          <div className="p-3.5 rounded-xl border border-[#00ff66]/50 bg-gradient-to-b from-[#042e18] to-[#021d0f] space-y-2">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="text-white flex items-center gap-1.5">
                <Flame className="h-4 w-4 text-amber-400" />
                <span>CONFLUÊNCIA DO GRÁFICO DA CORRETORA:</span>
              </span>
              <span className="text-base font-black text-[#00ff66]">
                {scanResult.confluencePercent}% ({activeCount} Indicadores)
              </span>
            </div>

            {/* Barra de Progresso da Confluência */}
            <div className="w-full h-3 rounded-full bg-black/60 overflow-hidden border border-[#00ff66]/30">
              <div 
                className={`h-full transition-all duration-500 ${
                  isCall
                    ? 'bg-gradient-to-r from-emerald-500 to-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.6)]'
                    : isPut
                    ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                    : 'bg-zinc-600'
                }`}
                style={{ width: `${scanResult.confluencePercent}%` }}
              />
            </div>

            <p className="text-[10px] text-[#a3d9b5] leading-relaxed">
              {scanResult.summary}
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#00ff66]/30 bg-[#021309] px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[10px] text-[#7a9587]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#00ff66]" />
            <span>Filtro de Confluência 100% Ativo</span>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#00ff66] text-black font-black text-xs transition hover:brightness-110 shadow-[0_0_15px_rgba(0,255,102,0.4)] active:scale-95 cursor-pointer"
          >
            Confirmar Indicadores
          </button>
        </div>
      </div>
    </div>
  );
};
