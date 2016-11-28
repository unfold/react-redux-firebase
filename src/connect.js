import { createElement, Component, PropTypes } from 'react'
import { isString, isPlainObject, isEqual, map, pickBy, reduce } from 'lodash'
import { connect } from 'react-redux'
import invariant from 'invariant'
import { getDisplayName, getSubscriptionKey } from './utils'
import * as firebaseActions from './actions'

const storeShape = PropTypes.shape({
  dispatch: PropTypes.func.isRequired,
})

const defaultMapPropsToSubscriptions = props => ({}) // eslint-disable-line no-unused-vars
const defaultMapStateToProps = state => ({}) // eslint-disable-line no-unused-vars
const defaultGetFirebaseState = ({ firebase }) => firebase

export default (
  mapPropsToSubscriptions,
  mapStateToProps,
  mapDispatchToProps,
  mergeProps,
  options = {}
) => {
  const mapSubscriptions = mapPropsToSubscriptions || defaultMapPropsToSubscriptions
  const mapState = mapStateToProps || defaultMapStateToProps
  const { pure = true, getFirebaseState = defaultGetFirebaseState } = options

  const mapSubscriptionsToQueries = subscriptions => {
    invariant(
      isPlainObject(subscriptions),
      '`mapPropsToSubscriptions` must return an object. Instead received %s.',
      subscriptions
    )

    return reduce(subscriptions, (queries, subscription, key) => ({
      ...queries,
      [key]: isString(subscription) ? { path: subscription } : subscription,
    }), {})
  }

  const mapSubscriptionsToProps = (state, ownProps) => {
    const subscriptions = mapSubscriptions(ownProps)
    const queries = mapSubscriptionsToQueries(subscriptions)
    const values = getFirebaseState(state)

    return reduce(queries, (props, { path, ...query }, prop) => {
      const key = getSubscriptionKey(path, query)
      const value = values[key]

      return {
        ...props,
        [prop]: value,
      }
    }, {})
  }

  const mapStateToMergedProps = (state, ownProps) => {
    const subscriptionProps = mapSubscriptionsToProps(state, ownProps)
    const stateProps = mapState(state, ownProps)

    return {
      ...subscriptionProps,
      ...stateProps,
    }
  }

  return WrappedComponent => {
    class FirebaseConnect extends Component {
      static WrappedComponent = WrappedComponent

      static displayName =`FirebaseConnect(${getDisplayName(WrappedComponent)})`
      static defaultProps = Component.defaultProps

      static contextTypes = {
        store: storeShape,
      }

      static propTypes = {
        store: storeShape,
      }

      constructor(props, context) {
        super(props)

        this.store = props.store || context.store
      }

      componentDidMount() {
        this.subscribe(mapSubscriptions(this.props))
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

          this.unsubscribe({ ...removed, ...changed })
          this.subscribe({ ...added, ...changed })
        }
      }

      componentWillUnmount() {
        this.unsubscribe(mapSubscriptions(this.props))
      }

      subscribe(subscriptions) {
        const { dispatch } = this.store
        const queries = mapSubscriptionsToQueries(subscriptions)

        map(queries, ({ path, ...query }) => (
          dispatch(firebaseActions.subscribe(path, query))
        ))
      }

      unsubscribe(subscriptions) {
        const { dispatch } = this.store
        const queries = mapSubscriptionsToQueries(subscriptions)

        map(queries, ({ path, ...query }) => (
          dispatch(firebaseActions.unsubscribe(path, query))
        ))
      }

      render() {
        return createElement(WrappedComponent, this.props)
      }
    }

    const withConnect = connect(mapStateToMergedProps, mapDispatchToProps, mergeProps, options)

    return withConnect(FirebaseConnect)
  }
}
