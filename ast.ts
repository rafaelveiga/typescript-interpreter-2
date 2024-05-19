import { Token } from "./token";

/**
 * Types
 */
/**
 * Program
 * The root node of our AST
 */
export type TProgram = {
  statements: TStatement[];
};

/**
 * Level 0
 * Every node in the AST must implement the Node interface.
 */
export type TNode = {
  tokenLiteral(): string;
  string(): string;
};

/**
 * Level 1
 * Statements are nodes that do not produce a value.
 */
export type TStatement = {
  statementNode(): TNode;
} & TNode;

/**
 * Level 1
 * Expressions are nodes that produce a value.
 */
export type TExpression = {
  expressionNode(): TNode;
} & TNode;

/**
 * Level 2
 * Let Statement
 */
export type TLetStatement = {
  token: Token;
  name: TIdentifier | null;
  value: TExpression | null;
} & TStatement;

/**
 * Level 2
 * Return Statement
 */
export type TReturnStatement = {
  token: Token;
  returnValue: TExpression | null;
} & TStatement;

/**
 * Level 2
 * Expression Statement
 * Expressions are statements, so we extend the TStatement interface
 * let x = 5; <-- let statement
 * x + 10; <-- expression statement
 */
export type TExpressionStatement = {
  token: Token;
  expression: TExpression | null;
} & TStatement;

/**
 * Level 3
 * Identifier
 * Identifiers can be used as expressions, so we extend the TExpression interface
 * let x = 5;
 * let add = fn(x, y) { x + y; };
 * or
 * x + 10;
 * add(5, x);
 */
export type TIdentifier = {
  token: Token;
  value: string;
} & TExpression;

/**
 * Builders
 * These are classes that implement the interfaces defined above
 * They are used to construct the nodes in the AST
 */
export class Program implements TProgram {
  statements: TStatement[];

  constructor(statements: TStatement[]) {
    this.statements = statements;
  }

  tokenLiteral(): string {
    if (this.statements.length > 0) {
      return this.statements[0].tokenLiteral();
    } else {
      return "";
    }
  }
}

export class LetStatement implements TLetStatement {
  token: Token;
  name: TIdentifier | null;
  value: TExpression | null;

  constructor(
    token: Token,
    name: TIdentifier | null,
    value: TExpression | null
  ) {
    this.token = token;
    this.name = name;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  statementNode(): TNode {
    return this;
  }

  string(): string {
    return `${this.tokenLiteral()} ${
      this.name?.value
    } = ${this.value?.string()};`;
  }
}

export class ReturnStatement implements TReturnStatement {
  token: Token;
  returnValue: TExpression | null;

  constructor(token: Token, returnValue: TExpression | null) {
    this.token = token;
    this.returnValue = returnValue;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  statementNode(): TNode {
    return this;
  }

  string(): string {
    return `${this.tokenLiteral()} ${this.returnValue?.string()};`;
  }
}

export class Identifier implements TIdentifier {
  token: Token;
  value: string;

  constructor(token: Token, value: string) {
    this.token = token;
    this.value = value;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return this.value;
  }
}
