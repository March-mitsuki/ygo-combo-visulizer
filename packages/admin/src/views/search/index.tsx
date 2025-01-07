/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelHttpClient, usePagenationClient } from "@qupidjs/httpclient";
import { Model } from "@server/utils/db/model";
import { useEffect, useReducer, useState } from "react";
import {
  Collapsible,
  Heading,
  Input,
  Stack,
  StackSeparator,
  Text,
} from "@chakra-ui/react";
import { Button } from "@admin/components/ui/button";
import { toaster } from "@admin/components/ui/toaster";
import { RecordView } from "@admin/components/record_view";
import { useSearchParams } from "react-router-dom";
import { DataListItem, DataListRoot } from "@admin/components/ui/data-list";
import { RelationField } from "@server/utils/db/fields";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";

export const SearchView: React.FC<{
  model: Model;
  client: ModelHttpClient<any>;
  search?: Record<string, string>;
}> = ({ model, client, search }) => {
  const [searchParams] = useSearchParams();
  const [where, setWhere] = useState(() => {
    return search ?? Object.fromEntries(searchParams.entries());
  });

  const {
    listData,
    loadNext,
    changeSearch,
    reload,
    isFetching,
    deleteRecord,
    hasNext,
    initialized,
  } = usePagenationClient(useReducer, client, where);

  const [isSearchInputOpen, setIsSearchInputOpen] = useState(false);

  useEffect(() => {
    loadNext();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Heading>{model.name} Model</Heading>

      <Collapsible.Root
        onOpenChange={(detail) => setIsSearchInputOpen(detail.open)}
      >
        <Collapsible.Trigger fontWeight="bold" mt="1rem" asChild>
          <Button size="sm">
            Search with
            {isSearchInputOpen ? <FaAngleUp /> : <FaAngleDown />}
          </Button>
        </Collapsible.Trigger>
        <Collapsible.Content>
          <DataListRoot orientation="horizontal" mt={2}>
            {model.fields.map((field, idx) => {
              if (field.type === "Relation") {
                const relationField = field as RelationField;
                const relationFieldFields = relationField.fields;

                return (
                  <DataListItem
                    key={`${model.name}/${field.name}/${idx}`}
                    label={field.name}
                    value={
                      <DataListRoot orientation="horizontal">
                        {relationFieldFields.map((rff, _idx) => {
                          return (
                            <DataListItem
                              key={`${rff.name}/${_idx}`}
                              label={rff.name}
                              value={
                                <Input
                                  size="sm"
                                  defaultValue={where[rff.name]}
                                  onChange={(e) => {
                                    setWhere((prev) => {
                                      return {
                                        ...prev,
                                        [rff.name]: e.target.value,
                                      };
                                    });
                                  }}
                                />
                              }
                            />
                          );
                        })}
                        {relationField.references.length === 0 && (
                          <Text>{`<${relationField.model().name}${relationField.isList ? "[]" : ""}> is hosted by <${model.name}>, can not use to search.`}</Text>
                        )}
                      </DataListRoot>
                    }
                  />
                );
              }

              return (
                <DataListItem
                  key={`${model.name}/${field.name}/${idx}`}
                  label={field.name}
                  value={
                    <Input
                      size="sm"
                      defaultValue={where[field.name]}
                      onChange={(e) => {
                        setWhere((prev) => {
                          return { ...prev, [field.name]: e.target.value };
                        });
                      }}
                    />
                  }
                />
              );
            })}
            <Button
              variant="subtle"
              onClick={() => {
                console.log("search", where);
                changeSearch(where);
                reload(where);
              }}
            >
              Research
            </Button>
          </DataListRoot>
        </Collapsible.Content>
      </Collapsible.Root>
      {initialized ? (
        <>
          <Stack separator={<StackSeparator />} mt="2rem" gap="8">
            {listData.map((record) => (
              <RecordView
                key={`${model.name}/${record.id}`}
                record={record}
                model={model}
                onDelete={() => {
                  if (
                    confirm(
                      `Are you sure to delete <${model.name} ${record.id}>?`,
                    )
                  ) {
                    deleteRecord(record.id);
                    toaster.create({
                      type: "success",
                      title: `Record <${model.name} ${record.id}> deleted`,
                    });
                  }
                }}
              />
            ))}
            {isFetching ? (
              <Text>Loading...</Text>
            ) : (
              listData.length === 0 && <Text>No records found</Text>
            )}
          </Stack>
          <Button onClick={loadNext} mt="4" disabled={!hasNext}>
            {hasNext ? "Load more" : "No more records"}
          </Button>
        </>
      ) : (
        <Text>Loading...</Text>
      )}
    </>
  );
};
