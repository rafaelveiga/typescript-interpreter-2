import { Identifier, LetStatement, Program, ReturnStatement } from "./ast";
import { TOKENS, Token } from "./token";

describe("AST", () => {
  it("should return the correct string", () => {
    const program = new Program([
      new LetStatement(
        new Token(TOKENS.LET, "let"),
        new Identifier(new Token(TOKENS.IDENT, "myVar"), "myVar"),
        new Identifier(new Token(TOKENS.IDENT, "otherVar"), "otherVar")
      ),
      new ReturnStatement(
        new Token(TOKENS.RETURN, "return"),
        new Identifier(new Token(TOKENS.IDENT, "myVar"), "myVar")
      ),
    ]);

    expect(program.string()).toEqual("let myVar = otherVar;return myVar;");
  });
});
