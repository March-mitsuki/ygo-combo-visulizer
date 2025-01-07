/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button, Heading, HStack, Spacer, Stack } from "@chakra-ui/react";
import { ModelHttpClient } from "@qupidjs/httpclient";
import { useRef, useState } from "react";
import { toaster } from "@admin/components/ui/toaster";
import { FieldEdit } from "@admin/components/fiedl_edit";
import { Model } from "@server/utils/db/model";
import { useNavigate, useSearchParams } from "react-router-dom";
import { findAllReferences } from "@admin/utlis/relation_field";

export const CreateView: React.FC<{
  model: Model;
  client: ModelHttpClient<any>;
}> = ({ model, client }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData] = useState<any>({});
  const fieldErrors = useRef({});
  const fieldRefs = useRef<Record<string, React.RefObject<HTMLInputElement>>>(
    {},
  );

  const handleCreate = async () => {
    if (Object.values(fieldErrors.current).some((e) => e)) {
      toaster.create({
        type: "error",
        title: "Error",
        description: "Please fix all errors",
      });
      return;
    }

    const refResult = await findAllReferences(model, searchParams);
    if (refResult.errors.length > 0) {
      toaster.create({
        type: "error",
        title: "Error",
        description: JSON.stringify(refResult.errors),
      });
      return;
    }

    const createData = {
      ...data,
      ...refResult.references,
    };
    console.log("will create", createData);
    const res = await client.create(createData);
    if (res.code.toString().startsWith("2")) {
      toaster.create({
        type: "success",
        title: "Created",
        action: {
          label: "View",
          onClick: () => {
            navigate(`${model.modelRoutePrefix}/${res.data.id}`);
          },
        },
      });
      setData({});
      Object.values(fieldRefs.current).forEach((ref) => {
        if (ref.current) {
          ref.current.value = "";
        }
      });
    } else {
      toaster.create({
        type: "error",
        title: "Error",
        description: JSON.stringify(res.data),
      });
    }
  };

  return (
    <Stack>
      <Heading>{model.name} Model</Heading>
      {model.fields.map((field) => {
        if (field.readOnly) {
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
              setData((prev: any) => ({ ...prev, [field.name]: value }));
            }}
            fieldErrors={fieldErrors}
            fieldRefs={fieldRefs}
            isCreate
          />
        );
      })}
      <HStack mt="1rem">
        <Spacer />
        <Button onClick={handleCreate}>Create</Button>
      </HStack>
    </Stack>
  );
};
