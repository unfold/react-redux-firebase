import { Component, PropTypes } from 'react'
import { isString, isPlainObject, isEqual, map, pickBy, reduce, set } from 'lodash'
import { connect } from 'react-redux'
import invariant from 'invariant'
import { firebaseAppShape } from './PropTypes'
import { getDisplayName, getSubscriptionKey } from './utils'
import * as firebaseActions from './actions'

const defaultMapPropsToSubscriptions = props => ({}) // eslint-disable-line no-unused-vars

export default (
  mapPropsToSubscriptions,
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options = {}
) => {
  const mapSubscriptions = mapPropsToSubscriptions || defaultMapPropsToSubscriptions
  const { pure = true } = options

  const mapSubscriptionsToQueries = props => {
    const subscriptions = mapSubscriptions(props)

    invariant(
      isPlainObject(subscriptions),
      '`mapPropsToSubscriptions` must return an object. Instead received %s.',
      subscriptions
    )

    return map(subscriptions, query => (isString(query) ? { path: query } : query))
  }

  const mapSubscriptionsToProps = ({ subscriptions }, ownProps) => {
    const queries = mapSubscriptions(mapSubscriptionsToQueries(ownProps))

    return reduce(queries, (props, { path, ...query }, prop) => {
      const key = getSubscriptionKey(path, query)
      const value = subscriptions[key]

      return set(props, prop, value)
    }, {})
  }

  const mapState = (state, ownProps) => {
    const subscriptionProps = mapSubscriptionsToProps(state, ownProps)
    const stateProps = mapStateToProps(state, ownProps)

    return {
      ...subscriptionProps,
      ...stateProps,
    }
  }

  const subscribe = subscriptions => (
    map(mapSubscriptionsToQueries(subscriptions), ({ path, ...query }) => (
      firebaseActions.subscribe(path, query)
    ))
  )

  const unsubscribe = subscriptions => (
    map(mapSubscriptionsToQueries(subscriptions), ({ path, ...query }) => (
      firebaseActions.unsubscribe(path, query)
    ))
  )

  return WrappedComponent => {
    class FirebaseConnect extends Component {
      static WrappedComponent = WrappedComponent

      static displayName =`FirebaseConnect(${getDisplayName(WrappedComponent)})`
      static defaultProps = Component.defaultProps

      static contextTypes = {
        firebase: firebaseAppShape,
      }

      static propTypes = {
        children: PropTypes.node,
      }

      componentDidMount() {
        subscribe(mapSubscriptions(this.props))
      }

      componentWillReceiveProps(nextProps) {
        const subscriptions = mapSubscriptions(this.props)
        const nextSubscriptions = mapSubscriptions(nextProps)

        if (!pure || !isEqual(subscriptions, nextSubscriptions)) {
          const added = pickBy(nextSubscriptions, (value, key) => !subscriptions[key])
          const removed = pickBy(subscriptions, (value, key) => !nextSubscriptions[key])
          const changed = pickBy(nextSubscriptions, (value, key) => (
            subscriptions[key] && !isEqual(subscriptions[key], value)
          ))

          unsubscribe({ ...removed, ...changed })
          subscribe({ ...added, ...changed })
        }
      }

      componentWillUnmount() {
        unsubscribe(mapSubscriptions(this.props))
      }

      render() {
        return this.props.children
      }
    }

    return connect(mapState, mapDispatchToProps, mergeProps, options)(FirebaseConnect)
  }
}
