import { combineReducers, configureStore } from "@reduxjs/toolkit";
import i18nReducer, { I18nActionsType } from "./slices/i18n";
import { loggerMiddleware } from "./middlewares/logger";
import userReducer, { UserActionsType } from "./slices/user";

const rootReducer = combineReducers({
  i18n: i18nReducer,
  user: userReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware(getDefaultMiddleware) {
    return getDefaultMiddleware().concat([loggerMiddleware]);
  },
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;
export type AppActionsType = I18nActionsType | UserActionsType;

export default store;
