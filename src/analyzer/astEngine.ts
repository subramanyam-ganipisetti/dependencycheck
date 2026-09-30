import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { ASTCallTrace } from '../types';

// Workaround for ES module default import of @babel/traverse
const traverse = (traverseModule as any).default || traverseModule;

export interface ExtractedImport {
  packageName: string;
  importedSymbol: string; // 'default' or named symbol or '*'
  localName: string;
  sourceFile: string;
  line: number;
}

export interface ExtractedCall {
  calleeName: string;
  memberName?: string;
  fullCallString: string;
  sourceFile: string;
  line: number;
  column: number;
  codeSnippet: string;
}

export interface FileAnalysisResult {
  filePath: string;
  imports: ExtractedImport[];
  calls: ExtractedCall[];
}

/**
 * Parses source code into AST and extracts all imports, requires, and call expressions.
 */
export function analyzeSourceFile(filePath: string, code: string): FileAnalysisResult {
  const imports: ExtractedImport[] = [];
  const calls: ExtractedCall[] = [];

  const lines = code.split('\n');
  const getLineSnippet = (lineNum: number) => {
    return lines[lineNum - 1]?.trim() || '';
  };

  try {
    const ast = parse(code, {
      sourceType: 'module',
      plugins: [
        'typescript',
        'jsx',
        'decorators-legacy',
        'classProperties',
        'optionalChaining',
        'nullishCoalescingOperator',
        'dynamicImport'
      ],
      errorRecovery: true
    });

    traverse(ast, {
      // 1. ES Module imports: import x from 'pkg', import { y as z } from 'pkg'
      ImportDeclaration(path: any) {
        const pkgName = path.node.source.value;
        const line = path.node.loc?.start.line || 1;

        path.node.specifiers.forEach((specifier: any) => {
          if (specifier.type === 'ImportDefaultSpecifier') {
            imports.push({
              packageName: pkgName,
              importedSymbol: 'default',
              localName: specifier.local.name,
              sourceFile: filePath,
              line
            });
          } else if (specifier.type === 'ImportSpecifier') {
            imports.push({
              packageName: pkgName,
              importedSymbol: specifier.imported?.name || specifier.local.name,
              localName: specifier.local.name,
              sourceFile: filePath,
              line
            });
          } else if (specifier.type === 'ImportNamespaceSpecifier') {
            imports.push({
              packageName: pkgName,
              importedSymbol: '*',
              localName: specifier.local.name,
              sourceFile: filePath,
              line
            });
          }
        });
      },

      // 2. CommonJS require: const x = require('pkg')
      VariableDeclarator(path: any) {
        const init = path.node.init;
        if (
          init &&
          init.type === 'CallExpression' &&
          init.callee.type === 'Identifier' &&
          init.callee.name === 'require' &&
          init.arguments.length > 0 &&
          init.arguments[0].type === 'StringLiteral'
        ) {
          const pkgName = init.arguments[0].value;
          const line = path.node.loc?.start.line || 1;

          // const x = require('pkg')
          if (path.node.id.type === 'Identifier') {
            imports.push({
              packageName: pkgName,
              importedSymbol: 'default',
              localName: path.node.id.name,
              sourceFile: filePath,
              line
            });
          }
          // const { foo, bar: baz } = require('pkg')
          else if (path.node.id.type === 'ObjectPattern') {
            path.node.id.properties.forEach((prop: any) => {
              if (prop.type === 'ObjectProperty') {
                imports.push({
                  packageName: pkgName,
                  importedSymbol: prop.key.name || prop.key.value,
                  localName: prop.value.name || prop.key.name,
                  sourceFile: filePath,
                  line
                });
              }
            });
          }
        }
      },

      // 3. Call expressions: x.func() or func()
      CallExpression(path: any) {
        const callee = path.node.callee;
        const line = path.node.loc?.start.line || 1;
        const column = path.node.loc?.start.column || 0;
        const snippet = getLineSnippet(line);

        // e.g. jsonwebtoken.verify(...) or obj.template(...)
        if (callee.type === 'MemberExpression') {
          let objectName = '';
          if (callee.object.type === 'Identifier') {
            objectName = callee.object.name;
          } else if (callee.object.type === 'MemberExpression' && callee.object.property.type === 'Identifier') {
            objectName = callee.object.property.name;
          }

          let propertyName = '';
          if (callee.property.type === 'Identifier') {
            propertyName = callee.property.name;
          }

          if (objectName && propertyName) {
            calls.push({
              calleeName: objectName,
              memberName: propertyName,
              fullCallString: `${objectName}.${propertyName}()`,
              sourceFile: filePath,
              line,
              column,
              codeSnippet: snippet
            });
          }
        }
        // Direct call: verify(...) or template(...)
        else if (callee.type === 'Identifier') {
          calls.push({
            calleeName: callee.name,
            fullCallString: `${callee.name}()`,
            sourceFile: filePath,
            line,
            column,
            codeSnippet: snippet
          });
        }
      }
    });
  } catch (err: any) {
    // Graceful regex-based fallback if parsing syntax errors occur in loose files
    regexFallbackParser(code, filePath, imports, calls);
  }

  return { filePath, imports, calls };
}

/**
 * Robust fallback scanner for files that may have unconventional syntax
 */
function regexFallbackParser(
  code: string,
  filePath: string,
  imports: ExtractedImport[],
  calls: ExtractedCall[]
) {
  const lines = code.split('\n');

  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    const trimmed = line.trim();

    // Match import ... from 'pkg'
    const importMatch = trimmed.match(/import\s+(?:(\w+)|\{([^}]+)\}|\*\s+as\s+(\w+))\s+from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      const pkg = importMatch[4];
      if (importMatch[1]) {
        imports.push({ packageName: pkg, importedSymbol: 'default', localName: importMatch[1], sourceFile: filePath, line: lineNum });
      } else if (importMatch[2]) {
        importMatch[2].split(',').forEach(item => {
          const parts = item.trim().split(/\s+as\s+/);
          imports.push({ packageName: pkg, importedSymbol: parts[0].trim(), localName: (parts[1] || parts[0]).trim(), sourceFile: filePath, line: lineNum });
        });
      } else if (importMatch[3]) {
        imports.push({ packageName: pkg, importedSymbol: '*', localName: importMatch[3], sourceFile: filePath, line: lineNum });
      }
    }

    // Match require
    const reqMatch = trimmed.match(/(?:const|let|var)\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\)/);
    if (reqMatch) {
      imports.push({ packageName: reqMatch[2], importedSymbol: 'default', localName: reqMatch[1], sourceFile: filePath, line: lineNum });
    }

    // Match member calls
    const callMatch = trimmed.match(/([a-zA-Z0-9_$]+)\.([a-zA-Z0-9_$]+)\(/);
    if (callMatch) {
      calls.push({
        calleeName: callMatch[1],
        memberName: callMatch[2],
        fullCallString: `${callMatch[1]}.${callMatch[2]}()`,
        sourceFile: filePath,
        line: lineNum,
        column: 0,
        codeSnippet: trimmed
      });
    }
  });
}
