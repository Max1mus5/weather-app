import React, { useState } from 'react';
import axios from 'axios';
import ResultsList from './ResultsList';
import './SearchView.css';

const SearchView = () => {
const [searchQuery, setSearchQuery] = useState('');
const [searchResults, setSearchResults] = useState([]);
const [errorMessage, setErrorMessage] = useState('');
const [welcomeMessage, setWelcomeMessage] = useState('Welcome to Clim-J!');
const [parragraph, setParragraph] = useState('Please enter a city and country to get the weather forecast.');

const handleSearchInputChange = (e) => {
  setSearchQuery(e.target.value);
};

const handleSearchSubmit = async (e) => {
  setWelcomeMessage('');
  setParragraph('');
  e.preventDefault();

    try {
      const response = await axios.get('https://ai-weather-by-meteosource.p.rapidapi.com/find_places', {
        params: {
          text: searchQuery,
          language: 'en'
        },
        headers: {
          'X-RapidAPI-Key': 'c226bb7480msh1c197da85b4db7bp145e99jsnc213b14f7856',//ligoleyen
          'X-RapidAPI-Host': 'ai-weather-by-meteosource.p.rapidapi.com'
        }
      });
      setSearchResults(response.data);
      if (response.data.length === 0) {
        setParragraph('No results found. Please try again.');
        setTimeout(() => {
          setParragraph('Please enter a city and country to get the weather forecast.');
        }, 1500);
      }    
    } catch (error) {
      console.error("error", error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 0 || error.request?.timeout || error.message === "Network Error") {
          setWelcomeMessage('Maybe a Network problem...');
          setParragraph('Please check your internet connection ☝️🤓');
        } else {
          setErrorMessage('Unable to perform the search.');
        }
      } else {
        setErrorMessage('An unexpected error occurred.');
      }
      setTimeout(() => {
        setErrorMessage('');
        setWelcomeMessage('');
        setParragraph('');
      }, 3000);
    }
    setSearchQuery('');
};

return (
  
  <div className="search-view">
      <div className="welcomeMessage">
        <h1 className='welcomeTitle'>{welcomeMessage}</h1>
      <p>{parragraph}</p>
      {errorMessage && (
        <div className="error-message">{errorMessage}</div>
      )}
      </div>
      <form onSubmit={handleSearchSubmit} className='form'>
        <input
          className='searchInput'
          type="text"
          value={searchQuery}
          onChange={handleSearchInputChange}
          placeholder="Enter city and country"
        />
        <button className='sendButton' type="submit">
          <span className="sendIcon">
          <svg width="20px" height="20px" viewBox="0 0 24 24"  xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path className='pathSendButton'fill="currentColor" clip-rule="evenodd" d="M1.265 4.42619C1.04293 2.87167 2.6169 1.67931 4.05323 2.31397L21.8341 10.1706C23.423 10.8727 23.423 13.1273 21.8341 13.8294L4.05323 21.686C2.6169 22.3207 1.04293 21.1283 1.265 19.5738L1.99102 14.4917C2.06002 14.0087 2.41458 13.6156 2.88791 13.4972L8.87688 12L2.88791 10.5028C2.41458 10.3844 2.06002 9.99129 1.99102 9.50829L1.265 4.42619ZM21.0257 12L3.2449 4.14335L3.89484 8.69294L12.8545 10.9328C13.9654 11.2106 13.9654 12.7894 12.8545 13.0672L3.89484 15.3071L3.2449 19.8566L21.0257 12Z" ></path> </g></svg>
          </span>
        </button>
      </form>
      {searchResults.length > 0 && (
        <ResultsList results={searchResults} className='resultsList' />
      )}

    </div>
 );
};

export default SearchView;
