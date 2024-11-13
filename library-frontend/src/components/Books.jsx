import { useQuery } from "@apollo/client";
import { useState } from "react"; 
import { ALL_BOOKS_BY_GENRE } from "../queries";

const Books = ({show, books}) => {

  const [selectedGenre, setSelectedGenre] = useState('all');
  const genres = [...new Set(books.flatMap((b) => b.genres)), 'all']

  const booksByGenre = useQuery(ALL_BOOKS_BY_GENRE, {
    variables: {genre: selectedGenre == 'all' ? '' : selectedGenre}
  })

  if (!show) {
    return null
  }

  const booksToShow = selectedGenre == 'all' || booksByGenre.loading ? books : booksByGenre.data?.allBooksByGenre

  return (
    <div>
      <h2>books</h2>
      <h3>in genre {selectedGenre}</h3>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {genres.map((genre) => 
        <button key={genre} onClick={() => setSelectedGenre(genre)}>{genre}</button>
      )}
    </div>
  )
}

export default Books
