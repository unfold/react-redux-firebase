import { CHANGE } from './index'

export default (state = {}, action) => {
  switch (action.type) {
    case CHANGE:
      return {
        ...state,
        [action.path]: action.value,
      }
    default:
      return state
  }
}
