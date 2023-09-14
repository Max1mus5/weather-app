import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsList.css';
import sunnyIcon from '../img/Clouds/sunny.png';
import cloudyIcon from '../img/Clouds/template.png';
import snowIcon from '../img/Clouds/snow.png';
import calidIcon from '../img/Clouds/calid.png';
import normalIcon from '../img/Clouds/normal.png';


const ResultsList = ({ results }) => {
  const [temp, setTemp] = useState([]);
  const [last_updated, setLast_updated] = useState([]);

  useEffect(() => {
    if (results.length >0 ) {
      searchTemperature();
    }
  }, [results]); // satblishe the dependency of the useEffect hook

  const searchTemperature = async () => {
    const tempArray = [];
    const lastupdate = [];
    for (let i = 0; i < results.length; i++){
      try {
        //Extract the latitude and longitude number from the string
      

        const response = await axios.get(`https://weatherapi-com.p.rapidapi.com/current.json`, {
          params: {
            q: `${results[i].name},${results[i].adm_area1},${results[i].country}`,
          },
          headers: {
            'X-RapidAPI-Key': '6b4a4807e5mshfd01d0925c6d1adp16c76djsnb773fc266756',
            'X-RapidAPI-Host': 'weatherapi-com.p.rapidapi.com'
          }
        });
        console.log(results[i].name+","+results[i].adm_area1+","+results[i].country+" : "+response.data.current.temp_c);
        tempArray.push(response.data.current.temp_c);
        lastupdate.push(response.data.current.last_updated);

      } catch (error) {
        console.error(error); 
      }
    }
    console.log(tempArray);
    setTemp(tempArray);
    setLast_updated(lastupdate);
  };


  const getWeatherIcon = (temperature) => {
    console.log("Temperature:", temperature); // Add this line
  
    if (temperature > 30) {
      console.log("Sunny Icon"); // Add this line
      return sunnyIcon;
    } else if (temperature > 25 && temperature <= 30) {
      console.log("Calid Icon"); // Add this line
      return calidIcon;
    } else if (temperature > 18 && temperature <= 25) {
      console.log("Normal Icon"); // Add this line
      return normalIcon;
    } else if (temperature > 10 && temperature <= 18) {
      console.log("Cloudy Icon"); // Add this line
      return cloudyIcon;
    } else if(temperature <= 10) {
      console.log("Snow Icon"); // Add this line
      return snowIcon;
    }
  };
  

  return (
    <div className='Container'>
      {results.length > 0 ? (
        <div className="results-list">
          <ul className='listContainer'>
          {results.map((result, index) => (
            <li key={result.id} className='listElement'>
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
    </div>
  );
  
  
  
        
};

export default ResultsList;