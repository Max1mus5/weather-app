import React, { useState, useEffect, useRef } from 'react';
import './CurrentWeather.css';
import axios from 'axios';

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
  const [isOpen, setIsOpen] = useState(true); // Estado para controlar si el componente está abierto

  const componentRef = useRef(null); // Ref para acceder al componente DOM

  useEffect(() => {
    setLoading(true);
    getAstroInfo();

    // Agregar un manejador de eventos de clic al documento para cerrar el componente cuando se hace clic fuera de él
    const handleClickOutside = (event) => {
      if (componentRef.current && !componentRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
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
      }
    } catch (error) {
      setError('Error al obtener información astronómica');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="current-weather">
      {loading && <p>Loading...</p>}
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
            <strong>Moon Phase:</strong> {astroInfo.moon.illumination.phaseName}
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