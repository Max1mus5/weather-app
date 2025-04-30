import React, { useRef, useState, useEffect } from 'react';
import SolarLineChart from './SolarLineChart.jsx';
import "./SolarH.css";

const SolarH = ({ dataLocation, astroInfo, sunInfo }) => {
  const [chartData, setChartData] = useState([]);
  const [sunRise, setSunRise] = useState(null);
  const [sunSet, setSunSet] = useState(null);
  const [latitude] = useState(dataLocation.location.lat);
  const [longitude] = useState(dataLocation.location.lon);
  const [tzIdentifier] = useState(dataLocation.location.tz_id);
  const [localHour, setLocalHour] = useState();
  const [sunRiseHourHH, setSunRiseHourHH] = useState();
  const [sunSetHourHH, setSunSetHourHH] = useState();
  const [localHourHH, setLocalHourHH] = useState();
  const [localHourMM, setLocalHourMM] = useState();
  const [offsetUTC, setOffsetUTC] = useState();
  const [altitude, setAltitude] = useState();
  const [error, setError] = useState('');
  const [declination, setDeclination] = useState(null);
  useEffect(() => {
    const interval = setInterval(() => {
      // Format from new API: "HH:MM:SS"
      let timeParts = localHour?.split(':');
      if (!timeParts || timeParts.length < 3) {
        console.error("localHour no tiene el formato esperado");
        return; //Exit if timeParts is empty or doesn't have enough parts
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

      if (hours >= 24){
        hours = 0;
      }
  
      // Reconstructs The string to the updated hour
      let newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      // Set the new Hour
      setLocalHour(newTime);     
    }, 1000);
  
    return () => clearInterval(interval); // Clean up the interval on component unmount
  }, [localHour]);

   useEffect(() => {
    if (sunInfo) {
      setSunRise(sunInfo.sun.rise.split('T')[1]);
      setSunSet(sunInfo.sun.set.split('T')[1]);
    }
  }, [sunInfo]);

  useEffect(() => {
    if (sunRise) {
      const sunRiseHourParts = sunRise.split(':');
      const sunRiseHourHH = parseInt(sunRiseHourParts[0], 10);
      const sunSetHourParts = sunSet.split(':');
      const sunSetHourHH = parseInt(sunSetHourParts[0], 10);
      setSunRiseHourHH(sunRiseHourHH);
      setSunSetHourHH(sunSetHourHH);
    }
  }, [sunRise]);

  useEffect(() => {
      const newData = generateChartData(localHourHH, localHourMM);
      setChartData(newData);
    
  }, [sunRiseHourHH, localHourHH, localHourMM]); 

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
      // Extract city from timezone (e.g., "America/Bogota" -> "Bogota")
      const city = timeZone.split('/').pop();
      
      // Using axios which is already in the project dependencies
      const response = await fetch(`https://api.apiverve.com/v1/worldtime?city=${city}`, {
        headers: {
          'x-api-key': 'b904b5b8-ecc5-4bfc-adf5-3511279dbeef',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      const responseData = await response.json();
      
      if (responseData.status !== 'ok' || !responseData.data || !responseData.data.foundCities || responseData.data.foundCities.length === 0) {
        throw new Error('No time data found for this city');
      }
      
      // Use the first city in the response
      const data = responseData.data.foundCities[0];
      
      // Format the time to match the expected format (HH:MM:SS)
      // Ensure we have seconds in the time format
      if (data.time24.split(':').length === 2) {
        // If time24 is in format HH:MM, add seconds
        setLocalHour(`${data.time24}:00`);
      } else {
        setLocalHour(data.time24);
      }
      
      // Extract UTC offset from timezone info
      // The API returns the offset in a different format, so we need to parse it
      // DST name like "-03" or "PDT" contains the offset information
      const offsetStr = data.dst_name;
      let offset;
      
      if (offsetStr.startsWith('-') || offsetStr.startsWith('+')) {
        // If it's a direct offset like "-03"
        offset = parseInt(offsetStr);
      } else {
        // For named timezones like "PDT" (UTC-7), "EST" (UTC-5), etc.
        // We need to map these to their UTC offsets
        const timezoneMap = {
          'PDT': -7, 'PST': -8, 'EDT': -4, 'EST': -5, 'CDT': -5, 'CST': -6, 
          'MDT': -6, 'MST': -7, 'AKDT': -8, 'AKST': -9, 'HDT': -9, 'HST': -10
        };
        offset = timezoneMap[offsetStr] || 0;
      }
      
      setOffsetUTC(offset);
    } catch (err) {
      console.error('Error fetching time data:', err);
      setError('Error getting the timezone information');
      
      // Fallback: Use local browser time as a backup
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      const localTimeString = `${hours}:${minutes}:${seconds}`;
      
      setLocalHour(localTimeString);
      
      // Estimate UTC offset from local browser
      const offsetInHours = -now.getTimezoneOffset() / 60;
      setOffsetUTC(offsetInHours);
      
      console.log('Using fallback local time:', localTimeString, 'with offset:', offsetInHours);
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
    return altitudResult; // Return the solar hour 
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const horaSolarLocalCalculada = calcularHoraSolarLocal(localHour, longitude, offsetUTC);
    calcularAlturaSolar(horaSolarLocalCalculada);
  }

  const splitHour = (hour) => { // Split the hour in parts
    if(hour){
      return hour.split(':');
    }
  }

  //decrement 1H hour
  const decrementHour = (hour) => {
    const timeParts = splitHour(hour);
    if (timeParts) {
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      let seconds = parseInt(timeParts[2], 10);

      hours--;

      if (hours < 0) {
        hours = 23;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  //decrement 1min hour
  const decrementMin = (hour) => {
    const timeParts = splitHour(hour);
    if (timeParts) {
      let hours = parseInt(timeParts[0], 10);
      let minutes = parseInt(timeParts[1], 10);
      let seconds = parseInt(timeParts[2], 10);

      minutes--;

      if (minutes < 0) {
        minutes = 59;
      }

      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  const generateChartData = (localHourHH, localHourMM) => {
    const data = [];
    let currentHour = localHour;
    while (localHourHH >= sunRiseHourHH) {
      while(localHourMM >= 0){
        const timelocalHour = localHourHH + localHourMM / 60;
      const localSolarHour = calcularHoraSolarLocal(timelocalHour, longitude, offsetUTC);
      const heightSun = calcularAlturaSolar(localSolarHour);
      if(heightSun > 0 || localHourHH === sunRiseHourHH || localHourHH === sunSetHourHH){
        data.push({ time: currentHour, heightSun: heightSun });
      }
      currentHour = decrementMin(currentHour);
      localHourMM--;
      }
      if (localHourMM < 0) {
        localHourMM = 59;
      }
      if(localHourHH < 0){
        localHourHH = 23;
      }
      currentHour = decrementHour(currentHour);
      localHourHH--;
    }
    //retornar invertido el array
    return data.reverse();
  };

  

  return (
    <div className='solarGraph'>
      {error && <p>{error}</p>}
      {<form onSubmit={handleSubmit}>
        {/* Formulario... */}
      </form>}
      {altitude!== null && (
        <div className='solarGraphCanvas'>
          <div className='Sun-Hour'>
            <p><b>Local Hour ( {offsetUTC} ) </b> <span>{localHour? localHour : 'Loading...'}</span></p>
            <p className='sunAltitud'><b>Sun Altitude</b> <span>{altitude? altitude?.toFixed(2)+'°' : 'Calculating...'}</span></p>
          </div>
          {/*create the line chart calling SolarlineChart  */}
          {chartData.length > 0 ? <SolarLineChart data={chartData} className="SolarLineChart" /> : <p>The sun is not yet up 😎</p>}
        </div>
        
      )}
    </div>
  );
}

export default SolarH;
