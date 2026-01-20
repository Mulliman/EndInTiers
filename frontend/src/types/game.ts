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
