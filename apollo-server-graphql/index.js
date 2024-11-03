import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'
import { v4 as uuidv4 } from 'uuid';

let authors = [
	{
		name: 'Robert Martin',
		id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
		born: 1952,
	},
	{
		name: 'Martin Fowler',
		id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
		born: 1963
	},
	{
		name: 'Fyodor Dostoevsky',
		id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
		born: 1821
	},
	{ 
		name: 'Joshua Kerievsky', // birthyear not known
		id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
	},
	{ 
		name: 'Sandi Metz', // birthyear not known
		id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
	},
]


let books = [
	{
		title: 'Clean Code',
		published: 2008,
		author: 'Robert Martin',
		id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
		genres: ['refactoring']
	},
	{
		title: 'Agile software development',
		published: 2002,
		author: 'Robert Martin',
		id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
		genres: ['agile', 'patterns', 'design']
	},
	{
		title: 'Refactoring, edition 2',
		published: 2018,
		author: 'Martin Fowler',
		id: "afa5de00-344d-11e9-a414-719c6709cf3e",
		genres: ['refactoring']
	},
	{
		title: 'Refactoring to patterns',
		published: 2008,
		author: 'Joshua Kerievsky',
		id: "afa5de01-344d-11e9-a414-719c6709cf3e",
		genres: ['refactoring', 'patterns']
	},  
	{
		title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
		published: 2012,
		author: 'Sandi Metz',
		id: "afa5de02-344d-11e9-a414-719c6709cf3e",
		genres: ['refactoring', 'design']
	},
	{
		title: 'Crime and punishment',
		published: 1866,
		author: 'Fyodor Dostoevsky',
		id: "afa5de03-344d-11e9-a414-719c6709cf3e",
		genres: ['classic', 'crime']
	},
	{
		title: 'Demons',
		published: 1872,
		author: 'Fyodor Dostoevsky',
		id: "afa5de04-344d-11e9-a414-719c6709cf3e",
		genres: ['classic', 'revolution']
	},
]

const typeDefs = `
	type Book {
		title: String!
		published: Int
		author: String!
		id: ID!
		genres: [String]
	}

	type Author {
		name: String!
		born: Int
		id: ID!
	}

	type AuthorBookCount {
		name: String!
		bookCount: Int!
	}

	type Query {
		bookCount: Int
		authorCount: Int
		allBooksByAuthor(author: String): [Book]
		allBooksByGenre(genre: String): [Book]
		allAuthors: [AuthorBookCount]
	}
	
	type Mutation {
		addBook(
			title: String!
			author: String!
			genres: [String]
			published: Int
		): Book

		editAuthor(
			name: String!
			setBornTo: Int!
		): Author
	}
`

const resolvers = {
	Query: {
		bookCount: () => books.length,
		authorCount: () => authors.length,
		allBooksByAuthor: (root, args) => {
			if(!args.author) {
				return books;
			}
			return books.filter(book => book.author == args.author);
			
		},
		allBooksByGenre: (root, args) => {
			if(!args.genre) {
				return books;
			}
			return books.filter(book => book.genres.includes(args.genre));
			
		},
		allAuthors: () => {
			return authors.map(author => {
				return { name: author.name, bookCount: books.filter(book => book.author == author.name).length}
			})
		}
	},
	Mutation: {
		addBook: (root, args) => {
			const book = { ...args, id: uuidv4() }
			if(!authors.find(author => author.name == args.author)) {
				authors = authors.concat({name: args.author, id: uuidv4()})
			}
			books = books.concat(book)
			return book
		},
		editAuthor: (root, args) => {
			const author = authors.find(p => p.name === args.name)
			if (!author) {
				return null
			}
		
			const updatedAuthor = { ...author, born: args.setBornTo }
			authors = authors.map(p => p.name === args.name ? updatedAuthor : p)
			return updatedAuthor
		}	
	}
}

const server = new ApolloServer({
	typeDefs,
	resolvers,
})

startStandaloneServer(server, {
	listen: { port: 4000 },
}).then(({ url }) => {
	console.log(`Server ready at ${url}`)
})