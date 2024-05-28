import Lexer from "./lexer";

import readline from "readline";
import Parser from "./parser";

const rs = readline.createInterface({
  input: process.stdin,
});

const OOPS = `
 ____  ____  ____  ____
/  _ \/  _ \/  __\/ ___\
| / \|| / \||  \/||    \
| \_/|| \_/||  __/\___ |
\____/\____/\_/   \____/
`;

rs.on("line", (input) => {
  const tokenizer = new Lexer(input);
  const parser = new Parser(tokenizer);

  const program = parser.parseProgram();

  if (parser.errors.length > 0) {
    console.log(OOPS);
    console.log("parser errors", parser.errors);
    return;
  }

  console.log(program.string());
});
