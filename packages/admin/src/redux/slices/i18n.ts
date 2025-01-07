import { SupportedLanguages } from "@/i18n";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type I18nState = {
  lang: SupportedLanguages;
};

export const initialState: I18nState = {
  lang: "en",
};

export const i18nSlice = createSlice({
  name: "i18n",
  initialState,
  reducers: {
    changeLang(state, action: PayloadAction<SupportedLanguages>) {
      state.lang = action.payload;
    },
  },
});

export const i18nActions = i18nSlice.actions;
export type I18nActionsType = ReturnType<
  (typeof i18nActions)[keyof typeof i18nActions]
>;

const i18nReducer = i18nSlice.reducer;
export default i18nReducer;
