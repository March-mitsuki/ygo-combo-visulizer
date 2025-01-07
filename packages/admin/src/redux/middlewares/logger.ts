import { Middleware } from "@reduxjs/toolkit";
import { AppActionsType, AppDispatch, RootState } from "../store";

export const loggerMiddleware: Middleware<{}, RootState> =
  // @ts-ignore
  (storeApi) => (next: AppDispatch) => (action: AppActionsType) => {
    next(action);

    console.info(
      "%c[ redux-logger ]%c",
      "color: green; font-weight: 700;",
      "",
      action.type,
      action.payload,
      "\n[ state ]",
      storeApi.getState(),
    );

    return;
  };
