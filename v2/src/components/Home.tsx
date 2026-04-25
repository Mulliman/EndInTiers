import { useState } from "react";
import { getSocket } from "../lib/socket";
import { Room } from "../App";

interface HomeProps {
  setRoom: (room: Room) => void;
  playerId: string;
  playerName: string;
  setPlayerName: (name: string) => void;
}

export function Home({ setRoom, playerId, playerName, setPlayerName }: HomeProps) {
  const [createName, setCreateName] = useState(playerName);
  const [joinName, setJoinName] = useState(playerName);
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreate = () => {
    if (!createName.trim()) {
      setError("Please enter your name to create a game!");
      return;
    }
    setPlayerName(createName.trim());
    setLoading(true);
    getSocket().emit("CREATE_GAME", { name: createName.trim(), playerId }, (res: any) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
      } else {
        setError(res.error || "Failed to create game");
      }
    });
  };

  const handleJoin = () => {
    if (!joinName.trim()) {
      setError("Please enter your name to join!");
      return;
    }
    if (!joinCode.trim() || joinCode.length !== 4) {
      setError("Please enter a valid 4-character room code!");
      return;
    }
    setPlayerName(joinName.trim());
    setLoading(true);
    getSocket().emit("JOIN_GAME", { roomCode: joinCode.toUpperCase(), name: joinName.trim(), playerId }, (res: any) => {
      setLoading(false);
      if (res.success) {
        setRoom(res.room);
      } else {
        setError(res.error || "Failed to join game");
      }
    });
  };

  return (
    <div className="h-[100dvh] flex flex-col p-4 sm:p-8 max-w-xl mx-auto w-full sm:border-x sm:border-white/10 overflow-y-auto hide-scrollbar bg-background text-white selection:bg-blue-500/30">
      <div className="flex-1 flex flex-col justify-center pb-8 pt-4">
        <div className="text-center mb-8">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tighter uppercase mb-2 leading-none">
            IT ALL ENDS IN <span className="text-red-500">TIERS</span>
          </h1>
          <p className="text-base sm:text-xl opacity-50 font-semibold px-4">Rank things. Reveal personalities. Ruin friendships.</p>
        </div>
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm text-center font-medium w-full">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-6 w-full">
          {/* Create Card */}
          <div className="bento-card flex flex-col justify-between h-auto bg-gradient-to-br from-[#16161E] to-[#1E1E2A] p-5 sm:p-6">
            <div>
              <span className="label-caps mb-2 text-xs">Host a Session</span>
              <h2 className="text-2xl font-bold mb-4">Create New Game</h2>
              <div className="space-y-4">
                <div>
                  <span className="label-caps text-[10px]">Your Name</span>
                  <input 
                    type="text" 
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Alice"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleCreate}
              disabled={loading}
              className="mt-6 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] text-base shadow-lg shadow-blue-500/20"
            >
              Create Private Room
            </button>
          </div>

          <div className="flex items-center text-center opacity-40 font-bold uppercase tracking-widest text-xs">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-4">OR</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Join Card */}
          <div className="bento-card flex flex-col justify-between h-auto p-5 sm:p-6">
            <div>
              <span className="label-caps mb-2 text-xs">Entry Portal</span>
              <h2 className="text-2xl font-bold mb-4">Join Game</h2>
              <div className="space-y-4">
                <div>
                  <span className="label-caps text-[10px]">Your Name</span>
                  <input 
                    type="text" 
                    value={joinName}
                    onChange={(e) => setJoinName(e.target.value)}
                    placeholder="e.g. Bob"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors"
                    maxLength={15}
                  />
                </div>
                <div>
                  <span className="label-caps text-[10px]">Room Code</span>
                  <input 
                    type="text" 
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="X9B2"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-400 transition-colors font-mono text-lg tracking-widest text-center uppercase"
                    maxLength={4}
                  />
                </div>
              </div>
            </div>
            <button 
              onClick={handleJoin}
              disabled={loading}
              className="mt-6 bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition-all border border-white/10 active:scale-[0.98] text-base"
            >
              Enter Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
