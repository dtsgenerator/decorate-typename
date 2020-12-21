import { ts, Plugin, PluginContext } from 'dtsgenerator';

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
        const option = pluginContext.option;
        if (option == null || typeof option === 'boolean') {
            return root;
        }

        const config = option as Config;
        const converted = new Map<string, string>();

        root = convertTypeName(context, root, config, converted);
        root = convertReference(context, root, converted);
        return root;
    };
}

function convertTypeName(
    context: ts.TransformationContext,
    root: ts.SourceFile,
    config: Config,
    converted: Map<string, string>
): ts.SourceFile {
    const parents: ts.Node[] = [root];
    function visit(node: ts.Node): ts.Node {
        parents.push(node);
        node = ts.visitEachChild(node, visit, context);
        parents.pop();
        if (
            ts.isInterfaceDeclaration(node) ||
            ts.isTypeAliasDeclaration(node)
        ) {
            const key = getFullyTypeName(node, parents);
            const value = changeTypeName(node, config);
            converted.set(key, value);
        }
        return node;
    }
    return ts.visitNode(root, visit);
}

function convertReference(
    context: ts.TransformationContext,
    root: ts.SourceFile,
    converted: Map<string, string>
): ts.SourceFile {
    const parents: ts.Node[] = [root];
    function visit(node: ts.Node): ts.Node {
        parents.push(node);
        node = ts.visitEachChild(node, visit, context);
        parents.pop();
        if (ts.isTypeReferenceNode(node)) {
            const name = getTypeName(node.typeName);
            const names = getBaseNames(parents);
            const value = searchConvertedValue(converted, names, name);
            if (value != null) {
                Object.assign<typeof node, Partial<typeof node>>(node, {
                    typeName: replaceTypeName(node.typeName, value),
                });
            }
        }
        return node;
    }
    return ts.visitNode(root, visit);
}

function searchConvertedValue(converted: Map<string, string>, baseNames: string[], nodeName: string): string | undefined {
    const names = baseNames.concat();
    for (;;) {
        const name = names.concat(nodeName).join('.');
        const value = converted.get(name);
        if (value != null) {
            return value;
        }
        if (names.length === 0) {
            break;
        }
        names.pop();
    }
    return undefined;
}

function changeTypeName<
    T extends ts.InterfaceDeclaration | ts.TypeAliasDeclaration
>(node: T, config: Config): string {
    const name = getName(node.name);
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
    Object.assign<T, Partial<ts.InterfaceDeclaration | ts.TypeAliasDeclaration>>(node, {
        name: ts.factory.createIdentifier(result),
    });
    return result;
}

function getTypeName(node: ts.EntityName): string {
    const names: string[] = [];
    function visit(node: ts.EntityName): void {
        if (ts.isIdentifier(node)) {
            names.push(getName(node));
        } else {
            visit(node.left);
            visit(node.right);
        }
    }
    visit(node);
    return names.join('.');
}

function replaceTypeName(node: ts.EntityName, replaced: string): ts.EntityName {
    const result = ts.factory.createIdentifier(replaced);
    if (ts.isIdentifier(node)) {
        return result;
    } else {
        return ts.factory.createQualifiedName(node.left, result);
    }
}

function getFullyTypeName(node: ts.InterfaceDeclaration | ts.TypeAliasDeclaration, parents: ts.Node[]): string {
    const names = getBaseNames(parents);
    names.push(getName(node.name));
    return names.join('.');
}

function getBaseNames(parents: ts.Node[]): string[] {
    const names: string[] = [];
    for (const p of parents) {
        if (ts.isModuleDeclaration(p)) {
            const name = p.name;
            if (ts.isIdentifier(name)) {
                names.push(getName(name));
            } else {
                names.push(name.getText());
            }
        }
    }
    return names;
}

function getName(name: ts.Identifier): string {
    return name.escapedText.toString();
}

export default plugin;
