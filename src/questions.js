// questions.js
// The quiz questions, stored in an array.
//
// Each question is an object with three parts:
//   question - the text shown to the player
//   choices  - an array of possible answers
//   answer   - the position (index) of the correct choice in `choices`
//              (0 = A, 1 = B, 2 = C, 3 = D)

const questions = [
  {
    question: 'Which keyword declares a variable that cannot be reassigned?',
    choices: ['var', 'let', 'const', 'static'],
    answer: 2,
  },
  {
    question: 'What does typeof [] return?',
    choices: ['"array"', '"object"', '"list"', '"undefined"'],
    answer: 1,
  },
  {
    question: 'Which array method returns a new array with every item transformed?',
    choices: ['filter()', 'forEach()', 'reduce()', 'map()'],
    answer: 3,
  },
  {
    question: 'Which operator checks both the value and the type?',
    choices: ['=', '==', '===', '!='],
    answer: 2,
  },
  {
    question: 'What is the result of "5" + 3 in JavaScript?',
    choices: ['8', 'NaN', '"8"', '"53"'],
    answer: 3,
  },
  {
    question: 'Which method turns a JSON string into a JavaScript object?',
    choices: ['JSON.stringify()', 'JSON.convert()', 'JSON.parse()', 'JSON.object()'],
    answer: 2,
  },
  {
    question: 'Which function runs code once after a delay?',
    choices: ['setInterval()', 'wait()', 'delay()', 'setTimeout()'],
    answer: 3,
  },
  {
    question: 'What is the index of the first item in a JavaScript array?',
    choices: ['1', '-1', '0', 'first'],
    answer: 2,
  },
  {
    question: 'Which array method removes the last item?',
    choices: ['pop()', 'shift()', 'push()', 'splice()'],
    answer: 0,
  },
  {
    question: 'Who created JavaScript in 1995?',
    choices: ['Brendan Eich', 'Tim Berners-Lee', 'Linus Torvalds', 'Ada Lovelace'],
    answer: 0,
  },
];

module.exports = questions;
