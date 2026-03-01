import { createSlice } from "@reduxjs/toolkit";

const savedUser = sessionStorage.getItem("currentUser");

const initialState = savedUser
  ? JSON.parse(savedUser)
  : {
      _id: null,
      firstname: null,
      lastname: null,
      email: null,
      profilePhoto: null,
      accountType: null,
    };

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      const updated = { ...state, ...action.payload };
      sessionStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    },

    updateUser: (state, action) => {
      const updated = { ...state, ...action.payload };
      sessionStorage.setItem("currentUser", JSON.stringify(updated));
      return updated;
    },

    clearUser: () => {
      sessionStorage.removeItem("currentUser");
      return {
        _id: null,
        firstname: null,
        lastname: null,
        email: null,
        profilePhoto: null,
        accountType: null,
      };
    },
  },
});

export const { setUser, updateUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
