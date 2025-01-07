/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelHttpClient, usePagenationClient } from "@qupidjs/httpclient";
import { Model } from "@server/utils/db/model";
import { useReducer } from "react";
import {
  HStack,
  Stack,
  StackSeparator,
  Text,
  Link as CLink,
  Collapsible,
  StackProps,
  ButtonProps,
} from "@chakra-ui/react";
import { Button } from "@admin/components/ui/button";
import { Link } from "react-router-dom";
import { toaster } from "@admin/components/ui/toaster";
import { DataListItem, DataListRoot } from "@admin/components/ui/data-list";
import { RelationField } from "@server/utils/db/fields";
import {
  formatReferenceFieldData,
  getChildModelReferenceFieldData,
} from "@admin/utlis/relation_field";

export const RecordView: React.FC<{
  record: Record<string, any>;
  model: Model;
  onDelete?: () => void;
  onSelect?: () => void;
  withDefaultOperations?: boolean;
  // e.g. { modelName: id }
  withReferences?: Record<string, number>;
}> = ({
  record,
  model,
  withDefaultOperations = true,
  onDelete,
  onSelect,
  withReferences,
}) => {
  let refrencesQuery = withReferences ? "?" : "";
  if (withReferences) {
    refrencesQuery += Object.entries(withReferences)
      .map(([modelName, id]) => `${modelName}=${id}`)
      .join("&");
  }

  return (
    <DataListRoot orientation="horizontal">
      <HStack>
        <Text>{model.name}</Text>

        {withDefaultOperations && (
          <>
            <Button size="xs" variant="surface" asChild>
              <Link to={`${model.modelRoutePrefix}/create${refrencesQuery}`}>
                Create
              </Link>
            </Button>
            <Button size="xs" variant="surface" asChild>
              <Link
                to={`${model.modelRoutePrefix}/${record.id}${refrencesQuery}`}
              >
                Edit
              </Link>
            </Button>
          </>
        )}
        {typeof onSelect !== "undefined" && (
          <Button size="xs" variant="surface" onClick={onSelect}>
            Select
          </Button>
        )}
        {typeof onDelete !== "undefined" && (
          <Button size="xs" variant="surface" color="red" onClick={onDelete}>
            Delete
          </Button>
        )}
      </HStack>

      {model.fields.map((field) => {
        if (field.type === "Relation") {
          const relationField = field as RelationField;
          const relationModel = relationField.model();

          if (relationField.references.length === 0) {
            // Host model
            return (
              <DataListItem
                key={`${model.name}/${field.name}`}
                label={field.name}
                value={
                  <ModelRelationFieldCollapsible
                    modelName={model.name}
                    field={relationField}
                    record={record}
                  />
                }
              />
            );
          } else {
            // Foreign model
            return (
              <DataListItem
                key={`${model.name}/${field.name}`}
                label={field.name}
                value={
                  <CLink asChild>
                    <Link
                      to={`${relationModel.modelRoutePrefix}/search?${formatReferenceFieldData(relationField, record, "&")}`}
                    >
                      {`<${relationModel.name} ${formatReferenceFieldData(relationField, record)}>`}
                    </Link>
                  </CLink>
                }
              />
            );
          }
        } else {
          return (
            <DataListItem
              key={`${model.name}/${field.name}`}
              label={field.name}
              value={
                record[field.name] ? record[field.name].toString() : "null"
              }
            />
          );
        }
      })}
    </DataListRoot>
  );
};

export const ModelRelationFieldCollapsible: React.FC<{
  modelName: string;
  field: RelationField;
  record: Record<string, any>;
  rootProps?: StackProps;
  triggerProps?: StackProps;
  triggerBtnProps?: ButtonProps;
}> = ({
  modelName,
  field,
  record,
  rootProps,
  triggerProps,
  triggerBtnProps,
}) => {
  const relationModel = field.model();
  const relationModelDisplay = field.isList
    ? `${relationModel.name}[]`
    : relationModel.name;

  const client = new ModelHttpClient<any>({
    baseUrl: window.app.config.baseUrl,
    prefix: relationModel.modelRoutePrefix,
  });
  const where = getChildModelReferenceFieldData(modelName, field, record);
  const { listData, loadNext, isFetching, deleteRecord, hasNext, initialized } =
    usePagenationClient(useReducer, client, where);

  return (
    <Collapsible.Root as={Stack} {...rootProps}>
      <Collapsible.Trigger as={HStack} {...(triggerProps as any)}>
        <Button
          size="xs"
          variant="subtle"
          onClick={() => {
            if (listData.length === 0 && !initialized) {
              loadNext();
            }
          }}
          {...triggerBtnProps}
        >
          {`<${relationModelDisplay}>`}
        </Button>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <Stack separator={<StackSeparator />} mt="1" gap="4">
          {listData.map((itemRecord) => (
            <RecordView
              key={`${modelName}/${field.name}/${itemRecord.id}`}
              record={itemRecord}
              model={relationModel}
              onDelete={() => {
                if (
                  confirm(
                    `Are you sure to delete <${relationModel.name} ${itemRecord.id}>?`,
                  )
                ) {
                  deleteRecord(itemRecord.id);
                  toaster.create({
                    type: "success",
                    title: `Record <${relationModel.name} ${itemRecord.id}> deleted`,
                  });
                }
              }}
              withReferences={{ [modelName]: record.id }}
            />
          ))}
          {isFetching ? (
            <Text>Loading...</Text>
          ) : (
            listData.length === 0 && (
              <HStack>
                <Text>{relationModel.name}</Text>

                <Button size="xs" variant="surface" asChild>
                  <Link
                    to={`${relationModel.modelRoutePrefix}/create?${modelName}=${record.id}`}
                  >
                    Create
                  </Link>
                </Button>
              </HStack>
            )
          )}
        </Stack>
        <Button onClick={loadNext} mt="4" disabled={!hasNext}>
          {hasNext ? "Load more" : "No more records"}
        </Button>
      </Collapsible.Content>
    </Collapsible.Root>
  );
};
