import { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import NewBook from "./components/NewBook";
import Recommendations from "./components/Recommendations";

import { useQuery, useMutation, useSubscription, useApolloClient } from '@apollo/client';
import { ALL_AUTHORS, ALL_BOOKS, PERSON_DETAILS } from './queries'
import LoginForm from './components/LoginForm'
import { gql } from "@apollo/client";

export const PERSON_ADDED = gql`  
	subscription {    
		personAdded {      
			...PersonDetails    
		}  
	}  
	${PERSON_DETAILS}
`

const App = () => {

	const [page, setPage] = useState("authors");
	const authors = useQuery(ALL_AUTHORS);
	const books = useQuery(ALL_BOOKS);
	const [token, setToken] = useState(null);
	const client = useApolloClient()

	useSubscription(PERSON_ADDED, {
		onData: ({ data }) => {
		  	console.log(data)
		}
	})
	
	const logout = () => {    
		setToken(null)    
		localStorage.clear()    
		client.resetStore()  
	}


	if (authors.loading || books.loading)  {
		return <div>loading...</div>
	}

	if (!token) {
		return (
			<div>
				<h2>Login</h2>
				<LoginForm
					setToken={setToken}
				/>
			</div>
		)
	}

	return (
		<div>
			<div>
				<button onClick={() => setPage("authors")}>authors</button>
				<button onClick={() => setPage("books")}>books</button>
				<button onClick={() => setPage("add")}>add book</button>
				<button onClick={() => setPage("recommend")}>recommend</button>
				<button onClick={logout}>logout</button>
			</div>

			<Authors show={page === "authors"} authors={authors.data.allAuthors} />
			<Books show={page === "books"} books={books.data.allBooks} />
			<NewBook show={page === "add"}  />
			<Recommendations show={page === "recommend"} books={books.data.allBooks}/>
		</div>
	);
};

export default App;
