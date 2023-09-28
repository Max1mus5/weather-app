import React, { useState, useEffect } from 'react';
import './CurrentWeather.css';
import axios from 'axios';
import loadingIcon from '../img/loadicon.svg';
import earthImage from '../img/earth.png';
import newmoon from '../img/Final View/MoonPhases/new-moon.png';
import waxingCrecent1 from '../img/Final View/MoonPhases/waxing-crescent-moon1.png';
import fistQuarter from '../img/Final View/MoonPhases/quarter-moon1.png';
import waxingGibbous1 from '../img/Final View/MoonPhases/waxing-gibbous-moon1.png';
import fullMoon from '../img/Final View/MoonPhases/full-moon.png';
import waningGibboues2 from '../img/Final View/MoonPhases/waning-gibbous-moon2.png';
import lastQuarter from '../img/Final View/MoonPhases/quarter-moon2.png';
import waningCrecent from '../img/Final View/MoonPhases/waning-crescent-moon2.png';

import drop from '../img/Final View/PrincipalWeather/water.png';

import { CloseButton } from 'react-bootstrap';

const CurrentWeather = ({ data, location, temperature, state, close }) => {
  const [loading, setLoading] = useState(false);
  const [astroInfo, setAstroInfo] = useState(null);
  const [sunInfo, setSunInfo] = useState(null); 
  const [error, setError] = useState(null);
  const [showCurrentWeather] = useState(state);
  const [showMessage, setShowMessage] = useState(false);
  

  useEffect(() => {
    setLoading(true);
    getAstroInfo();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (sunInfo) {
      console.log("Sun Info: ", sunInfo);
    }
  }, [sunInfo]);

  /* get astro info from Meteosource */
  const getAstroInfo = async () => {
    let astroLat = data.location.lat;
    let astroLon = data.location.lon;
    let localtime = data.location.localtime;
    console.log("getastroinfo: ", astroLat, astroLon, localtime);
  
    const astroOptions = {
      method: 'POST',
      url: 'https://wyjyt-geo-calculate.p.rapidapi.com/Sky',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': '1d247f045bmsh3233b6aa3ff3903p18e1dajsn1e168b9afdb0',
        'X-RapidAPI-Host': 'wyjyt-geo-calculate.p.rapidapi.com'
      },
      data: {
        date: localtime,
        coordinate: `${astroLat} ${astroLon}`
      }
    };
  
    try {
      const astroResponse = await axios.request(astroOptions);
        setLoading(true);
        setAstroInfo(astroResponse.data);
        console.log("ASTROINFO: ", astroResponse.data);
        
        // Makes second Peition to get Sun Info
        const sunOptions = {
          method: 'GET',
          url: 'https://ai-weather-by-meteosource.p.rapidapi.com/astro',
          params: {
            lat: astroLat, 
            lon: astroLon, 
            timezone: 'auto'
          },
          headers: {
            'X-RapidAPI-Key': '1d247f045bmsh3233b6aa3ff3903p18e1dajsn1e168b9afdb0',
            'X-RapidAPI-Host': 'ai-weather-by-meteosource.p.rapidapi.com'
          }
        };
  
        const sunResponse = await axios.request(sunOptions);
        if (sunResponse.data) {
          setSunInfo(sunResponse.data.astro.data[0]);
          console.log("Sun Info: ", sunInfo);
        }
      
    } catch (error) {
      setError('Error al obtener información astronómica\nIntente nuevamente más tarde');
      setTimeout(() => {
        close();
      }, 2000);
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

  
const copyCoordinates = () => {
  let lat = data.location.lat;
  let lon = data.location.lon;
  let coordinates = `${lat} , ${lon}`;
  navigator.clipboard.writeText(coordinates)
    .then(() => {
      setShowMessage(true);
      setTimeout(() => {
        setShowMessage(false);
      }, 2000); // Reiniciar el estado después de 2 segundos
    })
    .catch((error) => {
      console.error('Error On Copy:', error);
    });
}

<div className='latitudelongitude' onClick={copyCoordinates}>
  <div>
    <strong>Latitude:</strong> {data.location.lat}
  </div>
  <div>
    <strong>Longitude:</strong> {data.location.lon}
  </div>
  {showMessage && <p className="copy-message">Click to copy</p>}
</div>



  return (
    showCurrentWeather ? (
      <div className="current-weather">
        <div>
          <img src={earthImage} alt="earth" className='earth-image move' />
        </div>
        {loading && (
          <div>
            <img src={loadingIcon} alt="Loading" className='loading-image loadimage'/>
          </div>
        )}
        {error && <p>{error}</p>}
        {astroInfo && (
          <div className="weather-details">
            <div className='ubicationCITY'>
              <p>{location.name}, {location.adm_area1}, {location.country}</p>
            </div>
            <div className='principalInfo'>
              <div className='tempIMG'>
                <div className='imageCondition'>
                  <img alt='icon of climate' src={data.current.condition.icon}/>
                  <p className='textCondition'>{data.current.condition.text}</p>
                </div>
                <div className='Temperature'>
                  {temperature}°C
                </div>
              </div>
              <div className='complementInfo'>
                <div className='uv'>
                  Uv: {data.current.uv}
                </div>
                <div className='drop'>
                  <img alt='drop of water' src={drop}/> {data.current.humidity}%
                </div>
                <div className='cloud'>
                  Cloud: {data.current.cloud}%
                </div>
                <div className='feelsLike'>
                  Feels Like: {data.current.feelslike_c}°C
                </div>
                <div className='gust'>
                  Gust: {data.current.gust_kph} kph
                </div>
                <div className='pressure'>
                  Pressure: {data.current.pressure_in} in
                </div>
                <div className='wind'>
                  Wind: {data.current.wind_kph} kph {data.current.wind_dir}
                </div>
                <div className='visibility'>
                  Visibility: {data.current.vis_km} km
                </div>
                <div className='precipitation'>
                  Precipitation: {data.current.precip_mm} mm
                </div>
              </div> 
              <div className='latitudelongitude' onClick={copyCoordinates}>
                <div>
                  <strong>Latitude:</strong> {data.location.lat}
                </div>
                <div>
                  <strong>Longitude:</strong> {data.location.lon}
                </div>
                {showMessage && <p className="copy-message">Copied!</p>}
              </div>
              <div className='lastUpdate'> 
                <strong>Last Update: {data.current.last_updated}</strong>
              </div>
            </div>

            <div className='extraInfo'>
              <div className='moon'>
                <strong className='titlePhase'>Moon Phase:</strong> 
                <div className="moonImg" style={{ '--moon-rotation-angle': `${astroInfo?.moon?.declination}deg` }}>
                  {getMoonPhaseIcon(astroInfo.moon.illumination.phaseName)}
                </div>
                <p className='phaseName'>{astroInfo?.moon?.illumination?.phaseName}</p>
              </div>
              <div>
                <strong>Sunrise:</strong> {sunInfo?.sun?.rise.split('T')[0]}
              </div>
              <div>
                <strong>Sunset:</strong> {sunInfo?.sun?.set.split('T')[0]}
              </div>
            </div>


          </div>
        )}
        <CloseButton className='closeButton' onClick={() => {
          close();
          console.log("closed : ", showCurrentWeather);
        }}>
          <span className="material-symbols-outlined">close</span>
        </CloseButton>

      </div>
    ) : null
  );
  
};

export default CurrentWeather;









