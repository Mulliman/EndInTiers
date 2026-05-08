import { useState, useEffect } from "react";
import { Room } from "../App";
import { getSocket } from "../lib/socket";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from "lucide-react";

interface Props { room: Room; playerId: string; }

// Tier labels and colors mapping based on index
const TIERS = [
  { label: 'S', colorClass: 'bg-s-tier', textClass: 'text-s-tier' },
  { label: 'A', colorClass: 'bg-a-tier', textClass: 'text-a-tier' },
  { label: 'B', colorClass: 'bg-b-tier', textClass: 'text-b-tier' },
  { label: 'C', colorClass: 'bg-c-tier', textClass: 'text-c-tier' },
  { label: 'D', colorClass: 'bg-d-tier', textClass: 'text-d-tier' },
];

interface SortableItemProps {
  id: string;
  index: number;
  key?: string | number;
}

function SortableItem({ id, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const tier = TIERS[index];

  return (
    <div ref={setNodeRef} style={style} className={`flex h-[52px] sm:h-20 mb-2 sm:mb-3 relative group ${isDragging ? 'opacity-80 scale-[1.02] shadow-2xl z-50' : 'z-10'}`}>
      <div className={`w-[52px] sm:w-20 ${tier.colorClass} text-black flex items-center justify-center font-black text-2xl sm:text-3xl shrink-0 rounded-xl mr-2 sm:mr-3 shadow-sm`}>
        {tier.label}
      </div>
      
      {/* Draggable Item */}
      <div 
        {...attributes} 
        {...listeners}
        className="flex-grow bg-white/5 border border-white/10 rounded-xl flex items-center px-3 sm:px-4 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
      >
        <span className="font-semibold text-lg sm:text-xl flex-1 leading-tight">{id}</span>
        <GripVertical className="opacity-30 group-hover:opacity-100 transition-opacity w-5 h-5 sm:w-6 sm:h-6" />
      </div>
    </div>
  );
}

export function Ranking({ room, playerId }: Props) {
  const isChooser = room.chooser?.id === playerId;
  const [items, setItems] = useState<string[]>([]);
  const hasSubmitted = !!room.submissions?.[playerId];
  
  useEffect(() => {
    // Initialize items with selected items (shuffled slightly or just as is)
    if (items.length === 0 && room.selectedItems.length > 0) {
      setItems([...room.selectedItems]); // Or could shuffle here
    }
  }, [room.selectedItems, items.length]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = () => {
    getSocket().emit("SUBMIT_RANKING", {
      roomCode: room.code,
      playerId,
      ranking: items
    });
  };

  if (hasSubmitted) {
    const numSubmissions = Object.values(room.submissions || {}).filter(Boolean).length;
    const totalPlayers = room.players.length;
    
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-6 w-full max-w-sm">
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tighter uppercase text-blue-400">RANKING SUBMITTED</h2>
          <p className="opacity-50 uppercase tracking-widest font-semibold text-xs sm:text-sm">Waiting for others...</p>
          
          <div className="bento-card p-6 sm:p-8 mt-8">
             <div className="text-5xl sm:text-6xl font-black mb-4">{numSubmissions}<span className="text-2xl sm:text-3xl opacity-30 text-white">/{totalPlayers}</span></div>
             <div className="w-full bg-white/5 rounded-full h-3 mb-2 border border-white/10 overflow-hidden">
                <div 
                  className="bg-blue-500 h-full transition-all duration-500 rounded-full" 
                  style={{ width: `${(numSubmissions / totalPlayers) * 100}%` }}
                ></div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:p-6 flex flex-col relative space-y-4 sm:space-y-6">
        {room.roundPrompt && (
          <div className="text-center shrink-0">
            <div className="bg-white/5 border border-white/10 inline-flex flex-col items-center justify-center px-4 py-3 sm:px-6 sm:py-4 rounded-xl mx-auto w-full max-w-sm sm:max-w-md">
              <div className="text-sm sm:text-base font-bold italic text-white line-clamp-3 leading-snug">&quot;{room.roundPrompt}&quot;</div>
            </div>
          </div>
        )}

        <div className="bento-card relative shrink-0 p-3 sm:p-6 shadow-2xl">
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div className="space-y-1">
              {/* The structural background lines for the tiers */}
              <SortableContext 
                items={items}
                strategy={verticalListSortingStrategy}
              >
                {items.map((id, index) => (
                  <SortableItem key={id} id={id} index={index} />
                ))}
              </SortableContext>
            </div>
          </DndContext>
        </div>
      </div>

      <div className="shrink-0 p-4 border-t border-white/10 bg-background z-10 w-full">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white font-bold text-lg sm:text-xl py-4 sm:py-5 rounded-2xl hover:bg-blue-600 active:scale-[0.98] transition shadow-xl shadow-blue-500/20"
        >
          Lock In Ranking
        </button>
      </div>
    </div>
  );
}
