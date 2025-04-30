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
      // Manejar diferentes formatos de hora posibles
      let timeParts = localHour?.split(':');
      
      // Validar el formato de la hora
      if (!timeParts || timeParts.length < 2) {
        console.error("localHour no tiene el formato esperado:", localHour);
        return; // Salir si el formato no es válido
      }

      // Convertir a enteros
      let hours = parseInt(timeParts[0], 10);
      setLocalHourHH(hours);
      
      let minutes = parseInt(timeParts[1], 10);
      setLocalHourMM(minutes);
      
      // Si no hay segundos, asumimos 0
      let seconds = timeParts.length >= 3 ? parseInt(timeParts[2], 10) : 0;
  
      // Incrementar segundos
      seconds++;
  
      // Si los segundos llegan a 60, reiniciar a 0 e incrementar minutos
      if (seconds >= 60) {
        minutes++;
        seconds = 0;
      }
  
      // Si los minutos llegan a 60, reiniciar a 0 e incrementar horas
      if (minutes >= 60) {
        hours++;
        minutes = 0;
      }

      // Si las horas llegan a 24, reiniciar a 0
      if (hours >= 24) {
        hours = 0;
      }
  
      // Reconstruir la cadena de hora con formato HH:MM:SS
      let newTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      // Establecer la nueva hora
      setLocalHour(newTime);     
    }, 1000);
  
    return () => clearInterval(interval); // Limpiar el intervalo al desmontar el componente
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
      // PRIMERA OPCIÓN: AbstractAPI
      // Extract location from timezone (e.g., "America/Bogota" -> "Bogota, Colombia")
      const location = timeZone.split('/').pop().replace('_', ' ');
      
      // Usar AbstractAPI como fuente principal
      const abstractApiUrl = `https://timezone.abstractapi.com/v1/current_time/?api_key=6a313bc4cdd44339a3975bf6bdc4e289&location=${location}`;
      
      const abstractResponse = await fetch(abstractApiUrl);
      const abstractData = await abstractResponse.json();
      
      // Verificar si la respuesta es válida
      if (abstractData && abstractData.datetime) {
        console.log('Using AbstractAPI time data:', abstractData);
        
        // Extraer la hora del formato "2025-04-30 16:33:09"
        const timeParts = abstractData.datetime.split(' ')[1].split(':');
        const timeString = timeParts.join(':');
        
        setLocalHour(timeString);
        
        // Usar el offset GMT directamente proporcionado por la API
        setOffsetUTC(abstractData.gmt_offset);
        
        return; // Salir de la función si la primera API funciona
      }
      
      throw new Error('AbstractAPI response invalid or missing data');
      
    } catch (firstApiError) {
      console.error('Error fetching time from AbstractAPI:', firstApiError);
      
      try {
        // SEGUNDA OPCIÓN: ApiVerve como respaldo
        console.log('Falling back to ApiVerve...');
        const city = timeZone.split('/').pop();
        
        const response = await fetch(`https://api.apiverve.com/v1/worldtime?city=${city}`, {
          headers: {
            'x-api-key': 'b904b5b8-ecc5-4bfc-adf5-3511279dbeef',
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        const responseData = await response.json();
        
        if (responseData.status === 'ok' && responseData.data && responseData.data.foundCities && responseData.data.foundCities.length > 0) {
          console.log('Using ApiVerve time data:', responseData);
          
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
          const offsetStr = data.dst_name;
          let offset;
          
          if (offsetStr.startsWith('-') || offsetStr.startsWith('+')) {
            // If it's a direct offset like "-03"
            offset = parseInt(offsetStr);
          } else {
            // For named timezones like "PDT" (UTC-7), "EST" (UTC-5), etc.
            const timezoneMap = {
              'PDT': -7, 'PST': -8, 'EDT': -4, 'EST': -5, 'CDT': -5, 'CST': -6, 
              'MDT': -6, 'MST': -7, 'AKDT': -8, 'AKST': -9, 'HDT': -9, 'HST': -10,
              'BST': 1, 'GMT': 0, 'CET': 1, 'CEST': 2, 'EET': 2, 'EEST': 3
            };
            offset = timezoneMap[offsetStr] || 0;
          }
          
          setOffsetUTC(offset);
          return; // Salir si la segunda API funciona
        }
        
        throw new Error('ApiVerve response invalid or missing data');
        
      } catch (secondApiError) {
        console.error('Error fetching time from ApiVerve:', secondApiError);
        
        // TERCERA OPCIÓN: Hora local como último respaldo
        console.log('Falling back to local browser time...');
        
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
        setError('Using local time as fallback');
      }
    }
  };

  const calcularHoraSolarLocal = (timelocalHour, longitude, offsetUTC) => {
    // Validar que tenemos todos los datos necesarios
    if (timelocalHour === undefined || longitude === undefined || offsetUTC === undefined) {
      console.warn('Datos insuficientes para calcular la hora solar local:', {
        timelocalHour, longitude, offsetUTC
      });
      return 12; // Valor por defecto (mediodía)
    }
    
    try {
      // Convertir a números y calcular
      const hourValue = parseFloat(timelocalHour);
      const longitudeValue = parseFloat(longitude);
      const offsetValue = parseFloat(offsetUTC);
      
      return hourValue + (longitudeValue / 15) - offsetValue;
    } catch (error) {
      console.error('Error al calcular la hora solar local:', error);
      return 12; // Valor por defecto en caso de error
    }
  }

  const calcularAlturaSolar = (localSolarHour) => {
    // Validar que tenemos todos los datos necesarios
    if (latitude === undefined || declination === undefined || localSolarHour === undefined) {
      console.warn('Datos insuficientes para calcular la altura solar:', {
        latitude, declination, localSolarHour
      });
      return 0; // Valor por defecto
    }
    
    try {
      const latitudRad = latitude * (Math.PI / 180);
      const declinacionRad = declination * (Math.PI / 180);
      const anguloHorario = 15 * (localSolarHour - 12);
      const anguloHorarioRad = anguloHorario * (Math.PI / 180);
      
      const sinAltitud = (Math.sin(latitudRad) * Math.sin(declinacionRad) +
                          Math.cos(latitudRad) * Math.cos(declinacionRad) * Math.cos(anguloHorarioRad));
      
      // Asegurar que el valor está dentro del rango válido para asin (-1 a 1)
      const sinAltitudClamped = Math.max(-1, Math.min(1, sinAltitud));
      
      const altitudResult = Math.asin(sinAltitudClamped) * (180 / Math.PI);
      
      setAltitude(altitudResult);
      return altitudResult;
    } catch (error) {
      console.error('Error al calcular la altura solar:', error);
      return 0; // Valor por defecto en caso de error
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const horaSolarLocalCalculada = calcularHoraSolarLocal(localHour, longitude, offsetUTC);
    calcularAlturaSolar(horaSolarLocalCalculada);
  }

  const splitHour = (hour) => { // Split the hour in parts
    if (!hour) return null;
    
    const parts = hour.split(':');
    // Asegurar que siempre devolvemos un array con 3 elementos (horas, minutos, segundos)
    if (parts.length === 2) {
      // Si solo tenemos HH:MM, añadir segundos
      parts.push('00');
    } else if (parts.length !== 3) {
      console.error('Formato de hora inválido:', hour);
      return null;
    }
    
    return parts;
  }

  //decrement 1H hour
  const decrementHour = (hour) => {
    const timeParts = splitHour(hour);
    if (!timeParts) return hour; // Si no podemos procesar, devolver la hora original
    
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);

    hours--;

    if (hours < 0) {
      hours = 23;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  //decrement 1min hour
  const decrementMin = (hour) => {
    const timeParts = splitHour(hour);
    if (!timeParts) return hour; // Si no podemos procesar, devolver la hora original
    
    let hours = parseInt(timeParts[0], 10);
    let minutes = parseInt(timeParts[1], 10);
    let seconds = parseInt(timeParts[2], 10);

    minutes--;

    if (minutes < 0) {
      minutes = 59;
      hours--;
      if (hours < 0) {
        hours = 23;
      }
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const generateChartData = (localHourHH, localHourMM) => {
    // Validar que tenemos todos los datos necesarios
    if (localHourHH === undefined || localHourMM === undefined || 
        sunRiseHourHH === undefined || !localHour || !offsetUTC) {
      console.warn('Datos insuficientes para generar el gráfico:', {
        localHourHH, localHourMM, sunRiseHourHH, localHour, offsetUTC
      });
      return [];
    }
    
    const data = [];
    let currentHour = localHour;
    let tempLocalHourHH = localHourHH;
    let tempLocalHourMM = localHourMM;
    
    // Limitar el número de iteraciones para evitar bucles infinitos
    const maxIterations = 24 * 60; // 24 horas * 60 minutos
    let iterations = 0;
    
    while (tempLocalHourHH >= sunRiseHourHH && iterations < maxIterations) {
      while(tempLocalHourMM >= 0 && iterations < maxIterations){
        const timelocalHour = tempLocalHourHH + tempLocalHourMM / 60;
        const localSolarHour = calcularHoraSolarLocal(timelocalHour, longitude, offsetUTC);
        const heightSun = calcularAlturaSolar(localSolarHour);
        
        if(heightSun > 0 || tempLocalHourHH === sunRiseHourHH || tempLocalHourHH === sunSetHourHH){
          data.push({ time: currentHour, heightSun: heightSun });
        }
        
        currentHour = decrementMin(currentHour);
        tempLocalHourMM--;
        iterations++;
      }
      
      if (tempLocalHourMM < 0) {
        tempLocalHourMM = 59;
      }
      
      if(tempLocalHourHH < 0){
        tempLocalHourHH = 23;
      }
      
      currentHour = decrementHour(currentHour);
      tempLocalHourHH--;
      iterations++;
    }
    
    if (iterations >= maxIterations) {
      console.warn('Se alcanzó el límite máximo de iteraciones al generar datos del gráfico');
    }
    
    // Retornar el array invertido
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
