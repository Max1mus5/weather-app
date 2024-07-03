import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

// Función para convertir el tiempo en formato "HH:MM:SS" a horas decimales desde la medianoche
const timeToSeconds = (time) => {
  const [hours, minutes, seconds] = time.split(':').map(Number);
  return hours + minutes / 60 + seconds / 3600;
};

const SolarLineChart = ({ data }) => {
  const ref = useRef();

  useEffect(() => {
    const svg = d3.select(ref.current);
    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const width = 400 - margin.left - margin.right;
    const height = 200 - margin.top - margin.bottom;

    // Convertir tiempos a horas decimales y guardar la hora original
    const dataWithSeconds = data.map(d => ({
      ...d,
      timeDecimal: timeToSeconds(d.time),
      originalTime: d.time
    }));

    const xScale = d3.scaleLinear()
      .domain([d3.min(dataWithSeconds, d => d.timeDecimal), d3.max(dataWithSeconds, d => d.timeDecimal)])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(dataWithSeconds, d => d.heightSun)]) // Start from 0 degrees
      .range([height, 0]);

    const lineGenerator = d3.line()
      .x(d => xScale(d.timeDecimal))
      .y(d => yScale(d.heightSun));

    // Limpiar SVG antes de volver a dibujar
    svg.selectAll('*').remove();

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    g.append('path')
      .datum(dataWithSeconds)
      .attr('class', 'line')
      .attr('d', lineGenerator)
      .style('fill', 'none')
      .style('stroke', 'steelblue');

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(xScale));

    g.append('g')
      .call(d3.axisLeft(yScale));

    // Crear tooltip
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#f9f9f9')
      .style('padding', '5px')
      .style('border', '1px solid #d3d3d3')
      .style('border-radius', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0);

    // Crear punto de referencia
    const focus = g.append('g')
      .attr('class', 'focus')
      .style('display', 'none');

    focus.append('circle')
      .attr('r', 4.5);

    // Evento para el mouseover
    svg.on('mousemove', function (event) {
      const [mouseX] = d3.pointer(event);
      const x0 = xScale.invert(mouseX - margin.left);
      const bisect = d3.bisector(d => d.timeDecimal).left;
      const i = bisect(dataWithSeconds, x0, 1);

      // Verificar si i está dentro del rango de datos
      if (i >= dataWithSeconds.length) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Hour: No Data<br>Heigth: No Data`)
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`);
        focus.style('display', 'none');
        return;
      }

      const d0 = dataWithSeconds[i - 1];
      const d1 = dataWithSeconds[i];

      // Verificar si d0 o d1 son undefined
      if (!d0 || !d1) {
        tooltip.transition().duration(200).style('opacity', .9);
        tooltip.html(`Hora: Now<br>Altura: No data`)
          .style('left', `${event.pageX + 5}px`)
          .style('top', `${event.pageY - 28}px`);
        focus.style('display', 'none');
        return;
      }

      const d = x0 - d0.timeDecimal > d1.timeDecimal - x0 ? d1 : d0;

      focus.attr('transform', `translate(${xScale(d.timeDecimal)},${yScale(d.heightSun)})`);
      focus.style('display', null);

      tooltip.transition().duration(200).style('opacity', .9);
      tooltip.html(`Hora: ${d.originalTime}<br>Altura: ${d.heightSun.toFixed(2)}`)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`);
    });

    svg.on('mouseout', function () {
      tooltip.transition().duration(500).style('opacity', 0);
      focus.style('display', 'none');
    });

  }, [data]);

  return <svg className='solarLineChart' ref={ref} width="400" height="200"></svg>;
};

export default SolarLineChart;
