import React from 'react'
import { render } from 'react-dom'
import { createDemoStore, initializeDemoApp } from '../common'
import Count from './Count'

const store = createDemoStore(initializeDemoApp())

const App = () => (
  <Count store={store} />
)

render(<App />, document.getElementById('example'))
