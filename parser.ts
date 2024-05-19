import {
  ExpressionStatement,
  Identifier,
  IntegerLiteral,
  LetStatement,
  PrefixExpression,
  Program,
  ReturnStatement,
  TStatement,
} from "./ast";
import Lexer from "./lexer";
import { TOKENS, TToken } from "./token";

enum PRECEDENCE {
  LOWEST = 0,
  EQUALS = 1, // ==
  LESSGREATER = 2, // > or <
  SUM = 3, // +
  PRODUCT = 4, // *
  PREFIX = 5, // -X or !X
  CALL = 6, // myFunction(X)
}

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

    /**
     * Next, we advance the tokens until we encounter a semicolon token
     * This is because the value of a let statement can be an expression
     * If the current token is not assign, that means we are in the "expression zone", a.k.a.
     * the part after `let x =`
     */
    while (!this.curTokenIs(TOKENS.SEMICOLON)) {
      if (!this.curTokenIs(TOKENS.ASSIGN)) {
        letStatement.value = this.parseExpression(PRECEDENCE.LOWEST);
      }
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

    while (!this.curTokenIs(TOKENS.SEMICOLON)) {
      returnStatement.returnValue = this.parseExpression(PRECEDENCE.LOWEST);
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

  parsePrefixExpression() {
    const prefixExpression = new PrefixExpression(
      this.curToken,
      this.curToken.literal
    );

    this.nextToken();

    prefixExpression.right = this.parseExpression(PRECEDENCE.PREFIX);

    return prefixExpression;
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
}

export default Parser;
