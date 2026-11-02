# JavaScript Trivia

A command-line trivia game built with JavaScript and Node.js. It asks you JavaScript questions one at a
time, gives you instant feedback, limits the time you have to answer, and shows your score at the end.

## Features
- Start a game and answer questions one after another (in order)
- Instant feedback on every answer: **Correct**, **Incorrect** (with the right answer) or **Time's up**
- **Timers:** 15 seconds for each question, 120 seconds for the whole game, and a warning when 5 seconds are left
- Final report: correct answers, points, percentage, time used, and the questions to review
- Friendly input: type `A`-`D` or `1`-`4`, in any case. Type `q` to quit.
- Play again at the end without restarting

## Requirements
- [Node.js](https://nodejs.org) version 18 or newer (check with `node -v`)

No other installation is needed. The game uses only features built into Node.js.

## How to run the game
```
npm start
```
You can also run it directly:
```
node src/app.js
```

### Example
```
=== JavaScript Trivia ===
What is your name? Peter

Question 1 of 10
Which keyword declares a variable that cannot be reassigned?
  A) var
  B) let
  C) const
  D) static
Timer: you have 15 seconds. Type A-D (or 1-4), or q to quit.
Your answer: C
Correct!
```
## Project structure
```
trivia-cli/
├── index.html          simple project page
├── style.css           styles for the page
├── package.json        project settings and the npm commands
├── README.md           this file
├── src/
│   ├── questions.js    the questions (an array of objects)
│   ├── game.js         game logic (scoring, checking, feedback)
│   └── app.js          the terminal program (input, timers, printing)
└── tests/
    └── game.test.js    tests for the game logic
```

## How it works
1. `app.js` asks for your name and starts the game when you press Enter.
2. For each question it prints the question and choices (`formatQuestion`) and starts a countdown.
3. Your answer is read with `parseChoice` and compared to the right one with `checkAnswer`.
4. `createResult` stores what happened, and `getAnswerFeedback` tells you straight away.
5. If the question timer or the game timer runs out, the answer counts as incorrect.
6. At the end `buildSummary` prints your score using the saved results.


