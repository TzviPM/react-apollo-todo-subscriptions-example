import React, {Component, PropTypes} from 'react'
import TodoListFooter from './TodoListFooter'
import AddTodo from './AddTodo'
import TodoList from './TodoList'
import gql from 'graphql-tag'

import { graphql, compose } from 'react-apollo'

class TodoApp extends Component {
  static propTypes = {
    addTodo: PropTypes.func.isRequired,
    renameTodo: PropTypes.func.isRequired,
    deleteTodo: PropTypes.func.isRequired,
    toggleTodo: PropTypes.func.isRequired,
    data: PropTypes.object.isRequired
  }

  state = {
    filter: 'SHOW_ALL'
  }

  setFilter = (function(filter) {
    this.setState({filter});
  }).bind(this)

  componentWillUpdate(newProps, newState) {
    if (!newProps.data.loading) {
      if (this.subscription) {
        if (newProps.data.allTodoes !== this.props.data.allTodoes) {
          // if the todos have changed, we need to unsubscribe before resubscribing
          this.subscription()
        } else {
          // we already have an active subscription with the right params
          return
        }
      }
      this.subscription = newProps.data.subscribeToMore({
        document: gql`
          subscription {
            createTodo {
              id
              complete
              text
            }
          }
        `,
        variables: {},

        // this is where the magic happens.
        updateQuery: (previousState, {subscriptionData}) => {
          const newTodo = subscriptionData.data.createTodo;

          return {
            allTodoes: [
              ...previousState.allTodoes,
              {
                ...newTodo
              }
            ]
          }
        },
        onError: (err) => console.error(err),
      })
    }
  }

  render () {
    return (
      <div>
        <section className='todoapp'>
          <header className='header'>
            <AddTodo
              addTodo={this.props.addTodo}
              refetch={this.props.data.refetch}
            />
          </header>
          <TodoList
            todos={this.props.data.allTodoes || []}
            filter={this.state.filter}
            renameTodo={this.props.renameTodo}
            deleteTodo={this.props.deleteTodo}
            toggleTodo={this.props.toggleTodo}
            refetch={this.props.data.refetch}
            loading={this.props.data.loading}
          />
          <TodoListFooter setFilter={this.setFilter} />
        </section>
        <footer className='info'>
          <p>
            Double-click to edit a todo
          </p>
        </footer>
      </div>
    )
  }
}

const addTodoMutation = gql`
  mutation addTodo($text: String!) {
    createTodo(complete: false, text: $text) { id }
  }
`

const renameTodoMutation = gql`
  mutation renameTodo($id: ID!, $text: String!) {
    updateTodo(id: $id, text: $text) { id }
  }
`

const deleteTodoMutation = gql`
  mutation deleteTodo($id: ID!) {
    deleteTodo(id: $id) { id }
  }
`

const toggleTodoMutation = gql`
  mutation toggleTodo($id: ID!, $complete: Boolean!) {
    updateTodo(id: $id, complete: $complete) { id }
  }
`

const allTodoesQuery = gql`
  query allTodoes {
    allTodoes {
      id
      complete
      text
    }
  }
`

export default compose(
    graphql(addTodoMutation, {name: 'addTodo'}),
    graphql(renameTodoMutation, {name: 'renameTodo'}),
    graphql(deleteTodoMutation, {name: 'deleteTodo'}),
    graphql(toggleTodoMutation, {name: 'toggleTodo'}),
    graphql(allTodoesQuery)
)(TodoApp);
