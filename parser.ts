import {
  BlockStatement,
  Boolean,
  CallExpression,
  ExpressionStatement,
  FunctionLiteral,
  Identifier,
  IfExpression,
  InfixExpression,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  TExpression,
  TIdentifier,
  TStatement,
} from "./ast";
import Lexer from "./lexer";
import { TOKENS, TToken } from "./token";
import util from "util";

enum PRECEDENCE {
  LOWEST = 0,
  EQUALS = 1, // ==
  LESSGREATER = 2, // > or <
  SUM = 3, // +
  PRODUCT = 4, // *
  PREFIX = 5, // -X or !X
  CALL = 6, // myFunction(X)
}

const PRECENDENCE_TABLE: { [key: string]: number } = {
  [TOKENS.EQ]: PRECEDENCE.EQUALS,
  [TOKENS.NOT_EQ]: PRECEDENCE.EQUALS,
  [TOKENS.LT]: PRECEDENCE.LESSGREATER,
  [TOKENS.GT]: PRECEDENCE.LESSGREATER,
  [TOKENS.PLUS]: PRECEDENCE.SUM,
  [TOKENS.MINUS]: PRECEDENCE.SUM,
  [TOKENS.SLASH]: PRECEDENCE.PRODUCT,
  [TOKENS.ASTERISK]: PRECEDENCE.PRODUCT,
  [TOKENS.LPAREN]: PRECEDENCE.CALL,
};

class Parser {
  lexer: Lexer;
  curToken: TToken;
  peekToken: TToken | undefined;
  errors: string[] = [];
  prefixParseFns: { [key: string]: Function } = {};
  infixParseFns: { [key: string]: Function } = {};

  constructor(lexer: Lexer) {
    this.lexer = lexer;

    const firstToken = this.lexer.nextToken();
    this.curToken = firstToken;
    this.peekToken = this.lexer.nextToken();

    this.registerPrefix(TOKENS.IDENT, this.parseIdentifier.bind(this));
    this.registerPrefix(TOKENS.INT, this.parseIntegerLiteral.bind(this));
    this.registerPrefix(TOKENS.BANG, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKENS.MINUS, this.parsePrefixExpression.bind(this));
    this.registerPrefix(TOKENS.TRUE, this.parseBoolean.bind(this));
    this.registerPrefix(TOKENS.FALSE, this.parseBoolean.bind(this));
    this.registerPrefix(TOKENS.LPAREN, this.parseGroupedExpression.bind(this));
    this.registerPrefix(TOKENS.IF, this.parseIfExpression.bind(this));
    this.registerPrefix(TOKENS.FUNCTION, this.parseFunctionLiteral.bind(this));

    this.registerInfix(TOKENS.PLUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.MINUS, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.SLASH, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.ASTERISK, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.NOT_EQ, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.LT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.GT, this.parseInfixExpression.bind(this));
    this.registerInfix(TOKENS.LPAREN, this.parseCallExpression.bind(this));

    return this;
  }

  nextToken() {
    if (!this.peekToken) {
      throw new Error("No more tokens to parse");
    }
    this.curToken = this.peekToken;
    this.peekToken = this.lexer.nextToken();
  }

  /**
   * This method constructs the root node of the AST
   * It then iterates over every token in the input until it encounters an EOF token
   * It does this by calling nextToken repeatedly
   *
   * It then calls parseStatement to parse each statement in the input
   * If the statement is not null, it adds it to the statements array of the Program node
   */
  parseProgram() {
    const program = new Program([]);

    while (!this.curTokenIs(TOKENS.EOF)) {
      const statement = this.parseStatement();

      if (statement !== null) {
        program.statements.push(statement);
      }

      this.nextToken();
    }

    return program;
  }

  /**
   * This method is responsible for parsing statements
   */
  parseStatement(): TStatement | null {
    switch (this.curToken.type) {
      case TOKENS.LET:
        return this.parseLetStatement();
      case TOKENS.RETURN:
        return this.parseReturnStatement();
      default:
        return this.parseExpressionStatement();
    }
  }

  /**
   * This method is responsible for parsing let statements
   * The sequence of tokens expected here is:
   * Token { type: 'LET', literal: 'let' },
   * Token { type: 'IDENT', literal: 'x' },
   * Token { type: 'ASSIGN', literal: '=' },
   * Token { type: 'INT', literal: '5' } or <Expression>,
   */
  parseLetStatement(): LetStatement | null {
    /**
     * First, we create a new LetStatement node based on the current token that the curToken is pointing to
     * It then advances tokens while making assertions about the next token with calls to expectPeek
     * Check the expectPeek method below for more docs
     */
    const letStatement = new LetStatement(this.curToken, null, null);

    /**
     * Next, we check if the next token is an identifier
     * If its not, we return null and push an error to errors array
     * If it is, we create a new Identifier node and assign it to the name property of the LetStatement node
     */
    if (!this.expectPeek(TOKENS.IDENT)) {
      return null;
    }

    /**
     * After calling expectPeek, the curToken is now pointing to the identifier token
     * We then assign the value of the identifier token to the name property of the LetStatement node
     */
    letStatement.name = new Identifier(this.curToken, this.curToken.literal);

    /**
     * Next, we check if the next token is an assignment token
     * If its not, we return null and push an error to errors array
     * If it is, we advance the tokens
     */
    if (!this.expectPeek(TOKENS.ASSIGN)) {
      return null;
    }

    this.nextToken();

    letStatement.value = this.parseExpression(PRECEDENCE.LOWEST);

    if (!this.peekTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }

    return letStatement;
  }

  /**
   * This method is responsible for parsing return statements
   * The sequence of tokens expected here is:
   * Token { type: 'RETURN', literal: 'return' },
   * Token { type: 'INT', literal: '5' } or <Expression>,
   * Token { type: 'SEMICOLON', literal: ';' }   *
   */
  parseReturnStatement() {
    const returnStatement = new ReturnStatement(this.curToken, null);

    this.nextToken();

    returnStatement.returnValue = this.parseExpression(PRECEDENCE.LOWEST);

    if (this.peekTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }

    return returnStatement;
  }

  /**
   * This method is responsible for parsing expression statements
   */
  parseExpressionStatement() {
    const stmt = new ExpressionStatement(this.curToken, null);

    stmt.expression = this.parseExpression(PRECEDENCE.LOWEST);

    if (this.peekTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }

    return stmt;
  }

  /**
   * This method is responsible for parsing expressions
   */
  parseExpression(precedence: number) {
    const prefix = this.prefixParseFns[this.curToken.type];

    if (!prefix) {
      this.noPrefixParseFnError(this.curToken.type);
      return null;
    }

    let leftExp = prefix();

    while (
      !this.peekTokenIs(TOKENS.SEMICOLON) &&
      precedence < this.peekPrecedence() &&
      this.peekToken
    ) {
      const infix = this.infixParseFns[this.peekToken.type];

      if (!infix) {
        return leftExp;
      }

      this.nextToken();

      leftExp = infix(leftExp);
    }

    return leftExp;
  }

  /**
   * Expression types
   */
  parseIdentifier(): Identifier {
    return new Identifier(this.curToken, this.curToken.literal);
  }

  parseIntegerLiteral() {
    const stmt = new IntegerLiteral(
      this.curToken,
      parseInt(this.curToken.literal)
    );

    if (Number.isNaN(parseInt(this.curToken.literal))) {
      this.errors.push(`could not parse ${this.curToken.literal} as integer`);

      return null;
    }

    return stmt;
  }

  parseFunctionLiteral() {
    const fn = new FunctionLiteral(this.curToken, null, null);

    if (!this.expectPeek(TOKENS.LPAREN)) {
      return null;
    }

    fn.parameters = this.parseFunctionParameters();

    if (!this.expectPeek(TOKENS.LBRACE)) {
      return null;
    }

    fn.body = this.parseBlockStatement();

    return fn;
  }

  parseFunctionParameters() {
    const identifiers: TIdentifier[] = [];

    // If no parameters, return empty array
    if (this.peekTokenIs(TOKENS.RPAREN)) {
      this.nextToken();
      return identifiers;
    }

    this.nextToken();

    // Parse first parameter
    const ident = new Identifier(this.curToken, this.curToken.literal);
    identifiers.push(ident);

    // Parse remaining parameters
    while (this.peekTokenIs(TOKENS.COMMA)) {
      this.nextToken();
      this.nextToken();

      const ident = new Identifier(this.curToken, this.curToken.literal);
      identifiers.push(ident);
    }

    // Check for closing parenthesis
    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return identifiers;
  }

  parseBoolean() {
    return new Boolean(this.curToken, this.curTokenIs(TOKENS.TRUE));
  }

  parseGroupedExpression() {
    this.nextToken();

    const exp = this.parseExpression(PRECEDENCE.LOWEST);

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return exp;
  }

  parseIfExpression() {
    const expression = new IfExpression(this.curToken, null, null, null);

    if (!this.expectPeek(TOKENS.LPAREN)) {
      return null;
    }

    this.nextToken();

    expression.condition = this.parseExpression(PRECEDENCE.LOWEST);

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    if (!this.expectPeek(TOKENS.LBRACE)) {
      return null;
    }

    expression.consequence = this.parseBlockStatement();

    if (this.peekTokenIs(TOKENS.ELSE)) {
      this.nextToken();

      if (!this.expectPeek(TOKENS.LBRACE)) {
        return null;
      }

      expression.alternative = this.parseBlockStatement();
    }

    return expression;
  }

  parseCallExpression(fn: TExpression) {
    const exp = new CallExpression(this.curToken, fn, []);

    exp.arguments = this.parseCallArguments();

    return exp;
  }

  /**
   * Shockingly similar to parseFunctionParameters
   */
  parseCallArguments() {
    const args: TExpression[] = [];

    if (this.peekTokenIs(TOKENS.RPAREN)) {
      this.nextToken();
      return args;
    }

    this.nextToken();

    args.push(this.parseExpression(PRECEDENCE.LOWEST));

    while (this.peekTokenIs(TOKENS.COMMA)) {
      this.nextToken();
      this.nextToken();

      args.push(this.parseExpression(PRECEDENCE.LOWEST));
    }

    if (!this.expectPeek(TOKENS.RPAREN)) {
      return null;
    }

    return args;
  }

  parseBlockStatement() {
    const blockStatement = new BlockStatement(this.curToken, []);

    this.nextToken();

    while (!this.curTokenIs(TOKENS.RBRACE)) {
      const stmt = this.parseStatement();

      if (stmt) {
        blockStatement.statements.push(stmt);
      }

      this.nextToken();
    }

    return blockStatement;
  }

  parsePrefixExpression() {
    const prefixExpression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );

    this.nextToken();

    prefixExpression.right = this.parseExpression(PRECEDENCE.PREFIX);

    return prefixExpression;
  }

  parseInfixExpression(left: TExpression) {
    const expression = new InfixExpression(
      this.curToken,
      left,
      this.curToken.literal,
      null
    );

    const precedence = this.curPrecedence();

    this.nextToken();

    expression.right = this.parseExpression(precedence);

    return expression;
  }

  /**
   * Helper Methods
   */
  curTokenIs(type: string) {
    return this.curToken.type === type;
  }

  peekTokenIs(t: TOKENS): boolean {
    return this.peekToken?.type === t;
  }

  /**
   * This method is used to assert that the next token is of a certain type
   * If it is, it advances the tokens
   * If it is not, it adds an error to the errors array and returns false
   */
  expectPeek(t: TOKENS): boolean {
    if (this.peekTokenIs(t)) {
      this.nextToken();
      return true;
    } else {
      this.peekError(t);
      return false;
    }
  }

  peekError(t: TOKENS) {
    const msg = `expected next token to be ${t}, got ${this.peekToken?.type} instead`;
    this.errors.push(msg);
  }

  noPrefixParseFnError(t: TOKENS) {
    const msg = `no prefix parse function for ${t} found`;
    this.errors.push(msg);
  }

  /**
   * This method is used to register prefix and infix functions
   * Prefix functions are used to parse tokens that appear at the beginning of an expression
   * Infix functions are used to parse tokens that appear in the middle of an expression
   */
  registerPrefix(tokenType: string, fn: Function) {
    this.prefixParseFns[tokenType] = fn;
  }

  registerInfix(tokenType: string, fn: Function) {
    this.infixParseFns[tokenType] = fn;
  }

  /**
   * This method is used to get the precedence of the current token
   */
  curPrecedence() {
    if (!this.curToken) return PRECEDENCE.LOWEST;
    const p = PRECENDENCE_TABLE[this.curToken?.type];
    return p ? p : PRECEDENCE.LOWEST;
  }

  /**
   * This method is used to get the precedence of the next token
   */
  peekPrecedence() {
    if (!this.peekToken) return PRECEDENCE.LOWEST;
    const p = PRECENDENCE_TABLE[this.peekToken?.type];
    return p ? p : PRECEDENCE.LOWEST;
  }
}

export default Parser;

const lexer = new Lexer(`
  let x = 5;
  let y = 10;
  let foobar = 838383;

  !5;

  -15;

  x * 5;

  if (x < y) {
    return true;
  } else {
    return false;
  }

  let myFn = fn(x, y) {
    x + y;
  };

  myFn(1, 3)
`);

const parser = new Parser(lexer);

const program = parser.parseProgram();

console.log(
  util.inspect(program.statements, {
    showHidden: false,
    depth: null,
    colors: true,
  })
);
