import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL Error] Message: ${message}, Path: ${path}`)
    );
  }
  if (networkError) {
    console.error(`[Network Error] ${networkError}`);
  }
});

const httpLink = new HttpLink({
  uri: 'http://localhost:8080/graphql',
});

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query:      { fetchPolicy: 'network-only', errorPolicy: 'all' },
  },
});

export default client;
