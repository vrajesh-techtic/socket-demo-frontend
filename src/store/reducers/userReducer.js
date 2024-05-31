import { createSlice } from "@reduxjs/toolkit";

const loginUser = {
  _id: "",
  email: "",
  name: "",
  lastSeen: null,
};

const currUser = {
  isGroup: false,
  admin: "",
  groupName: "",
  users: [],
  convoId: "",
  email: "",
  name: "",
  receiverId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState: { loginUser, currUser, currIndex: 0 },
  reducers: {
    addUserData(state, action) {
      state.loginUser = action.payload;
      console.log("state.loginUser", state.loginUser);
    },

    setCurrUserData(state, action) {
      state.currUser = action.payload;
    },

    setReduxCurrIndex(state, action) {
      state.currIndex = action.payload;
      console.log("redux currIndex", state.currIndex);
    },
  },
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;
