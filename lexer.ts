import { KEYWORDS, TOKENS, Token, lookupIdent, newToken } from "./token";

export default class Lexer {
  private input: string;
  private position: number = 0;
  private readPosition: number = 0;
  private ch: string;

  constructor(input: string) {
    this.input = input;
    this.ch = input[this.position];
    this.readChar();
  }

  /**
   * We advance the pointers (this.position, this.readPosition) by one character
   * and set this.ch to the character at the new position
   *
   * If we reach the end of the input, we set this.ch to an empty string
   * to indicate that we have reached the end of the input, aka TOKENS.EOF
   */
  readChar(): void {
    if (this.readPosition >= this.input.length) {
      this.ch = "";
    } else {
      this.ch = this.input[this.readPosition];
    }

    this.position = this.readPosition;

    this.readPosition++;
  }

  /**
   * We look at the current character in examination and return a token
   * depending on which token it is
   * Before returning a token, we advance the pointers (this.position, this.readPosition) using readChar
   * so that when we call nextToken() again, we are looking at the next character
   **/
  nextToken(): Token {
    let token: Token | null = null;

    this.skipWhitespace();

    switch (this.ch) {
      case "=":
        /**
         * This case can be either an ASSIGN = token or an EQ == token
         * We check if the next character is an =, if it is, we return an EQ token
         */
        if (this.peekChar() === "=") {
          this.readChar();
          token = newToken(TOKENS.EQ, "==");
        } else {
          token = newToken(TOKENS.ASSIGN, this.ch);
        }
        break;

      case ";":
        token = newToken(TOKENS.SEMICOLON, this.ch);
        break;

      case "(":
        token = newToken(TOKENS.LPAREN, this.ch);
        break;

      case ")":
        token = newToken(TOKENS.RPAREN, this.ch);
        break;

      case ",":
        token = newToken(TOKENS.COMMA, this.ch);
        break;

      case "+":
        token = newToken(TOKENS.PLUS, this.ch);
        break;

      case "{":
        token = newToken(TOKENS.LBRACE, this.ch);
        break;

      case "}":
        token = newToken(TOKENS.RBRACE, this.ch);
        break;

      case "-":
        token = newToken(TOKENS.MINUS, this.ch);
        break;

      case "!":
        /**
         * This case can be either a BANG ! token or a NOT_EQ != token
         * We check if the next character is an =, if it is, we return a NOT_EQ token
         */
        if (this.peekChar() === "=") {
          this.readChar();
          token = newToken(TOKENS.NOT_EQ, "!=");
        } else {
          token = newToken(TOKENS.BANG, this.ch);
        }
        break;

      case "*":
        token = newToken(TOKENS.ASTERISK, this.ch);
        break;

      case "/":
        token = newToken(TOKENS.SLASH, this.ch);
        break;

      case "<":
        token = newToken(TOKENS.LT, this.ch);
        break;

      case ">":
        token = newToken(TOKENS.GT, this.ch);
        break;

      case "":
        token = newToken(TOKENS.EOF, "");
        break;

      default:
        if (this.isLetter(this.ch)) {
          /**
           * If the character is a letter, we read the identifier
           * and return a token with type IDENT
           */
          const literal = this.readIdentifier();
          const type = lookupIdent(literal as keyof typeof KEYWORDS);
          return newToken(type, literal);
        } else if (this.isDigit(this.ch)) {
          /**
           * If the character is a digit, we read the number
           * and return a token with type INT
           */
          const literal = this.readNumber();
          return newToken(TOKENS.INT, literal);
        } else {
          /**
           * If nothing matches, we return an ILLEGAL token
           */
          return newToken(TOKENS.ILLEGAL, this.ch);
        }
    }

    this.readChar();

    return token;
  }

  /**
   * Helper functions
   */
  isLetter(ch: string): boolean {
    /**
     * We can extend this regex to include ? and ! as well, this is where we can add more characters
     * that are allowed in identifiers/variables, like foo_bar, foo_bar!, foo_bar?
     */
    return ch.match(/[a-zA-Z_]/) !== null;
  }

  isDigit(ch: string): boolean {
    return ch.match(/[0-9]/) !== null;
  }

  /**
   * This function skips over any whitespace characters
   */
  skipWhitespace(): void {
    while (
      this.ch === " " ||
      this.ch === "\t" ||
      this.ch === "\n" ||
      this.ch === "\r"
    ) {
      this.readChar();
    }
  }

  /**
   * We can join the readIdentifier and readNumber functions into one function since
   * they share the same logic, but for sake of simplicity and readability, I have kept them separate
   */

  /**
   * This function continually reads the next character until it encounters a non-letter character
   * We store the initial position when this is called at the `position` variable and then slice the
   * input from the initial position to the current position to get the full identifier
   */
  readIdentifier(): string {
    const position = this.position;
    while (this.isLetter(this.ch)) {
      this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  /**
   * This function continually reads the next character until it encounters a non-digit character
   * We store the initial position when this is called at the `position` variable and then slice the
   * input from the initial position to the current position to get the full number
   *
   * This does not support floating point numbers yet
   */
  readNumber(): string {
    const position = this.position;
    while (this.isDigit(this.ch)) {
      this.readChar();
    }

    return this.input.slice(position, this.position);
  }

  /**
   * This function returns the next token without advancing the pointers
   * similar to readChar
   */
  peekChar(): string {
    if (this.readPosition >= this.input.length) {
      return "";
    } else {
      return this.input[this.readPosition];
    }
  }
}
