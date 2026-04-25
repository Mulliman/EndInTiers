import { useState } from "react";
import { Room, Player } from "../App";
import { getSocket } from "../lib/socket";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, XCircle } from "lucide-react";

interface Props { room: Room; playerId: string; }

const TIERS = [
  { label: 'S', colorClass: 'bg-s-tier', textClass: 'text-s-tier' },
  { label: 'A', colorClass: 'bg-a-tier', textClass: 'text-a-tier' },
  { label: 'B', colorClass: 'bg-b-tier', textClass: 'text-b-tier' },
  { label: 'C', colorClass: 'bg-c-tier', textClass: 'text-c-tier' },
  { label: 'D', colorClass: 'bg-d-tier', textClass: 'text-d-tier' },
];

export function Results({ room, playerId }: Props) {
  const [[activeTab, direction], setPage] = useState([0, 0]); // 0: Summary, 1: Scores, 2: Leaderboard
  const chooser = room.chooser;
  if (!chooser) return null;

  const chooserRanking = room.playerRankings[chooser.id] || [];
  const myRanking = room.playerRankings[playerId] || [];

  const handleNext = () => {
    getSocket().emit("START_NEXT_ROUND", { roomCode: room.code });
  };

  const paginate = (newDirection: number, newTab: number) => {
    setPage([newTab, newDirection]);
  };

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = Math.abs(offset.x) * velocity.x;

    if (swipe < -10000 || offset.x < -100) {
      if (activeTab < 2) paginate(1, activeTab + 1);
    } else if (swipe > 10000 || offset.x > 100) {
      if (activeTab > 0) paginate(-1, activeTab - 1);
    }
  };

  // Sort players by score descending
  const sortedPlayers = [...room.players].sort((a, b) => b.score - a.score);
  
  // Calculate round scores
  const roundScores: Record<string, { distance: number, diffs: any[], score: number }> = {};
  room.players.forEach(p => {
    if (p.id !== chooser.id) {
      const playerRanking = room.playerRankings[p.id] || [];
      let totalDistance = 0;
      let diffs: any[] = [];
      chooserRanking.forEach((cItem, cIdx) => {
        const pIdx = playerRanking.indexOf(cItem);
        const distance = Math.abs(cIdx - pIdx);
        totalDistance += distance;
        diffs.push({ item: cItem, distance });
      });
      roundScores[p.id] = {
        distance: totalDistance,
        diffs,
        score: Math.max(0, 100 - (totalDistance * 10))
      };
    }
  });

  const topScorer = Object.entries(roundScores).sort(([, a], [, b]) => b.score - a.score)[0];
  const topScorerPlayer = topScorer ? room.players.find(p => p.id === topScorer[0]) : null;

  const tabs = ["Summary", "Scores", "Leaderboard"];

  const variants = {
    enter: (direction: number) => {
      return {
        x: direction > 0 ? 1000 : -1000,
        opacity: 0
      };
    },
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => {
      return {
        zIndex: 0,
        x: direction < 0 ? 1000 : -1000,
        opacity: 0
      };
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden">
      
      {/* Header Tabs */}
      <div className="shrink-0 p-4 border-b border-white/10 bg-background/50 backdrop-blur-sm z-20">
        <div className="flex bg-white/5 rounded-xl p-1 gap-1 relative overflow-hidden">
          {tabs.map((tab, idx) => (
            <button
              key={tab}
              onClick={() => paginate(idx > activeTab ? 1 : -1, idx)}
              className={`flex-1 py-3 text-xs sm:text-sm font-bold rounded-lg transition-all z-10 ${
                activeTab === idx 
                  ? 'text-white' 
                  : 'text-white/50 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
          {/* Active Tab Indicator Background */}
          <div 
             className="absolute top-1 bottom-1 bg-blue-500 rounded-lg transition-all duration-300 pointer-events-none"
             style={{
               width: `calc(33.333% - 5px)`,
               left: `calc(${activeTab * 33.333}% + 4px)`
             }}
          />
        </div>
      </div>

      {/* Main Content Area (Slider) */}
      <div className="flex-1 relative w-full overflow-hidden bg-background">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={activeTab}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: "spring", stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 }
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={1}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden p-4 sm:p-6 cursor-grab active:cursor-grabbing"
          >
            <div className="w-full flex flex-col max-w-2xl mx-auto pointer-events-auto pb-8">
              {/* TAB 0: SUMMARY */}
              {activeTab === 0 && (
                <div className="flex flex-col gap-4">
                  <div className="text-center mb-2">
                    <span className="label-caps block">The Reveal</span>
                    <h2 className="text-2xl font-bold">{chooser.name}&apos;s Rankings</h2>
                    <p className="text-sm opacity-50 mt-1">{room.roundTopic?.topic}</p>
                  </div>
                  
                  <div className="bento-card p-4 sm:p-6 flex flex-col gap-3 pointer-events-none">
                    {chooserRanking.map((item, index) => {
                      const tier = TIERS[index];
                      const myIdx = myRanking.indexOf(item);
                      const isCorrect = myIdx === index;
                      const myTier = myIdx >= 0 ? TIERS[myIdx] : null;

                      return (
                        <div key={item} className="flex items-center gap-3 w-full">
                          <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black text-black shrink-0 shadow-sm ${tier.colorClass}`}>
                            {tier.label}
                          </div>
                          
                          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-3 sm:px-4 sm:py-3 flex items-center justify-between flex-1 gap-2 min-w-0">
                            <span className="font-semibold text-sm sm:text-base truncate flex-1">{item}</span>
                            
                            {playerId === chooser.id ? null : (
                              <div className="shrink-0 flex items-center">
                                {isCorrect ? (
                                  <CheckCircle2 className="text-green-500 w-6 h-6 sm:w-7 sm:h-7" />
                                ) : (
                                  <>
                                    {myTier && (
                                      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-[1.5px] border-red-500 flex items-center justify-center font-black text-xs sm:text-sm text-white relative overflow-hidden">
                                        <div className={`absolute inset-0 opacity-40 ${myTier.colorClass}`} />
                                        <span className="relative z-10 leading-none">{myTier.label}</span>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 1: SCORES */}
              {activeTab === 1 && (
                <div className="flex flex-col gap-4 w-full">
                  <div className="text-center mb-2">
                    <span className="label-caps block">How you did</span>
                    <h2 className="text-2xl font-bold">Round Scores</h2>
                  </div>
                  
                  <div className="bento-card p-4 sm:p-6 flex flex-col gap-3 pointer-events-none">
                    {room.players.map(p => {
                       const isChoos = p.id === chooser.id;
                       if (isChoos) {
                         return (
                           <div key={p.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 opacity-60">
                             <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center font-bold shrink-0">
                                 {p.name.charAt(0).toUpperCase()}
                               </div>
                               <div className="min-w-0">
                                 <p className="font-bold truncate text-sm sm:text-base">{p.name}</p>
                                 <p className="text-xs opacity-50">The Chooser</p>
                               </div>
                             </div>
                             <div className="text-right shrink-0">
                               <p className="text-xl sm:text-2xl font-black">-</p>
                             </div>
                           </div>
                         );
                       }

                       const roundInfo = roundScores[p.id];
                       if (!roundInfo) return null;

                       let scoreColor = "text-white";
                       if (roundInfo.score >= 80) scoreColor = "text-green-400";
                       else if (roundInfo.score >= 50) scoreColor = "text-yellow-400";
                       else scoreColor = "text-red-400";

                       return (
                         <div key={p.id} className="flex items-center justify-between p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10">
                           <div className="flex items-center gap-3 min-w-0">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${p.id === playerId ? 'bg-blue-500' : 'bg-white/20'}`}>
                               {p.name.charAt(0).toUpperCase()}
                             </div>
                             <div className="min-w-0">
                               <p className="font-bold truncate text-sm sm:text-base">{p.name} {p.id === playerId && '(You)'}</p>
                               <p className="text-[10px] sm:text-xs opacity-50 truncate">Distance: {roundInfo.distance}</p>
                             </div>
                           </div>
                           <div className="text-right shrink-0">
                             <p className={`text-xl sm:text-2xl font-black ${scoreColor}`}>+{roundInfo.score}</p>
                             <p className="text-[9px] sm:text-[10px] opacity-40 uppercase tracking-widest leading-none">Points</p>
                           </div>
                         </div>
                       );
                    })}
                    
                    {topScorerPlayer && topScorerPlayer.id !== chooser.id && (
                      <div className="mt-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl pointer-events-none">
                        <p className="text-xs sm:text-sm text-green-400 font-medium text-center">
                          {topScorerPlayer.id === playerId ? 'You guessed the rankings most accurately!' : `${topScorerPlayer.name} guessed the rankings most accurately!`}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: LEADERBOARD */}
              {activeTab === 2 && (
                <div className="flex flex-col gap-4 w-full h-full">
                  <div className="text-center mb-2">
                    <span className="label-caps block">Global Standings</span>
                    <h2 className="text-2xl font-bold">Leaderboard</h2>
                  </div>
                  
                  <div className="bento-card p-4 sm:p-6 flex flex-col gap-2 relative pointer-events-none">
                    {sortedPlayers.map((p, index) => (
                      <div key={p.id} className={`flex items-center justify-between py-3 px-2 ${index < sortedPlayers.length - 1 ? 'border-b border-white/10' : ''}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`font-mono font-bold text-sm sm:text-base w-4 sm:w-6 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-amber-600' : 'text-white/50'}`}>
                            {index + 1}
                          </span>
                          <span className="font-semibold truncate text-sm sm:text-base">{p.name} {p.id === playerId && <span className="opacity-50 text-xs ml-1">(You)</span>}</span>
                        </div>
                        <span className="font-bold shrink-0 text-sm sm:text-base">{p.score} <span className="text-[10px] opacity-50 font-normal ml-0.5">PTS</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer Action */}
      <div className="shrink-0 p-4 border-t border-white/10 bg-background z-20">
        <button 
          onClick={handleNext}
          className="w-full bg-blue-500 text-white font-bold text-lg py-4 sm:py-5 rounded-2xl transition hover:bg-blue-600 active:scale-[0.98] shadow-xl shadow-blue-500/20"
        >
          Start Next Round
        </button>
      </div>

    </div>
  );
}
