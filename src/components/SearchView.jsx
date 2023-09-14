import React, { useState } from 'react';
import axios from 'axios';
import ResultsList from './ResultsList';
import './SearchView.css';

const SearchView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };



  const handleSearchSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.get('https://ai-weather-by-meteosource.p.rapidapi.com/find_places', {
        params: {
          text: searchQuery,
          language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': '6b4a4807e5mshfd01d0925c6d1adp16c76djsnb773fc266756',
          'X-RapidAPI-Host': 'ai-weather-by-meteosource.p.rapidapi.com'
        }
      });
      setSearchResults(response.data);
      console.log(response.data);
    } catch (error) {
      console.error(error);
      /* manage error mesage */
      setErrorMessage('Error: Unable to perform the search.'); 
      setTimeout(() => {
        setErrorMessage('');
      }, 5000); 
    }
    setSearchQuery('');
  };

  return (
    <div className="search-view">
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      <form onSubmit={handleSearchSubmit} className='form'>
        <input
          className='searchInput'
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Enter city and country"
        />
        <button className='sendButton' type="submit">
          <span className="material-symbols-outlined sendIcon">send</span>
        </button>
      </form>
      <ResultsList results={searchResults} className='resultsList' />
    </div>
  );
};

export default SearchView;
