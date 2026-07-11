import { useState, useEffect } from 'react'
import axios from 'axios'
import CountryList from './components/CountryList'

const App = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [countries, setCountries] = useState([])

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
      .catch(error => {
        console.log('Error fetching country data', error)
      })
  }, [])

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value)
  }

  const countriesToShow = searchQuery === ''
    ? []
    : countries.filter(country =>
        country.name.common.toLowerCase().includes(searchQuery.toLowerCase())
      )

  return (
    <div>
      <div>
        find countries <input value={searchQuery} onChange={handleSearchChange} />
      </div>
      <CountryList
        countries={countriesToShow}
        handleShow={country => setSearchQuery(country.name.common)}
      />
    </div>
  )
}

export default App
