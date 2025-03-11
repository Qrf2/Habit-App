import { configureStore } from "@reduxjs/toolkit";
import habitReducer from "../components/redux/reducers"; // Adjust path to your reducers.js
import { loadHabits } from "../components/redux/actions"; // Adjust path to your habitActions.js

const store = configureStore({
  reducer: {
    habits: habitReducer,
  },
});

// Load habits from AsyncStorage on app start
store.dispatch(loadHabits());

export default store;
