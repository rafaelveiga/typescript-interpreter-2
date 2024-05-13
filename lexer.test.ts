import Lexer from "./lexer";
import { TOKENS } from "./token";

describe("Lexer", () => {
  it("Should tokenize a list of tokens", () => {
    const input = `=+(){},;`;

    const expected = [
      { type: TOKENS.ASSIGN, literal: "=" },
      { type: TOKENS.PLUS, literal: "+" },
      { type: TOKENS.LPAREN, literal: "(" },
      { type: TOKENS.RPAREN, literal: ")" },
      { type: TOKENS.LBRACE, literal: "{" },
      { type: TOKENS.RBRACE, literal: "}" },
      { type: TOKENS.COMMA, literal: "," },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.EOF, literal: "" },
    ];

    const lexer = new Lexer(input);

    expected.forEach((expectedToken) => {
      const token = lexer.nextToken();
      expect(token.type).toBe(expectedToken.type);
      expect(token.literal).toBe(expectedToken.literal);
    });
  });

  it("nextToken function", () => {
    const input = `let five = 5;
    let ten = 10;

    let add = fn(x, y) {
      x + y;
    };

    let result = add(five, ten);

    !-/*5;

    5 < 10 > 5

    if (5 < 10) {
      return true;
    } else {
      return false;
    }

    10 == 10;

    10 != 9;
    `;

    const expected = [
      { type: TOKENS.LET, literal: "let" },
      { type: TOKENS.IDENT, literal: "five" },
      { type: TOKENS.ASSIGN, literal: "=" },
      { type: TOKENS.INT, literal: "5" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.LET, literal: "let" },
      { type: TOKENS.IDENT, literal: "ten" },
      { type: TOKENS.ASSIGN, literal: "=" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.LET, literal: "let" },
      { type: TOKENS.IDENT, literal: "add" },
      { type: TOKENS.ASSIGN, literal: "=" },
      { type: TOKENS.FUNCTION, literal: "fn" },
      { type: TOKENS.LPAREN, literal: "(" },
      { type: TOKENS.IDENT, literal: "x" },
      { type: TOKENS.COMMA, literal: "," },
      { type: TOKENS.IDENT, literal: "y" },
      { type: TOKENS.RPAREN, literal: ")" },
      { type: TOKENS.LBRACE, literal: "{" },
      { type: TOKENS.IDENT, literal: "x" },
      { type: TOKENS.PLUS, literal: "+" },
      { type: TOKENS.IDENT, literal: "y" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.RBRACE, literal: "}" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.LET, literal: "let" },
      { type: TOKENS.IDENT, literal: "result" },
      { type: TOKENS.ASSIGN, literal: "=" },
      { type: TOKENS.IDENT, literal: "add" },
      { type: TOKENS.LPAREN, literal: "(" },
      { type: TOKENS.IDENT, literal: "five" },
      { type: TOKENS.COMMA, literal: "," },
      { type: TOKENS.IDENT, literal: "ten" },
      { type: TOKENS.RPAREN, literal: ")" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.BANG, literal: "!" },
      { type: TOKENS.MINUS, literal: "-" },
      { type: TOKENS.SLASH, literal: "/" },
      { type: TOKENS.ASTERISK, literal: "*" },
      { type: TOKENS.INT, literal: "5" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.INT, literal: "5" },
      { type: TOKENS.LT, literal: "<" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.GT, literal: ">" },
      { type: TOKENS.INT, literal: "5" },
      { type: TOKENS.IF, literal: "if" },
      { type: TOKENS.LPAREN, literal: "(" },
      { type: TOKENS.INT, literal: "5" },
      { type: TOKENS.LT, literal: "<" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.RPAREN, literal: ")" },
      { type: TOKENS.LBRACE, literal: "{" },
      { type: TOKENS.RETURN, literal: "return" },
      { type: TOKENS.TRUE, literal: "true" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.RBRACE, literal: "}" },
      { type: TOKENS.ELSE, literal: "else" },
      { type: TOKENS.LBRACE, literal: "{" },
      { type: TOKENS.RETURN, literal: "return" },
      { type: TOKENS.FALSE, literal: "false" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.RBRACE, literal: "}" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.EQ, literal: "==" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.INT, literal: "10" },
      { type: TOKENS.NOT_EQ, literal: "!=" },
      { type: TOKENS.INT, literal: "9" },
      { type: TOKENS.SEMICOLON, literal: ";" },
      { type: TOKENS.EOF, literal: "" },
    ];

    const lexer = new Lexer(input);

    expected.forEach((expectedToken) => {
      const token = lexer.nextToken();
      expect(token.type).toBe(expectedToken.type);
      expect(token.literal).toBe(expectedToken.literal);
    });
  });
});
