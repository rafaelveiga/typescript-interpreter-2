import { TToken } from "./token";

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
 * Level 2.A
 * Let Statement
 */
export type TLetStatement = {
  token: TToken;
  name: TIdentifier | null;
  value: TExpression | null;
} & TStatement;

/**
 * Level 2.A
 * Return Statement
 */
export type TReturnStatement = {
  token: TToken;
  returnValue: TExpression | null;
} & TStatement;

/**
 * Level 2.A
 * Expression Statement
 * Expressions are statements, so we extend the TStatement interface
 * let x = 5; <-- let statement
 * x + 10; <-- expression statement
 */
export type TExpressionStatement = {
  token: TToken;
  expression: TExpression | null;
} & TStatement;

/**
 * Level 2.A
 * Block Statement
 */
export type TBlockStatement = {
  token: TToken;
  statements: TStatement[];
} & TStatement;

/**
 * Level 2.B
 * Identifier
 * Identifiers can be used as expressions, so we extend the TExpression interface
 * let x = 5;
 * let add = fn(x, y) { x + y; };
 * or
 * x + 10;
 * add(5, x);
 */
export type TIdentifier = {
  token: TToken;
  value: string;
} & TExpression;

/**
 * Level 2.B
 * Integer Literal
 */
export type TIntegerLiteral = {
  token: TToken;
  value: number;
} & TExpression;

/**
 * Level 2.B
 * Boolean
 */
export type TBoolean = {
  token: TToken;
  value: boolean;
} & TExpression;

/**
 * Level 2.B
 * If Expression
 */
export type TIfExpression = {
  token: TToken;
  condition: TExpression | null;
  consequence: TBlockStatement | null;
  alternative: TBlockStatement | null;
} & TExpression;

export type TFunctionLiteral = {
  token: TToken;
  parameters: TIdentifier[] | null;
  body: TBlockStatement | null;
} & TExpression;

export type TCallExpression = {
  token: TToken;
  function: TExpression | null;
  arguments: TExpression[] | null;
} & TExpression;

/**
 * Level 2.B
 * Prefix Expression
 */
export type TPrefixExpression = {
  token: TToken;
  operator: string;
  right: TExpression | null;
} & TExpression;

/**
 * Level 2.B
 * Infix Expression
 */
export type TInfixExpression = {
  token: TToken;
  left: TExpression | null;
  operator: string;
  right: TExpression | null;
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

  string(): string {
    return this.statements.map((statement) => statement.string()).join("");
  }
}

/**
 * Level 2.A
 */
export class LetStatement implements TLetStatement {
  token: TToken;
  name: TIdentifier | null;
  value: TExpression | null;

  constructor(
    token: TToken,
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
  token: TToken;
  returnValue: TExpression | null;

  constructor(token: TToken, returnValue: TExpression | null) {
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

export class ExpressionStatement implements TExpressionStatement {
  token: TToken;
  expression: TExpression | null;

  constructor(token: TToken, expression: TExpression | null) {
    this.token = token;
    this.expression = expression;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  statementNode(): TNode {
    return this;
  }

  string(): string {
    return this.expression?.string() || "";
  }
}

export class BlockStatement implements TBlockStatement {
  token: TToken;
  statements: TStatement[];

  constructor(token: TToken, statements: TStatement[]) {
    this.token = token;
    this.statements = statements;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  statementNode(): TNode {
    return this;
  }

  string(): string {
    return this.statements.map((statement) => statement.string()).join("");
  }
}

/**
 * Level 2.B
 */
export class Identifier implements TIdentifier {
  token: TToken;
  value: string;

  constructor(token: TToken, value: string) {
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

export class IntegerLiteral implements TIntegerLiteral {
  token: TToken;
  value: number;

  constructor(token: TToken, value: number) {
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
    return this.token.literal;
  }
}

export class FunctionLiteral implements TFunctionLiteral {
  token: TToken;
  parameters: TIdentifier[] | null;
  body: TBlockStatement | null;

  constructor(
    token: TToken,
    parameters: TIdentifier[] | null,
    body: TBlockStatement | null
  ) {
    this.token = token;
    this.parameters = parameters;
    this.body = body;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return `${this.tokenLiteral()}(${
      this.parameters
        ? this.parameters.map((param) => param.string()).join(", ")
        : ""
    }) ${this.body?.string()}`;
  }
}

export class Boolean implements TBoolean {
  token: TToken;
  value: boolean;

  constructor(token: TToken, value: boolean) {
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
    return this.token.literal;
  }
}

export class IfExpression implements TIfExpression {
  token: TToken;
  condition: TExpression | null;
  consequence: TBlockStatement | null;
  alternative: TBlockStatement | null;

  constructor(
    token: TToken,
    condition: TExpression | null,
    consequence: TBlockStatement | null,
    alternative: TBlockStatement | null
  ) {
    this.token = token;
    this.condition = condition;
    this.consequence = consequence;
    this.alternative = alternative;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return `if ${this.condition?.string()} ${this.consequence?.string()} ${
      this.alternative ? `else ${this.alternative.string()}` : ""
    }`;
  }
}

export class PrefixExpression implements TPrefixExpression {
  token: TToken;
  operator: string;
  right: TExpression | null;

  constructor(
    token: TToken,
    operator: string,
    right: TExpression | null = null
  ) {
    this.token = token;
    this.operator = operator;
    this.right = right;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return `(${this.operator}${this.right?.string()})`;
  }
}

export class InfixExpression implements TInfixExpression {
  token: TToken;
  left: TExpression | null;
  operator: string;
  right: TExpression | null;

  constructor(
    token: TToken,
    left: TExpression | null,
    operator: string,
    right: TExpression | null
  ) {
    this.token = token;
    this.left = left;
    this.operator = operator;
    this.right = right;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return `(${this.left?.string()} ${this.operator} ${this.right?.string()})`;
  }
}

export class CallExpression implements TCallExpression {
  token: TToken;
  function: TExpression | null;
  arguments: TExpression[] | null;

  constructor(
    token: TToken,
    fn: TExpression | null,
    args: TExpression[] | null
  ) {
    this.token = token;
    this.function = fn;
    this.arguments = args;
  }

  tokenLiteral(): string {
    return this.token.literal;
  }

  expressionNode(): TNode {
    return this;
  }

  string(): string {
    return `${this.function?.string()}(${this.arguments?.map((arg) =>
      arg.string()
    )})`;
  }
}
