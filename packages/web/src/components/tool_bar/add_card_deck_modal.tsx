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
import { BuildFactory, GameFactory, Step } from "@web/interfaces";
import { useForm } from "react-hook-form";
import { Input } from "@chakra-ui/react";
import { store } from "@web/store";
import { toolBarEvents } from "./events";
import { cardDeckClient } from "@web/httpclient/models";
import { toaster } from "../ui/toaster";

const AddCardDeckModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    toolBarEvents.on("req-add-card-deck", () => {
      setIsOpen(true);
    });
  }, []);

  return (
    <DialogRoot open={isOpen} onOpenChange={(e) => setIsOpen(e.open)} size="lg">
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>添加构筑</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            onSubmit={handleSubmit((data) => {
              const cardDeck = BuildFactory.cardDeck(data.name);
              store.addCardDeck(cardDeck);
              cardDeckClient
                .create({
                  name: cardDeck.name,
                  userId: 1,
                })
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

              toolBarEvents.emit("add-card-deck-done");
              setIsOpen(false);

              reset();
            })}
            id="add-card-deck-form"
          >
            <Field
              label="构筑名称"
              helperText={errors["name"]?.message?.toString()}
            >
              <Input {...register("name")} />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setIsOpen(false)} variant="subtle" size="sm">
            关闭
          </Button>
          <Button size="sm" type="submit" form="add-card-deck-form">
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddCardDeckModal;
