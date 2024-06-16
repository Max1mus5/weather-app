import React, { useState, useEffect } from 'react';
import "./SolarH.css";

const SolarH = ({ dataLocation, astroInfo }) => {
  const [latitude] = useState(dataLocation.location.lat); 
  const [longitude] = useState(dataLocation.location.lon); 
  const [tzIdentifier] = useState(dataLocation.location.tz_id); 
  const [localHour,setLocalHour] = useState();
  const [localHourHH, setLocalHourHH] = useState();
  const [localHourMM, setLocalHourMM] = useState();
  const [offsetUTC, setOffsetUTC] = useState();
  const [altitude, setAltitude] = useState();
  const [error, setError] = useState('');
  const [declination, setDeclination] = useState(null); 

  useEffect(() => {
    const interval = setInterval(() => {
       // "2024-06-15T15:31:16.395237-05:00"
      let timeParts = localHour?.split(':');
      if (!timeParts) {
        console.error("localHour no tiene el formato esperado");
        return; //Exit if timeParts is empty
      }

      // Converts the string to integers
      let hours = parseInt(timeParts[0], 10);
      setLocalHourHH(parseInt(hours));
      let minutes = parseInt(timeParts[1], 10);
      setLocalHourMM(parseInt(minutes));
      let seconds = parseInt(timeParts[2], 10);
  
      //plus seconds
      seconds++;
  
      // if seconds reach 60, restart 0
      if (seconds >= 60) {
        minutes++;
        seconds = 0; // Reiniciar segundos
      }
  
      // If minutes reach 60, restart hours
      if (minutes >= 60) {
        hours++;
        minutes = 0; // Restart minutes
      }

      if (hours > 24){
        hours= 0;
      }
  
      // Reconstructs The string to the updated hour
      let newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
  
      // Set the new Hour
      setLocalHour(newTime);     
    }, 1000);
  
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [localHour]);
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setDeclination(astroInfo?.sun.declination); //update declination
    }, 500);

    return () => clearTimeout(timer); // Clean Temporizer
  }, [astroInfo?.sun.declination]);
  

  useEffect(() => {
    if (!offsetUTC ||!declination) return;
  
    const timelocalHour = localHourHH + localHourMM / 60;
    const horaSolarLocalCalculada = calcularHoraSolarLocal(timelocalHour, longitude, offsetUTC);
    calcularAlturaSolar(horaSolarLocalCalculada);
  }, [localHour,declination, offsetUTC, longitude]);
  
  useEffect(() => {
    fetchTimeZoneData(tzIdentifier).then(() => {
      // Asumming that offset has been updated
      const timelocalHour = localHourHH + localHourMM / 60;
      const horaSolarLocalCalculada = calcularHoraSolarLocal(timelocalHour, longitude, offsetUTC);
      calcularAlturaSolar(horaSolarLocalCalculada);
    });
  }, [tzIdentifier]);

  const fetchTimeZoneData = async (timeZone) => {
    try {
      const response = await fetch(`http://worldtimeapi.org/api/timezone/${timeZone}`);
      const data = await response.json();
      /* set localHour "datetime": "2024-06-15T15:31:16.395237-05:00" */
      /* setLocalHour(data.datetime.split('T')[1].split('.')[0]); */
      setLocalHour(data?.datetime?.split('T')[1].split('.')[0]);
      setOffsetUTC(parseInt(data.utc_offset));
    } catch (err) {
      setError('Error getting the timezone information');
    }
  };

  const calcularHoraSolarLocal = (timelocalHour, longitude, offsetUTC) => {
    return parseFloat(timelocalHour) + (longitude / 15) - parseFloat(offsetUTC);
  }

  const calcularAlturaSolar = (localSolarHour) => {
    const latitudRad = latitude * (Math.PI / 180);
    const declinacionRad = declination  * (Math.PI / 180);
    const anguloHorario = 15 * (localSolarHour - 12);
    const anguloHorarioRad = anguloHorario * (Math.PI / 180);
    
    const sinAltitud = (Math.sin(latitudRad) * Math.sin(declinacionRad) +
                        Math.cos(latitudRad) * Math.cos(declinacionRad) * Math.cos(anguloHorarioRad));
    
    const altitudResult = Math.asin(sinAltitud) * (180 / Math.PI);
    
    setAltitude(altitudResult);
    return localSolarHour; // Return the solar hour 
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const horaSolarLocalCalculada = calcularHoraSolarLocal(localHour, longitude, offsetUTC);
    calcularAlturaSolar(horaSolarLocalCalculada);
  }

  return (
    <div className='solarGraph'>
      {error && <p>{error}</p>}
      {<form onSubmit={handleSubmit}>
        {/* Formulario... */}
      </form>}
      {altitude!== null && (
        <div className='solarGraphCanvas'>
          <p>Local Hour ( {offsetUTC} ): {localHour? localHour : 'Loading...'}</p>
          <h2 className='sunAltitud'>Sun Altitude: {altitude? altitude?.toFixed(2)+'°' : 'Calculating...'}</h2>
        </div>
      )}
    </div>
  );
}

export default SolarH;
