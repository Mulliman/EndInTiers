'use client';
import { useState } from 'react';
import { useGame } from '@/hooks/useGame';
import Lobby from '@/components/phases/Lobby';
import SelectionPhase from '@/components/phases/SelectionPhase';
import RankingPhase from '@/components/phases/RankingPhase';
import ResultsPhase from '@/components/phases/ResultsPhase';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Container from '@/components/atoms/Container';

export default function Home() {
    const { 
        gameState, 
        error, 
        joined, 
        createGame, 
        joinGame, 
        startGame, 
        socket 
    } = useGame();

    const [name, setName] = useState('');
    const [roomCode, setRoomCode] = useState('');

    if (gameState && joined && socket) {
        const myPlayer = gameState.players.find(p => p.id === socket.id);

        switch (gameState.status) {
            case 'LOBBY':
                return (
                    <div className="relative">
                        <Lobby gameState={gameState} playerId={socket.id || ''} />
                        {myPlayer?.isHost && (
                            <div className="fixed bottom-8 left-0 right-0 flex justify-center">
                        <Button 
                                    onClick={startGame}
                                    variant="primary"
                                    size="big"
                                >
                                    Start Game
                                </Button>
                            </div>
                        )}
                    </div>
                );
            case 'SELECTING':
                const chooser = gameState.players.find(p => p.isChooser);
                return (
                    <SelectionPhase 
                        socket={socket} 
                        isChooser={!!myPlayer?.isChooser} 
                        chooserName={chooser?.name} 
                    />
                );
            case 'RANKING':
                const hasSubmitted = socket.id ? !!gameState.currentRound.submissions[socket.id] : false;
                const submissionsCount = Object.keys(gameState.currentRound.submissions).length;
                return (
                    <RankingPhase 
                        socket={socket}
                        words={gameState.currentRound.words}
                        question={gameState.currentRound.question}
                        hasSubmitted={hasSubmitted}
                        submissionsCount={submissionsCount}
                        totalPlayers={gameState.players.length}
                    />
                );
            case 'RESULTS':
                return (
                    <ResultsPhase 
                        socket={socket}
                        gameState={gameState}
                        playerId={socket.id || ''}
                    />
                );
            default:
                return (
                    <Container>
                        <p className="text-xl">Status: {gameState.status}</p>
                    </Container>
                );
        }
    }

    return (
        <Container>
            <h1 className="text-6xl font-black mb-12 bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 text-transparent bg-clip-text drop-shadow-sm">
                EndInTiers
            </h1>

            <Card className="w-full max-w-md">
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-100 p-4 rounded-lg mb-6 text-sm animate-shake">
                        {error}
                    </div>
                )}

                <div className="space-y-8">
                    <Input
                        label="Your Name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoFocus
                    />

                    <div className="grid grid-cols-1 gap-4">
                        <Button 
                            onClick={() => createGame(name)}
                            variant="primary"
                            size="big"
                        >
                            Host New Game
                        </Button>
                    </div>

                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-gray-800"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold tracking-widest uppercase">OR</span>
                        <div className="flex-grow border-t border-gray-800"></div>
                    </div>

                    <div className="flex gap-2">
                        <Input
                            placeholder="CODE"
                            value={roomCode}
                            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                            maxLength={4}
                            className="font-mono text-center text-xl tracking-widest"
                        />
                        <Button
                            onClick={() => joinGame(name, roomCode)}
                            variant="secondary"
                            size="normal"
                            className="whitespace-nowrap"
                        >
                            Join Game
                        </Button>
                    </div>
                </div>
            </Card>
        </Container>
    );
}
