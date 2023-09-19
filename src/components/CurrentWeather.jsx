import React, { useState, useEffect } from 'react';
import './CurrentWeather.css';
import axios from 'axios';

import loadingIcon from '../img/loadicon.svg';
import newmoon from '../img/Final View/MoonPhases/new-moon.png';
import waxingCrecent1 from '../img/Final View/MoonPhases/waxing-crescent-moon1.png';
import fistQuarter from '../img/Final View/MoonPhases/quarter-moon1.png';
import waxingGibbous1 from '../img/Final View/MoonPhases/waxing-gibbous-moon1.png';
import fullMoon from '../img/Final View/MoonPhases/full-moon.png';
import waningGibboues2 from '../img/Final View/MoonPhases/waning-gibbous-moon2.png';
import lastQuarter from '../img/Final View/MoonPhases/quarter-moon2.png';
import waningCrecent from '../img/Final View/MoonPhases/waning-crescent-moon2.png';

const CurrentWeather = ({ data, location, temperature }) => {
  const [loading, setLoading] = useState(false);
  const [astroInfo, setAstroInfo] = useState(null);
  const [error, setError] = useState(null);


  useEffect(() => {
    setLoading(true);
    getAstroInfo();
  }, []);


  /* get astro info from Meteosource */
  const getAstroInfo = async () => {
    let astroLat = data.location.lat;
    let astroLon = data.location.lon;
    let localtime = data.location.localtime;
    console.log("getastroinfo: ", astroLat, astroLon, localtime);
    const options = {
      method: 'POST',
      url: 'https://wyjyt-geo-calculate.p.rapidapi.com/Sky',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '6b4a4807e5mshfd01d0925c6d1adp16c76djsnb773fc266756', 
        'X-RapidAPI-Host': 'wyjyt-geo-calculate.p.rapidapi.com'
      },
      data: {
        date: localtime,
        coordinate: `${astroLat} ${astroLon}`
      }
    };

    try {
      const response = await axios.request(options);
      if (response.data) {
        setAstroInfo(response.data);
        console.log("ASTROINFO: ", response.data);
      }
    } catch (error) {
      setError('Error al obtener información astronómica');
    } finally {
      setLoading(false);
    }
  }

  const getMoonPhaseIcon = (phaseName) => {
    switch (phaseName) {
      case 'New Moon':
        return (<div className='moonImg'>
          <img src= {newmoon} alt='New Moon'/>
        </div>);
      case 'Waxing Crescent':
        return (<div className='moonImg'>
          <img src= {waxingCrecent1} alt='Waxing Crescent'/>
        </div>);
      case 'First Quarter':
        return (<div className='moonImg'>
          <img src= {fistQuarter} alt='First Quarter'/>
        </div>);
      case 'Waxing Gibbous':
        return (<div className='moonImg'>
          <img src= {waxingGibbous1} alt='Waxing Gibbous'/>
        </div>);
      case 'Full Moon':
        return (<div className='moonImg'>
          <img src= {fullMoon} alt='Full Moon'/>
        </div>);
      case 'Waning Gibbous':
        return (<div className='moonImg'>
          <img src= {waningGibboues2} alt='Waning Gibbous'/>
        </div>);
      case 'Last Quarter':
        return (<div className='moonImg'>
          <img src= {lastQuarter} alt='Last Quarter'/>
        </div>);
      case 'Waning Crescent':
        return (<div className='moonImg'>
          <img src= {waningCrecent} alt='Waning Crescent'/>
        </div>);
      default:
        return null;
    }
  }


  return (
    <div className="current-weather">
      {loading && <div>
        <img src={loadingIcon} alt="Loading" className='loading-image'/></div>}
      {error && <p>{error}</p>}
      {astroInfo && (
        <div className="weather-details">
          <div>
            <strong>Location:</strong> {location.name}, {location.adm_area1}, {location.country}
          </div>
          <div>
            <strong>Temperature:</strong> {temperature}°C
          </div>
          {data && data.current && (
            <div>
              <strong>Humidity:</strong> {data.current.humidity}%
            </div>
          )}
          <div>
            <strong>Moon Phase:</strong> {getMoonPhaseIcon(astroInfo.moon.illumination.phaseName)}
          </div>
          <div>
            <strong>Sunrise:</strong> {astroInfo.sun.rise}
          </div>
          <div>
            <strong>Sunset:</strong> {astroInfo.sun.set}
          </div>
          <div>
            <strong>Pressure:</strong> {data.current.pressure_in} hPa
          </div>
          <div>
            <strong>Latitude:</strong> {data.location.lat}
          </div>
          <div>
            <strong>Longitude:</strong> {data.location.lon}
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentWeather;