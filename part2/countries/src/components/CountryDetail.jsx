import { useState, useEffect } from 'react'
import axios from 'axios'

const CountryDetail = ({ country }) => {
  const [weather, setWeather] = useState(null)
  const apiKey = import.meta.env.VITE_SOME_KEY

  useEffect(() => {
    const capital = country.capital?.[0]
    if (capital && apiKey) {
      axios
        .get(`https://api.openweathermap.org/data/2.5/weather?q=${capital}&appid=${apiKey}&units=metric`)
        .then(response => {
          setWeather(response.data)
        })
        .catch(error => {
          console.log('Error fetching weather data', error)
        })
    }
  }, [country, apiKey])

  return (
    <div>
      <h1>{country.name.common}</h1>
      <div>capital {country.capital?.[0]}</div>
      <div>area {country.area}</div>

      <h3>languages:</h3>
      <ul>
        {Object.values(country.languages || {}).map(lang => (
          <li key={lang}>{lang}</li>
        ))}
      </ul>

      <img src={country.flags.png} alt={`Flag of ${country.name.common}`} width="150" />

      {weather && (
        <div>
          <h2>Weather in {country.capital?.[0]}</h2>
          <div>temperature {weather.main?.temp} Celcius</div>
          {weather.weather?.[0]?.icon && (
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
            />
          )}
          <div>wind {weather.wind?.speed} m/s</div>
        </div>
      )}
    </div>
  )
}

export default CountryDetail
