import CountryDetail from './CountryDetail'

const CountryList = ({ countries, handleShow }) => {
  if (countries.length > 10) {
    return (
      <div>Too many matches, specify another filter</div>
    )
  }

  if (countries.length === 1) {
    return (
      <CountryDetail country={countries[0]} />
    )
  }

  if (countries.length === 0) {
    return (
      <div>No matches found</div>
    )
  }

  return (
    <div>
      {countries.map(country => (
        <div key={country.name.common} style={{ margin: '5px 0' }}>
          {country.name.common}{' '}
          <button onClick={() => handleShow(country)}>show</button>
        </div>
      ))}
    </div>
  )
}

export default CountryList
