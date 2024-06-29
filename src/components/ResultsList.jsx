import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsList.css';
import loading from '../img/loadicon.svg';
import sunnyIcon from '../img/Clouds/sunny.png';
import cloudyIcon from '../img/Clouds/template.png';
import snowIcon from '../img/Clouds/snow.png';
import calidIcon from '../img/Clouds/calid.png';
import normalIcon from '../img/Clouds/normal.png';
import CurrentWeather from './CurrentWeather';

const ResultsList = ({ results }) => {
  const [temp, setTemp] = useState([]);
  /* const [last_updated, setLast_updated] = useState([]); */
  const [selectedItem, setSelectedItem] = useState(null); 
  const [info, setInfo] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCurrentWeather, setShowCurrentWeather] = useState(true); // Change initial state to false

  useEffect(() => {
    if (results.length > 0) {
      searchTemperature();
      setInfo([]);
      setIsLoading(true);
    }
    // eslint-disable-next-line
  }, [results]);

  const searchTemperature = async () => {
    const tempArray = [];
    const lastupdate = [];
    const infoComplet = [];

    for (let i = 0; i < results.length; i++) {
      try {
        const response = await axios.get(`https://weatherapi-com.p.rapidapi.com/current.json`, {
          params: {
            q: `${results[i].name},${results[i].adm_area1},${results[i].country}`,
          },
          headers: {
            'X-RapidAPI-Key':  '6b4a4807e5mshfd01d0925c6d1adp16c76djsnb773fc266756',//ligoleyen
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
          }
        });

        tempArray.push(response.data.current.temp_c);
        lastupdate.push(response.data.current.last_updated);
        infoComplet.push(response.data);
      } catch (error) {
        console.error(error);
      }
    }

    setTemp(tempArray);
    setInfo(infoComplet);
/*     setLast_updated(lastupdate);*/
   
    //console.log("info Complete",infoComplet);
    setIsLoading(false);
  };

  const getWeatherIcon = (temperature) => {
    if (temperature === null || temperature === undefined) {
      return {}; // Muestra "Loading..." mientras se carga la temperatura
    } else if (temperature > 30) {
      return sunnyIcon;
    } else if (temperature > 25 && temperature <= 30) {
      return calidIcon;
    } else if (temperature > 18 && temperature <= 25) {
      return normalIcon;
    } else if (temperature > 10 && temperature <= 18) {
      return cloudyIcon;
    } else if (temperature <= 10) {
      return snowIcon;
    }
  };

  const handleItemClick = (index) => {
    if (selectedItem === index) {
      // If the clicked item is already selected, toggle the showCurrentWeather state
      setShowCurrentWeather((prevState) => !prevState);
      //console.log("selectetItem: ",index, ":", showCurrentWeather);
    } else {
      // If a different item is clicked, update the selectedItem and showCurrentWeather states
      setSelectedItem(index);
      setShowCurrentWeather(true);
      //console.log("selectedItem:",index, ":", showCurrentWeather);
    }
  };

  const handleClose =()=>{
    setShowCurrentWeather(false);
    //console.log("close: ", showCurrentWeather);
    setSelectedItem(null);
  }

  return (
    <div className='Container'>
      {isLoading ? (
        <div className="loading-container">
          <img src={loading} alt="Loading" className="loading-image" />
        </div>
      ) : (
        <div className="results-list">
          <ul className='listContainer'>
            {results.map((result, index) => (
              <li key={result.id} className='listElement' onClick={() => handleItemClick(index)}>
                <div className='location'>
                  <span className="country">{result.country}</span>
                  <span className="city">{result.name},{result.adm_area1}</span>
                </div>
                <div className="temperatureContainer">
                  <img src={getWeatherIcon(temp[index])} alt="Temperature" className="temperatureImage" />
                  <span className="temperatureValue">{temp[index]}°</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showCurrentWeather && selectedItem !== null && (
        <CurrentWeather data={info[selectedItem]} location={results[selectedItem]} temperature={temp[selectedItem]} state={showCurrentWeather} close={handleClose} />
      )}
    </div>
  );
};

export default ResultsList;