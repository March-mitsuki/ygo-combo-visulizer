import { UserFromServer } from "@/http_client/server_models";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type UserState = {
  user?: UserFromServer;
};

const initialState: UserState = {};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<UserFromServer>) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = undefined;
    },
  },
});

export const userActions = userSlice.actions;
export type UserActionsType = ReturnType<
  (typeof userActions)[keyof typeof userActions]
>;

const userReducer = userSlice.reducer;
export default userReducer;
