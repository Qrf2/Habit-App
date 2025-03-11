import {
  ADD_HABIT,
  TOGGLE_HABIT_COMPLETION,
  SET_HABITS,
  DELETE_HABIT,
  RESET_HABITS_FOR_NEW_DAY,
  UPDATE_HABIT_PROGRESS,
  UPDATE_STREAK,
} from "../redux/actions";

const initialState = {
  habits: [],
  streak: 0
};

const habitReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_HABIT:
      return {
        ...state,
        habits: [...state.habits, { ...action.payload }]
      };

    case TOGGLE_HABIT_COMPLETION:
      return {
        ...state,
        habits: state.habits.map((habit) =>
          habit.id === action.payload
            ? { ...habit, completed: !habit.completed }
            : habit
        )
      };

    case SET_HABITS:
      return {
        ...state,
        habits: action.payload || []
      };

    case DELETE_HABIT:
      return {
        ...state,
        habits: state.habits.filter((habit) => habit.id !== action.payload)
      };

    case RESET_HABITS_FOR_NEW_DAY:
      return {
        ...state,
        habits: state.habits.map((habit) => ({
          ...habit,
          completed: false,
          progress: 0
        }))
      };

    case UPDATE_HABIT_PROGRESS:
      return {
        ...state,
        habits: state.habits.map(habit =>
          habit.id === action.payload.habitId
            ? { ...habit, progress: action.payload.progress }
            : habit
        )
      };
      
    case UPDATE_STREAK:
      return {
        ...state,
        streak: action.payload
      };

    default:
      return state;
  }
};

export default habitReducer;
