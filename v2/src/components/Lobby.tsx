import { Room } from "../App";
import { getSocket } from "../lib/socket";
import { Users, Crown, WifiOff, Copy, Check } from "lucide-react";
import { useState } from "react";

interface Props { room: Room; playerId: string; }

export function Lobby({ room, playerId }: Props) {
  const isHost = room.players.find(p => p.id === playerId)?.isHost;
  const [copied, setCopied] = useState(false);
  
  const handleStart = () => {
    getSocket().emit("START_GAME", { roomCode: room.code, playerId });
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter">WAITING FOR PLAYERS</h2>
          <div className="flex items-center justify-center gap-2">
            <p className="opacity-50 uppercase tracking-widest font-semibold text-[10px] sm:text-sm">Share the room code: </p>
            <button 
              onClick={handleCopyCode}
              className="group flex items-center gap-1.5 hover:bg-white/10 px-2 py-1 rounded-lg transition-colors cursor-pointer active:scale-95"
            >
              <strong className="text-white text-base sm:text-xl tracking-wider">{room.code}</strong>
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} className="text-blue-400/50 group-hover:text-blue-400 transition-colors" />}
            </button>
          </div>
        </div>
        
        <div className="bento-card p-4 sm:p-6 mb-4">
          <div className="flex justify-between items-center mb-6">
            <span className="label-caps flex items-center gap-2 mb-0">
              <Users size={16} /> Players
            </span>
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-sm font-mono">{room.players.length}/8</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {room.players.map((p, i) => (
              <div key={p.id} className={`bg-white/5 border ${p.id === playerId ? 'border-blue-500/50' : 'border-white/10'} py-3 px-4 sm:py-4 sm:px-4 rounded-xl flex items-center gap-3 relative`}>
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm sm:text-lg opacity-80 shrink-0">
                  {i + 1}
                </div>
                <div className="truncate font-semibold text-sm sm:text-lg flex-1">
                  {p.name} {p.id === playerId && <span className="text-blue-400 ml-1 text-xs sm:text-sm font-medium">(You)</span>}
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {!p.connected && <WifiOff size={14} className="text-red-500" title="Disconnected" />}
                  {p.isHost && <Crown size={14} className="text-yellow-400 opacity-80" title="Host" />}
                </div>
              </div>
            ))}
            {Array.from({ length: Math.max(0, 8 - room.players.length) }).map((_, i) => (
              <div key={`empty-${i}`} className="bg-white/[0.02] border border-white/5 border-dashed py-3 px-4 sm:py-4 sm:px-4 rounded-xl flex items-center gap-3">
                 <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-dashed border-white/20 flex items-center justify-center shrink-0"></div>
                 <div className="opacity-30 uppercase text-[10px] sm:text-xs font-bold tracking-widest">Waiting...</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-white/10 bg-background z-10">
        {isHost ? (
          <button 
            onClick={handleStart}
            disabled={room.players.length < 2}
            className="w-full bg-blue-500 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 shadow-xl shadow-blue-500/20 active:scale-[0.98]"
          >
            {room.players.length < 2 ? "Waiting for players..." : "Start Game"}
          </button>
        ) : (
          <div className="text-center p-4 sm:p-5 border border-white/10 rounded-2xl opacity-60 font-semibold flex flex-col items-center gap-3 bg-white/5">
            <span className="text-sm">Waiting for host to start...</span>
            <span className="flex gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "0ms"}}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "150ms"}}></span>
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{animationDelay: "300ms"}}></span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
