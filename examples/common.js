import { initializeApp } from 'firebase/app'
import { applyMiddleware, createStore, combineReducers } from 'redux'
import 'firebase/database'
import { reducer, middleware } from '../src/index'

export const getSandboxedPath = path => `${process.env.SANDBOX_PATH}/${path}`
export const initializeDemoApp = () => initializeApp({
  databaseURL: 'https://react-firebase-sandbox.firebaseio.com',
})

export const createDemoStore = firebase => {
  const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ // eslint-disable-line no-underscore-dangle
  const enhancer = devTools(applyMiddleware(middleware(firebase)))
  const reducers = combineReducers({ firebase: reducer })

  return createStore(reducers, enhancer)
}
