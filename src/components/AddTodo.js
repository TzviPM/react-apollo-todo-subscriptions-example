import React, {PropTypes} from 'react'
import TodoTextInput from '../components/TodoTextInput'

export default class AddTodo extends React.Component {
  constructor() {
    super()
    this._handleSave = this._handleSave.bind(this);
  }

  _handleSave (text) {
    this.props.addTodo({variables: {text}})
      .then(this.props.refetch())
  }

  render () {
    return (
      <TodoTextInput
        className='new-todo'
        onSave={this._handleSave}
        placeholder='Add...'
      />
    )
  }
}

AddTodo.propTypes = {
  addTodo: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
};
