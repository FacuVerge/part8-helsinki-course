import { ADD_YEAR, ALL_AUTHORS } from '../queries'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import Select from 'react-select';

export const YearForm = ({authors}) => {

    const [name, setName] = useState({})
    const [born, setBorn] = useState('')

    const options = authors.map((author) =>  { return {'value': author, 'label': author} }) 

    const [ addYear ] = useMutation(ADD_YEAR, {
        onError: (error) => {
          console.log(error)
        },
        refetchQueries: [{query: ALL_AUTHORS}]
    })

    const submit = async (event) => {
        event.preventDefault()
    
        

        addYear({
          variables: { 
            name: name.value, 
            born: born > 0 ? parseInt(born, 10) : undefined,
            token: localStorage.getItem('phonenumbers-user-token')
          }
        })
    
        setName('')
        setBorn('')
    }

    return(
        <>
            <h2>Set Birthyear</h2>
            <form onSubmit={submit}>
                <Select
                    defaultValue={name}
                    onChange={setName}
                    options={options}
                />
                <div>
                    born
                    <input
                        value={born}
                        onChange={({ target }) => setBorn(target.value)}
                    />
                </div>
                <button type="submit">update author</button>
            </form>
        </>
    )
}