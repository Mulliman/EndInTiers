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
    };
}

export interface ServerToClientEvents {
    GAME_UPDATED: (gameState: GameState) => void;
    ERROR: (message: string) => void;
}

export interface ClientToServerEvents {
    CREATE_GAME: (playerName: string) => void;
    JOIN_GAME: (roomCode: string, playerName: string) => void;
}

export interface InterServerEvents {
    ping: () => void;
}

export interface SocketData {
    name: string;
    roomCode: string;
}
