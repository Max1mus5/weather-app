import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsList.css';
import sunnyIcon from '../img/Clouds/sunny.png';
import cloudyIcon from '../img/Clouds/template.png';
import snowIcon from '../img/Clouds/snow.png';
import calidIcon from '../img/Clouds/calid.png';
import normalIcon from '../img/Clouds/normal.png';
import CurrentWeather from './CurrentWeather';

const ResultsList = ({ results }) => {
  const [temp, setTemp] = useState([]);
  const [last_updated, setLast_updated] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [info, setinfo]=useState([]);

  useEffect(() => {
    if (results.length > 0) {
      searchTemperature();
    }
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
            'X-RapidAPI-Key': '6b4a4807e5mshfd01d0925c6d1adp16c76djsnb773fc266756',
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
    setLast_updated(lastupdate);
    setinfo(infoComplet);
    console.log("all info:",infoComplet);
  };

  const getWeatherIcon = (temperature) => {
    if (temperature > 30) {
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
    setSelectedItem(index);
  };

  return (
    
    <div className='Container'>
      {results.length > 0 ? (
        
        <div className="results-list">
          <p>Please Wait to load the Icons</p>
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
      ) : null}

      {selectedItem !== null && (
        <CurrentWeather data={info[selectedItem]} location={results[selectedItem]}temperature = {temp[selectedItem]} />
      )}
    </div>
  );
};

export default ResultsList;
