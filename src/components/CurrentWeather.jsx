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
  const [error, setError] = useState(null);
  const [showCurrentWeather] = useState(state);
  const [showMessage, setShowMessage] = useState(false);



  
  
  
  

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
        'X-RapidAPI-Key': 'a2e2a99f32mshe71d53f98ecd797p1b14cdjsnc906495e9294',
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
      setError('Error al obtener información astronómica\nIntente nuevamente más tarde');
      /* wait 2 segunds and calls close */
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

  /* copy latitude and longitude on clipboard in the format: "lat , lon"*/
  // ...

/* copy latitude and longitude on clipboard in the format: "lat , lon"*/
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


const subtractHoursAndMinutes = (time, hours, minutes) => {
  const [hh, mm, ss] = time.split(':').map(Number);
  const totalMinutes = hh * 60 + mm - (hours * 60 + minutes);
  const newHH = Math.floor(totalMinutes / 60);
  const newMM = totalMinutes % 60;
  return `${newHH.toString().padStart(2, '0')}:${newMM.toString().padStart(2, '0')}:${ss}`;
};

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
              {location.name}, {location.adm_area1}, {location.country}
            </div>
            <div className='principalInfo'>
              <div className='tempIMG'>
                <div className='imageCondition'>
                  <img src={data.current.condition.icon}/>
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
                  <img src={drop}/> {data.current.humidity}%
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
                <strong className='titlePhase'>Moon Phase:</strong> {getMoonPhaseIcon(astroInfo.moon.illumination.phaseName)}
                <p className='phaseName'>{astroInfo.moon.illumination.phaseName}</p>
              </div>
              <div>
                <strong>Sunrise:</strong> {subtractHoursAndMinutes(astroInfo.sun.rise.split('T')[1], 5, 29)}
              </div>
              <div>
                <strong>Sunset:</strong> {subtractHoursAndMinutes(astroInfo.sun.set.split('T')[1], 5, 21)}
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









