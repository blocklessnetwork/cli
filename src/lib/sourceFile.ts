import fs from 'fs'
import ts from 'typescript'

export function getTsExportedFunctions(fileName: string) {
  const allowedVerbs = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  const fileContents = fs.readFileSync(fileName, "utf-8")
  const sourceFile = ts.createSourceFile(fileName, fileContents, ts.ScriptTarget.Latest)

  const exportedFunctions: string[] = []

  function visitNode(node: any) {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      ts.isIdentifier(node.name) &&
      allowedVerbs.includes(node.name.escapedText as string)
    ) {
      exportedFunctions.push(node.name.escapedText as string)
    }

    ts.forEachChild(node, visitNode)
  }

  visitNode(sourceFile)
  
  return exportedFunctions
}