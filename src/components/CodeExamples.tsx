export const codeExamples = {
  basic: [
    {
      title: 'Simple Variable Declaration',
      code: 'let x = 42;',
      description: 'Shows basic variable declaration and assignment',
    },
    {
      title: 'Function Declaration',
      code: 'function add(a, b) {\n  return a + b;\n}',
      description: 'Demonstrates function declaration with parameters',
    },
    {
      title: 'Conditional Statement',
      code: 'if (x > 0) {\n  console.log("positive");\n} else {\n  console.log("negative");\n}',
      description: 'Shows control flow with if-else statement',
    },
  ],
  intermediate: [
    {
      title: 'Loop with Array',
      code: 'const arr = [1, 2, 3];\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}',
      description: 'Demonstrates array iteration',
    },
    {
      title: 'Object Methods',
      code: 'const obj = {\n  name: "John",\n  greet() {\n    return `Hello, ${this.name}`;\n  }\n};',
      description: 'Shows object method definition',
    },
  ],
  advanced: [
    {
      title: 'Class Definition',
      code: 'class Calculator {\n  constructor() {\n    this.value = 0;\n  }\n  add(x) {\n    this.value += x;\n  }\n}',
      description: 'Demonstrates class definition with methods',
    },
  ],
};