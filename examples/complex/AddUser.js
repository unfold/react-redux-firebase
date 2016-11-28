import React, { Component, PropTypes } from 'react'
import { getSandboxedPath } from '../common'
import { connect } from '../../src'
import { push } from '../../src/actions'

const usersPath = getSandboxedPath('complex/users')

class AddUser extends Component {
  constructor(props) {
    super(props)

    this.state = {
      name: '',
    }
  }

  onChange(event) {
    const { name, value } = event.target

    this.setState({
      [name]: value,
    })
  }

  onSubmit(event) {
    event.preventDefault()

    this.props.addUser(this.state.name)
  }

  render() {
    const { name } = this.state

    return (
      <form onSubmit={event => this.onSubmit(event)}>
        <input name="name" value={name} onChange={event => this.onChange(event)} />
        <button type="submit" disabled={!name}>Add user</button>
      </form>
    )
  }
}

AddUser.propTypes = {
  addUser: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => ({
  addUser: name => dispatch(push(usersPath, ({ name }))),
})

const withConnect = connect(null, null, mapDispatchToProps)

export default withConnect(AddUser)

