/* eslint-disable @typescript-eslint/no-explicit-any */
import { Input, Stack, StackSeparator } from "@chakra-ui/react";
import { Field as ModelField, RelationField } from "@server/utils/db/fields";
import { useEffect, useReducer, useRef, useState } from "react";
import { Field } from "@admin/components/ui/field";
import { Button } from "@admin/components/ui/button";
import { ZodError } from "zod";
import { Link, useSearchParams } from "react-router-dom";
import { ModelRelationFieldCollapsible, RecordView } from "../record_view";
import { ModelHttpClient, usePagenationClient } from "@qupidjs/httpclient";
import {
  DrawerBackdrop,
  DrawerBody,
  DrawerContent,
  DrawerRoot,
  DrawerTrigger,
} from "@admin/components/ui/drawer";

export type FieldEditProps = {
  recordData: Record<string, any>;
  modelName: string;
  field: ModelField;
  value: any;
  onChange: (value: any) => void;
  fieldErrors: { current: Record<string, boolean> };
  fieldRefs?: {
    current: Record<string, React.RefObject<HTMLInputElement | null>>;
  };
  isCreate?: boolean;
  relations?: Record<string, number>; // { modelName: id }
};
export const FieldEdit: React.FC<FieldEditProps> = ({
  recordData,
  modelName,
  field,
  value,
  onChange,
  fieldErrors,
  fieldRefs,
  isCreate,
  relations,
}) => {
  const [searchParams] = useSearchParams();

  const [error, setError] = useState<string | undefined>();
  useEffect(() => {
    if (error) {
      fieldErrors.current[field.name] = true;
    } else {
      fieldErrors.current[field.name] = false;
    }
  }, [error]); // eslint-disable-line react-hooks/exhaustive-deps

  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!fieldRefs) return;
    fieldRefs.current[field.name] = inputRef;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (field.type === "Relation") {
    const relationField = field as RelationField;
    const relationModel = relationField.model();

    if (isCreate) {
      if (relationField.references.length === 0) {
        // Host model
        return (
          <Field label={relationField.name}>
            <Button w="full" variant="outline" disabled>
              {`Relation to <${relationModel.name}${relationField.isList ? "[]" : ""}>, Please create <${modelName}> first and then add <${relationModel.name}${relationField.isList ? "[]" : ""}> from <${modelName}> list view.`}
            </Button>
          </Field>
        );
      } else {
        // Foreign model
        let relationModelPk: number | undefined;
        if (relations) {
          relationModelPk = relations[relationModel.name];
        } else {
          relationModelPk =
            parseInt(searchParams.get(relationModel.name) || "") || undefined;
        }

        if (!relationModelPk) {
          const required = !field.validationOptions?.optional;
          return (
            <Field label={relationField.name} required={required}>
              <DrawerRoot size="lg">
                <DrawerBackdrop />
                <DrawerTrigger asChild>
                  <Button w="full" variant="outline">
                    {`Select <${relationModel.name}>`}
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerBody>
                    <RelationFieldListSelect
                      field={relationField}
                      onSelect={(record) => {
                        location.search = new URLSearchParams({
                          ...Object.fromEntries(searchParams),
                          [relationModel.name]: record.id.toString(),
                        }).toString();
                      }}
                    />
                  </DrawerBody>
                </DrawerContent>
              </DrawerRoot>
            </Field>
          );
        } else {
          return (
            <Field label={relationField.name}>
              <Button w="full" variant="outline" asChild>
                <Link
                  to={`${relationModel.modelRoutePrefix}/${relationModelPk}`}
                >
                  {`Relation to <${relationModel.name} ${relationModelPk}>. Click to Review.`}
                </Link>
              </Button>
            </Field>
          );
        }
      }
    } else {
      // !isCreate
      if (relationField.references.length === 0) {
        // Host model
        return (
          <Field label={relationField.name}>
            <ModelRelationFieldCollapsible
              modelName={modelName}
              field={field as RelationField}
              record={recordData}
              rootProps={{
                w: "full",
              }}
              triggerProps={{
                w: "full",
              }}
              triggerBtnProps={{
                w: "full",
                size: "md",
              }}
            />
          </Field>
        );
      } else {
        // Foreign model
        const relationTo: Record<string, string> = {};
        let relationToStr = "";
        for (const [idx, rf] of relationField.fields.entries()) {
          relationTo[relationField.references[idx]] = String(
            recordData[rf.name],
          );
          relationToStr += ` ${relationField.references[idx]}=${recordData[rf.name]}`;
        }
        return (
          <Field label={relationField.name}>
            <Button w="full" variant="outline" asChild>
              <Link
                to={`${relationModel.modelRoutePrefix}/search?${new URLSearchParams(
                  relationTo,
                ).toString()}`}
              >
                {`Relation to <${relationModel.name}${relationToStr}>. Cannot be edited directly. Please edit from <${relationModel.name}>. Click to Review.`}
              </Link>
            </Button>
          </Field>
        );
      }
    }
  } // if (field.type === "Relation")

  return (
    <Field
      label={field.name}
      required={!field.validationOptions?.optional}
      errorText={error}
      invalid={Boolean(error)}
    >
      <Input
        ref={inputRef}
        defaultValue={value}
        onChange={(e) => {
          try {
            onChange(field.coerce(e.target.value));
            setError(undefined);
          } catch (error) {
            if (error instanceof ZodError) {
              setError(error.errors[0].message);
            } else {
              setError("Unknown error");
              console.error(error);
            }
          }
        }}
      />
    </Field>
  );
};

const RelationFieldListSelect: React.FC<{
  field: RelationField;
  onSelect: (record: Record<string, any>) => void;
}> = ({ field, onSelect }) => {
  const client = new ModelHttpClient({
    baseUrl: window.app.config.baseUrl,
    prefix: field.model().modelRoutePrefix,
  });
  const { listData, loadNext, hasNext } = usePagenationClient(
    useReducer,
    client,
  );

  useEffect(() => {
    loadNext();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Stack separator={<StackSeparator />} gap={8}>
        {listData.map((record) => (
          <RecordView
            key={`${field.model().name}/${record.id}`}
            record={record}
            model={field.model()}
            onSelect={() => onSelect(record)}
            withDefaultOperations={false}
          />
        ))}
      </Stack>
      <Button onClick={loadNext} mt="4" disabled={!hasNext}>
        {hasNext ? "Load more" : "No more records"}
      </Button>
    </>
  );
};
