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
import { stepEvents } from "./events";
import { Step } from "@web/interfaces";
import { useForm } from "react-hook-form";
import { Input } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";

const AddConditionModal: React.FC = () => {
  const [step, setStep] = useState<Step>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    stepEvents.on("req-add-condition", (step) => {
      setStep(step);
    });
  }, []);

  return (
    <DialogRoot open={!!step} onOpenChange={() => setStep(undefined)} size="lg">
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>吃坑分支</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            onSubmit={handleSubmit((data) => {
              if (!step) {
                toaster.error({ title: "找不到step" });
                return;
              }

              step.conditions.push({ condition: data.condition });
              stepEvents.emit("add-condition-done");

              setStep(undefined);
              reset();
            })}
            id="add-condition-form"
          >
            <Field
              label="吃坑种类"
              helperText={errors["condition"]?.message?.toString()}
            >
              <Input {...register("condition")} />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setStep(undefined)} variant="subtle" size="sm">
            关闭
          </Button>
          <Button size="sm" type="submit" form="add-condition-form">
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddConditionModal;
