import Lexer from "./lexer";

import readline from "readline";

const rs = readline.createInterface({
  input: process.stdin,
});

rs.on("line", (input) => {
  const tokenizer = new Lexer(input);

  while (true) {
    const token = tokenizer.nextToken();
    console.log(token);
    if (token.type === "EOF") {
      break;
    }
  }
});
