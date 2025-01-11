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
import { GameFactory, Step } from "@web/interfaces";
import { useForm } from "react-hook-form";
import { Input } from "@chakra-ui/react";
import { toaster } from "../ui/toaster";
import { store } from "@web/store";

const AddStepModal: React.FC = () => {
  const [step, setStep] = useState<Step>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    stepEvents.on("req-add-step", (step) => {
      setStep(step);
    });
  }, []);

  return (
    <DialogRoot open={!!step} onOpenChange={() => setStep(undefined)} size="lg">
      <DialogBackdrop />
      <DialogContent>
        <DialogCloseTrigger />
        <DialogHeader>
          <DialogTitle>添加下一步</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <form
            onSubmit={handleSubmit((data) => {
              if (!step) {
                toaster.error({ title: "找不到step" });
                return;
              }

              step.nextStepAction = data.name;
              const newStep = GameFactory.step({
                id: Date.now(),
              });
              store.getCurrentSteps()?.addStep(step, newStep);
              stepEvents.emit("add-step-done");

              setStep(undefined);
              reset();
            })}
            id="add-step-form"
          >
            <Field
              label="具体操作"
              helperText={errors["name"]?.message?.toString()}
            >
              <Input {...register("name")} />
            </Field>
          </form>
        </DialogBody>
        <DialogFooter>
          <Button onClick={() => setStep(undefined)} variant="subtle" size="sm">
            关闭
          </Button>
          <Button size="sm" type="submit" form="add-step-form">
            添加
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddStepModal;
