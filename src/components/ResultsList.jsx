import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ResultsList.css';

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


  return (
    <div className='Container'>
      {results.length > 0 ? (
        <div className="results-list">
          <ul className='listContainer'>
            {results.map((result, index) => (
              <li key={result.id} className='listElement'>
                {result.name},{result.adm_area1}, {result.country}, {temp[index]}° ----last updated: {last_updated[index]}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
  
  
  
        
};

export default ResultsList;