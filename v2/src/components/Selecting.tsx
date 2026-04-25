import { useState } from "react";
import { Room, TopicInfo } from "../App";
import { getSocket } from "../lib/socket";
import { RefreshCw, Edit2, Check, CloudDownload } from "lucide-react";

export const getPromptsForTopic = (topic: TopicInfo) => {
  if (topic.questions && topic.questions.length > 0) {
    return topic.questions;
  }
  return [
    `Rank these ${topic.name} from best to worst`,
    `Which of these ${topic.name} are the most overrated?`,
    `Rank these ${topic.name} based on pure nostalgia`,
    `Which of these ${topic.name} would you take to a desert island?`,
    `Rank these ${topic.name} from most to least essential`
  ];
};

interface Props { room: Room; playerId: string; }

export function Selecting({ room, playerId }: Props) {
  const isChooser = room.chooser?.id === playerId;
  const [selectedTopicObj, setSelectedTopicObj] = useState<TopicInfo | null>(null);
  const [selectedTopicPath, setSelectedTopicPath] = useState<{ category: string, subcategory: string } | null>(null);
  const [prompt, setPrompt] = useState("");
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isEditingPrompt, setIsEditingPrompt] = useState(false);
  const [promptIndex, setPromptIndex] = useState(0);
  const [isReloading, setIsReloading] = useState(false);

  const me = room.players.find(p => p.id === playerId);

  const handleReloadData = () => {
    if (!me?.isHost || isReloading) return;
    setIsReloading(true);
    getSocket().emit("RELOAD_DATA", { roomCode: room.code, playerId }, () => {
      setTimeout(() => setIsReloading(false), 500);
    });
  };

  const handleRandomizePrompt = () => {
    if (!selectedTopicObj) return;
    const prompts = getPromptsForTopic(selectedTopicObj);
    const nextIdx = (promptIndex + 1) % prompts.length;
    setPromptIndex(nextIdx);
    setPrompt(prompts[nextIdx]);
    setIsEditingPrompt(false);
  };

  if (!isChooser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold tracking-tighter leading-none uppercase text-blue-400">
            <span className="text-white text-2xl sm:text-4xl block mb-2">{room.chooser?.name}</span>
            IS CHOOSING
          </h2>
          <div className="flex flex-col items-center gap-4">
            <span className="label-caps !text-xs sm:!text-sm">Get ready to read their mind...</span>
            <span className="flex gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/30 animate-bounce" style={{animationDelay: "0ms"}}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/30 animate-bounce" style={{animationDelay: "150ms"}}></span>
              <span className="w-2.5 h-2.5 rounded-full bg-white/30 animate-bounce" style={{animationDelay: "300ms"}}></span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  const toggleWord = (word: string) => {
    setError("");
    if (selectedWords.includes(word)) {
      setSelectedWords(prev => prev.filter(w => w !== word));
    } else {
      if (selectedWords.length >= 5) {
        setError("You can only choose exactly 5 items.");
        return;
      }
      setSelectedWords(prev => [...prev, word]);
    }
  };

  const handleSubmit = () => {
    if (selectedWords.length !== 5) {
      setError("Please select exactly 5 items.");
      return;
    }
    
    getSocket().emit("SET_WORDS", {
      roomCode: room.code,
      playerId,
      topic: selectedTopicObj,
      prompt: prompt.trim() || `Rank these ${selectedTopicObj.name}`,
      items: selectedWords
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {!selectedTopicObj ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-12">
          <div className="text-center space-y-1 mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tighter text-blue-400">YOU ARE THE CHOOSER</h2>
            <span className="label-caps !opacity-60 block text-[10px]">Select 5 items for the others to guess</span>
          </div>

          <div className="bento-card p-4 sm:p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl sm:text-2xl font-bold">CHOOSE A CATEGORY</h3>
              {me?.isHost && (
                <button 
                  onClick={handleReloadData}
                  disabled={isReloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50"
                >
                  <CloudDownload size={14} className={isReloading ? "animate-bounce" : ""} />
                  {isReloading ? "Reloading..." : "Reload Data"}
                </button>
              )}
            </div>
            <div className="space-y-8">
            {(room.categories || []).map(cat => (
              <div key={cat.category} className="space-y-4">
                 <span className="label-caps">{cat.category}</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {cat.subcategories.map(sub => (
                    <div key={sub.name} className="bg-white/5 border border-white/10 rounded-2xl p-4">
                      <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-3 text-blue-400 opacity-80">{sub.name}</div>
                      <div className="flex flex-wrap gap-2">
                        {sub.topics.map(topic => (
                          <button
                            key={topic.id || topic.name}
                            onClick={() => {
                              setSelectedTopicObj(topic);
                              setSelectedTopicPath({ category: cat.category, subcategory: sub.name });
                              setSelectedWords([]);
                              const initialPrompt = getPromptsForTopic(topic)[0];
                              setPrompt(initialPrompt);
                              setPromptIndex(0);
                              setIsEditingPrompt(false);
                            }}
                            className="bg-black/30 hover:bg-white/10 border border-white/10 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors text-xs font-medium"
                          >
                            {topic.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            <div className="bento-card py-4 px-4 sm:p-6 text-left w-full space-y-3">
              <div className="flex flex-col items-start text-left w-full">
                <div className="flex items-center gap-2 mb-2 w-full">
                  <button 
                    onClick={() => setSelectedTopicObj(null)} 
                    className="opacity-80 hover:opacity-100 text-[10px] sm:text-xs font-semibold flex items-center gap-1 transition-opacity text-blue-400 uppercase tracking-widest shrink-0"
                  >
                    &larr; Back
                  </button>
                  <span className="opacity-50 text-[10px] sm:text-xs uppercase tracking-widest truncate">
                    | {selectedTopicPath.category} &rsaquo; {selectedTopicPath.subcategory}
                  </span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold line-clamp-2 md:line-clamp-1">{selectedTopicObj.name}</h3>
              </div>

              {isEditingPrompt ? (
                <div className="flex items-center gap-2 mt-2 w-full">
                  <input 
                    type="text" 
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    onBlur={() => setIsEditingPrompt(false)}
                    onKeyDown={(e) => e.key === 'Enter' && setIsEditingPrompt(false)}
                    placeholder={`e.g. "Rank these best to worst"`}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-blue-400 transition-colors"
                    maxLength={60}
                    autoFocus
                  />
                  <button 
                    onClick={() => setIsEditingPrompt(false)} 
                    className="p-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition-colors flex shrink-0"
                  >
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3 group mt-2 w-full">
                  <div className="text-sm sm:text-base font-bold italic text-white/90 line-clamp-2">
                    &quot;{prompt}&quot;
                  </div>
                  <div className="flex items-center gap-1 shrink-0 opacity-100 sm:opacity-50 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={handleRandomizePrompt} className="p-1.5 hover:bg-white/10 border border-white/5 sm:border-transparent rounded-lg transition-colors text-white/80 hover:text-white active:scale-95" title="Randomize Prompt">
                      <RefreshCw size={14} className="sm:w-[16px] sm:h-[16px]" />
                    </button>
                    <button onClick={() => setIsEditingPrompt(true)} className="p-1.5 hover:bg-white/10 border border-white/5 sm:border-transparent rounded-lg transition-colors text-white/80 hover:text-white active:scale-95" title="Edit Prompt">
                      <Edit2 size={14} className="sm:w-[16px] sm:h-[16px]" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bento-card p-4 sm:p-6 mb-4">
               <div className="mb-4 sm:mb-6 flex justify-between items-center gap-2">
                 <span className="label-caps mb-0 text-[10px]">Choose 5 items that you can put in preference order</span>
                 {error && <span className="text-red-400 text-[10px] sm:text-xs font-semibold bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-lg">{error}</span>}
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 {(selectedTopicObj.options || []).map((item: string) => {
                   const isSelected = selectedWords.includes(item);
                   return (
                     <button
                       key={item}
                       onClick={() => toggleWord(item)}
                       className={`p-3 sm:p-4 rounded-xl border text-left font-semibold text-xs sm:text-sm transition-all duration-200 shadow-sm ${
                         isSelected 
                          ? 'bg-blue-500 border-blue-400 text-white shadow-lg shadow-blue-500/20 ring-1 ring-blue-400' 
                          : 'bg-white/5 border-white/10 hover:border-white/30'
                       }`}
                     >
                       {item}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>
          
          <div className="shrink-0 p-4 border-t border-white/10 bg-background z-10 w-full flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={selectedWords.length !== 5}
              className="flex-1 bg-blue-500 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 active:scale-[0.98] shadow-xl shadow-blue-500/20"
            >
              Confirm Selection ({selectedWords.length}/5)
            </button>
          </div>
        </>
      )}
    </div>
  );
}
