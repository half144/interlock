import ts from "typescript";

export const MAX_PROPS = 10;
export const MAX_BOOLEAN_PROPS = 3;

const isComponentName = (name) => /^[A-Z]/.test(name);

export function checkDotComponents({ rel, ast }) {
  const violations = [];
  const flag = (name, part) =>
    violations.push({
      file: rel,
      message: `${rel}: ${name}.${part} is a dot component. Export ${part} as its own component in its own folder and pass it to ${name} through a slot prop.`,
    });
  const visit = (node) => {
    if (
      ts.isBinaryExpression(node) &&
      node.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
      ts.isPropertyAccessExpression(node.left) &&
      ts.isIdentifier(node.left.expression) &&
      isComponentName(node.left.expression.text) &&
      isComponentName(node.left.name.text)
    ) {
      flag(node.left.expression.text, node.left.name.text);
    }
    if (ts.isCallExpression(node) && node.expression.getText(ast) === "Object.assign") {
      const [target, parts] = node.arguments;
      if (
        target &&
        parts &&
        ts.isIdentifier(target) &&
        isComponentName(target.text) &&
        ts.isObjectLiteralExpression(parts)
      ) {
        for (const prop of parts.properties) {
          if (prop.name && isComponentName(prop.name.getText(ast)))
            flag(target.text, prop.name.getText(ast));
        }
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return violations;
}

function localTypes(ast) {
  const types = new Map();
  for (const statement of ast.statements) {
    if (ts.isInterfaceDeclaration(statement) || ts.isTypeAliasDeclaration(statement)) {
      types.set(statement.name.text, statement);
    }
  }
  return types;
}

function isBooleanType(type) {
  if (type.kind === ts.SyntaxKind.BooleanKeyword) return true;
  if (ts.isLiteralTypeNode(type)) {
    return (
      type.literal.kind === ts.SyntaxKind.TrueKeyword ||
      type.literal.kind === ts.SyntaxKind.FalseKeyword
    );
  }
  if (ts.isParenthesizedTypeNode(type)) return isBooleanType(type.type);
  if (ts.isUnionTypeNode(type)) {
    const parts = type.types.filter(
      (t) =>
        t.kind !== ts.SyntaxKind.UndefinedKeyword &&
        !(ts.isLiteralTypeNode(t) && t.literal.kind === ts.SyntaxKind.NullKeyword),
    );
    return parts.length > 0 && parts.every(isBooleanType);
  }
  return false;
}

function collectProps(type, types, seen = new Set()) {
  if (ts.isTypeLiteralNode(type)) return membersToProps(type.members);
  if (ts.isIntersectionTypeNode(type))
    return type.types.flatMap((t) => collectProps(t, types, seen));
  if (ts.isParenthesizedTypeNode(type)) return collectProps(type.type, types, seen);
  if (ts.isTypeReferenceNode(type) && ts.isIdentifier(type.typeName)) {
    const name = type.typeName.text;
    const declared = types.get(name);
    if (!declared || seen.has(name)) return [];
    seen.add(name);
    if (ts.isTypeAliasDeclaration(declared)) return collectProps(declared.type, types, seen);
    const inherited = (declared.heritageClauses ?? []).flatMap((clause) =>
      clause.types.flatMap((t) => collectProps(t, types, seen)),
    );
    return [...membersToProps(declared.members), ...inherited];
  }
  return [];
}

function membersToProps(members) {
  return members
    .filter(ts.isPropertySignature)
    .map((m) => ({ name: m.name.getText(), boolean: m.type ? isBooleanType(m.type) : false }));
}

function componentProps(node, types) {
  if (ts.isFunctionDeclaration(node) && node.name && isComponentName(node.name.text)) {
    const annotation = node.parameters[0]?.type;
    return annotation ? { name: node.name.text, props: collectProps(annotation, types) } : null;
  }
  if (
    ts.isVariableDeclaration(node) &&
    ts.isIdentifier(node.name) &&
    isComponentName(node.name.text) &&
    node.initializer
  ) {
    const init = node.initializer;
    if (!ts.isArrowFunction(init) && !ts.isFunctionExpression(init)) return null;
    const generic =
      node.type && ts.isTypeReferenceNode(node.type) ? node.type.typeArguments?.[0] : undefined;
    const annotation = init.parameters[0]?.type ?? generic;
    return annotation ? { name: node.name.text, props: collectProps(annotation, types) } : null;
  }
  return null;
}

export function checkProps({ rel, ast }) {
  const violations = [];
  const types = localTypes(ast);
  const visit = (node) => {
    const found = componentProps(node, types);
    if (found) {
      const booleans = found.props.filter((p) => p.boolean);
      if (booleans.length > MAX_BOOLEAN_PROPS) {
        violations.push({
          file: rel,
          message: `${rel}: ${found.name} has ${booleans.length} boolean props (${booleans.map((p) => p.name).join(", ")}), max ${MAX_BOOLEAN_PROPS}. Replace the flags with one \`variant\` prop or with slot props (ReactNode).`,
        });
      }
      if (found.props.length > MAX_PROPS) {
        violations.push({
          file: rel,
          message: `${rel}: ${found.name} has ${found.props.length} props, max ${MAX_PROPS}. Split it into smaller components and pass content through slots (header=, actions=, children).`,
        });
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  return violations;
}
