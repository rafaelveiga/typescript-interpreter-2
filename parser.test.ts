import Lexer from "./lexer";
import Parser from "./parser";

describe("Parser", () => {
  it("should parse let statements", () => {
    const input = `
      let x = 5;
      let y = 10;
      let foobar = 838383;
    `;

    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    checkForParserErrors(parser);

    const program = parser.parseProgram();

    expect(program).toBeTruthy();

    expect(program.statements.length).toBe(3);

    const tests = ["x", "y", "foobar"];

    tests.forEach((test, i) => {
      const stmt = program.statements[i];
      expect(stmt.tokenLiteral()).toBe("let");

      expect(stmt).toBeTruthy();
    });
  });

  it("should parse return statements", () => {
    const input = `
      return 5;
      return 10;
      return 993322;
    `;

    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    checkForParserErrors(parser);

    const program = parser.parseProgram();

    expect(program).toBeTruthy();

    expect(program.statements.length).toBe(3);

    program.statements.forEach((stmt) => {
      expect(stmt.tokenLiteral()).toBe("return");
    });
  });
});

function checkForParserErrors(parser: Parser) {
  expect(parser.errors.length).toBe(0);

  if (parser.errors.length > 0) {
    console.log("parser has", parser.errors.length, "errors");
    parser.errors.forEach((error) => {
      console.log("parser error:", error);
    });
  }
}
