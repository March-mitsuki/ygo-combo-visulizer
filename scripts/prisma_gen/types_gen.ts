import ts from "typescript";
import { Model } from "@server/utils/db/model";
import { Field, RelationField } from "@server/utils/db/fields";
import prettier from "prettier";

export const genModelsType = (models: Model[]) => {
  const printer = ts.createPrinter();
  const sourceFile = ts.factory.createSourceFile(
    [genImport(), ...models.map((model) => genSingleModel(model))],
    ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None,
  );
  return prettier.format(printer.printFile(sourceFile), {
    parser: "typescript",
  });
};

const genImport = () => {
  return ts.factory.createImportDeclaration(
    undefined,
    ts.factory.createImportClause(
      false,
      undefined,
      ts.factory.createNamedImports([
        ts.factory.createImportSpecifier(
          false,
          undefined,
          ts.factory.createIdentifier("JsonData"),
        ),
      ]),
    ),
    ts.factory.createStringLiteral("../api"),
  );
};

const genSingleModel = (model: Model) => {
  return ts.factory.createTypeAliasDeclaration(
    [ts.factory.createModifier(ts.SyntaxKind.ExportKeyword)],
    ts.factory.createIdentifier(model.name),
    undefined,
    ts.factory.createTypeLiteralNode(
      model.fields.map((field) => genSingleField(field)),
    ),
  );
};

type PropertySignatureArgs = {
  modifiers?: ts.Modifier[];
  name: string;
  questionToken?: ts.QuestionToken;
  type?: ts.TypeNode;
};
const genSingleField = (field: Field) => {
  const args: PropertySignatureArgs = {
    name: field.name,
  };

  if (field.validationOptions?.optional) {
    args.questionToken = ts.factory.createToken(ts.SyntaxKind.QuestionToken);
  }

  if (field.type === "Relation") {
    args.type = ts.factory.createTypeReferenceNode(
      (field as RelationField).model().name,
    );
  } else {
    let typeName = "";
    switch (field.type) {
      case "String":
        typeName += "string";
        break;
      case "Int":
      case "Float":
        typeName += "number";
        break;
      case "DateTime":
        typeName += "Date";
        break;
      case "Boolean":
        typeName += "boolean";
        break;
      case "BigInt":
        typeName += "bigint";
        break;
      case "Json":
        typeName += "JsonData";
        break;
      default:
        throw new Error(`Unknown field type: ${field.type}`);
    }
    if (field.nullable) {
      typeName += " | null";
    }

    args.type = ts.factory.createTypeReferenceNode(typeName);
  }

  return ts.factory.createPropertySignature(
    args.modifiers,
    args.name,
    args.questionToken,
    args.type,
  );
};
