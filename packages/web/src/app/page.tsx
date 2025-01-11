"use client";

import AddConditionModal from "@web/components/step_renderer/add_condition_modal";
import AddStepModal from "@web/components/step_renderer/add_step_modal";
import EditStepModal from "@web/components/step_renderer/edit_step_modal";
import { Toaster } from "@web/components/ui/toaster";
import { GLOBAL_SHORTCUTS } from "@web/interfaces/shortcuts";
import { useEffect } from "react";
import MainContents from "./main_contents";
import AddCardDeckModal from "@web/components/tool_bar/add_card_deck_modal";
import AddFinalFieldModal from "@web/components/tool_bar/add_final_field_modal";
import AddStepsModal from "@web/components/tool_bar/add_steps_modal";
import { store } from "@web/store";
// import { PersonalityTestResponseClient } from '@web/httpclient/personality_test_response';

export default function Home() {
  // const client = new PersonalityTestResponseClient();

  useEffect(() => {
    console.log("window.app", window.app);
    window.addEventListener("keydown", (e) => {
      GLOBAL_SHORTCUTS.set(e.key, true);
    });
    window.addEventListener("keyup", (e) => {
      GLOBAL_SHORTCUTS.set(e.key, false);
    });

    // @ts-ignore
    window.debugStore = store;
  });

  return (
    <div>
      {/* <div>ENV: {window.app.config.baseUrl}</div> */}
      <Toaster />
      <AddStepModal />
      <AddConditionModal />
      <EditStepModal />
      <AddCardDeckModal />
      <AddFinalFieldModal />
      <AddStepsModal />

      <MainContents />
    </div>
  );
}
