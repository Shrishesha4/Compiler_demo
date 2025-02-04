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

    function parseProgram(): ASTNode {
      const program: ASTNode = {
        type: 'Program',
        children: []
      };
    
      while (current < tokens.length) {
        const statement = parseStatement();
        program.children?.push(statement);
      }
    
      return program;
    }

    function parseStatement(): ASTNode {
      const token = tokens[current];

      // Handle function declarations
      if (token.type === 'keyword' && token.value === 'function') {
        current++;
        const node: ASTNode = {
          type: 'FunctionDeclaration',
          children: []
        };

        // Function name
        if (tokens[current]?.type === 'identifier') {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError('Expected function name', 'syntax');
        }

        // Parameters
        if (tokens[current]?.value === '(') {
          current++;
          while (current < tokens.length && tokens[current].value !== ')') {
            if (tokens[current].type === 'identifier') {
              node.children?.push({
                type: 'Parameter',
                value: tokens[current].value
              });
            }
            current++;
            if (tokens[current]?.value === ',') current++;
          }
          if (tokens[current]?.value === ')') {
            current++;
          } else {
            throw new CompilerError('Expected closing parenthesis', 'syntax');
          }
        }

        // Function body
        if (tokens[current]?.value === '{') {
          node.children?.push(parseBlock());
        } else {
          throw new CompilerError('Expected function body', 'syntax');
        }

        return node;
      }

      // Handle if statements
      if (token.type === 'keyword' && token.value === 'if') {
        current++;
        const node: ASTNode = {
          type: 'IfStatement',
          children: []
        };

        if (tokens[current]?.value !== '(') {
          throw new CompilerError('Expected opening parenthesis after if', 'syntax');
        }
        current++;

        // Parse condition
        node.children?.push(parseExpression());

        if (tokens[current]?.value !== ')') {
          throw new CompilerError('Expected closing parenthesis', 'syntax');
        }
        current++;

        // Parse then branch
        node.children?.push(parseBlock());

        // Handle else
        if (current < tokens.length && tokens[current]?.type === 'keyword' && tokens[current].value === 'else') {
          current++;
          node.children?.push(parseBlock());
        }

        return node;
      }

      // Handle variable declarations
      if (token.type === 'keyword' && (token.value === 'let' || token.value === 'const' || token.value === 'var')) {
        current++;
        const node: ASTNode = {
          type: 'VariableDeclaration',
          value: token.value,
          children: []
        };

        if (tokens[current]?.type === 'identifier') {
          node.children?.push({
            type: 'Identifier',
            value: tokens[current].value
          });
          current++;

          if (tokens[current]?.value === '=') {
            current++;
            node.children?.push(parseExpression());
          }

          if (tokens[current]?.value === ';') {
            current++;
          }

          return node;
        }
        throw new CompilerError('Expected identifier after variable declaration', 'syntax');
      }

      // Handle return statements
      if (token.type === 'keyword' && token.value === 'return') {
        current++;
        const node: ASTNode = {
          type: 'ReturnStatement',
          children: []
        };

        // Parse return expression if exists
        if (current < tokens.length && tokens[current].value !== ';') {
          node.children?.push(parseExpression());
        }

        // Skip semicolon if present
        if (current < tokens.length && tokens[current].value === ';') {
          current++;
        }

        return node;
      }

      return parseExpression();
    }

    // Update parseBlock to handle semicolons properly
    function parseBlock(): ASTNode {
      if (tokens[current]?.value !== '{') {
        throw new CompilerError('Expected opening brace', 'syntax');
      }
      current++;

      const node: ASTNode = {
        type: 'Block',
        children: []
      };

      while (current < tokens.length && tokens[current].value !== '}') {
        // Skip any extra semicolons
        while (current < tokens.length && tokens[current].value === ';') {
          current++;
        }
        
        if (tokens[current].value === '}') break;
        
        node.children?.push(parseStatement());
        
        // Optional semicolon after statement
        if (current < tokens.length && tokens[current].value === ';') {
          current++;
        }
      }

      if (tokens[current]?.value !== '}') {
        throw new CompilerError('Expected closing brace', 'syntax');
      }
      current++;

      return node;
    }

    function walk(): ASTNode {
      if (current >= tokens.length) {
        throw new CompilerError('Unexpected end of input', 'syntax');
      }
    
      const token = tokens[current];
    
      // Handle blocks
      if (token.value === '{') {
        current++;
        const node: ASTNode = {
          type: 'Block',
          children: []
        };
    
        while (current < tokens.length && tokens[current].value !== '}') {
          node.children?.push(walk());
        }
        current++; // Skip closing brace
        return node;
      }
    
      // Handle if statements
      if (token.type === 'keyword' && token.value === 'if') {
        current++;
        const node: ASTNode = {
          type: 'IfStatement',
          children: []
        };
    
        // Parse condition
        if (tokens[current].value === '(') {
          current++;
          node.children?.push(parseExpression());
          if (tokens[current].value === ')') {
            current++;
          }
        }
    
        // Parse body
        node.children?.push(walk());
    
        // Handle else
        if (current < tokens.length && tokens[current].type === 'keyword' && tokens[current].value === 'else') {
          current++;
          node.children?.push(walk());
        }
    
        return node;
      }
    
      // Handle function declarations
      if (token.type === 'keyword' && token.value === 'function') {
        current++;
        const node: ASTNode = {
          type: 'FunctionDeclaration',
          children: []
        };
    
        // Function name
        if (current < tokens.length && tokens[current].type === 'identifier') {
          node.value = tokens[current].value;
          current++;
        }
    
        // Parameters
        if (tokens[current].value === '(') {
          current++;
          while (current < tokens.length && tokens[current].value !== ')') {
            if (tokens[current].type === 'identifier') {
              node.children?.push({
                type: 'Parameter',
                value: tokens[current].value
              });
            }
            current++;
            if (tokens[current].value === ',') current++;
          }
          current++; // Skip closing parenthesis
        }
    
        // Function body
        if (tokens[current].value === '{') {
          node.children?.push(walk());
        }
    
        return node;
      }
    
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

    function isOperator(value: string): boolean {
      const operators = [
        '+', '-', '*', '/', 
        '<', '>', '<=', '>=', 
        '=', '==', '===',
        '!=', '!==',
        '+=', '-=', '*=', '/='
      ];
      return operators.includes(value);
    }

    function parsePrimary(): ASTNode {
      const token = tokens[current];

      // Handle function calls
      if (token.type === 'identifier') {
        current++;
        
        // Check if it's a function call
        if (current < tokens.length && tokens[current]?.value === '(') {
          current++; // Skip opening parenthesis
          const args: ASTNode[] = [];
          
          while (current < tokens.length && tokens[current].value !== ')') {
            args.push(parseExpression());
            if (tokens[current]?.value === ',') {
              current++; // Skip comma
            }
          }
    
          if (current >= tokens.length || tokens[current].value !== ')') {
            throw new CompilerError('Expected closing parenthesis in function call', 'syntax');
          }
          current++; // Skip closing parenthesis
    
          return {
            type: 'FunctionCall',
            value: token.value,
            children: args
          };
        }
    
        // If not a function call, it's a regular identifier
        return { type: 'Identifier', value: token.value };
      }

      // Handle numbers
      if (token.type === 'number') {
        current++;
        return { type: 'NumberLiteral', value: token.value };
      }

      // Handle parentheses
      if (token.value === '(') {
        current++;
        const expr = parseExpression();
        if (current >= tokens.length || tokens[current].value !== ')') {
          throw new CompilerError('Expected closing parenthesis', 'syntax');
        }
        current++; // Skip closing parenthesis
        return expr;
      }

      throw new CompilerError(`Unexpected token: ${token.value}`, 'syntax', token.line, token.column);
    }

    try {
      // Change this line to use parseProgram instead of walk
      return parseProgram();
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
      const keywords = new Set([
        'let', 'const', 'var', 'if', 'else', 'while', 'for', 'function', 
        'return', 'class', 'extends', 'new', 'this', 'super'
      ]);
      const operators = new Set([
        '+', '-', '*', '/', '=', '<', '>', '!', '&', '|', '(', ')', '{', '}', '[', ']',
        ';', ',', '.', '+=', '-=', '*=', '/=', '==', '===', '!=', '!==', '>=', '<='
      ]);

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
          let op = char;
          // Check for multi-character operators
          if (i + 1 < sourceCode.length) {
            const nextChar = sourceCode[i + 1];
            const combined = char + nextChar;
            if (operators.has(combined)) {
              op = combined;
              i++;
              column++;
            }
          }
          tokens.push({ type: 'operator', value: op, line, column });
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
    const scopes: Map<string, any>[] = [symbolTable];
    
    function analyze(node: ASTNode): void {
      switch (node.type) {
        case 'Block':
          scopes.push(new Map());
          node.children?.forEach(analyze);
          scopes.pop();
          break;
    
        case 'FunctionDeclaration':
          if (node.value) {
            // Check if function is already declared in current scope
            if (scopes[0].has(node.value)) {
              throw new CompilerError(`Function ${node.value} is already declared`, 'semantic');
            }
            
            const params: string[] = [];
            scopes[0].set(node.value, { type: 'function', parameters: params });
            
            // Create new scope for function body
            scopes.push(new Map());
            node.children?.forEach(child => {
              if (child.type === 'Parameter') {
                if (child.value) {
                  if (scopes[scopes.length - 1].has(child.value)) {
                    throw new CompilerError(`Duplicate parameter ${child.value}`, 'semantic');
                  }
                  params.push(child.value);
                  scopes[scopes.length - 1].set(child.value, { type: 'parameter' });
                }
              } else {
                analyze(child);
              }
            });
            scopes.pop();
          }
          break;
    
        case 'IfStatement':
          // Analyze condition
          if (node.children?.[0]) {
            analyze(node.children[0]);
          }
          // Analyze then branch
          if (node.children?.[1]) {
            analyze(node.children[1]);
          }
          // Analyze else branch if exists
          if (node.children?.[2]) {
            analyze(node.children[2]);
          }
          break;
    
        case 'VariableDeclaration':
          if (Array.isArray(node.children) && node.children.length > 0) {
            const identifier = node.children[0];
            if (identifier.type === 'Identifier' && identifier.value) {
              // Check in current scope only
              if (scopes[scopes.length - 1].has(identifier.value)) {
                throw new CompilerError(`Variable ${identifier.value} already declared in current scope`, 'semantic');
              }
              scopes[scopes.length - 1].set(identifier.value, { 
                type: 'variable',
                declarationType: node.value 
              });
              
              if (node.children.length > 1) {
                analyze(node.children[1]);
              }
            }
          }
          break;
    
        case 'BinaryExpression':
          if (!Array.isArray(node.children) || node.children.length !== 2) {
            throw new CompilerError('Invalid binary expression', 'semantic');
          }
          node.children.forEach(analyze);
          break;
    
        case 'Identifier':
          if (node.value) {
            // Look for variable in all scopes from inner to outer
            let found = false;
            for (let i = scopes.length - 1; i >= 0; i--) {
              if (scopes[i].has(node.value)) {
                found = true;
                break;
              }
            }
            if (!found) {
              throw new CompilerError(`Undefined variable: ${node.value}`, 'semantic');
            }
          }
          break;
      }
    }
    
    try {
      analyze(ast);
      return { ast, symbolTable: scopes[0] };
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
    let labelCounter = 0;

    function generate(node: ASTNode): string {
      if (!node) return '';

      switch (node.type) {
        case 'Block':
          if (node.children) {
            for (const child of node.children) {
              generate(child);
            }
          }
          return '';

        case 'VariableDeclaration': {
          if (Array.isArray(node.children) && node.children.length > 0) {
            const identifier = node.children[0];
            if (node.children.length > 1) {
              const value = generate(node.children[1]);
              threeAddressCode.push(`${identifier.value} = ${value}`);
            }
          }
          return '';
        }

        case 'BinaryExpression': {
          if (Array.isArray(node.children) && node.children.length === 2 && node.value) {
            const left = generate(node.children[0]);
            const right = generate(node.children[1]);
            const temp = `t${tempCounter++}`;
            threeAddressCode.push(`${temp} = ${left} ${node.value} ${right}`);
            return temp;
          }
          return '';
        }

        case 'IfStatement': {
          const condition = node.children?.[0];
          const thenBranch = node.children?.[1];
          
          const labelTrue = `L${labelCounter++}`;
          const labelEnd = `L${labelCounter++}`;

          if (condition) {
            const conditionResult = generate(condition);
            threeAddressCode.push(`if ${conditionResult} goto ${labelTrue}`);
            threeAddressCode.push(`goto ${labelEnd}`);
            threeAddressCode.push(`${labelTrue}:`);
            
            if (thenBranch) {
              generate(thenBranch);
            }
            
            threeAddressCode.push(`${labelEnd}:`);
          }
          return '';
        }

        case 'AssignmentExpression': {
          if (Array.isArray(node.children) && node.children.length === 2 && node.value) {
            const right = generate(node.children[1]);
            const left = node.children[0].value || '';
            if (node.value === '=') {
              threeAddressCode.push(`${left} = ${right}`);
            } else {
              const op = node.value.charAt(0);
              const temp = `t${tempCounter++}`;
              threeAddressCode.push(`${temp} = ${left} ${op} ${right}`);
              threeAddressCode.push(`${left} = ${temp}`);
            }
            return left;
          }
          return '';
        }

        case 'NumberLiteral':
          return node.value || '0';

        case 'Identifier':
          return node.value || '';

        default:
          return '';
      }
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

  static generateTargetCode(intermediateCode: string[]): string[] {
    const targetCode: string[] = [];
    let currentFunction: string | null = null;

    for (const line of intermediateCode) {
      if (line.startsWith('function ')) {
        // Function declaration
        currentFunction = line.slice(9, -1);
        targetCode.push(`${currentFunction}:`);
        targetCode.push('  push rbp');
        targetCode.push('  mov rbp, rsp');
        continue;
      }

      if (line.startsWith('param ')) {
        // Parameter handling
        const param = line.slice(6);
        targetCode.push(`  mov ${param}, [rbp + ${targetCode.length * 8}]`);
        continue;
      }

      if (line.startsWith('return ')) {
        // Return value handling
        const returnValue = line.slice(7);
        if (returnValue) {
          targetCode.push(`  mov rax, ${returnValue}`);
        }
        targetCode.push('  mov rsp, rbp');
        targetCode.push('  pop rbp');
        targetCode.push('  ret');
        continue;
      }

      if (line.endsWith(':')) {
        // Function or label definition
        if (line.startsWith('func_')) {
          currentFunction = line.slice(5, -1);
          targetCode.push(`${line}`);
          targetCode.push('  push rbp');
          targetCode.push('  mov rbp, rsp');
        } else {
          // Regular label
          targetCode.push(line);
        }
        continue;
      }

      if (line === 'return') {
        targetCode.push('  mov rsp, rbp');
        targetCode.push('  pop rbp');
        targetCode.push('  ret');
        currentFunction = null;
        continue;
      }

      // Handle conditional jumps
      if (line.startsWith('if ')) {
        const condition = line.slice(3, line.indexOf(' goto'));
        const label = line.slice(line.indexOf('goto ') + 5);
        targetCode.push(`  cmp ${condition}, 0`);
        targetCode.push(`  jne ${label}`);
        continue;
      }

      if (line.startsWith('goto ')) {
        const label = line.slice(5);
        targetCode.push(`  jmp ${label}`);
        continue;
      }

      // Handle regular instructions
      if (line.includes('=')) {
        const [dest, src] = line.split(' = ');
        if (src.includes(' ')) {
          // Binary operation
          const [left, op, right] = src.split(' ');
          targetCode.push(`  mov rax, ${left}`);
          switch (op) {
            case '+': targetCode.push(`  add rax, ${right}`); break;
            case '-': targetCode.push(`  sub rax, ${right}`); break;
            case '*': targetCode.push(`  imul rax, ${right}`); break;
            case '/': 
              targetCode.push('  xor rdx, rdx');
              targetCode.push(`  div ${right}`);
              break;
          }
          targetCode.push(`  mov ${dest}, rax`);
        } else {
          // Simple assignment
          targetCode.push(`  mov ${dest}, ${src}`);
        }
      }
    }

    return targetCode;
  }
  
  
}