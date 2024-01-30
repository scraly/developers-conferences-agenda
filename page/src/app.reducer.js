const appReducer = (
  state,
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
    case 'resetFilters':
      return {...state, filters: {callForPapers: false, closedCaptions: false, online: false, country: '', query: ''}};
    default:
      return state;
  }
};

export default appReducer;
