/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Heading, HStack, Spacer, Stack } from "@chakra-ui/react";
import { ModelHttpClient } from "@qupidjs/httpclient";
import { Model } from "@server/utils/db/model";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { toaster } from "@admin/components/ui/toaster";
import { FieldEdit } from "@admin/components/fiedl_edit";

export const EditView: React.FC<{
  model: Model;
  client: ModelHttpClient<any>;
}> = ({ model, client }) => {
  const { id } = useParams();
  const [error, setError] = useState<string | undefined>();
  const [data, setData] = useState<any>({});
  const fieldErrors = useRef({});

  const init = async () => {
    if (!id) {
      setError("ID is required");
      return;
    }
    const intId = parseInt(id);
    if (isNaN(intId)) {
      setError("Invalid ID");
      return;
    }
    const res = await client.retrieve(intId);
    if (!res.data) {
      setError("Record not found");
      return;
    }
    setData(res.data);
  };
  useEffect(() => {
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    if (Object.values(fieldErrors.current).some((e) => e)) {
      toaster.create({
        type: "error",
        title: "Error",
        description: "Please fix all errors",
      });
      return;
    }

    console.log("will save", data);
    const res = await client.update(data.id, data);
    if (res.code.toString().startsWith("2")) {
      toaster.create({
        type: "success",
        title: "Updated",
      });
    } else {
      toaster.create({
        type: "error",
        title: "Error",
        description: res.data,
      });
    }
  };

  if (error) {
    return <Heading>Error: {error}</Heading>;
  }

  return (
    <Stack>
      <Heading>{model.name} Model</Heading>
      {model.fields.map((field) => {
        if (field.readOnly || field.createOnly) {
          return null;
        }

        return (
          <FieldEdit
            key={field.name}
            recordData={data}
            modelName={model.name}
            field={field}
            value={data[field.name]}
            onChange={(value) => {
              setData({ ...data, [field.name]: value });
            }}
            fieldErrors={fieldErrors}
          />
        );
      })}
      <HStack mt="1rem">
        <Spacer />
        <Button onClick={handleSave}>Save</Button>
      </HStack>
    </Stack>
  );
};
