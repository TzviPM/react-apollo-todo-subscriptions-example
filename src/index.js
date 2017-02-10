import React from 'react';
import ReactDOM from 'react-dom';
import ApolloClient, { createNetworkInterface } from 'apollo-client';
import { ApolloProvider } from 'react-apollo';
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';
import TodoApp from './components/TodoApp';
import './index.css';

const projectUri = 'https://api.graph.cool/simple/v1/__PROJECT_ID__';

const wsClient = new SubscriptionClient(projectUri.replace(
    'https://api.graph.cool/simple/v1/',
    'ws://subscriptions.graph.cool/'
), {
    reconnect: true
});
const networkInterface =
  createNetworkInterface({uri: projectUri});

// The x-graphcool-source header is to let the server know that the example app has started.
// (Not necessary for normal projects)
networkInterface.use([{
  applyMiddleware (req, next) {
    if (!req.options.headers) {
      // Create the header object if needed.
      req.options.headers = {}
    }
    req.options.headers['x-graphcool-source'] = 'example:react-apollo-todo-subscriptions'
    next()
  },
}])

const networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
  networkInterface,
  wsClient,
);

const client = new ApolloClient({
  networkInterface: networkInterfaceWithSubscriptions,
  dataIdFromObject: o => o.id
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <TodoApp />
  </ApolloProvider>,
  document.getElementById('root')
);
