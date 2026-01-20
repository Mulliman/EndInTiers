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
        words: string[];
        chooserRankings: Record<string, number>;
        submissions: Record<string, Record<string, number>>;
    };
}

export interface Category {
    id: string;
    name: string;
    words: string[];
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
    SET_WORDS: (category: string, words: string[]) => void;
    SUBMIT_RANKING: (rankings: Record<string, number>) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    roomCode: string;
}
