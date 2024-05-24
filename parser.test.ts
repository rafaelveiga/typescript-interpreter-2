import {
  Boolean,
  ExpressionStatement,
  InfixExpression,
  IntegerLiteral,
} from "./ast";
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

  it("should parse identifier expressions", () => {
    const input = "foobar;";

    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    checkForParserErrors(parser);

    const program = parser.parseProgram();

    expect(program).toBeTruthy();

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];

    expect(stmt.tokenLiteral()).toBe("foobar");
  });

  it("should parse integer expressions", () => {
    const input = "5;";

    const lexer = new Lexer(input);

    const parser = new Parser(lexer);

    checkForParserErrors(parser);

    const program = parser.parseProgram();

    expect(program).toBeTruthy();

    expect(program.statements.length).toBe(1);

    const stmt = program.statements[0];

    expect(stmt.tokenLiteral()).toBe("5");
  });

  it("should parse prefix expressions", () => {
    const prefixTests = [
      ["!5;", "!", "5"],
      ["-15;", "-", "15"],
    ];

    prefixTests.forEach(([input, operator, value]) => {
      const lexer = new Lexer(input);

      const parser = new Parser(lexer);

      checkForParserErrors(parser);

      const program = parser.parseProgram();

      expect(program).toBeTruthy();

      expect(program.statements.length).toBe(1);

      const stmt = program.statements[0];

      expect(stmt.tokenLiteral()).toBe(operator);
    });
  });

  it("should parse infix expressions", () => {
    const testCases = [
      ["5 + 5", 5, "+", 5],
      ["5 - 5", 5, "-", 5],
      ["5 * 5", 5, "*", 5],
      ["5 / 5", 5, "/", 5],
      ["5 > 5", 5, ">", 5],
      ["5 < 5", 5, "<", 5],
      ["5 == 5", 5, "==", 5],
      ["5 != 5", 5, "!=", 5],
    ];

    testCases.forEach(([input, leftValue, operator, rightValue]) => {
      const lexer = new Lexer(input as string);

      const parser = new Parser(lexer);

      checkForParserErrors(parser);

      const program = parser.parseProgram();

      expect(program).toBeTruthy();

      expect(program.statements.length).toBe(1);

      const expression = program.statements[0] as ExpressionStatement;

      expect(expression).toBeInstanceOf(ExpressionStatement);

      const infixExpression = expression.expression as InfixExpression;
      expect(infixExpression).toBeInstanceOf(InfixExpression);

      const infixExpressionLeft = infixExpression.left as IntegerLiteral;
      const infixExpressionRight = infixExpression.right as IntegerLiteral;

      expect(infixExpression.left).toBeInstanceOf(IntegerLiteral);
      expect(infixExpressionLeft.value).toBe(leftValue);
      expect(infixExpression.operator).toBe(operator);
      expect(infixExpression.right).toBeInstanceOf(IntegerLiteral);
      expect(infixExpressionRight.value).toBe(rightValue);
    });
  });

  it("should parse boolean expressions", () => {
    const testCases = [
      ["true;", true],
      ["false;", false],
    ];

    testCases.forEach(([input, value]) => {
      const lexer = new Lexer(input as string);

      const parser = new Parser(lexer);

      checkForParserErrors(parser);

      const program = parser.parseProgram();

      expect(program).toBeTruthy();

      expect(program.statements.length).toBe(1);

      const boolean = program.statements[0] as ExpressionStatement;
      const booleanExpression = boolean.expression as Boolean;

      expect(booleanExpression.value).toBe(value);
      expect(booleanExpression).toBeInstanceOf(Boolean);
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
