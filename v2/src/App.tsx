import { useEffect, useState } from "react";
import { getSocket } from "./lib/socket";
import { Home } from "./components/Home";
import { Lobby } from "./components/Lobby";
import { Selecting } from "./components/Selecting";
import { Ranking } from "./components/Ranking";
import { Results } from "./components/Results";

import { Copy, Check, LogOut } from "lucide-react";

export type GameState = 'LOBBY' | 'SELECTING' | 'RANKING' | 'RESULTS';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  score: number;
  isHost: boolean;
  connected: boolean;
}

export interface Room {
  code: string;
  state: GameState;
  players: Player[];
  chooser: Player | null;
  chooserIndex: number;
  roundTopic: { category: string, subcategory: string, topic: string } | null;
  roundPrompt: string | null;
  selectedItems: string[];
  playerRankings: Record<string, string[]>;
  submissions: Record<string, boolean>;
}

export default function App() {
  const [room, setRoom] = useState<Room | null>(null);
  const [playerId, setPlayerId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [copied, setCopied] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(true);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    let pid = localStorage.getItem("playerId");
    if (!pid) {
      pid = Math.random().toString(36).substring(2, 9);
      localStorage.setItem("playerId", pid);
    }
    setPlayerId(pid);

    let pname = localStorage.getItem("playerName") || "";
    setPlayerName(pname);

    const socket = getSocket();
    
    socket.on("room_update", (updatedRoom: Room) => {
      setRoom(updatedRoom);
      if (updatedRoom) {
        localStorage.setItem("roomCode", updatedRoom.code);
      }
    });

    const storedRoomCode = localStorage.getItem("roomCode");
    if (storedRoomCode && pid) {
      socket.emit("JOIN_GAME", { roomCode: storedRoomCode, name: pname, playerId: pid }, (res: any) => {
        if (res.success) {
          setRoom(res.room);
          localStorage.setItem("roomCode", res.room.code);
        } else {
          localStorage.removeItem("roomCode");
        }
        setIsReconnecting(false);
      });
    } else {
      setIsReconnecting(false);
    }

    return () => {
      socket.off("room_update");
    };
  }, []);

  const updateName = (name: string) => {
    setPlayerName(name);
    localStorage.setItem("playerName", name);
  };

  const confirmLeaveGame = () => {
    if (room) {
      getSocket().emit("LEAVE_GAME", { roomCode: room.code, playerId });
    }
    setRoom(null);
    localStorage.removeItem("roomCode");
    setShowLeaveConfirm(false);
  };

  if (isReconnecting) {
    return <div className="h-[100dvh] bg-background flex items-center justify-center font-bold">Resuming session...</div>;
  }

  if (!room) {
    return (
      <Home 
        setRoom={setRoom} 
        playerId={playerId} 
        playerName={playerName} 
        setPlayerName={updateName} 
      />
    );
  }

  const getRankString = (rank: number) => {
    if (rank === 1) return '1st';
    if (rank === 2) return '2nd';
    if (rank === 3) return '3rd';
    return `${rank}th`;
  };

  const sortedPlayers = [...room.players].sort((a,b) => b.score - a.score);
  const myRank = sortedPlayers.findIndex(p => p.id === playerId) + 1;
  const myRankStr = myRank > 0 ? getRankString(myRank) : '';
  const me = room.players.find(p => p.id === playerId);

  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="h-[100dvh] flex flex-col sm:max-w-xl sm:mx-auto w-full relative sm:border-x sm:border-white/10 sm:shadow-2xl overflow-hidden bg-background">
      <header className="shrink-0 flex items-center p-3 sm:p-4 border-b border-white/10 bg-background z-10 w-full h-14 sm:h-16">
        <div className="flex items-center w-full justify-between gap-2">
          <div className="flex-1 flex justify-start min-w-0">
            <button 
              onClick={handleCopyCode}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95 shrink-0"
              title="Copy room code"
            >
              <span className="text-xs sm:text-sm font-mono font-bold text-blue-400 truncate">Code: {room.code}</span>
              {copied ? <Check size={14} className="text-green-400 shrink-0" /> : <Copy size={14} className="text-blue-400/70 shrink-0" />}
            </button>
          </div>

          <div className="flex justify-center font-black tracking-tighter opacity-80 text-lg uppercase whitespace-nowrap shrink-0">
            [LOGO]
          </div>

          <div className="flex-1 flex justify-end items-center gap-2 min-w-0">
            {room.state !== 'LOBBY' && me && (
               <div className="bg-white/10 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold flex items-center gap-1.5 min-w-0 max-w-full">
                 <span className="truncate">{me.name}</span>
                 {myRank > 0 && (
                   <span className="opacity-80 bg-black/30 px-1.5 py-0.5 rounded font-bold text-blue-300 whitespace-nowrap shrink-0">
                     {myRankStr}
                   </span>
                 )}
               </div>
            )}
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="p-1.5 sm:p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors shrink-0"
              title="Leave Game"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 min-h-0 w-full relative flex flex-col">
        {room.state === 'LOBBY' && <Lobby room={room} playerId={playerId} />}
        {room.state === 'SELECTING' && <Selecting room={room} playerId={playerId} />}
        {room.state === 'RANKING' && <Ranking room={room} playerId={playerId} />}
        {room.state === 'RESULTS' && <Results room={room} playerId={playerId} />}
      </main>

      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bento-card bg-background max-w-sm w-full p-6 space-y-6 animate-in fade-in zoom-in duration-200 shadow-2xl">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-extrabold tracking-tighter uppercase text-white">Leave Game?</h3>
              <p className="opacity-60 font-semibold text-sm">Are you sure you want to leave? You'll be disconnected from the room.</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button 
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-colors text-white border border-white/10"
              >
                Cancel
              </button>
              <button 
                onClick={confirmLeaveGame}
                className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 rounded-xl font-bold transition-colors text-white shadow-lg shadow-red-500/20"
              >
                Leave
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
