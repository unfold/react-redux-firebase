import { reduce } from 'lodash'

import {
  PUSH,
  REMOVE,
  SET,
  UPDATE,
  SUBSCRIBE,
  UNSUBSCRIBE,
  CHANGE,
  ERROR,
} from './index'

import { getSubscriptionKey } from './utils'

const createAsyncActionTypes = type => ({
  successType: `${type}_SUCCESS`,
  failureType: `${type}_FAILURE`,
})

export default ({ database }) => ({ dispatch }) => {
  const subscriptions = new Map()

  const createCallback = (type, props) => {
    const { successType, failureType } = createAsyncActionTypes(type)

    return error => (
      dispatch(error ? { type: failureType, error, ...props } : { type: successType, ...props })
    )
  }

  const getQueryRef = ({ path, ...query }) => (
    reduce(query, (ref, args, method) => ref[method](...args), database.ref(path))
  )

  const subscribe = (path, query) => {
    const key = getSubscriptionKey(path, query)
    const subscription = subscriptions.get(key)

    if (subscription) {
      subscription.subscriberCount += 1
      return
    }

    const onChange = snapshot => (
      dispatch({ type: CHANGE, path, query, snapshot, value: snapshot.val() })
    )

    const onError = error => (
      dispatch({ type: ERROR, path, query, error })
    )

    const ref = getQueryRef(path, query)
    const callback = ref.on('value', onChange, onError)

    subscriptions.set(key, {
      ref,
      callback,
      subscriberCount: 1,
    })
  }

  const unsubscribe = (path, query) => {
    const key = getSubscriptionKey(path, query)
    const subscription = subscriptions.get(key)
    subscription.subscriberCount -= 1

    if (subscription.subscriberCount < 1) {
      subscription.ref.off('value', subscription.callback)
      subscriptions.delete(key)
    }
  }

  const push = (path, value) => {
    const ref = database.ref(path).push()
    const callback = createCallback(PUSH, { path, key: ref.key, value })

    ref.set(value, callback)
  }

  const remove = path => {
    const ref = database.ref(path)
    const callback = createCallback(REMOVE, { path })

    ref.remove(callback)
  }

  const set = (path, value) => {
    const ref = database.ref(path)
    const callback = createCallback(SET, { path, value })

    ref.set(value, callback)
  }

  const update = changes => {
    const ref = database.ref()
    const callback = createCallback(UPDATE, { changes })

    ref.update(changes, callback)
  }

  return next => action => {
    const { type, path, query, value } = action

    // Since Firebase modifications are synchronous we invoke the next middlware
    // first, otherwise the actions would appear out of order
    next(action)

    switch (type) {
      case PUSH:
        push(path, value)
        break
      case REMOVE:
        remove(path)
        break
      case SET:
        set(path, value)
        break
      case UPDATE:
        update(path, value)
        break
      case SUBSCRIBE:
        subscribe(path, query)
        break
      case UNSUBSCRIBE:
        unsubscribe(path, query)
        break
      default:
        break
    }
  }
}
