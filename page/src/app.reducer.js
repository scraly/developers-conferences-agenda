const datesReducer = (state = {date: null, month: null, year: null}, action) => {
  switch (action.type) {
    case 'displayDate':
      return action.payload;
    default:
      return state;
  }
};

export default datesReducer;
