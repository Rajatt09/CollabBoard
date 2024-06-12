import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  email: "",
  phone: "",
  joined: "",
  show: false,
  loader: false,
  notification: {
    show: false,
    type: "",
    message: "",
  },
};

export const userinfoSlice = createSlice({
  name: "userinfo",
  initialState,
  reducers: {
    updateUserinfo: (state, action) => {
      const { email, phone, joined, show } = action.payload;

      const handleDate = (dateString) => {
        const date = new Date(dateString);

        const months = [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ];

        const day = date.getUTCDate();
        const month = months[date.getUTCMonth()];
        const year = date.getUTCFullYear();

        return `${month} ${day}, ${year}`;
      };

      if (email !== undefined) state.email = email;
      if (phone !== undefined) state.phone = phone;
      if (joined !== undefined) state.joined = handleDate(joined);
      state.show = show;
    },
    updateLoader: (state, action) => {
      const { loader } = action.payload;
      state.loader = loader;
    },
    updateNotification: (state, action) => {
      const { show, type, message } = action.payload;
      state.notification.show = show;
      state.notification.type = type;
      state.notification.message = message;
    },
  },
});

export const { updateUserinfo, updateLoader, updateNotification } =
  userinfoSlice.actions;

export default userinfoSlice.reducer;
