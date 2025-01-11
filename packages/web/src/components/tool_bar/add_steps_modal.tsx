import {
  DialogBackdrop,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "@web/components/ui/dialog";
import { Button } from "@web/components/ui/button";
import { Field } from "@web/components/ui/field";
import { useEffect, useState } from "react";
import { FinalField, GameFactory, Steps } from "@web/interfaces";
import { useForm } from "react-hook-form";
import { Input } from "@chakra-ui/react";
import { store } from "@web/store";
import { toolBarEvents } from "./events";
import { toaster } from "../ui/toaster";
import { stepsClient } from "@web/httpclient/models";

const AddStepsModal: React.FC = () => {
  const [finalField, setFinalField] = useState<FinalField>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    toolBarEvents.on("req-add-steps", (finalField) => {
      setFinalField(finalField);
    });
  }, []);

  return (
    <DialogRoot
      open={!!finalField}
      onOpenChange={() => setFinalField(undefined)}
      size="lg"
    >
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>添加构筑</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            onSubmit={handleSubmit((data) => {
              if (!finalField) {
                toaster.error({ title: "找不到steps" });
                return;
              }

              const steps = new Steps({
                name: data.name,
                cardDeck: store.getDeckById(finalField.cardDeckId)!,
                finalField: finalField,
                data: [GameFactory.step()],
              });
              store.addSteps(steps);
              stepsClient
                .create(steps.toSaveJSON())
                .then((res) => {
                  if (res.code.toString().startsWith("2")) {
                    toaster.success({ title: "已保存到服务器" });
                  } else {
                    toaster.error({
                      title: "保存到服务器失败",
                      description: res.code,
                    });
                  }
                })
                .catch((e) => {
                  toaster.error({ title: "请求出错" });
                  console.error("请求出错", e);
                });

              toolBarEvents.emit("add-steps-done");
              setFinalField(undefined);

              reset();
            })}
            id="add-steps-form"
          >
            <Field
              label="展开名称"
              helperText={errors["name"]?.message?.toString()}
            >
              <Input {...register("name")} />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setFinalField(undefined)}
            variant="subtle"
            size="sm"
          >
            关闭
          </Button>
          <Button size="sm" type="submit" form="add-steps-form">
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddStepsModal;
