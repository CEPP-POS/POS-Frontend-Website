import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const {
        menuId,
        menuName,
        menu_img,
        selectedType,
        selectedSweetness,
        selectedSize,
        selectedAddOn,
        price,
        quantity,
      } = action.payload;

      const newItem = {
        menuId,
        menuName,
        menu_img,
        selectedType,
        selectedSweetness,
        selectedSize,
        selectedAddOn,
        price,
        quantity,
      };

      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.menuId === menuId &&
          item.menuName === menuName &&
          item.menu_img === menu_img &&
          item.selectedType.id === selectedType.id &&
          item.selectedSweetness.id === selectedSweetness.id &&
          item.selectedSize.id === selectedSize.id &&
          JSON.stringify(item.selectedAddOn) === JSON.stringify(selectedAddOn)
      );

      if (existingItemIndex !== -1) {
        // Item exists, so update quantity and total price
        state.items[existingItemIndex].quantity += quantity;
      } else {
        // New item, add to the cart
        state.items.push(newItem);
      }
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(
        (item) =>
          item.menuId !== action.payload.menuId ||
          item.selectedSize.id !== action.payload.selectedSize.id ||
          item.selectedSweetness.id !== action.payload.selectedSweetness.id ||
          item.selectedType.id !== action.payload.selectedType.id ||
          JSON.stringify(item.selectedAddOn) !==
            JSON.stringify(action.payload.selectedAddOn)
      );
    },

    clearCart: (state) => {
      state.items = [];
    },

    increaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) =>
          item.menuId === action.payload.menuId &&
          item.selectedSize.id === action.payload.selectedSize.id &&
          item.selectedSweetness.id === action.payload.selectedSweetness.id &&
          item.selectedType.id === action.payload.selectedType.id &&
          JSON.stringify(item.selectedAddOn) ===
            JSON.stringify(action.payload.selectedAddOn)
      );
      if (item) {
        item.quantity += 1;
        item.price = (item.price / (item.quantity - 1)) * item.quantity;
      }
    },

    decreaseQuantity: (state, action) => {
      const item = state.items.find(
        (item) =>
          item.menuId === action.payload.menuId &&
          item.selectedSize.id === action.payload.selectedSize.id &&
          item.selectedSweetness.id === action.payload.selectedSweetness.id &&
          item.selectedType.id === action.payload.selectedType.id &&
          JSON.stringify(item.selectedAddOn) ===
            JSON.stringify(action.payload.selectedAddOn)
      );
      if (item && item.quantity > 1) {
        item.quantity -= 1;
        item.price = (item.price / (item.quantity + 1)) * item.quantity;
      }
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  clearCart,
  increaseQuantity,
  decreaseQuantity,
} = cartSlice.actions;

export default cartSlice.reducer;
