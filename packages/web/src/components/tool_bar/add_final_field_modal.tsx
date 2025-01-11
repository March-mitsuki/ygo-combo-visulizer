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
import { BuildFactory, CardDeck } from "@web/interfaces";
import { useForm } from "react-hook-form";
import { Input } from "@chakra-ui/react";
import { store } from "@web/store";
import { toolBarEvents } from "./events";
import { toaster } from "../ui/toaster";
import { finalFieldClient } from "@web/httpclient/models";

const AddFinalFieldModal: React.FC = () => {
  const [cardDeck, setCardDeck] = useState<CardDeck>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    toolBarEvents.on("req-add-final-field", (deck) => {
      setCardDeck(deck);
    });
  }, []);

  return (
    <DialogRoot
      open={!!cardDeck}
      onOpenChange={() => setCardDeck(undefined)}
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
              if (!cardDeck) {
                toaster.error({ title: "找不到cardDeck" });
                return;
              }

              const finalField = BuildFactory.finalField({
                cardDeckId: cardDeck.id,
                name: data.name,
              });
              store.addFinalField(finalField);
              finalFieldClient
                .create(finalField)
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

              toolBarEvents.emit("add-final-field-done");
              setCardDeck(undefined);

              reset();
            })}
            id="add-final-field-form"
          >
            <Field
              label="终场名称"
              helperText={errors["name"]?.message?.toString()}
            >
              <Input {...register("name")} />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button
            onClick={() => setCardDeck(undefined)}
            variant="subtle"
            size="sm"
          >
            关闭
          </Button>
          <Button size="sm" type="submit" form="add-final-field-form">
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddFinalFieldModal;
