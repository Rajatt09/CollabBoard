import { configureStore } from "@reduxjs/toolkit";
import userinfoReducer from "./counterSlice";

export const store = configureStore({
  reducer: {
    userinfo: userinfoReducer,
  },
});
