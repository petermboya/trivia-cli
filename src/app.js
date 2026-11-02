// app.js
// Runs the trivia game in the terminal: asks the questions, runs the timers
// and prints feedback. Start it with:  node src/app.js   (or: npm start)

const readline = require('node:readline/promises');
const { stdin, stdout } = require('node:process');

const questions = require('./questions');
const {
  formatQuestion,
  parseChoice,
  createResult,
  getAnswerFeedback,
  secondsForQuestion,
  buildSummary,
} = require('./game');

// ----- Settings you can change -----
const QUESTION_TIME_LIMIT_SECONDS = 15; // time allowed for each question
const GAME_TIME_LIMIT_SECONDS = 120; // time allowed for the whole game
const WARNING_SECONDS = 5; // show a warning when this many seconds are left

// ----- Colours for the terminal -----
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const BOLD = '\x1b[1m';
const RESET = '\x1b[0m';

function paint(color, text) {
  return `${color}${text}${RESET}`;
}

// Asks one question and waits for an answer, but only for `seconds` seconds.
// Output: the text the player typed, or null if time ran out
async function askWithTimeout(rl, prompt, seconds) {
  const controller = new AbortController();
  // Cancel the question when the time is over
  const timer = setTimeout(() => controller.abort(), seconds * 1000);

  try {
    return await rl.question(prompt, { signal: controller.signal });
  } catch (error) {
    if (error.name === 'AbortError') {
      return null; // time ran out
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

// Shows one question and keeps asking until the player gives a valid answer,
// runs out of time, or quits. The timer does not restart after a bad answer.
// Output: { choiceIndex, timedOut, quit }
async function askQuestion(rl, question, number, total, seconds) {
  console.log(`\n${paint(BOLD, formatQuestion(question, number, total))}`);
  console.log(paint(YELLOW, `Timer: you have ${seconds} seconds. Type A-D (or 1-4), or q to quit.`));

  const deadline = Date.now() + seconds * 1000;

  // Warn the player when time is almost up
  const warning = setTimeout(
    () => console.log(paint(YELLOW, `\n${WARNING_SECONDS} seconds left!`)),
    Math.max(0, seconds - WARNING_SECONDS) * 1000
  );

  try {
    while (true) {
      const secondsLeft = Math.ceil((deadline - Date.now()) / 1000);
      if (secondsLeft <= 0) {
        return { choiceIndex: -1, timedOut: true, quit: false };
      }

      const input = await askWithTimeout(rl, 'Your answer: ', secondsLeft);
      if (input === null) {
        return { choiceIndex: -1, timedOut: true, quit: false };
      }
      if (input.trim().toLowerCase() === 'q') {
        return { choiceIndex: -1, timedOut: false, quit: true };
      }

      const choiceIndex = parseChoice(input, question.choices.length);
      if (choiceIndex !== -1) {
        return { choiceIndex, timedOut: false, quit: false };
      }
      console.log(paint(RED, 'Please type a letter from A to D (or a number from 1 to 4).'));
    }
  } finally {
    clearTimeout(warning);
  }
}

// Plays one full game.
// Output: { results, secondsUsed }
async function playGame(rl) {
  const results = [];
  const startTime = Date.now();

  for (let i = 0; i < questions.length; i++) {
    const secondsUsed = Math.floor((Date.now() - startTime) / 1000);
    const gameSecondsLeft = GAME_TIME_LIMIT_SECONDS - secondsUsed;

    if (gameSecondsLeft <= 0) {
      console.log(paint(RED, '\nThe game time limit has been reached!'));
      break;
    }

    const question = questions[i];
    const seconds = secondsForQuestion(gameSecondsLeft, QUESTION_TIME_LIMIT_SECONDS);
    const answer = await askQuestion(rl, question, i + 1, questions.length, seconds);

    if (answer.quit) {
      console.log('\nQuitting the game...');
      break;
    }

    const result = createResult(question, answer.choiceIndex, answer.timedOut);
    results.push(result);

    const color = result.correct ? GREEN : RED;
    console.log(paint(color, getAnswerFeedback(result)));
  }

  const secondsUsed = Math.round((Date.now() - startTime) / 1000);
  return { results, secondsUsed };
}

async function main() {
  const rl = readline.createInterface({ input: stdin, output: stdout });

  // Close the program cleanly with Ctrl+C or when the input ends
  rl.on('SIGINT', () => {
    console.log('\nGoodbye!');
    rl.close();
  });
  rl.on('close', () => process.exit(0));

  console.log(paint(BOLD, '\n=== JavaScript Trivia ==='));
  const name = (await rl.question('What is your name? ')).trim() || 'Player';

  console.log(`\nHi ${name}! There are ${questions.length} questions.`);
  console.log(`You get ${QUESTION_TIME_LIMIT_SECONDS} seconds per question and ${GAME_TIME_LIMIT_SECONDS} seconds for the whole game.`);

  let playAgain = true;
  while (playAgain) {
    await rl.question('\nPress Enter to start the game...');

    const { results, secondsUsed } = await playGame(rl);
    console.log(`\n${buildSummary(results, questions.length, secondsUsed)}`);

    const reply = await rl.question('\nPlay again? (y/n) ');
    playAgain = reply.trim().toLowerCase() === 'y';
  }

  console.log(`\nThanks for playing, ${name}!`);
  rl.close();
}

// Only start the game when this file is run directly (not when it is imported)
if (require.main === module) {
  main();
}

module.exports = { askWithTimeout, askQuestion, playGame, main };
