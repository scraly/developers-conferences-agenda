const appReducer = (
  state = {filters: {callForPapers: false, closedCaptions: false, query: ''}, date: null, month: null, year: null},
  action
) => {
  switch (action.type) {
    case 'displayDate':
      return {
        ...state,
        date: action.payload.date,
        month: action.payload.month,
        year: action.payload.year,
      };
    case 'setFilters':
      return {...state, filters: action.payload};
    default:
      return state;
  }
};

export default appReducer;
