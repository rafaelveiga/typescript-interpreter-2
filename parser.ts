import {
  Identifier,
  LetStatement,
  Program,
  ReturnStatement,
  TStatement,
} from "./ast";
import Lexer from "./lexer";
import { TOKENS, Token } from "./token";

class Parser {
  lexer: Lexer;
  curToken: Token;
  peekToken: Token | undefined;
  errors: string[] = [];

  constructor(lexer: Lexer) {
    this.lexer = lexer;

    const firstToken = this.lexer.nextToken();
    this.curToken = firstToken;
    this.peekToken = this.lexer.nextToken();

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
        return null;
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

    // TODO: We're skipping the expressions until we implement them

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

    // TODO: We're skipping the expressions until we implement them
    while (!this.curTokenIs(TOKENS.SEMICOLON)) {
      this.nextToken();
    }

    return returnStatement;
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
}

export default Parser;
