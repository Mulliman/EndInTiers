export interface Player {
    id: string;
    name: string;
    score: number;
    isHost: boolean;
    isChooser: boolean;
}

export type GameStatus = 'LOBBY' | 'SELECTING' | 'RANKING' | 'RESULTS';

export interface GameState {
    roomCode: string;
    players: Player[];
    status: GameStatus;
    currentRound: {
        category: string;
        question?: string;
        words: string[];
        chooserRankings: Record<string, number>;
        submissions: Record<string, Record<string, number>>;
    };
    lastRoundScores?: Record<string, number>;
    nextChooserId?: string;
}

export interface Topic {
    id: string;
    name: string;
    questions: string[];
    options: string[];
    tags: string[];
}

export interface SubCategory {
    name: string;
    topics: Topic[];
}

export interface Category {
    name: string;
    subcategories: SubCategory[];
}

export interface ServerToClientEvents {
    GAME_UPDATED: (gameState: GameState) => void;
    ERROR: (message: string) => void;
    CATEGORIES_SENT: (categories: Category[]) => void;
}

export interface ClientToServerEvents {
    CREATE_GAME: (playerName: string) => void;
    JOIN_GAME: (roomCode: string, playerName: string) => void;
    START_GAME: () => void;
    GET_CATEGORIES: () => void;
    SET_WORDS: (category: string, words: string[], question?: string) => void;
    SUBMIT_RANKING: (rankings: Record<string, number>) => void;
    START_NEXT_ROUND: () => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    roomCode: string;
}
