import React from 'react';
import Header from './components/Header';
import Die from './components/Die';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti';

function generateAllNewDice() {
  return new Array(10).fill(0).map(() => ({
    id: nanoid(),
    value: Math.ceil(Math.random() * 6),
    isHeld: false,
  }));
}

export default function App() {
  const [dice, setDice] = React.useState(generateAllNewDice());
  const [timeLimit, setTimeLimit] = React.useState('');
  const [timeLeft, setTimeLeft] = React.useState(null);
  const [gameStarted, setGameStarted] = React.useState(false);
  const [gameFailed, setGameFailed] = React.useState(false);
  const buttonRef = React.useRef(null);
  const timerRef = React.useRef(null);

  const areAllDiceSame = dice.every((die) => die.value === dice[0].value);
  const gameWon = dice.every((die) => die.isHeld) && areAllDiceSame;
  const gameOver = gameWon || gameFailed;

  React.useEffect(() => {
    if (gameWon) {
      clearInterval(timerRef.current);
      buttonRef.current.focus();
    }
  }, [gameWon]);

  React.useEffect(() => {
    if (!gameStarted || gameOver) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setGameFailed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [gameStarted, gameOver]);

  function startGame() {
    const seconds = parseInt(timeLimit, 10);
    if (!seconds || seconds < 5 || seconds > 300) return;
    clearInterval(timerRef.current);
    setDice(generateAllNewDice());
    setTimeLeft(seconds);
    setGameStarted(true);
    setGameFailed(false);
  }

  function resetGame() {
    clearInterval(timerRef.current);
    setDice(generateAllNewDice());
    setTimeLeft(null);
    setGameStarted(false);
    setGameFailed(false);
    setTimeLimit('');
  }

  function rollDice() {
    if (!gameStarted) return;
    if (gameOver) {
      resetGame();
      return;
    }
    setDice((prev) =>
      prev.map((die) =>
        die.isHeld ? die : { ...die, value: Math.ceil(Math.random() * 6) }
      )
    );
  }

  function hold(die) {
    if (!gameStarted || gameOver) return;
    setDice((prev) =>
      prev.map((d) => (d.id === die.id ? { ...d, isHeld: !d.isHeld } : d))
    );
  }

  const diceElements = dice.map((die) => (
    <Die key={die.id} value={die.value} isHeld={die.isHeld} hold={() => hold(die)} />
  ));

  const timeLimitNum = parseInt(timeLimit) || 0;
  const timerColor =
    timeLeft === null ? '#888'
    : timeLeft > timeLimitNum * 0.5 ? '#22a06b'
    : timeLeft > timeLimitNum * 0.25 ? '#e8a838'
    : '#e2483d';

  const rollBtnLabel = gameWon ? 'New Game' : gameFailed ? 'New Game' : 'Roll';
  const rollBtnClass = `roll-dice${gameWon ? ' game-won' : gameFailed ? ' game-over' : ''}`;

  return (
    <>
      {gameWon && <Confetti />}
      <main>
        <Header>
          <div aria-live="polite" className="sr-only">
            {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
            {gameFailed && <p>Time's up! You failed. Press "New Game" to play again.</p>}
          </div>
        </Header>

        {/* Timer input — before game starts */}
        {!gameStarted && !gameFailed && (
          <div className="timer-setup">
            <label htmlFor="time-input" className="timer-label">
              Set a time limit (seconds)
            </label>
            <div className="timer-input-row">
              <input
                id="time-input"
                type="number"
                min="5"
                max="300"
                placeholder="e.g. 30"
                value={timeLimit}
                onChange={(e) => setTimeLimit(e.target.value)}
                className="timer-input"
                onKeyDown={(e) => e.key === 'Enter' && startGame()}
              />
              <button
                className="timer-start-btn"
                onClick={startGame}
                disabled={!timeLimit || parseInt(timeLimit) < 5}
              >
                Start
              </button>
            </div>
            {timeLimit && parseInt(timeLimit) < 5 && (
              <p className="timer-hint">Minimum is 5 seconds</p>
            )}
          </div>
        )}

        {/* Countdown */}
        {gameStarted && !gameFailed && (
          <div className="timer-display" style={{ color: timerColor }}>
            <span className="timer-clock">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:
              {String(timeLeft % 60).padStart(2, '0')}
            </span>
          </div>
        )}

        {/* Fail message */}
        {gameFailed && (
          <div className="fail-overlay">
            <p className="fail-title">⏰ Time's up!</p>
            <p className="fail-sub">Better luck next time.</p>
          </div>
        )}

        <div className={`dice-container${!gameStarted || gameOver ? ' dice-disabled' : ''}`}>
          {diceElements}
        </div>

        <button
          ref={buttonRef}
          className={rollBtnClass}
          onClick={rollDice}
          disabled={!gameStarted && !gameOver}
        >
          {rollBtnLabel}
        </button>
      </main>
    </>
  );
}

export default App;