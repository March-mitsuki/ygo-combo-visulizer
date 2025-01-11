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
import { Input, Stack } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";

const EditStepModal: React.FC = () => {
  const [step, setStep] = useState<Step>();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    if (step) {
      setValue("nextStepAction", step.nextStepAction);
      setValue("exLeft", step.state.field.exLeft);
      setValue("exRight", step.state.field.exRight);
      setValue("front", step.state.field.front);
      setValue("back", step.state.field.back);
      setValue("graveyard", step.state.graveyard);
      setValue("banished", step.state.banished);
      setValue("hand", step.state.hand);
    }
  }, [step]);

  useEffect(() => {
    stepEvents.on("req-edit-step", (step) => {
      setStep(step);
    });
  }, []);

  return (
    <DialogRoot open={!!step} onOpenChange={() => setStep(undefined)} size="lg">
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>修改步骤</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            onSubmit={handleSubmit((data) => {
              if (!step) {
                toaster.error({ title: "找不到step" });
                return;
              }

              step.nextStepAction = data.nextStepAction;
              step.state.field.exLeft = data.exLeft;
              step.state.field.exRight = data.exRight;
              step.state.field.front = data.front;
              step.state.field.back = data.back;
              step.state.graveyard = data.graveyard;
              step.state.banished = data.banished;
              step.state.hand = data.hand;

              stepEvents.emit("edit-step-done");

              setStep(undefined);
              reset();
            })}
            id="edit-step-form"
          >
            <Stack>
              <Field
                mb={4}
                label="下一步操作"
                helperText={errors["nextStepAction"]?.message?.toString()}
              >
                <Input {...register("nextStepAction")} />
              </Field>

              <Field
                label="左额外"
                helperText={errors["exLeft"]?.message?.toString()}
              >
                <Input {...register("exLeft")} />
              </Field>
              <Field
                label="右额外"
                helperText={errors["exRight"]?.message?.toString()}
              >
                <Input {...register("exRight")} />
              </Field>
              <Field
                label="前场"
                helperText={errors["front"]?.message?.toString()}
              >
                <Input {...register("front")} />
              </Field>
              <Field
                label="后场"
                helperText={errors["back"]?.message?.toString()}
              >
                <Input {...register("back")} />
              </Field>
              <Field
                label="墓地"
                helperText={errors["graveyard"]?.message?.toString()}
              >
                <Input {...register("graveyard")} />
              </Field>
              <Field
                label="除外"
                helperText={errors["banished"]?.message?.toString()}
              >
                <Input {...register("banished")} />
              </Field>
              <Field
                label="手牌"
                helperText={errors["hand"]?.message?.toString()}
              >
                <Input {...register("hand")} />
              </Field>
            </Stack>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setStep(undefined)} variant="subtle" size="sm">
            关闭
          </Button>
          <Button size="sm" type="submit" form="edit-step-form">
            修改
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default EditStepModal;
