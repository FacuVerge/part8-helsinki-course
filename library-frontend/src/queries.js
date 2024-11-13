import { gql } from "@apollo/client"

export const ALL_AUTHORS = gql`
query {
  allAuthors  {
    name
    born
    bookCount
  }
}
`

export const ALL_BOOKS = gql`
query Query {
  allBooks {
    author {
      name
    }
    title
    published
    genres
  }
}
`

export const ALL_BOOKS_BY_GENRE = gql`
query Query($genre: String) {
  allBooksByGenre(genre: $genre) {
    author {
      name
      id
      born
    }
    title
    published
    genres
  }
}
`

export const ADD_BOOK = gql`
mutation AddBook($title: String!, $author: String!, $token: String!, $genres: [String], $published: Int) {
  addBook(title: $title, author: $author, token: $token, genres: $genres, published: $published) {
    genres
    published
    title
    author {
      name
      id
      born
    }
  }
}
`

export const ADD_YEAR = gql`
  mutation AddYear($name: String!, $born: Int!, $token:String!) {
  editAuthor(name: $name, setBornTo: $born, token: $token) {
    name
    born
    id
  }
}
`

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password)  {
      value
    }
  }
`

export const ME = gql`
  query Query {
    me {
      username
      favoriteGenre
      id
    }
  }
`

export const PERSON_DETAILS = gql`
  fragment PersonDetails on Person {
    id
    name
    phone 
    address {
      street 
      city
    }
  }
`