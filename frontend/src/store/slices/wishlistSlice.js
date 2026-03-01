import { createSlice } from '@reduxjs/toolkit';


const loadWishlistState = () => {
  try {
    const savedWishlist = localStorage.getItem("likedHomes");
    return {
      likedRoomIds: savedWishlist ? JSON.parse(savedWishlist) : [],
      likedRooms: [], 
      isLoading: false,
      error: null,
    };
  } catch (error) {
    console.error("Error loading wishlist from localStorage:", error);
    return {
      likedRoomIds: [],
      likedRooms: [],
      isLoading: false,
      error: null,
    };
  }
};

const initialState = loadWishlistState();

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const roomId = action.payload;
      if (!state.likedRoomIds.includes(roomId)) {
        state.likedRoomIds.push(roomId);
        localStorage.setItem("likedHomes", JSON.stringify(state.likedRoomIds));
      }
    },
    
    removeFromWishlist: (state, action) => {
      const roomId = action.payload;
      state.likedRoomIds = state.likedRoomIds.filter(id => id !== roomId);
      state.likedRooms = state.likedRooms.filter(room => room._id !== roomId);
      localStorage.setItem("likedHomes", JSON.stringify(state.likedRoomIds));
    },
    
    setWishlist: (state, action) => {
      state.likedRoomIds = action.payload.roomIds || [];
      state.likedRooms = action.payload.rooms || [];
      localStorage.setItem("likedHomes", JSON.stringify(state.likedRoomIds));
    },
    
    setLikedRooms: (state, action) => {
      state.likedRooms = action.payload;
    },
    
    clearWishlist: (state) => {
      state.likedRoomIds = [];
      state.likedRooms = [];
      localStorage.removeItem("likedHomes");
    },
    
    setWishlistLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    setWishlistError: (state, action) => {
      state.error = action.payload;
    },
    
    clearWishlistError: (state) => {
      state.error = null;
    }
  },
});

export const { 
  addToWishlist, 
  removeFromWishlist, 
  setWishlist, 
  setLikedRooms,
  clearWishlist, 
  setWishlistLoading, 
  setWishlistError, 
  clearWishlistError 
} = wishlistSlice.actions;

export default wishlistSlice.reducer;