import React, { PropTypes } from 'react'
import { partial } from 'lodash'
import { getSandboxedPath } from '../common'
import connect from '../../src/connect'
import { set } from '../../src/actions'

const countPath = getSandboxedPath('count')

const Count = ({ count, setCount }) => (
  <div>
    <p>Count: {count || 0}</p>

    <button onClick={partial(setCount, count - 1)}>Decrement</button>
    <button onClick={partial(setCount, count + 1)}>Increment</button>
  </div>
)

Count.propTypes = {
  count: PropTypes.number,
  setCount: PropTypes.func.isRequired,
}

const mapPropsToSubscriptions = () => ({ count: countPath })
const mapDispatchToProps = dispatch => ({
  setCount: count => dispatch(set(countPath, count)),
})

const withConnect = connect(mapPropsToSubscriptions, null, mapDispatchToProps)

export default withConnect(Count)
