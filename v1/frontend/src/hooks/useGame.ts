import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { GameState } from '../types/game';

export const useGame = () => {
    const { socket, isConnected } = useSocket();
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [joined, setJoined] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.on('GAME_UPDATED', (newGameState: GameState) => {
            setGameState(newGameState);
            setJoined(true);
            setError(null);
        });

        socket.on('ERROR', (msg: string) => {
            setError(msg);
        });

        return () => {
            socket.off('GAME_UPDATED');
            socket.off('ERROR');
        };
    }, [socket]);

    const createGame = useCallback((name: string) => {
        if (!socket) return;
        if (!name) return setError('Please enter your name');
        socket.emit('CREATE_GAME', name);
    }, [socket]);

    const joinGame = useCallback((name: string, roomCode: string) => {
        if (!socket) return;
        if (!name) return setError('Please enter your name');
        if (!roomCode) return setError('Please enter a room code');
        socket.emit('JOIN_GAME', roomCode.toUpperCase(), name);
    }, [socket]);

    const startGame = useCallback(() => {
        if (!socket) return;
        socket.emit('START_GAME');
    }, [socket]);

    return {
        gameState,
        error,
        joined,
        isConnected,
        createGame,
        joinGame,
        startGame,
        socket
    };
};
