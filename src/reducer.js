import { CHANGE } from './index'
import { getSubscriptionKey } from './utils'

export default (state = {}, action) => {
  switch (action.type) {
    case CHANGE:
      return {
        ...state,
        [getSubscriptionKey(action.path, action.query)]: action.value,
      }
    default:
      return state
  }
}
