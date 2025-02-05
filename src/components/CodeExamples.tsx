export const codeExamples = {
  All: [
    {
      title: 'Simple Variable Declaration',
      code: 'let x = 42;\nx',
      description: 'Shows basic variable declaration and assignment',
    },
    {
      title: 'Function Declaration',
      code: 'function add(a, b) {\n  return a + b;\n}\nadd(5, 3);',
      description: 'Demonstrates function declaration with parameters',
    },
    {
      title: 'Conditional Statement',
      code: 'let x = 10;\nif (x > 0) {\nx > 0;\n} else {\nx > 0;\n}',
      description: 'Shows control flow with if-else statement',
    },
    {
      title: 'Array Methods',
      code: 'const numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(n => n * 2);\ndoubled',
      description: 'Demonstrates array map method',
    },
    {
      title: 'Class Definition',
      code: 'class Calculator {\n  constructor() {\n    this.value = 0;\n  }\n  add(x) {\n    this.value += x;\n    return this.value;\n  }\n}\nconst calc = new Calculator();\ncalc.add(5);',
      description: 'Demonstrates class definition with methods',
    },
  ],
};