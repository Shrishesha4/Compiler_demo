# Interactive Compiler Visualization Project

A comprehensive web-based tool for visualizing and understanding the compilation process through interactive demonstrations of each compilation phase.

## Project Overview

This educational tool demonstrates the six main phases of compilation:

1. 🔍 **Lexical Analysis**
   - Breaks source code into tokens (lexemes)
   - Identifies keywords, identifiers, operators
   - Shows token type, value, and position
   - Removes whitespace and comments

2. 🌳 **Syntax Analysis**
   - Generates Abstract Syntax Tree (AST)
   - Validates code structure and grammar
   - Interactive tree visualization
   - Highlights syntactic relationships

3. ✨ **Semantic Analysis**
   - Performs type checking
   - Builds and displays symbol table
   - Validates scope and visibility
   - Shows variable declarations and usage

4. 🔄 **Intermediate Code Generation**
   - Converts AST to Three-Address Code
   - Platform-independent representation
   - Shows step-by-step code transformation
   - Optimizable intermediate format

5. ⚡ **Code Optimization**
   - Demonstrates common optimizations
   - Shows before and after comparison
   - Includes constant folding
   - Dead code elimination visualization

6. 💻 **Code Generation**
   - Produces assembly-like code
   - Shows final compilation output
   - Demonstrates target code structure
   - Machine-level instruction view

## Features

- **Interactive Code Editor**
  - Syntax highlighting
  - Real-time compilation
  - Error highlighting
  - Example code snippets

- **Visual Phase Navigation**
  - Step-by-step phase exploration
  - Detailed phase explanations
  - Progress tracking
  - Phase-specific visualizations

- **Educational Components**
  - Detailed phase descriptions
  - Hover explanations
  - Best practices
  - Common error handling

## Technical Stack

- **Frontend Framework**: Next.js 14
- **Styling**: Tailwind CSS
- **Code Editor**: Monaco Editor
- **Visualization**: Custom React components
- **Graph Rendering**: Mermaid.js
- **Type Safety**: TypeScript

## Getting Started

1. **Clone the Repository**
```bash
git clone https://github.com/yourusername/compiler_design_project.git
cd compiler_design_project
```

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Installation & Setup

1. **Install Dependencies**
```bash
npm install
```

2. **Start the Development Server**
```bash
npm run dev
```
3. **Open in Browser**
```bash
https://localhost:3000
```

## How to Use
### Writing Code
1. Write your code in the editor.
2. Click on the "Run" button to compile your code.
3. View the results in the output panel.

### Exploring Compilation Phases
1. After compilation, click "View Phases"
2. Use navigation buttons to move between phases
3. Examine phase-specific visualizations
4. Try provided example code for each phase

### Understanding Visualizations
Each phase provides unique insights:

- Lexical Analysis : Grid view of tokens with type and position
- Syntax Analysis : Interactive Abstract Syntax Tree (AST)
- Semantic Analysis : Symbol tables and scope information
- Intermediate Code : Three-address code representation
- Optimization : Side-by-side comparison of optimizations
- Code Generation : Assembly-like target code output

## Project Structure
```plaintext
src/
├── components/
│   ├── CodeEditor.tsx        # Monaco editor integration
│   ├── PhaseVisualizer.tsx   # Phase visualization logic
│   ├── CompilerDemo.tsx      # Main compiler component
│   └── ...
├── services/
│   └── compiler.ts           # Compiler logic implementation
└── app/
    └── page.tsx              # Main page component
```

## Contributing
1. Fork the repository
2. Create your feature branch ( git checkout -b feature/amazing-feature )
3. Commit your changes ( git commit -m 'Add amazing feature' )
4. Push to the branch ( git push origin feature/amazing-feature )
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- Next.js team for the application framework
- Monaco Editor for code editing capabilities
- Mermaid.js for graph visualizations
- The compiler design community for inspiration

## Support
For questions and support, please open an issue in the repository.