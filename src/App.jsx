import React from 'react';
import Header from './components/Header';
import Die from './components/Die';
import { nanoid } from 'nanoid';
import Confetti from 'react-confetti'

function App() {
const [dice, setDice] = React.useState(generateAllNewDice())
const buttonRef = React.useRef(null);

const areAllDiceSame = dice.every((die, index) => die.value === dice[0].value)

const gameWon = dice.every(die => die.isHeld) && 
        areAllDiceSame;

React.useEffect(() => {
        if (gameWon) {
            buttonRef.current.focus()
        }
    }, [gameWon])

    function generateAllNewDice(){
      return new Array(10)
      .fill(0).map(()=> {
        return {
          id: nanoid(),
          value: Math.ceil(Math.random() * 6),
          isHeld: false
        }
      })
    }
const rollDice = () => !gameWon ? setDice(prevDice => prevDice.map(die => (die.isHeld ? die : {...die, value: Math.ceil(Math.random() * 6)}))) : setDice(generateAllNewDice());

    function hold(die){
      console.log(die.id);
      setDice(prevDice => prevDice.map(d => d.id === die.id ? {...d, isHeld: !d.isHeld} : d))
    }

    const diceElements = dice.map(die => <Die 
                                            key={die.id} 
                                            value={die.value} 
                                            isHeld={die.isHeld}
                                            hold={() => hold(die)}
                                            />)
    
  return (
    <>
    {gameWon && <Confetti />}
    <main>
      <Header>
        {/* For Screen-Readers only (Those who might not see confettis) */}
        <div aria-live="polite" className="sr-only">
          {gameWon && <p>Congratulations! You won! Press "New Game" to start again.</p>}
        </div> 

      </Header>
      <div className = "dice-container">
        {diceElements}
      </div>
      <button ref={buttonRef} className="roll-dice" onClick={rollDice}>{gameWon ? "New Game" : "Roll"}</button>
    </main>
    </>
  )
}

export default App;
