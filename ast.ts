/**
 * Types
 */

/**
 * Every node in the AST must implement the Node interface.
 */
export type Node = {
  tokenLiteral: string;
};

/**
 * Statements are nodes that do not produce a value.
 */
export type Statement = {
  statementNode(): Node;
} & Node;

/**
 * Expressions are nodes that produce a value.
 */
export type Expression = {
  expressionNode(): Node;
} & Node;
