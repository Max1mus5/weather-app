import React, { useState, useEffect } from 'react';
import './CurrentWeather.css';
import axios from 'axios';
import SolarH from './SolarH.jsx';
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

  const [dataLocation, setDataLocation]= useState(data);
  const [astroInfoFix, setAstroInfoFix] = useState(null);
  const [loading, setLoading] = useState(false);
  const [astroInfo, setAstroInfo] = useState(null);
  const [sunInfo, setSunInfo] = useState(null); 
  const [error, setError] = useState(null);
  const [showCurrentWeather] = useState(state);
  const [showMessage, setShowMessage] = useState(false);
  const [openGoogleMaps, setOpenGoogleMaps] = useState(false);
 

  // Función para restablecer todos los estados a sus valores iniciales
  const resetStates = () => {
    setDataLocation(data);
    setAstroInfoFix(null);
    setLoading(false);
    setAstroInfo(null);
    setSunInfo(null);
    setError(null);
    setShowMessage(false);
    setOpenGoogleMaps(false);
  };

  // Uso de useEffect para restablecer estados cuando el componente se desmonte
  useEffect(() => {
    return () => {
      resetStates();
    };
  }, []); // Dependencias vacías indican que este efecto se ejecuta solo una vez


  const openGoogleMapsWindow = (lat, lon) => {
    const url = `https://www.google.com/maps?q=${lat},${lon}`;
    window.open(url, '_blank');
  };
  

  const handleOpenGoogleMaps = () => {
    setOpenGoogleMaps(true);
    openGoogleMapsWindow(data.location.lat, data.location.lon);
  };
  


  useEffect(() => {
    setLoading(true);
    getAstroInfo();
    // eslint-disable-next-line
  }, []);

  // Fix astroInfo to avoid null values
  useEffect(() => {
    const timer = setTimeout(() => {
      setAstroInfoFix(astroInfo);
    }, 100);
    return () => clearTimeout(timer);

  }, [astroInfo]);

  useEffect(() => {
    if (sunInfo) {
    }
  }, [sunInfo]);

  /* get astro info from Meteosource */
  const getAstroInfo = async () => {
    let astroLat = data.location.lat;
    let astroLon = data.location.lon;
    let localtime = data.location.localtime;
    //console.log("getastroinfo: ", astroLat, astroLon, localtime);
  
    const astroOptions = {
      method: 'POST',
      url: 'https://wyjyt-geo-calculate.p.rapidapi.com/Sky',
      headers: {
        'content-type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,//ligoleyen
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
        
        //console.log("ASTROINFO: ", astroResponse.data);
        
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
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,//ligoleyen
            'X-RapidAPI-Host': 'ai-weather-by-meteosource.p.rapidapi.com'
          }
        };
  
        const sunResponse = await axios.request(sunOptions);
        if (sunResponse.data) {
          setSunInfo(sunResponse.data.astro.data[0]);
         /*  console.log("Sun Info: ", sunInfo); */

        }
      
    } catch (error) {
      setError('Error getting astronomical Info, Try Again Later');
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
      console.error('Error On Copy ', error);
    });
}

  




  return (
    showCurrentWeather ? (
      <div className="current-weather">
       <div className="headerCurrentWeather">
       <div>
        <img src={earthImage} alt="earth" className='earth-image move' onClick={handleOpenGoogleMaps} />

        </div>
        <CloseButton className='closeButton' onClick={() => {
          close();
/*           console.log("closed   ", showCurrentWeather);
 */        }}>
          <svg width="80px" height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M14.5 9.50002L9.5 14.5M9.49998 9.5L14.5 14.5" stroke="#f7f7f7" stroke-width="1.5" stroke-linecap="round"></path> <path d="M7 3.33782C8.47087 2.48697 10.1786 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 10.1786 2.48697 8.47087 3.33782 7" stroke="#f7f7f7" stroke-width="1.5" stroke-linecap="round"></path> </g></svg>
        </CloseButton>
       </div>
        {loading && (
          <div>
            <img src={loadingIcon} alt="Loading" className='loading-image loadimage'/>
          </div>
        )}
        {error && <p>{error}</p>}
        {astroInfo && (
          <div className="weather-details">
              <div className='principalInfo'>
              <div className='ubicationCITY'>
              <p>{location.name}, {location.adm_area1}, {location.country}</p>
              </div>
                <div className='tempIMG'>
                  <div className='imageCondition'>
                    <img className='imageConditionIMG' alt='icon of climate' src={data.current.condition.icon}/>
                    <p className='textCondition'>{data.current.condition.text}</p>
                  </div>  
                  <div className='Temperature'>
                    {temperature}°C
                  </div>
                </div>
                <div className='complementInfo'>
                  <div className='complementElement'>
                    <h3>Uv</h3>
                    {data.current.uv}
                  </div>
                  <div className='drop'>
                    <img alt='drop of water' src={drop}/> {data.current.humidity}%
                  </div>
                  <div className='complementElement'>
                    <h3>Cloud</h3>
                    {data.current.cloud}%
                  </div>
                  <div className='complementElement'>
                    <h3>Feels Like</h3>
                    {data.current.feelslike_c}°C
                  </div>
                  <div className='complementElement'>
                    <h3>Gust</h3>
                    {data.current.gust_kph} kph
                  </div>
                  <div className='complementElement'>
                    <h3>Pressure</h3>
                    {data.current.pressure_in} in
                  </div>
                  <div className='complementElement'>
                    <h3>Wind</h3>
                    {data.current.wind_kph} kph {data.current.wind_dir}
                  </div>
                  <div className='complementElement'>
                    <h3>Visibility</h3>
                    {data.current.vis_km} km
                  </div>
                  <div className='complementElement'>
                    <h3>Precipitation</h3>
                    {data.current.precip_mm} mm
                  </div>
                </div>
                <div className='coordinatesDiv'>
                  <div className='latitudelongitude' onClick={copyCoordinates}>
                    <div>
                      <strong>Latitude </strong> {data.location.lat}
                    </div>
                    <div>
                      <strong>Longitude </strong> {data.location.lon}
                    </div>
                  </div>
                  {showMessage && <p className="copy-message">Copied!</p>}
                </div>
                <div className='lastUpdate'> 
                  <strong>Last Update </strong> <i>{data.current.last_updated}</i>
                </div>
              </div>
              <div className='extraInfo'>
                <div className='moon'>
                  <div className='monnPhase'>
                  <strong className='titlePhase'>Moon Phase </strong> 
                  <p className='phaseName'> {astroInfo?.moon?.illumination?.phaseName}</p>
                  </div>
                  <div className="moonImg" style={{ '--moon-rotation-angle': `${astroInfo?.moon?.declination}deg` }}>
                    {getMoonPhaseIcon(astroInfo.moon.illumination.phaseName)}
                  </div>
                 
                </div>
                 <SolarH dataLocation={dataLocation} astroInfo={astroInfoFix} sunInfo={sunInfo} className="SolarH" />
                <div className='sunInfoCurrentWeather'>
                  <div>
                    <strong>Sunrise </strong> {sunInfo?.sun?.rise.split('T')[1]}
                  </div>
                  <div>
                    <strong>Sunset </strong> {sunInfo?.sun?.set.split('T')[1]}
                  </div>
                </div>
              </div>
          </div>
        )}
        {openGoogleMaps && openGoogleMapsWindow(data.location.lat, data.location.lon)}

      </div>
    ) : null
  );
  
};

export default CurrentWeather;









