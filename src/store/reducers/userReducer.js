import { createSlice } from "@reduxjs/toolkit";

const loginUser = {
  _id: "",
  email: "",
  name: "",
  lastSeen: null,
};

const currUser = {
  convoId: "",
  email: "",
  name: "",
  receiverId: "",
};

const userSlice = createSlice({
  name: "user",
  initialState: { user: loginUser, currUser: currUser, currIndex: null },
  reducers: {
    addUserData(state, action) {
      state.user = action.payload;
    },

    setCurrUserData(state, action) {
      state.currUser = action.payload;
    },

    setReduxCurrIndex(state, action) {
      state.currIndex = action.payload;
    },
  },
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;
