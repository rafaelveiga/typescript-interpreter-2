export type Token = {
  type: TOKENS;
  literal: string;
};

export enum TOKENS {
  ILLEGAL = "ILLEGAL",
  EOF = "EOF",

  // Identifiers + literals
  IDENT = "IDENT", // add, foobar, x, y, ...
  INT = "INT",

  // Operators
  ASSIGN = "=",
  PLUS = "+",
  MINUS = "-",
  BANG = "!",
  ASTERISK = "*",
  SLASH = "/",
  LT = "<",
  GT = ">",
  EQ = "==",
  NOT_EQ = "!=",

  // Delimiters
  COMMA = ",",
  SEMICOLON = ";",
  LPAREN = "(",
  RPAREN = ")",
  LBRACE = "{",
  RBRACE = "}",

  // Keywords
  FUNCTION = "FUNCTION",
  LET = "LET",
  TRUE = "TRUE",
  FALSE = "FALSE",
  IF = "IF",
  ELSE = "ELSE",
  RETURN = "RETURN",
}

export const KEYWORDS = {
  fn: TOKENS.FUNCTION,
  let: TOKENS.LET,
  true: TOKENS.TRUE,
  false: TOKENS.FALSE,
  if: TOKENS.IF,
  else: TOKENS.ELSE,
  return: TOKENS.RETURN,
};

/**
 * This is a helper function to create a new token based on the Token type
 */
export function newToken(token: TOKENS, char: string): Token {
  return { type: token, literal: char };
}

/**
 * This is a helper function that checks if a identifier matches a keyword like fn or let
 * and returns the appropriate token type. If it doesn't match, it returns IDENT
 */
export function lookupIdent(ident: keyof typeof KEYWORDS): TOKENS {
  return KEYWORDS[ident] || TOKENS.IDENT;
}
