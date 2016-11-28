import React, { PropTypes } from 'react'
import { connect } from '../../src'
import { getSandboxedPath } from '../common'

const tasksPath = getSandboxedPath('complex/tasks')

const TaskSummary = ({ task = {} }) => {
  const { name, description, outside } = task

  return (
    <span>{name} - {description} - {outside ? '🌞' : '🏨'}</span>
  )
}

TaskSummary.propTypes = {
  task: PropTypes.object,
}

const mapPropsToSubscriptions = ({ taskId }) => ({ task: `${tasksPath}/${taskId}` })

const withConnect = connect(mapPropsToSubscriptions)

export default withConnect(TaskSummary)
