import { Plugin, PluginContext } from 'dtsgenerator';
import ts from 'typescript';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require('./package.json');

const plugin: Plugin = {
    meta: {
        name: packageJson.name,
        version: packageJson.version,
        description: packageJson.description,
    },
    postProcess,
};

interface ConfigContent {
    prefix?: string;
    postfix?: string;
}
export type Config =
    | {
          interface: ConfigContent;
          type: ConfigContent;
      }
    | ConfigContent;

/**
 * This `postProcess` is the hook for the output AST changing.
 */
async function postProcess(
    pluginContext: PluginContext
): Promise<ts.TransformerFactory<ts.SourceFile> | undefined> {
    return (context: ts.TransformationContext) => (
        root: ts.SourceFile
    ): ts.SourceFile => {
        const config: Config = pluginContext.option;
        if (config == null) {
            return root;
        }

        const program = createProgram(root, context.getCompilerOptions());
        const checker = program.getTypeChecker();
        const converted = new Map<string, string>();

        root = convertTypeName(context, root, config, checker, converted);
        root = convertReference(context, root, checker, converted);
        return root;
    };
}

function convertTypeName(
    context: ts.TransformationContext,
    root: ts.SourceFile,
    config: Config,
    checker: ts.TypeChecker,
    converted: Map<string, string>
): ts.SourceFile {
    function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);
        if (
            ts.isInterfaceDeclaration(node) ||
            ts.isTypeAliasDeclaration(node)
        ) {
            const type = checker.getTypeAtLocation(node);
            const symbol = type.getSymbol();
            if (symbol != null) {
                const key = checker.getFullyQualifiedName(symbol);
                const value = changeTypeName(node, config);
                converted.set(key, value);
            }
        }
        return node;
    }
    return ts.visitNode(root, visit);
}

function convertReference(
    context: ts.TransformationContext,
    root: ts.SourceFile,
    checker: ts.TypeChecker,
    converted: Map<string, string>
): ts.SourceFile {
    function visit(node: ts.Node): ts.Node {
        node = ts.visitEachChild(node, visit, context);
        if (ts.isTypeReferenceNode(node)) {
            const type = checker.getTypeAtLocation(node);
            const symbol = type.getSymbol();
            if (symbol != null) {
                const key = checker.getFullyQualifiedName(symbol);
                const value = converted.get(key);
                if (value != null) {
                    node = replaceTypeName(node.typeName, value);
                }
            }
        }
        return node;
    }
    return ts.visitNode(root, visit);
}

function createProgram(
    root: ts.SourceFile,
    options: ts.CompilerOptions
): ts.Program {
    const host = ts.createCompilerHost(options);
    host.getSourceFile = (): ts.SourceFile => root;
    return ts.createProgram([''], options, host);
}

function changeTypeName<
    T extends ts.InterfaceDeclaration | ts.TypeAliasDeclaration
>(node: T, config: Config): string {
    const name = node.name.getText();
    function decorate(name: string, config: ConfigContent): string {
        if (config.prefix != null) {
            name = config.prefix + name;
        }
        if (config.postfix != null) {
            name += config.postfix;
        }
        return name;
    }
    let result = name;
    if ('prefix' in config || 'postfix' in config) {
        result = decorate(name, config);
    }
    if ('interface' in config && ts.isInterfaceDeclaration(node)) {
        result = decorate(name, config.interface);
    }
    if ('type' in config && ts.isTypeAliasDeclaration(node)) {
        result = decorate(name, config.type);
    }
    node.name = ts.createIdentifier(result);
    return result;
}

function replaceTypeName(node: ts.EntityName, replaced: string): ts.EntityName {
    function visit(node: ts.EntityName): ts.EntityName {
        if (ts.isIdentifier(node)) {
            return ts.createIdentifier(replaced);
        } else if (ts.isQualifiedName(node)) {
            return visit(node.right);
        }
        return node;
    }
    return visit(node);
}

export default plugin;
