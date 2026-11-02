// game.js
// The game logic. These functions only work with data (no typing, no printing),
// so they are easy to test. app.js uses them to run the game in the terminal.

const POINTS_PER_CORRECT = 10;
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

// Turns a question into text to show the player.
// Input:  a question object, its number, and the total number of questions
// Output: a string such as "Question 1 of 10 ... A) var ..."
function formatQuestion(question, number, total) {
  // map() builds a new array with one formatted line per choice
  const choiceLines = question.choices.map(
    (choice, index) => `  ${LETTERS[index]}) ${choice}`
  );
  return [`Question ${number} of ${total}`, question.question, ...choiceLines].join('\n');
}

// Turns what the player typed ("b", "B" or "2") into a choice position.
// Input:  the typed text and how many choices the question has
// Output: 0, 1, 2... for a valid answer, or -1 if the input is not valid
function parseChoice(input, choiceCount) {
  const text = String(input).trim().toUpperCase();

  const letterIndex = LETTERS.indexOf(text);
  if (letterIndex !== -1 && letterIndex < choiceCount) {
    return letterIndex;
  }

  const number = Number(text);
  if (Number.isInteger(number) && number >= 1 && number <= choiceCount) {
    return number - 1;
  }

  return -1;
}

// Checks if the chosen position is the correct one.
// Output: true or false
function checkAnswer(question, choiceIndex) {
  return choiceIndex === question.answer;
}

// Builds a result object that records what happened on one question.
// Input:  the question, the chosen position, and whether time ran out
// Output: { question, correct, timedOut, chosen, correctAnswer }
function createResult(question, choiceIndex, timedOut) {
  return {
    question: question.question,
    correct: !timedOut && checkAnswer(question, choiceIndex),
    timedOut: timedOut,
    chosen: timedOut ? null : question.choices[choiceIndex],
    correctAnswer: question.choices[question.answer],
  };
}

// Gives the player a message about their answer.
// Output: a string
function getAnswerFeedback(result) {
  if (result.timedOut) {
    return `Time's up! The correct answer was: ${result.correctAnswer}`;
  }
  if (result.correct) {
    return 'Correct!';
  }
  return `Incorrect. The correct answer was: ${result.correctAnswer}`;
}

// Counts the correct answers. filter() keeps only the correct results.
// Output: a number
function calculateScore(results) {
  return results.filter((result) => result.correct).length;
}

// Adds up the points. reduce() combines the whole array into one number.
// Output: a number
function calculatePoints(results) {
  return results.reduce(
    (total, result) => (result.correct ? total + POINTS_PER_CORRECT : total),
    0
  );
}

// Output: a whole number from 0 to 100
function calculatePercentage(correctCount, totalQuestions) {
  if (totalQuestions === 0) {
    return 0;
  }
  return Math.round((correctCount / totalQuestions) * 100);
}

// Output: the results the player did not get right
function getMissedQuestions(results) {
  return results.filter((result) => !result.correct);
}

// Output: an encouraging message that matches the percentage
function getFinalMessage(percentage) {
  if (percentage >= 90) return 'Outstanding! You really know your JavaScript.';
  if (percentage >= 70) return 'Great job!';
  if (percentage >= 50) return 'Good effort. Keep practising!';
  return 'Keep going. Review the answers and try again!';
}

// Decides how many seconds a question gets. It is the question limit,
// unless fewer seconds are left in the whole game.
// Output: a number of seconds (never below 0)
function secondsForQuestion(gameSecondsLeft, questionLimit) {
  return Math.max(0, Math.min(gameSecondsLeft, questionLimit));
}

// Builds the end-of-game report.
// Input:  all the results, the number of questions in the quiz, and seconds used
// Output: a string to print
function buildSummary(results, totalQuestions, secondsUsed) {
  const correctCount = calculateScore(results);
  const percentage = calculatePercentage(correctCount, totalQuestions);
  const unanswered = totalQuestions - results.length;

  const lines = [
    '===== GAME OVER =====',
    `Correct answers: ${correctCount} / ${totalQuestions}`,
    `Points: ${calculatePoints(results)}`,
    `Score: ${percentage}%`,
    `Time used: ${secondsUsed} seconds`,
  ];

  if (unanswered > 0) {
    lines.push(`Not reached: ${unanswered}`);
  }

  lines.push('', getFinalMessage(percentage));

  const missed = getMissedQuestions(results);
  if (missed.length > 0) {
    lines.push('', 'Questions to review:');
    missed.forEach((result) => {
      lines.push(` - ${result.question}`, `   Correct answer: ${result.correctAnswer}`);
    });
  }

  return lines.join('\n');
}

module.exports = {
  POINTS_PER_CORRECT,
  formatQuestion,
  parseChoice,
  checkAnswer,
  createResult,
  getAnswerFeedback,
  calculateScore,
  calculatePoints,
  calculatePercentage,
  getMissedQuestions,
  getFinalMessage,
  secondsForQuestion,
  buildSummary,
};
