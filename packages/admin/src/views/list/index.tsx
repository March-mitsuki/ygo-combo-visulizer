/* eslint-disable @typescript-eslint/no-explicit-any */
import { ModelHttpClient, usePagenationClient } from "@qupidjs/httpclient";
import { Model } from "@server/utils/db/model";
import { useEffect, useReducer } from "react";
import { Heading, Stack, StackSeparator, Text } from "@chakra-ui/react";
import { Button } from "@admin/components/ui/button";
import { toaster } from "@admin/components/ui/toaster";
import { RecordView } from "@admin/components/record_view";

export const ListView: React.FC<{
  model: Model;
  client: ModelHttpClient<any>;
}> = ({ model, client }) => {
  const { listData, loadNext, isFetching, deleteRecord, hasNext, initialized } =
    usePagenationClient(useReducer, client);

  useEffect(() => {
    loadNext();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Heading>{model.name} Model</Heading>
      {initialized ? (
        <>
          <Stack separator={<StackSeparator />} mt="1rem" gap="8">
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
