import React from 'react'
import { render } from 'react-dom'
import { Provider } from 'react-redux'
import { set } from '../../src/actions'
import { createDemoStore, initializeDemoApp, getSandboxedPath } from '../common'
import UserList from './UserList'
import AddUser from './AddUser'
import TaskList from './TaskList'

const rootPath = getSandboxedPath('complex')
const store = createDemoStore(initializeDemoApp())

store.dispatch(set(rootPath, {
  users: {
    frank: {
      name: 'Frank',
      tasks: {
        flooring: true,
        gardening: true,
      },
    },

    joe: {
      name: 'Joe',
      tasks: {
        welding: true,
      },
    },
  },

  tasks: {
    flooring: {
      name: 'Flooring',
      description: 'Lay some really nice floors',
      outside: false,
    },

    gardening: {
      name: 'Gardening',
      description: 'Trim hedges and mow lawn',
      outside: true,
      completed: true,
    },

    welding: {
      name: 'Welding',
      description: 'Weld pipes',
      outside: false,
      completed: true,
    },
  },
}))

const App = () => (
  <div>
    <h2>Users</h2>
    <UserList />
    <AddUser />

    <h2>All tasks</h2>
    <TaskList />

    <h2>Outside tasks</h2>
    <TaskList outside />
  </div>
)

render((
  <Provider store={store}>
    <App />
  </Provider>
), document.getElementById('example'))
