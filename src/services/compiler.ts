export interface Token {
  type: string;
  value: string;
  line: number;
  column: number;
}

export interface SymbolTableEntry {
  type: "function" | "variable" | "parameter";
  parameters?: string[];
  returnType?: string;
  declarationType?: string;
  dataType?: string;
  initialized?: boolean;
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
    this.name = "CompilerError";
  }
}

export class CompilerService {
  static syntaxAnalysis(tokens: Token[]): ASTNode {
    if (tokens.length === 0) {
      throw new CompilerError("No tokens to parse", "syntax");
    }

    let current = 0;

    function parseProgram(): ASTNode {
      const program: ASTNode = {
        type: "Program",
        children: [],
      };

      while (current < tokens.length) {
        const statement = parseStatement();
        program.children?.push(statement);
      }

      return program;
    }

    function parseMethod(methodName: string): ASTNode {
      const node: ASTNode = {
        type: "MethodDeclaration",
        value: methodName,
        children: [],
      };

      // Parse parameters
      if (tokens[current]?.value === "(") {
        current++; // Skip opening parenthesis
        while (current < tokens.length && tokens[current].value !== ")") {
          if (tokens[current].type === "identifier") {
            node.children?.push({
              type: "Parameter",
              value: tokens[current].value,
            });
          }
          current++;
          if (tokens[current]?.value === ",") current++;
        }
        if (tokens[current]?.value === ")") {
          current++; // Skip closing parenthesis
        } else {
          throw new CompilerError("Expected closing parenthesis", "syntax");
        }
      }

      // Parse method body
      if (tokens[current]?.value === "{") {
        node.children?.push(parseBlock());
      } else {
        throw new CompilerError("Expected method body", "syntax");
      }

      return node;
    }

    function parseStatement(): ASTNode {
      const token = tokens[current];

      // Handle class declarations
      if (token.type === "keyword" && token.value === "class") {
        current++; // Skip 'class' keyword
        const node: ASTNode = {
          type: "ClassDeclaration",
          children: [],
        };

        // Class name
        if (tokens[current]?.type === "identifier") {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError("Expected class name", "syntax", token.line, token.column);
        }

        // Class body
        if (tokens[current]?.value === "{") {
          current++; // Skip opening brace
          
          while (current < tokens.length && tokens[current].value !== "}") {
            // Skip any extra whitespace or newlines
            while (current < tokens.length && tokens[current].value === ";") {
              current++;
            }

            // Parse class members (methods and properties)
            if (tokens[current]?.value === "constructor") {
              current++; // Skip constructor keyword
              const constructor = parseMethod("constructor");
              node.children?.push(constructor);
            } else if (tokens[current]?.type === "identifier") {
              const methodName = tokens[current].value;
              current++; // Skip method name
              const method = parseMethod(methodName);
              node.children?.push(method);
            }
          }

          if (tokens[current]?.value === "}") {
            current++; // Skip closing brace
          } else {
            throw new CompilerError("Expected closing brace for class", "syntax", token.line, token.column);
          }
        } else {
          throw new CompilerError("Expected opening brace for class", "syntax", token.line, token.column);
        }

        return node;
      }

      // Handle variable declarations (for 'const calc = new Calculator()')
      if (token.type === "keyword" && (token.value === "const" || token.value === "let" || token.value === "var")) {
        current++;
        const node: ASTNode = {
          type: "VariableDeclaration",
          value: token.value,
          children: [],
        };

        if (tokens[current]?.type === "identifier") {
          node.children?.push({
            type: "Identifier",
            value: tokens[current].value,
          });
          current++;

          if (tokens[current]?.value === "=") {
            current++;
            node.children?.push(parseExpression());
          }

          if (tokens[current]?.value === ";") {
            current++;
          }

          return node;
        }
      }


      // Handle method calls with dot notation
      if (token.type === "identifier") {
        const left = parseExpression();
        
        if (tokens[current]?.value === ".") {
          current++; // Skip dot
          if (tokens[current]?.type === "identifier") {
            const methodName = tokens[current].value;
            current++; // Skip method name
            
            if (tokens[current]?.value === "(") {
              current++; // Skip opening parenthesis
              const args: ASTNode[] = [];
              
              while (current < tokens.length && tokens[current].value !== ")") {
                args.push(parseExpression());
                if (tokens[current]?.value === ",") {
                  current++; // Skip comma
                }
              }
              
              if (tokens[current]?.value === ")") {
                current++; // Skip closing parenthesis
                return {
                  type: "MethodCall",
                  value: methodName,
                  children: [left, ...args],
                };
              }
            }
          }
        }
        return left;
      }

      if (token.type === "keyword" && token.value === "new") {
        current++; // Skip 'new' keyword
        
        // Get constructor name
        if (tokens[current]?.type === "identifier") {
          const className = tokens[current].value;
          current++; // Skip class name
          
          // Handle constructor arguments
          if (tokens[current]?.value === "(") {
            current++; // Skip opening parenthesis
            const args: ASTNode[] = [];
            
            while (current < tokens.length && tokens[current].value !== ")") {
              args.push(parseExpression());
              if (tokens[current]?.value === ",") {
                current++; // Skip comma
              }
            }
            
            if (tokens[current]?.value === ")") {
              current++; // Skip closing parenthesis
              return {
                type: "NewExpression",
                value: className,
                children: args
              };
            }
          }
          throw new CompilerError("Expected constructor call", "syntax", token.line, token.column);
        }
        throw new CompilerError("Expected class name after new keyword", "syntax", token.line, token.column);
      }

      if (token.type === 'keyword' && token.value === 'class') {
        current++; // Skip 'class' keyword
        const node: ASTNode = {
          type: 'ClassDeclaration',
          children: []
        };
      
        // Class name
        if (tokens[current]?.type === 'identifier') {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError('Expected class name', 'syntax', token.line, token.column);
        }
      
        // Class body
        if (tokens[current]?.value === '{') {
          current++; // Skip opening brace
          
          while (current < tokens.length && tokens[current].value !== '}') {
            // Parse class members (methods and properties)
            if (tokens[current].value === 'constructor') {
              const methodName = tokens[current].value;
              current++; // Skip constructor keyword
              const method = parseMethod(methodName);
              node.children?.push(method);
            } else if (tokens[current].type === 'identifier') {
              const methodName = tokens[current].value;
              current++; // Skip method name
              const method = parseMethod(methodName);
              node.children?.push(method);
            }
          }
      
          if (tokens[current]?.value === '}') {
            current++; // Skip closing brace
          } else {
            throw new CompilerError('Expected closing brace for class', 'syntax', token.line, token.column);
          }
        } else {
          throw new CompilerError('Expected opening brace for class', 'syntax', token.line, token.column);
        }
      
        return node;
      }

      // Add array literal support
      if (token.value === "[") {
        current++;
        const elements: ASTNode[] = [];

        while (current < tokens.length && tokens[current].value !== "]") {
          elements.push(parseExpression());
          if (tokens[current]?.value === ",") {
            current++;
          }
        }

        if (tokens[current]?.value !== "]") {
          throw new CompilerError(
            "Expected closing bracket for array",
            "syntax"
          );
        }
        current++;

        return {
          type: "ArrayLiteral",
          children: elements,
        };
      }

      // Add support for method calls (like .map)
      if (token.value === ".") {
        current++;
        if (tokens[current]?.type === "identifier") {
          const methodName = tokens[current].value;
          current++;

          // Handle arrow function
          if (tokens[current]?.value === "=>") {
            current++;
            return {
              type: "ArrowFunction",
              value: methodName,
              children: [parseExpression()],
            };
          }

          return {
            type: "MethodCall",
            value: methodName,
            children: [],
          };
        }
      }

      // Handle function declarations
      if (token.type === "keyword" && token.value === "function") {
        current++;
        const node: ASTNode = {
          type: "FunctionDeclaration",
          children: [],
        };

        // Function name
        if (tokens[current]?.type === "identifier") {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError("Expected function name", "syntax");
        }

        // Parameters
        if (tokens[current]?.value === "(") {
          current++;
          while (current < tokens.length && tokens[current].value !== ")") {
            if (tokens[current].type === "identifier") {
              node.children?.push({
                type: "Parameter",
                value: tokens[current].value,
              });
            }
            current++;
            if (tokens[current]?.value === ",") current++;
          }
          if (tokens[current]?.value === ")") {
            current++;
          } else {
            throw new CompilerError("Expected closing parenthesis", "syntax");
          }
        }

        // Function body
        if (tokens[current]?.value === "{") {
          node.children?.push(parseBlock());
        } else {
          throw new CompilerError("Expected function body", "syntax");
        }

        return node;
      }

      // Handle if statements
      if (token.type === "keyword" && token.value === "if") {
        current++;
        const node: ASTNode = {
          type: "IfStatement",
          children: [],
        };

        if (tokens[current]?.value !== "(") {
          throw new CompilerError(
            "Expected opening parenthesis after if",
            "syntax"
          );
        }
        current++;

        // Parse condition
        node.children?.push(parseExpression());

        if (tokens[current]?.value !== ")") {
          throw new CompilerError("Expected closing parenthesis", "syntax");
        }
        current++;

        // Parse then branch
        node.children?.push(parseBlock());

        // Handle else
        if (
          current < tokens.length &&
          tokens[current]?.type === "keyword" &&
          tokens[current].value === "else"
        ) {
          current++;
          node.children?.push(parseBlock());
        }

        return node;
      }

      // Handle variable declarations
      if (
        token.type === "keyword" &&
        (token.value === "let" ||
          token.value === "const" ||
          token.value === "var")
      ) {
        current++;
        const node: ASTNode = {
          type: "VariableDeclaration",
          value: token.value,
          children: [],
        };

        if (tokens[current]?.type === "identifier") {
          node.children?.push({
            type: "Identifier",
            value: tokens[current].value,
          });
          current++;

          if (tokens[current]?.value === "=") {
            current++;
            node.children?.push(parseExpression());
          }

          if (tokens[current]?.value === ";") {
            current++;
          }

          return node;
        }
        throw new CompilerError(
          "Expected identifier after variable declaration",
          "syntax"
        );
      }

      // Handle return statements
      if (token.type === "keyword" && token.value === "return") {
        current++;
        const node: ASTNode = {
          type: "ReturnStatement",
          children: [],
        };

        // Parse return expression if exists
        if (current < tokens.length && tokens[current].value !== ";") {
          node.children?.push(parseExpression());
        }

        // Skip semicolon if present
        if (current < tokens.length && tokens[current].value === ";") {
          current++;
        }

        return node;
      }

      return parseExpression();
    }

    // Update parseBlock to handle semicolons properly
    function parseBlock(): ASTNode {
      if (tokens[current]?.value !== "{") {
        throw new CompilerError("Expected opening brace", "syntax");
      }
      current++;

      const node: ASTNode = {
        type: "Block",
        children: [],
      };

      while (current < tokens.length && tokens[current].value !== "}") {
        // Skip any extra semicolons
        while (current < tokens.length && tokens[current].value === ";") {
          current++;
        }

        if (tokens[current].value === "}") break;

        node.children?.push(parseStatement());

        // Optional semicolon after statement
        if (current < tokens.length && tokens[current].value === ";") {
          current++;
        }
      }

      if (tokens[current]?.value !== "}") {
        throw new CompilerError("Expected closing brace", "syntax");
      }
      current++;

      return node;
    }

    function parseExpression(): ASTNode {
      let left = parsePrimary();

      while (current < tokens.length) {
        if (tokens[current]?.value === ".") {
          current++; // Skip the dot
          if (tokens[current]?.type === "identifier") {
            const methodName = tokens[current].value;
            current++; // Skip the method name

            if (tokens[current]?.value === "(") {
              current++; // Skip opening parenthesis
              const args: ASTNode[] = [];
              const startToken = tokens[current - 1]; // Store reference to opening parenthesis token

              while (current < tokens.length && tokens[current].value !== ")") {
                // Handle arrow function as parameter
                if (
                  tokens[current].type === "identifier" &&
                  tokens[current + 1]?.value === "=>"
                ) {
                  const paramName = tokens[current].value;
                  current += 2; // Skip identifier and arrow
                  const body = parseExpression();
                  args.push({
                    type: "ArrowFunction",
                    value: paramName,
                    children: [body],
                  });
                } else {
                  args.push(parseExpression());
                }

                if (tokens[current]?.value === ",") {
                  current++; // Skip comma
                }
              }

              if (tokens[current]?.value !== ")") {
                throw new CompilerError(
                  "Expected closing parenthesis",
                  "syntax",
                  startToken.line,
                  startToken.column
                );
              }
              current++; // Skip closing parenthesis

              left = {
                type: "MethodCall",
                value: methodName,
                children: [left, ...args],
              };
              continue;
            }
          }
        }

        // Handle operators
        if (isOperator(tokens[current]?.value)) {
          const operator = tokens[current].value;
          current++;
          const right = parsePrimary();
          left = {
            type: "BinaryExpression",
            value: operator,
            children: [left, right],
          };
          continue;
        }

        break;
      }

      while (current < tokens.length && isOperator(tokens[current].value)) {
        const operator = tokens[current].value;
        current++;
        const right = parsePrimary();
        left = {
          type: "BinaryExpression",
          value: operator,
          children: [left, right],
        };
      }

      if (tokens[current]?.value === ".") {
        current++;
        const right = tokens[current];
        if (right?.type === "identifier") {
          current++;
          const node: ASTNode = {
            type: "MemberExpression",
            value: ".",
            children: [left, { type: "Identifier", value: right.value }],
          };
          left = node;
        } else {
          throw new CompilerError("Expected identifier after dot", "syntax");
        }
      }

      return left;
    }

    function isOperator(value: string): boolean {
      const operators = [
        "+",
        "-",
        "*",
        "/",
        "<",
        ">",
        "<=",
        ">=",
        "=",
        "==",
        "===",
        "!=",
        "!==",
        "+=",
        "-=",
        "*=",
        "/=",
        "=>",
      ];
      return operators.includes(value);
    }

    function parsePrimary(): ASTNode {
      const token = tokens[current];

      // Handle function declarations
      if (token.type === "keyword" && token.value === "function") {
        current++;
        const node: ASTNode = {
          type: "FunctionDeclaration",
          children: [],
        };

        // Function name
        if (tokens[current]?.type === "identifier") {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError("Expected function name", "syntax");
        }

        // Parameters
        if (tokens[current]?.value === "(") {
          current++;
          while (current < tokens.length && tokens[current].value !== ")") {
            if (tokens[current].type === "identifier") {
              node.children?.push({
                type: "Parameter",
                value: tokens[current].value,
              });
            }
            current++;
            if (tokens[current]?.value === ",") current++;
          }
          if (tokens[current]?.value === ")") {
            current++;
          } else {
            throw new CompilerError("Expected closing parenthesis", "syntax");
          }
        }

        // Function body - handle both single-line and block-style
        if (tokens[current]?.value === "{") {
          node.children?.push(parseBlock());
        } else {
          // Create an implicit block for single-line functions
          const bodyNode: ASTNode = {
            type: "Block",
            children: [],
          };

          // Parse the single statement
          const statement = parseStatement();
          bodyNode.children?.push(statement);

          node.children?.push(bodyNode);
        }

        return node;
      }

      // Handle function calls
      if (token.type === "identifier") {
        current++;

        if (tokens[current]?.value === "(") {
          current++;
          const args: ASTNode[] = [];

          while (current < tokens.length && tokens[current].value !== ")") {
            args.push(parseExpression());
            if (tokens[current]?.value === ",") {
              current++;
            }
          }

          if (tokens[current]?.value === ")") {
            current++;
            return {
              type: "FunctionCall",
              value: token.value,
              children: args,
            };
          }
          throw new CompilerError(
            "Expected closing parenthesis in function call",
            "syntax",
            token.line,
            token.column
          );
        }

        // If not a function call, return as identifier
        return { type: "Identifier", value: token.value };
      }
      
      // Handle curly braces (object literals or blocks)
      if (token.value === "{") {
        // Check if it's an object literal
        const peek = tokens[current + 1];
        if (peek?.type === "identifier" && tokens[current + 2]?.value === ":") {
          current++; // Skip opening brace
          const properties: ASTNode[] = [];

          while (current < tokens.length && tokens[current].value !== "}") {
            if (tokens[current].type === "identifier") {
              const key = tokens[current].value;
              current++; // Skip key
              
              if (tokens[current]?.value !== ":") {
                throw new CompilerError("Expected ':' after object key", "syntax", token.line, token.column);
              }
              current++; // Skip colon
              
              const value = parseExpression();
              properties.push({
                type: "Property",
                value: key,
                children: [value]
              });

              if (tokens[current]?.value === ",") {
                current++; // Skip comma
              }
            }
          }

          if (tokens[current]?.value !== "}") {
            throw new CompilerError("Expected closing brace for object", "syntax", token.line, token.column);
          }
          current++; // Skip closing brace

          return {
            type: "ObjectLiteral",
            children: properties
          };
        } else {
          // It's a block expression
          return parseBlock();
        }
      }

      // Handle arrow functions
      if (token.type === "identifier" && tokens[current + 1]?.value === "=>") {
        const paramName = token.value;
        current += 2; // Skip identifier and arrow
        
        // Parse arrow function body
        const body = parseExpression();
        
        return {
          type: "ArrowFunction",
          value: paramName,
          children: [body]
        };
      }

      // Handle semicolons
      if (token.value === ";") {
        current++; // Skip semicolon
        return {
          type: "EmptyStatement"
        };
      }
      // Handle identifiers
      if (token.type === "identifier") {
        current++;
        return { type: "Identifier", value: token.value };
      }

      // Handle semicolons
      if (token.value === ";") {
        current++; // Skip semicolon
        return {
          type: "EmptyStatement"
        };
      }

      // Handle numbers
      if (token.type === "number") {
        current++;
        return { type: "NumberLiteral", value: token.value };
      }

      if (token.type === "keyword" && token.value === "this") {
        current++;
        return {
          type: "ThisExpression",
          value: "this",
        };
      }

      if (token.type === "keyword" && token.value === "new") {
        current++; // Skip 'new' keyword
        
        // Get constructor name
        if (tokens[current]?.type === "identifier") {
          const className = tokens[current].value;
          current++; // Skip class name
          
          // Handle constructor arguments
          if (tokens[current]?.value === "(") {
            current++; // Skip opening parenthesis
            const args: ASTNode[] = [];
            
            while (current < tokens.length && tokens[current].value !== ")") {
              args.push(parseExpression());
              if (tokens[current]?.value === ",") {
                current++; // Skip comma
              }
            }
            
            if (tokens[current]?.value === ")") {
              current++; // Skip closing parenthesis
              return {
                type: "NewExpression",
                value: className,
                children: args
              };
            }
          }
          throw new CompilerError("Expected constructor call", "syntax", token.line, token.column);
        }
        throw new CompilerError("Expected class name after new keyword", "syntax", token.line, token.column);
      }

      if (token.type === "keyword" && token.value === "class") {
        current++; // Skip 'class' keyword
        const node: ASTNode = {
          type: "ClassDeclaration",
          children: [],
        };

        

        // Class name
        if (tokens[current]?.type === "identifier") {
          node.value = tokens[current].value;
          current++;
        } else {
          throw new CompilerError(
            "Expected class name",
            "syntax",
            token.line,
            token.column
          );
        }

        // Class body
        if (tokens[current]?.value === "{") {
          current++; // Skip opening brace

          while (current < tokens.length && tokens[current].value !== "}") {
            // Parse class members (methods and properties)
            if (tokens[current].value === "constructor") {
              current++; // Skip constructor keyword
              const method = parseMethod("constructor");
              node.children?.push(method);
            } else if (tokens[current].type === "identifier") {
              const methodName = tokens[current].value;
              current++; // Skip method name
              const method = parseMethod(methodName);
              node.children?.push(method);
            }
          }

          if (tokens[current]?.value === "}") {
            current++; // Skip closing brace
          } else {
            throw new CompilerError(
              "Expected closing brace for class",
              "syntax",
              token.line,
              token.column
            );
          }
        } else {
          throw new CompilerError(
            "Expected opening brace for class",
            "syntax",
            token.line,
            token.column
          );
        }

        return node;
      }

      // Handle function calls
      if (token.type === "identifier") {
        current++;

        // Check if it's a function call
        if (current < tokens.length && tokens[current]?.value === "(") {
          current++; // Skip opening parenthesis
          const args: ASTNode[] = [];

          while (current < tokens.length && tokens[current].value !== ")") {
            args.push(parseExpression());
            if (tokens[current]?.value === ",") {
              current++; // Skip comma
            }
          }

          if (current >= tokens.length || tokens[current].value !== ")") {
            throw new CompilerError(
              "Expected closing parenthesis in function call",
              "syntax"
            );
          }
          current++; // Skip closing parenthesis

          return {
            type: "FunctionCall",
            value: token.value,
            children: args,
          };
        }

        // If not a function call, it's a regular identifier
        return { type: "Identifier", value: token.value };
      }

      // Handle numbers
      if (token.type === "number") {
        current++;
        return { type: "NumberLiteral", value: token.value };
      }

      // Handle parentheses
      if (token.value === "(") {
        current++;
        const expr = parseExpression();
        if (current >= tokens.length || tokens[current].value !== ")") {
          throw new CompilerError("Expected closing parenthesis", "syntax");
        }
        current++; // Skip closing parenthesis
        return expr;
      }

      if (token.value === "[") {
        current++; // Skip opening bracket
        const elements: ASTNode[] = [];

        while (current < tokens.length && tokens[current].value !== "]") {
          elements.push(parseExpression());
          if (tokens[current]?.value === ",") {
            current++; // Skip comma
          }
        }

        if (tokens[current]?.value !== "]") {
          throw new CompilerError(
            "Expected closing bracket for array",
            "syntax",
            token.line,
            token.column
          );
        }
        current++; // Skip closing bracket

        return {
          type: "ArrayLiteral",
          children: elements,
        };
      }

      if (token.value === ".") {
        current++;
        if (tokens[current]?.type === "identifier") {
          const methodName = tokens[current].value;
          current++;

          // Handle method call with parameters
          if (tokens[current]?.value === "(") {
            current++; // Skip opening parenthesis
            const args: ASTNode[] = [];

            while (current < tokens.length && tokens[current].value !== ")") {
              if (tokens[current].value === "=>") {
                // Handle arrow function
                const param = args.pop(); // Get the parameter
                current++; // Skip =>
                const body = parseExpression();
                return {
                  type: "MethodCall",
                  value: methodName,
                  children: [
                    {
                      type: "ArrowFunction",
                      value: param?.value,
                      children: [body],
                    },
                  ],
                };
              }
              args.push(parseExpression());
              if (tokens[current]?.value === ",") {
                current++; // Skip comma
              }
            }

            if (tokens[current]?.value !== ")") {
              throw new CompilerError(
                "Expected closing parenthesis",
                "syntax",
                token.line,
                token.column
              );
            }
            current++; // Skip closing parenthesis

            return {
              type: "MethodCall",
              value: methodName,
              children: args,
            };
          }
        }
      }

      throw new CompilerError(
        `Unexpected token: ${token.value}`,
        "syntax",
        token.line,
        token.column
      );
    }

    try {
      // Change this line to use parseProgram instead of walk
      return parseProgram();
    } catch (error) {
      if (error instanceof CompilerError) throw error;
      throw new CompilerError(
        `Syntax analysis failed: ${(error as Error).message}`,
        "syntax"
      );
    }
  }

  static validateInput(sourceCode: string) {
    if (!sourceCode.trim()) {
      throw new CompilerError("Source code cannot be empty", "validation");
    }
  }

  static lexicalAnalysis(sourceCode: string): Token[] {
    this.validateInput(sourceCode);
    try {
      const tokens: Token[] = [];
      const keywords = new Set([
        "let",
        "const",
        "var",
        "if",
        "else",
        "while",
        "for",
        "function",
        "return",
        "class",
        "extends",
        "new",
        "this",
        "super",
        "console", // Added console
      ]);
      const operators = new Set([
        "+",
        "-",
        "*",
        "/",
        "=>",
        "=",
        "<",
        ">",
        "!",
        "&",
        "|",
        "(",
        ")",
        "{",
        "}",
        "[",
        "]",
        ";",
        ",",
        ".",
        "+=",
        "-=",
        "*=",
        "/=",
        "==",
        "===",
        "!=",
        "!==",
        ">=",
        "<=",
      ]);

      let line = 1;
      let column = 0;

      for (let i = 0; i < sourceCode.length; i++) {
        column++;
        const char = sourceCode[i];

        // Skip whitespace but track newlines
        if (/\s/.test(char)) {
          if (char === "\n") {
            line++;
            column = 0;
          }
          continue;
        }

        // Handle identifiers and keywords
        if (/[a-zA-Z_]/.test(char)) {
          let identifier = char;
          const startColumn = column;

          while (
            i + 1 < sourceCode.length &&
            /[a-zA-Z0-9_]/.test(sourceCode[i + 1])
          ) {
            identifier += sourceCode[++i];
            column++;
          }

          tokens.push({
            type: keywords.has(identifier) ? "keyword" : "identifier",
            value: identifier,
            line,
            column: startColumn,
          });
          continue;
        }

        // Handle numbers
        if (/[0-9]/.test(char)) {
          let number = char;
          const startColumn = column;

          while (
            i + 1 < sourceCode.length &&
            /[0-9.]/.test(sourceCode[i + 1])
          ) {
            number += sourceCode[++i];
            column++;
          }
          tokens.push({
            type: "number",
            value: number,
            line,
            column: startColumn,
          });
          continue;
        }

        // Handle strings
        if (char === '"' || char === "'") {
          let string = "";
          const quote = char;
          const startColumn = column;

          while (i + 1 < sourceCode.length && sourceCode[i + 1] !== quote) {
            string += sourceCode[++i];
            column++;
          }
          i++; // Skip closing quote
          tokens.push({
            type: "string",
            value: string,
            line,
            column: startColumn,
          });
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
          tokens.push({ type: "operator", value: op, line, column });
          continue;
        }
      }

      return tokens;
    } catch (error) {
      throw new CompilerError(
        `Lexical analysis failed: ${(error as Error).message}`,
        "lexical"
      );
    }
  }

  static semanticAnalysis(ast: ASTNode): {
    ast: ASTNode;
    symbolTable: Map<string, SymbolTableEntry>;
  } {
    const symbolTable = new Map<string, SymbolTableEntry>();
    const scopes: Map<string, SymbolTableEntry>[] = [symbolTable];

    function analyze(node: ASTNode): void {
      switch (node.type) {

        case "ClassDeclaration":
        symbolTable.set(node.value!, {
          type: "variable",
          dataType: "class",
          initialized: true
        });
        node.children?.forEach(analyze);
        break;

        case "MethodDeclaration":
          if (node.value === "constructor") {
            // Handle constructor
            symbolTable.set("this", {
              type: "variable",
              dataType: "object",
              initialized: true
            });
          } else {
            // Handle regular methods
            symbolTable.set(node.value!, {
              type: "function",
              parameters: node.children?.filter(c => c.type === "Parameter").map(p => p.value!) || [],
              returnType: "number"
            });
          }
          node.children?.forEach(analyze);
          break;

        case "VariableDeclaration":
          const varName = node.children?.[0].value!;
          symbolTable.set(varName, {
            type: "variable",
            declarationType: node.value,
            initialized: true,
            dataType: "object"
          });
          break;

        case "Program":
          // Add built-in functions to global scope
          symbolTable.set("console.log", {
            type: "function",
            parameters: ["...args"],
            returnType: "void",
          });
          node.children?.forEach(analyze);
          break;

        case "FunctionDeclaration":
          if (node.value) {
            const functionName = node.value;
            const params =
              node.children
                ?.filter((child) => child.type === "Parameter")
                .map((param) => param.value)
                .filter((value): value is string => value !== undefined) || [];

            // Add function to current scope
            const currentScope = scopes[scopes.length - 1];
            currentScope.set(functionName, {
              type: "function",
              parameters: params,
              returnType: "any",
            });

            // Create new scope for function body
            const functionScope = new Map<string, SymbolTableEntry>();
            scopes.push(functionScope);

            // Add parameters to function scope
            params.forEach((param) => {
              functionScope.set(param, {
                type: "parameter",
                dataType: "any",
              });
            });

            // Analyze function body
            node.children?.forEach((child) => {
              if (child.type !== "Parameter") {
                analyze(child);
              }
            });

            scopes.pop();
          }
          break;

        case "VariableDeclaration":
          if (
            node.children?.[0]?.type === "Identifier" &&
            node.children[0].value
          ) {
            const varName = node.children[0].value;
            const currentScope = scopes[scopes.length - 1];

            // Add variable to current scope with more information
            currentScope.set(varName, {
              type: "variable",
              declarationType: node.value || "let",
              dataType:
                node.children[1]?.type === "NumberLiteral"
                  ? "number"
                  : node.children[1]?.type === "StringLiteral"
                  ? "string"
                  : "any",
              initialized: node.children.length > 1,
            });
          }
          break;

        case "Block":
          // Create new scope for blocks (if statements, loops, etc.)
          const blockScope = new Map();
          scopes.push(blockScope);
          node.children?.forEach(analyze);
          scopes.pop();
          break;

        case "Identifier":
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
              throw new CompilerError(
                `Undefined variable: ${node.value}`,
                "semantic"
              );
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

    function generate(node: ASTNode): string | undefined {
      if (!node) return "";

      switch (node.type) {

        case "ClassDeclaration":
        threeAddressCode.push(`class ${node.value} {`);
        node.children?.forEach(child => generate(child));
        threeAddressCode.push("}");
        break;

      case "MethodDeclaration":
        if (node.value === "constructor") {
          threeAddressCode.push(`function ${node.value}() {`);
          threeAddressCode.push("this.value = 0");
        } else {
          const params = node.children?.filter(c => c.type === "Parameter").map(p => p.value).join(", ");
          threeAddressCode.push(`function ${node.value}(${params}) {`);
        }
        node.children?.forEach(child => {
          if (child.type !== "Parameter") {
            generate(child);
          }
        });
        threeAddressCode.push("}");
        break;

      case "BinaryExpression":
        const t1 = `t${tempCounter++}`;
        threeAddressCode.push(`${t1} = this.value ${node.value} ${node.children?.[1].value}`);
        threeAddressCode.push(`this.value = ${t1}`);
        break;

      case "ReturnStatement":
        threeAddressCode.push(`return ${node.children?.[0].type === "ThisExpression" ? "this.value" : generate(node.children![0])}`);
        break;

      case "VariableDeclaration":
        threeAddressCode.push(`${node.children?.[0].value} = new ${node.children?.[1].value}()`);
        break;

      case "MethodCall":
        const obj = node.children?.[0].value;
        const method = node.value;
        const args = node.children?.slice(1).map(arg => arg.value).join(", ");
        threeAddressCode.push(`${obj}.${method}(${args})`);
        break;

        case "Program":
          node.children?.forEach((child) => generate(child));
          return "";

        case "ArrayLiteral": {
          const temp = `t${tempCounter++}`;
          threeAddressCode.push(`${temp} = []`);
          node.children?.forEach((element, index) => {
            const elemValue = generate(element);
            threeAddressCode.push(`${temp}[${index}] = ${elemValue}`);
          });
          return temp;
        }

        case "MethodCall": {
          if (node.value === "map") {
            const arrayTemp = `t${tempCounter++}`;
            const resultTemp = `t${tempCounter++}`;
            threeAddressCode.push(`${resultTemp} = []`);
            // Generate map operation
            threeAddressCode.push(
              `${arrayTemp} = ${generate(node.children![0])}`
            );
            return resultTemp;
          }
          return "";
        }

        case "ArrowFunction": {
          const param = node.value;
          const body = generate(node.children![0]);
          const temp = `t${tempCounter++}`;
          threeAddressCode.push(
            `${temp} = function(${param}) { return ${body}; }`
          );
          return temp;
        }

        case "Block": {
          node.children?.forEach((child) => {
            generate(child);
          });
          return "";
        }

        case "ReturnStatement": {
          if (node.children?.[0]) {
            const returnValue = generate(node.children[0]);
            threeAddressCode.push(`return ${returnValue}`);
          }
          return "";
        }

        case "BinaryExpression": {
          if (
            Array.isArray(node.children) &&
            node.children.length === 2 &&
            node.value
          ) {
            const left = generate(node.children[0]);
            const right = generate(node.children[1]);
            const temp = `t${tempCounter++}`;
            threeAddressCode.push(`${temp} = ${left} ${node.value} ${right}`);
            return temp;
          }
          return "";
        }

        case "FunctionDeclaration":
          if (node.value) {
            threeAddressCode.push(`function ${node.value}:`);
            // Handle parameters
            node.children?.forEach((child) => {
              if (child.type === "Parameter") {
                threeAddressCode.push(`param ${child.value}`);
              } else {
                generate(child);
              }
            });
          }
          return "";

        case "ReturnStatement":
          if (node.children?.[0]) {
            const returnValue = generate(node.children[0]);
            threeAddressCode.push(`return ${returnValue}`);
          }
          return "";

        case "FunctionCall":
          if (node.value) {
            const args = node.children?.map((arg) => generate(arg)) || [];
            const temp = `t${tempCounter++}`;
            // Push parameters without unused index parameter
            args.forEach((arg) => {
              threeAddressCode.push(`param ${arg}`);
            });
            threeAddressCode.push(
              `${temp} = call ${node.value}, ${args.length}`
            );
            return temp;
          }
          return "";

        case "ExpressionStatement": {
          if (node.children?.[0]) {
            generate(node.children[0]);
          }
          return "";
        }

        case "VariableDeclaration": {
          if (Array.isArray(node.children) && node.children.length > 0) {
            const identifier = node.children[0];
            if (node.children.length > 1) {
              const value = generate(node.children[1]);
              threeAddressCode.push(`${identifier.value} = ${value}`);
            }
          }
          return "";
        }

        case "BinaryExpression": {
          if (
            Array.isArray(node.children) &&
            node.children.length === 2 &&
            node.value
          ) {
            const left = generate(node.children[0]);
            const right = generate(node.children[1]);
            const temp = `t${tempCounter++}`;
            threeAddressCode.push(`${temp} = ${left} ${node.value} ${right}`);
            return temp;
          }
          return "";
        }

        case "IfStatement": {
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
          return "";
        }

        case "AssignmentExpression": {
          if (
            Array.isArray(node.children) &&
            node.children.length === 2 &&
            node.value
          ) {
            const right = generate(node.children[1]);
            const left = node.children[0].value || "";
            if (node.value === "=") {
              threeAddressCode.push(`${left} = ${right}`);
            } else {
              const op = node.value.charAt(0);
              const temp = `t${tempCounter++}`;
              threeAddressCode.push(`${temp} = ${left} ${op} ${right}`);
              threeAddressCode.push(`${left} = ${temp}`);
            }
            return left;
          }
          return "";
        }

        case "NumberLiteral":
          return node.value || "0";

        case "Identifier":
          return node.value || "";

        default:
          return "";
      }
    }

    generate(ast);
    return threeAddressCode;
  }

  static optimize(intermediateCode: string[]): string[] {
    const optimized: string[] = [];
    const variables = new Map<string, string>();

    for (const line of intermediateCode) {

      // Keep class and method-related code unchanged
      if (line.includes("class") || line.includes("function") || line.includes("return")) {
        optimized.push(line);
        continue;
      }

      // Handle assignments and method calls
      if (line.includes("=")) {
        const [result, operation] = line.split(" = ");
        if (operation.includes("new")) {
          optimized.push(line);
        } else {
          // Handle arithmetic operations
          const parts = operation.split(" ");
          if (parts.length === 3) {
            const [left, op, right] = parts;
            if (!isNaN(Number(right))) {
              optimized.push(`${result} = ${left} ${op} ${right}`);
            }
          }
        }
      } else if (line.includes(".")) {
        // Keep method calls unchanged
        optimized.push(line);
      }
      
      // Keep function-related instructions unchanged
      if (
        line.startsWith("function") ||
        line.startsWith("param") ||
        line.includes("call") ||
        line.startsWith("return")
      ) {
        optimized.push(line);
        continue;
      }

      // Handle assignments and expressions
      if (line.includes("=")) {
        const [result, operation] = line.split(" = ");
        const resultVar = result.trim();

        // Handle simple assignments (x = 5 or x = y)
        if (!operation.includes(" ")) {
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
        const parts = operation.split(" ");
        if (parts.length === 3) {
          const [left, op, right] = parts.map((p) => p.trim());
          const leftVal = variables.get(left) || left;
          const rightVal = variables.get(right) || right;

          // Try constant folding
          if (!isNaN(Number(leftVal)) && !isNaN(Number(rightVal))) {
            let value;
            switch (op) {
              case "+":
                value = Number(leftVal) + Number(rightVal);
                break;
              case "-":
                value = Number(leftVal) - Number(rightVal);
                break;
              case "*":
                value = Number(leftVal) * Number(rightVal);
                break;
              case "/":
                value = Number(leftVal) / Number(rightVal);
                break;
              default:
                value = null;
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
      if (line.includes("=")) {
        const [result, operation] = line.split(" = ");
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
    let currentClass: string | null = null;

    for (const line of intermediateCode) {

      if (line.startsWith("class")) {
        currentClass = line.split(" ")[1].replace("{", "");
        targetCode.push(`section .data`);
        targetCode.push(`${currentClass}_value dd 0`);
        targetCode.push(`section .text`);
        continue;
      }
  
      if (line.startsWith("function")) {
        const funcName = line.split(" ")[1].split("(")[0];
        targetCode.push(`${currentClass}_${funcName}:`);
        targetCode.push("  push rbp");
        targetCode.push("  mov rbp, rsp");
        continue;
      }
  
      if (line.includes("this.value")) {
        if (line.includes("=")) {
          const [_, value] = line.split(" = ");
          targetCode.push(`  mov eax, ${value}`);
          targetCode.push(`  mov [${currentClass}_value], eax`);
        }
      }
  
      if (line.startsWith("return")) {
        targetCode.push("  mov eax, [${currentClass}_value]");
        targetCode.push("  mov rsp, rbp");
        targetCode.push("  pop rbp");
        targetCode.push("  ret");
      }

      if (line.startsWith("function ")) {
        // Function declaration
        currentFunction = line.slice(9, -1);
        targetCode.push(`${currentFunction}:`);
        targetCode.push("  push rbp");
        targetCode.push("  mov rbp, rsp");
        const value = line.slice(6);
        targetCode.push(`  mov rdi, format_str`);
        targetCode.push(`  mov rsi, ${value}`);
        targetCode.push("  call printf");
        continue;
      }

      if (line.includes("call")) {
        // Handle function calls
        const [result, callInfo] = line.split(" = call ");
        const [func, argCount] = callInfo.split(", ");
        targetCode.push(`  call ${func}`);
        targetCode.push(`  mov ${result}, rax`);
        // Clean up stack after call
        if (parseInt(argCount) > 0) {
          targetCode.push(`  add rsp, ${parseInt(argCount) * 8}`);
        }
        continue;
      }

      if (line.startsWith("param ")) {
        // Parameter handling
        const param = line.slice(6);
        targetCode.push(`  push ${param}`);
        targetCode.push(`  mov ${param}, [rbp + ${targetCode.length * 8}]`);
        continue;
      }

      if (line.startsWith("return ")) {
        // Return value handling
        const returnValue = line.slice(7);
        if (returnValue) {
          targetCode.push(`  mov rax, ${returnValue}`);
        }
        targetCode.push("  mov rsp, rbp");
        targetCode.push("  pop rbp");
        targetCode.push("  ret");
        continue;
      }

      if (line.endsWith(":")) {
        // Function or label definition
        if (line.startsWith("func_")) {
          currentFunction = line.slice(5, -1);
          targetCode.push(`${line}`);
          targetCode.push("  push rbp");
          targetCode.push("  mov rbp, rsp");
        } else {
          // Regular label
          targetCode.push(line);
        }
        continue;
      }

      if (line === "return") {
        targetCode.push("  mov rsp, rbp");
        targetCode.push("  pop rbp");
        targetCode.push("  ret");
        currentFunction = null;
        continue;
      }

      // Handle conditional jumps
      if (line.startsWith("if ")) {
        const condition = line.slice(3, line.indexOf(" goto"));
        const label = line.slice(line.indexOf("goto ") + 5);
        targetCode.push(`  cmp ${condition}, 0`);
        targetCode.push(`  jne ${label}`);
        continue;
      }

      if (line.startsWith("goto ")) {
        const label = line.slice(5);
        targetCode.push(`  jmp ${label}`);
        continue;
      }

      // Handle regular instructions
      if (line.includes("=")) {
        const [dest, src] = line.split(" = ");
        if (src.includes(" ")) {
          // Binary operation
          const [left, op, right] = src.split(" ");
          targetCode.push(`  mov rax, ${left}`);
          switch (op) {
            case "+":
              targetCode.push(`  add rax, ${right}`);
              break;
            case "-":
              targetCode.push(`  sub rax, ${right}`);
              break;
            case "*":
              targetCode.push(`  imul rax, ${right}`);
              break;
            case "/":
              targetCode.push("  xor rdx, rdx");
              targetCode.push(`  div ${right}`);
              break;
          }
          targetCode.push(`  mov ${dest}, rax`);
        } else {
          targetCode.push(`  mov ${dest}, ${src}`);
        }
      }
    }

    return targetCode;
  }
}
