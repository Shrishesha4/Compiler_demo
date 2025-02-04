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
        case 'Program':
          // Add built-in functions to global scope
          symbolTable.set('console.log', {
            type: 'function',
            parameters: ['...args'],
            returnType: 'void'
          });
          node.children?.forEach(analyze);
          break;

        case 'FunctionDeclaration':
          if (node.value) {
            const functionName = node.value;
            const params = node.children?.filter(child => child.type === 'Parameter')
              .map(param => param.value) || [];
            
            // Add function to current scope
            const currentScope = scopes[scopes.length - 1];
            currentScope.set(functionName, {
              type: 'function',
              parameters: params,
              returnType: 'any'
            });

            // Create new scope for function body
            const functionScope = new Map();
            scopes.push(functionScope);
            
            // Add parameters to function scope
            params.forEach(param => {
              if (param) {
                functionScope.set(param, {
                  type: 'parameter',
                  dataType: 'any'
                });
              }
            });

            // Analyze function body
            node.children?.forEach(child => {
              if (child.type !== 'Parameter') {
                analyze(child);
              }
            });

            scopes.pop();
          }
          break;

        case 'VariableDeclaration':
          if (node.children?.[0]?.type === 'Identifier' && node.children[0].value) {
            const varName = node.children[0].value;
            const currentScope = scopes[scopes.length - 1];
            
            // Add variable to current scope with more information
            currentScope.set(varName, {
              type: 'variable',
              declarationType: node.value || 'let',
              dataType: node.children[1]?.type === 'NumberLiteral' ? 'number' :
                        node.children[1]?.type === 'StringLiteral' ? 'string' : 'any',
              initialized: node.children.length > 1
            });
          }
          break;

        case 'Block':
          // Create new scope for blocks (if statements, loops, etc.)
          const blockScope = new Map();
          scopes.push(blockScope);
          node.children?.forEach(analyze);
          scopes.pop();
          break;

        case 'Identifier':
          // Verify variable exists in any scope
          if (node.value) {
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

        default:
          node.children?.forEach(analyze);
          break;
      }
    }

    analyze(ast);
    return { ast, symbolTable };
}

  static generateIntermediateCode(ast: ASTNode): string[] {
    const threeAddressCode: string[] = [];
    let tempCounter = 0;
    let labelCounter = 0;

    function generate(node: ASTNode): string {
      if (!node) return '';

      switch (node.type) {
        case 'Program':
          node.children?.forEach(child => generate(child));
          return '';


          case 'Block': {
            node.children?.forEach(child => {
              generate(child);
            });
            return '';
          }
          
          case 'ReturnStatement': {
            if (node.children?.[0]) {
              const returnValue = generate(node.children[0]);
              threeAddressCode.push(`return ${returnValue}`);
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

        
        case 'FunctionDeclaration':
          if (node.value) {
            threeAddressCode.push(`function ${node.value}:`);
            // Handle parameters
            node.children?.forEach(child => {
              if (child.type === 'Parameter') {
                threeAddressCode.push(`param ${child.value}`);
              } else {
                generate(child);
              }
            });
          }
          return '';

        case 'ReturnStatement':
          if (node.children?.[0]) {
            const returnValue = generate(node.children[0]);
            threeAddressCode.push(`return ${returnValue}`);
          }
          return '';

        case 'FunctionCall':
          if (node.value) {
            const args = node.children?.map(arg => generate(arg)) || [];
            const temp = `t${tempCounter++}`;
            args.forEach((arg, i) => {
              threeAddressCode.push(`param ${arg}`);
            });
            threeAddressCode.push(`${temp} = call ${node.value}, ${args.length}`);
            return temp;
          }
          return '';

        case 'ExpressionStatement': {
          if (node.children?.[0]) {
            generate(node.children[0]);
          }
          return '';
        }
        
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
    const variables = new Map<string, string>();

    for (const line of intermediateCode) {
      // Keep function-related instructions unchanged
      if (line.startsWith('function') || line.startsWith('param') || 
          line.includes('call') || line.startsWith('return')) {
        optimized.push(line);
        continue;
      }

      // Handle assignments and expressions
      if (line.includes('=')) {
        const [result, operation] = line.split(' = ');
        const resultVar = result.trim();

        // Handle simple assignments (x = 5 or x = y)
        if (!operation.includes(' ')) {
          const value = operation.trim();
          if (!isNaN(Number(value))) {
            variables.set(resultVar, value);
            optimized.push(`${resultVar} = ${value}`);
          } else {
            // Check if we're assigning from a known variable
            const knownValue = variables.get(value);
            if (knownValue) {
              variables.set(resultVar, knownValue);
              optimized.push(`${resultVar} = ${knownValue}`);
            } else {
              optimized.push(line);
            }
          }
          continue;
        }

        // Handle arithmetic operations (t0 = x + y)
        const parts = operation.split(' ');
        if (parts.length === 3) {
          const [left, op, right] = parts.map(p => p.trim());
          const leftVal = variables.get(left) || left;
          const rightVal = variables.get(right) || right;

          // Try constant folding
          if (!isNaN(Number(leftVal)) && !isNaN(Number(rightVal))) {
            let value;
            switch (op) {
              case '+': value = Number(leftVal) + Number(rightVal); break;
              case '-': value = Number(leftVal) - Number(rightVal); break;
              case '*': value = Number(leftVal) * Number(rightVal); break;
              case '/': value = Number(leftVal) / Number(rightVal); break;
              default: value = null;
            }
            
            if (value !== null) {
              variables.set(resultVar, String(value));
              optimized.push(`${resultVar} = ${value}`);
              continue;
            }
          }

          // If no constant folding possible, try to use known variable values
          const newLeft = variables.get(left) || left;
          const newRight = variables.get(right) || right;
          if (newLeft !== left || newRight !== right) {
            optimized.push(`${resultVar} = ${newLeft} ${op} ${newRight}`);
          } else {
            optimized.push(line);
          }
          continue;
        }
      }

      // If no optimization was possible, keep the original instruction
      optimized.push(line);
    }

    // Remove duplicate assignments
    const finalOptimized: string[] = [];
    const seen = new Set<string>();

    for (const line of optimized) {
      if (line.includes('=')) {
        const [result, operation] = line.split(' = ');
        const key = `${result.trim()}=${operation.trim()}`;
        if (!seen.has(key)) {
          seen.add(key);
          finalOptimized.push(line);
        }
      } else {
        finalOptimized.push(line);
      }
    }

    return finalOptimized;
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
        const value = line.slice(6);
        targetCode.push(`  mov rdi, format_str`);
        targetCode.push(`  mov rsi, ${value}`);
        targetCode.push('  call printf');
        continue;
      }

      if (line.includes('call')) {
        // Handle function calls
        const [result, callInfo] = line.split(' = call ');
        const [func, argCount] = callInfo.split(', ');
        targetCode.push(`  call ${func}`);
        targetCode.push(`  mov ${result}, rax`);
        // Clean up stack after call
        if (parseInt(argCount) > 0) {
          targetCode.push(`  add rsp, ${parseInt(argCount) * 8}`);
        }
        continue;
      }

      if (line.startsWith('param ')) {
        // Parameter handling
        const param = line.slice(6);
        targetCode.push(`  push ${param}`);
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