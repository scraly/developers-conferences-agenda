const reducer = (state = {events: [], selectedDate: null, month: -1}, action) => {
  switch (action.type) {
    case 'define':
      return action.payload;
    default:
      return state;
  }
};

export default reducer;
