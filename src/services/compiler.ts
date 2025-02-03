export interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

export interface ASTNode {
  type: string;
  value?: string;
  children?: ASTNode[];
}

export class CompilerError extends Error {
  constructor(
    message: string,
    public phase: string,
    public line?: number,
    public column?: number
  ) {
    super(message);
    this.name = 'CompilerError';
  }
}

export class CompilerService {
  static syntaxAnalysis(tokens: Token[]): ASTNode {
    if (tokens.length === 0) {
      throw new CompilerError('No tokens to parse', 'syntax');
    }

    let current = 0;

    function walk(): ASTNode {
      if (current >= tokens.length) {
        throw new CompilerError('Unexpected end of input', 'syntax');
      }

      const token = tokens[current];

      // Handle variable declarations
      if (token.type === 'keyword' && (token.value === 'let' || token.value === 'const' || token.value === 'var')) {
        current++;
        const node: ASTNode = {
          type: 'VariableDeclaration',
          value: token.value,
          children: [] // Initialize with empty array
        };

        // Expect identifier
        if (current < tokens.length && tokens[current].type === 'identifier') {
          if (!node.children) {
            node.children = [];
          }
          node.children.push({ type: 'Identifier', value: tokens[current].value });
          current++;
        }

        // Expect equals sign
        if (current < tokens.length && tokens[current].value === '=') {
          current++;
          // Parse the right-hand expression
          if (!node.children) {
            node.children = [];
          }
          node.children.push(parseExpression());
        }

        return node;
      }

      return parseExpression();
    }

    function parseExpression(): ASTNode {
      let left = parsePrimary();

      while (current < tokens.length && isOperator(tokens[current].value)) {
        const operator = tokens[current].value;
        current++;
        const right = parsePrimary();
        left = {
          type: 'BinaryExpression',
          value: operator,
          children: [left, right]
        };
      }

      return left;
    }

    function parsePrimary(): ASTNode {
      const token = tokens[current];

      if (token.type === 'number') {
        current++;
        return { type: 'NumberLiteral', value: token.value };
      }

      if (token.type === 'identifier') {
        current++;
        return { type: 'Identifier', value: token.value };
      }

      throw new CompilerError(`Unexpected token: ${token.value}`, 'syntax');
    }

    function isOperator(value: string): boolean {
      return ['+', '-', '*', '/'].includes(value);
    }

    try {
      return walk();
    } catch (error) {
      if (error instanceof CompilerError) throw error;
      throw new CompilerError(`Syntax analysis failed: ${(error as Error).message}`, 'syntax');
    }
  }

  static validateInput(sourceCode: string) {
    if (!sourceCode.trim()) {
      throw new CompilerError('Source code cannot be empty', 'validation');
    }
  }

  static lexicalAnalysis(sourceCode: string): Token[] {
    this.validateInput(sourceCode);
    try {
      const tokens: Token[] = [];
      const keywords = new Set(['let', 'const', 'var', 'if', 'else', 'while', 'for', 'function', 'return']);
      const operators = new Set(['+', '-', '*', '/', '=', '<', '>', '!', '&', '|', '(', ')', '{', '}', ';', ',']);
      let line = 1;
      let column = 0;
  
      for (let i = 0; i < sourceCode.length; i++) {
        column++;
        const char = sourceCode[i];
  
        // Skip whitespace but track newlines
        if (/\s/.test(char)) {
          if (char === '\n') {
            line++;
            column = 0;
          }
          continue;
        }
  
        // Handle identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
          let identifier = char;
          const startColumn = column;
          
          while (i + 1 < sourceCode.length && /[a-zA-Z0-9_]/.test(sourceCode[i + 1])) {
            identifier += sourceCode[++i];
            column++;
          }
          
          tokens.push({
            type: keywords.has(identifier) ? 'keyword' : 'identifier',
            value: identifier,
            line,
            column: startColumn
          });
          continue;
        }
  
        // Handle numbers
        if (/[0-9]/.test(char)) {
          let number = char;
          const startColumn = column;
          
          while (i + 1 < sourceCode.length && /[0-9.]/.test(sourceCode[i + 1])) {
            number += sourceCode[++i];
            column++;
          }
          tokens.push({ type: 'number', value: number, line, column: startColumn });
          continue;
        }

        // Handle strings
        if (char === '"' || char === "'") {
          let string = '';
          const quote = char;
          const startColumn = column;
          
          while (i + 1 < sourceCode.length && sourceCode[i + 1] !== quote) {
            string += sourceCode[++i];
            column++;
          }
          i++; // Skip closing quote
          tokens.push({ type: 'string', value: string, line, column: startColumn });
          continue;
        }
  
        // Handle operators and punctuation
        if (operators.has(char)) {
          tokens.push({ type: 'operator', value: char, line, column });
          continue;
        }
      }
  
      return tokens;
    } catch (error) {
      throw new CompilerError(
        `Lexical analysis failed: ${(error as Error).message}`,
        'lexical'
      );
    }
  }

  static semanticAnalysis(ast: ASTNode): { ast: ASTNode; symbolTable: Map<string, any> } {
    const symbolTable = new Map<string, any>();
    
    function analyze(node: ASTNode): void {
      if (node.type === 'VariableDeclaration') {
        if (Array.isArray(node.children) && node.children.length > 0) {
          const identifier = node.children[0];
          if (identifier.type === 'Identifier' && identifier.value) {
            if (symbolTable.has(identifier.value)) {
              throw new CompilerError(`Variable ${identifier.value} already declared`, 'semantic');
            }
            symbolTable.set(identifier.value, undefined);
            
            // If there's an initialization value, analyze it
            if (node.children.length > 1) {
              analyze(node.children[1]);
            }
          }
        }
      } else if (node.type === 'BinaryExpression') {
        if (!Array.isArray(node.children) || node.children.length !== 2) {
          throw new CompilerError('Invalid binary expression', 'semantic');
        }
        node.children.forEach(analyze);
      } else if (node.type === 'Identifier') {
        if (!node.value || !symbolTable.has(node.value)) {
          throw new CompilerError(`Undefined variable: ${node.value}`, 'semantic');
        }
      }
    }

    try {
      analyze(ast);
      return { ast, symbolTable };
    } catch (error) {
      throw new CompilerError(
        `Semantic analysis failed: ${(error as Error).message}`,
        'semantic'
      );
    }
  }

  static generateIntermediateCode(ast: ASTNode): string[] {
    const threeAddressCode: string[] = [];
    let tempCounter = 0;

    function generate(node: ASTNode): string {
      if (node.type === 'NumberLiteral') {
        return node.value || '0';
      }

      if (node.type === 'Identifier') {
        return node.value || '';
      }

      if (node.type === 'VariableDeclaration' && Array.isArray(node.children)) {
        const identifier = node.children[0];
        if (node.children.length > 1) {
          const value = generate(node.children[1]);
          threeAddressCode.push(`${identifier.value} = ${value}`);
        }
        return identifier.value || '';
      }

      if (node.type === 'BinaryExpression' && Array.isArray(node.children)) {
        const left = generate(node.children[0]);
        const right = generate(node.children[1]);
        const temp = `t${tempCounter++}`;
        threeAddressCode.push(`${temp} = ${left} ${node.value} ${right}`);
        return temp;
      }

      return '';
    }

    generate(ast);
    return threeAddressCode;
  }

  static optimize(intermediateCode: string[]): string[] {
    const optimized: string[] = [];
    const constants = new Map<string, string>();

    // Constant propagation and folding
    for (const line of intermediateCode) {
      const [result, operation] = line.split(' = ');
      
      // Skip no-op assignments
      if (result.trim() === operation?.trim()) {
        continue;
      }

      // Try to evaluate constant expressions
      if (operation) {
        const parts = operation.split(' ');
        if (parts.length === 3) {
          const [left, op, right] = parts;
          const leftVal = constants.get(left) || left;
          const rightVal = constants.get(right) || right;

          // If both operands are numbers, compute the result
          if (!isNaN(Number(leftVal)) && !isNaN(Number(rightVal))) {
            const value = eval(`${leftVal} ${op} ${rightVal}`);
            constants.set(result, value.toString());
            optimized.push(`${result} = ${value}`);
            continue;
          }
        } else if (!isNaN(Number(operation))) {
          // Store constant assignments for propagation
          constants.set(result, operation);
        }
      }

      // If no optimization was possible, keep the original instruction
      optimized.push(line);
    }

    return optimized;
  }

  static generateTargetCode(optimizedCode: string[]): string[] {
    const assembly: string[] = [];
    const registers = new Map<string, string>();
    let registerCounter = 0;

    function allocateRegister(variable: string): string {
      if (!registers.has(variable)) {
        registers.set(variable, `r${registerCounter++}`);
      }
      return registers.get(variable)!;
    }

    assembly.push('.text');
    assembly.push('main:');

    for (const line of optimizedCode) {
      const [result, operation] = line.split(' = ');
      if (!operation) continue;

      const parts = operation.split(' ');
      if (parts.length === 3) {
        const [left, op, right] = parts;
        const destReg = allocateRegister(result);
        const leftReg = allocateRegister(left);
        const rightReg = allocateRegister(right);

        // Load values if they're immediate numbers
        if (!isNaN(Number(left))) {
          assembly.push(`  MOV ${leftReg}, #${left}`);
        }
        if (!isNaN(Number(right))) {
          assembly.push(`  MOV ${rightReg}, #${right}`);
        }

        // Generate operation
        switch (op) {
          case '+': assembly.push(`  ADD ${destReg}, ${leftReg}, ${rightReg}`); break;
          case '-': assembly.push(`  SUB ${destReg}, ${leftReg}, ${rightReg}`); break;
          case '*': assembly.push(`  MUL ${destReg}, ${leftReg}, ${rightReg}`); break;
          case '/': assembly.push(`  DIV ${destReg}, ${leftReg}, ${rightReg}`); break;
        }
      } else {
        // Simple assignment
        const destReg = allocateRegister(result);
        if (!isNaN(Number(operation))) {
          assembly.push(`  MOV ${destReg}, #${operation}`);
        } else {
          const srcReg = allocateRegister(operation);
          assembly.push(`  MOV ${destReg}, ${srcReg}`);
        }
      }
    }

    assembly.push('  RET');
    return assembly;
  }
}