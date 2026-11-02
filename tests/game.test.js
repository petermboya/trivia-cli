// Tests for the game logic. Run them with:  npm test
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const questions = require('../src/questions');
const game = require('../src/game');

// A small question used in several tests
const sampleQuestion = {
  question: 'Which keyword declares a constant?',
  choices: ['var', 'let', 'const', 'static'],
  answer: 2,
};

describe('questions data', () => {
  it('has at least 5 questions', () => {
    assert.ok(questions.length >= 5);
  });

  it('gives every question text, 4 choices and a valid answer position', () => {
    questions.forEach((q) => {
      assert.ok(q.question.length > 0);
      assert.equal(q.choices.length, 4);
      assert.ok(Number.isInteger(q.answer));
      assert.ok(q.answer >= 0 && q.answer < q.choices.length);
    });
  });

  it('does not repeat a question', () => {
    const texts = questions.map((q) => q.question);
    assert.equal(new Set(texts).size, texts.length);
  });
});

describe('formatQuestion', () => {
  it('shows the number, the question and lettered choices', () => {
    const text = game.formatQuestion(sampleQuestion, 1, 10);
    assert.match(text, /Question 1 of 10/);
    assert.match(text, /Which keyword declares a constant\?/);
    assert.match(text, /A\) var/);
    assert.match(text, /C\) const/);
    assert.match(text, /D\) static/);
  });
});

describe('parseChoice', () => {
  it('accepts letters in any case', () => {
    assert.equal(game.parseChoice('a', 4), 0);
    assert.equal(game.parseChoice('D', 4), 3);
  });

  it('accepts numbers from 1', () => {
    assert.equal(game.parseChoice('1', 4), 0);
    assert.equal(game.parseChoice('4', 4), 3);
  });

  it('ignores spaces around the answer', () => {
    assert.equal(game.parseChoice('  b  ', 4), 1);
  });

  it('returns -1 for anything invalid', () => {
    assert.equal(game.parseChoice('', 4), -1);
    assert.equal(game.parseChoice('E', 4), -1);
    assert.equal(game.parseChoice('5', 4), -1);
    assert.equal(game.parseChoice('0', 4), -1);
    assert.equal(game.parseChoice('hello', 4), -1);
    assert.equal(game.parseChoice('AB', 4), -1);
  });
});

describe('checkAnswer', () => {
  it('is true for the correct choice only', () => {
    assert.equal(game.checkAnswer(sampleQuestion, 2), true);
    assert.equal(game.checkAnswer(sampleQuestion, 0), false);
    assert.equal(game.checkAnswer(sampleQuestion, -1), false);
  });
});

describe('createResult and getAnswerFeedback', () => {
  it('records a correct answer', () => {
    const result = game.createResult(sampleQuestion, 2, false);
    assert.equal(result.correct, true);
    assert.equal(result.chosen, 'const');
    assert.equal(game.getAnswerFeedback(result), 'Correct!');
  });

  it('records a wrong answer and shows the right one', () => {
    const result = game.createResult(sampleQuestion, 0, false);
    assert.equal(result.correct, false);
    assert.equal(result.chosen, 'var');
    assert.match(game.getAnswerFeedback(result), /Incorrect.*const/);
  });

  it('records a timeout as not correct', () => {
    const result = game.createResult(sampleQuestion, 2, true);
    assert.equal(result.correct, false);
    assert.equal(result.timedOut, true);
    assert.equal(result.chosen, null);
    assert.match(game.getAnswerFeedback(result), /Time's up.*const/);
  });
});

describe('scoring', () => {
  const results = [
    game.createResult(sampleQuestion, 2, false), // correct
    game.createResult(sampleQuestion, 1, false), // wrong
    game.createResult(sampleQuestion, 2, false), // correct
    game.createResult(sampleQuestion, -1, true), // timed out
  ];

  it('counts correct answers', () => {
    assert.equal(game.calculateScore(results), 2);
    assert.equal(game.calculateScore([]), 0);
  });

  it('adds up the points', () => {
    assert.equal(game.calculatePoints(results), 2 * game.POINTS_PER_CORRECT);
    assert.equal(game.calculatePoints([]), 0);
  });

  it('calculates a percentage and never divides by zero', () => {
    assert.equal(game.calculatePercentage(2, 4), 50);
    assert.equal(game.calculatePercentage(1, 3), 33);
    assert.equal(game.calculatePercentage(10, 10), 100);
    assert.equal(game.calculatePercentage(0, 0), 0);
  });

  it('finds the questions that were missed', () => {
    const missed = game.getMissedQuestions(results);
    assert.equal(missed.length, 2);
    assert.equal(missed.every((result) => !result.correct), true);
  });
});

describe('getFinalMessage', () => {
  it('matches the score', () => {
    assert.match(game.getFinalMessage(100), /Outstanding/);
    assert.match(game.getFinalMessage(75), /Great job/);
    assert.match(game.getFinalMessage(50), /Good effort/);
    assert.match(game.getFinalMessage(10), /Keep going/);
  });
});

describe('secondsForQuestion (the timer rule)', () => {
  it('gives the full question time when plenty of game time is left', () => {
    assert.equal(game.secondsForQuestion(100, 15), 15);
  });

  it('gives less when the game is almost over', () => {
    assert.equal(game.secondsForQuestion(7, 15), 7);
  });

  it('never returns a negative number', () => {
    assert.equal(game.secondsForQuestion(-3, 15), 0);
  });
});

describe('buildSummary', () => {
  it('reports score, points, time and a final message', () => {
    const results = questions.map((q) => game.createResult(q, q.answer, false));
    const text = game.buildSummary(results, questions.length, 42);
    assert.match(text, /GAME OVER/);
    assert.match(text, new RegExp(`Correct answers: ${questions.length} / ${questions.length}`));
    assert.match(text, new RegExp(`Points: ${questions.length * game.POINTS_PER_CORRECT}`));
    assert.match(text, /Score: 100%/);
    assert.match(text, /Time used: 42 seconds/);
    assert.match(text, /Outstanding/);
    assert.doesNotMatch(text, /Questions to review/);
  });

  it('lists the questions to review and the ones not reached', () => {
    const results = [game.createResult(sampleQuestion, 0, false)];
    const text = game.buildSummary(results, 5, 10);
    assert.match(text, /Correct answers: 0 \/ 5/);
    assert.match(text, /Not reached: 4/);
    assert.match(text, /Questions to review/);
    assert.match(text, /Which keyword declares a constant\?/);
    assert.match(text, /Correct answer: const/);
  });
});
