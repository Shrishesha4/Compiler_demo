export const codeExamples = {
  basic: [
    {
      title: 'Simple Variable Declaration',
      code: 'let x = 42;\nx',
      description: 'Shows basic variable declaration and assignment',
    },
    {
      title: 'Function Declaration',
      code: 'function add(a, b) {\n  return a + b;\n}\nlet x = add(5, 3);\nx',
      description: 'Demonstrates function declaration with parameters',
    },
    {
      title: 'Conditional Statement',
      code: 'let x = 10;\nif (x > 0) {\nx > 0;\n} else {\nx > 0;\n}',
      description: 'Shows control flow with if-else statement',
    },
  ],
  intermediate: [
    {
      title: 'Array Methods',
      code: 'const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\ndoubled',
      description: 'Demonstrates array map method',
    },
  ],
  advanced: [
    {
      title: 'Class Definition',
      code: 'class Calculator {\n  constructor() {\n    this.value = 0;\n  }\n  add(x) {\n    this.value += x;\n    return this.value;\n  }\n}\nconst calc = new Calculator();\nconsole.log(calc.add(5));',
      description: 'Demonstrates class definition with methods',
    },
    {
      title: 'Async/Await',
      code: 'async function fetchData() {\n  return new Promise(resolve => {\n    setTimeout(() => resolve("Data"), 1000);\n  });\n}\n\nconsole.log("Fetching...");\nfetchData().then(data => console.log(data));',
      description: 'Shows async/await pattern',
    },
    {
      title: 'Recursion',
      code: 'function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\n\nconsole.log(factorial(5));',
      description: 'Demonstrates recursive function',
    },
  ],
};