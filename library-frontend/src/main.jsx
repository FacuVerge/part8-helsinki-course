import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, split } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import ReactDOM from 'react-dom/client'
import App from './App'

import { getMainDefinition } from '@apollo/client/utilities'
import { WebSocketLink } from '@apollo/client/link/ws'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    }
  }
})

const httpLink = createHttpLink({
  uri: 'http://localhost:4000',
})

const wsLink = new WebSocketLink({  
  uri: `ws://localhost:4000/`,  
  options: {    
    reconnect: true  
  }})
  const splitLink = split(  
    ({ query }) => {    
      const definition = getMainDefinition(query)    
      return (      
        definition.kind === 'OperationDefinition' &&      
        definition.operation === 'subscription'    
      );  
    },  
    wsLink,  
    authLink.concat(httpLink),
  )

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink
})

ReactDOM.createRoot(document.getElementById('root')).render(
	<ApolloProvider client={client}>
	  <App />
	</ApolloProvider>
  )
