import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
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
  meeting: {
    id: "",
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
    updateUserName: (state, action) => {
      const { name } = action.payload;
      state.name = name;
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
    updateMeetinginfo: (state, action) => {
      const { host } = action.payload;

      state.meeting.id = host;
    },
  },
});

export const {
  updateUserinfo,
  updateLoader,
  updateNotification,
  updateMeetinginfo,
  updateUserName,
} = userinfoSlice.actions;

export default userinfoSlice.reducer;
