import {
  PUSH,
  REMOVE,
  SET,
  SUBSCRIBE,
  UNSUBSCRIBE,
  UPDATE,
} from './index'

export const push = (path, value) => ({ type: PUSH, path, value })
export const remove = path => ({ type: REMOVE, path })
export const set = (path, value) => ({ type: SET, path, value })
export const update = changes => ({ type: UPDATE, changes })
export const subscribe = (path, query) => ({ type: SUBSCRIBE, path, query })
export const unsubscribe = (path, query) => ({ type: UNSUBSCRIBE, path, query })
