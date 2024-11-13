const { ApolloServer } = require('@apollo/server')
const { ApolloServerPluginDrainHttpServer } = require('@apollo/server/plugin/drainHttpServer')
const { expressMiddleware } = require('@apollo/server/express4')
const { makeExecutableSchema } = require('@graphql-tools/schema')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const Person = require('./models/person')
const User = require('./models/user')

require('dotenv').config()

const MONGODB_URI = process.env.MONGODB_URI

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

	type User {
		username: String!
		favoriteGenre: String!
		id: ID!
	}

	type Token {
		value: String!
	}

	type Person {
		name: String!
		phone: String
		address: Address!
		id: ID!
  	}

	type Address {
		street: String!
		city: String! 
  	}

	enum YesNo {
		YES
		NO
	}

  	type Book {
		title: String!
		published: Int
		author: Author!
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
		born: Int
		bookCount: Int
	}

	type AuthorAndBooks {
		name: String!
		born: Int
		books: [Book]
	}

	type Query {
		bookCount: Int
		authorCount: Int
		allBooksByAuthor(author: String): [Book]
		allBooksByGenre(genre: String): [Book]
		allAuthors: [AuthorBookCount]
		allBooks: [Book]
		personCount: Int!
		allPersons(phone: YesNo): [Person!]!
		findPerson(name: String!): Person
		me: User
	}
	
	type Mutation {
		addBook(
			title: String!
			author: String!
			genres: [String]
			published: Int
			token: String!
		): Book

		editAuthor(
			name: String!
			setBornTo: Int!
			token: String!
		): Author

		createUser(
			username: String!
			favoriteGenre: String!
		): User
  
		login(
    		username: String!
    		password: String!
  		): Token

		addPerson(
			name: String!
			phone: String
			street: String!
			city: String!
		): Person

		editNumber(
			name: String!
			phone: String!
		): Person

	}

	type Subscription {
  		bookAdded: Book!
	} 
`

const resolvers = {
	Query: {
		personCount: async () => Person.collection.countDocuments(),
		allPersons: async (root, args) => {
			if (!args.phone) {
				return await Person.find({})
			}
		
			return await Person.find({ phone: { $exists: args.phone === 'YES'  }})
		},
		findPerson: async (root, args) => Person.findOne({ name: args.name }),
		bookCount: () => books.length,
		authorCount: () => authors.length,
		allBooksByAuthor: (root, args) => {
			if(!args.author) {
				return books;
			}
			return books
				.filter(book => book.author == args.author)
				.map((book) => {return {...book, author: authors.find(author => author.name === book.author)}});
				
		},
		allBooksByGenre: (root, args) => {
			if(!args.genre) {
				return books;
			}
			return books.filter(book => book.genres.includes(args.genre)).map((book) => {return {...book, author: authors.find(author => author.name === book.author)}});
				
		},
		allAuthors: () => {
			return authors.map(author => {
				return { name: author.name, born: author.born, bookCount: books.filter(book => book.author == author.name).length}
			})
		},
		allBooks: () => {
			return books.map((book) => {return {...book, author: authors.find(author => author.name === book.author)}});
		},
		me: (root, args, context) => {
			return context.currentUser
		}
	},
	Person: {
		address: (root) => {
			return {
				street: root.street,
				city: root.city,
			}
		},
	},
	Mutation: {
		addPerson: async (root, args) => {
			const person = new Person({ ...args })
	
			try {
				await person.save()
			} catch (error) {
				throw new GraphQLError(error.message, {
					extensions: {
					  code: 'BAD_USER_INPUT',
					},
				});
			}
			return person
		},
		editNumber: async (root, args) => {
			const person = await Person.findOne({ name: args.name })
			person.phone = args.phone
	
			try {
				await person.save()
			} catch (error) {
				throw new GraphQLError(error.message, {
					extensions: {
					  code: 'BAD_USER_INPUT',
					},
				});
			}
			return person
		},
		addBook: (root, args) => {
			try {
				jwt.verify(args.token, process.env.SECRET);
			} catch (error) {
				throw new GraphQLError('Adding the book failed', {
					extensions: {
						code: 'INVALID_TOKEN',
						invalidArgs: args.name,
						error
					}
				})
			}
			
			let author = authors.find(p => p.name === args.author)
			if (!author) {
				author = {name: args.author, id: uuidv4()}
				authors = authors.concat(author)
			}
			const book = { ...args, id: uuidv4(), author: author }
			books = books.concat({ ...args, id: uuidv4(), author: author.name })
			
			pubsub.publish('PERSON_ADDED', { personAdded: person })
			return book;
		},
		editAuthor: (root, args) => {
			try {
				jwt.verify(args.token, process.env.SECRET);
			} catch (error) {
				throw new GraphQLError('Updating the author failed', {
					extensions: {
						code: 'INVALID_TOKEN',
						invalidArgs: args.name,
						error
					}
				})
			}
			const author = authors.find(p => p.name === args.name)
			if (!author) {
				return null
			}
		
			const updatedAuthor = { ...author, born: args.setBornTo }
			authors = authors.map(p => p.name === args.name ? updatedAuthor : p)
			return updatedAuthor
		},
		createUser: async (root, args) => {
			const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
		
			return user.save()
				.catch(error => {
					throw new GraphQLError('Creating the user failed', {
						extensions: {
							code: 'BAD_USER_INPUT',
							invalidArgs: args.name,
							error
						}
					})
				})
		},
		login: async (root, args) => {
			const user = await User.findOne({ username: args.username })
		
			if ( !user || args.password !== 'secret' ) {
			throw new GraphQLError('wrong credentials', {
				extensions: {
				code: 'BAD_USER_INPUT'
				}
			})        
			}
		
			const userForToken = {
				username: user.username,
				id: user._id,
			}
		
			return { value: jwt.sign(userForToken, process.env.SECRET) }
		},	
	},
	Subscription: {    
		bookAdded: {      
			subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])    
		},  
	},
}

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })

// setup is now within a function
const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/',
  })
  
  const schema = makeExecutableSchema({ typeDefs, resolvers })
  const serverCleanup = useServer({ schema }, wsServer);

  const server = new ApolloServer({
    schema,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  })

  await server.start()

  app.use(
    '/',
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.startsWith('Bearer ')) {
          const decodedToken = jwt.verify(auth.substring(7), process.env.JWT_SECRET)
          const currentUser = await User.findById(decodedToken.id).populate(
            'friends'
          )
          return { currentUser }
        }
      },
    }),
  )

  const PORT = 4000

  httpServer.listen(PORT, () =>
    console.log(`Server is now running on http://localhost:${PORT}`)
  )

}

start()