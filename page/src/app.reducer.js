const reducer = (state = {events: [], selectedDate: null}, action) => {
  switch (action.type) {
    case 'define':
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
