import fs from 'fs';
import { JSDOM } from 'jsdom';

// Change this to your HTML file path
const htmlFile = './chemistry.html'; // or physics.html

const html = fs.readFileSync(htmlFile, 'utf-8');
const dom = new JSDOM(html);
const document = dom.window.document;

const questions = [];

// Adjust selectors based on your HTML structure
document.querySelectorAll('.question-block').forEach((q, idx) => {
  const code = q.querySelector('.code')?.textContent.trim() || `C${idx+1}`;
  const questionText = q.querySelector('.question')?.innerHTML.trim() || '';
  const options = Array.from(q.querySelectorAll('.option')).map(o => o.textContent.trim());
  const correct_answer = q.querySelector('.correct')?.textContent.trim() || null;
  const solutionText = q.querySelector('.solution')?.innerHTML.trim() || '';
  const solutionSteps = Array.from(q.querySelectorAll('.solution-step')).map(s => s.textContent.trim());

  questions.push({
    code,
    question: { text: questionText },
    options,
    correct_answer,
    solution: { text: solutionText },
    solution_steps: solutionSteps
  });
});

fs.writeFileSync('./chemistry.json', JSON.stringify(questions, null, 2));
console.log('JSON file created: chemistry.json');
