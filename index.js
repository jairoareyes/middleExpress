const express = require('express')
const app = express();
const morgan = require('morgan');
const request = require('request');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const { cajeros } = require('./data');
const axios = require('axios');

const googleInstance = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/directions/json'
})
var precio;

// var speechToText = new SpeechToTextV1({
//   iam_apikey: 'b7xTdYWLIlacoY8qHd5my145W9D9HZPhPRFS7KrBZvDE',
//   url: 'https://stream.watsonplatform.net/speech-to-text/api'
// });

// var task = cron.schedule('*/30 * * * * *', () =>  {
//     console.log(' prueba cada 30 Sec '+
//     new Date().getMinutes() + ":" + new Date().getSeconds()+ " "+precio);
//     precio=precioActual();
//   });

//task.start();


//Middleware
app.use(morgan('dev'))
app.use(cors());

app.get('/health', function (req, res) {
  res.status(200).json({ status: 'OK' });
});

app.get('/recoroutes', async function (req, res, next) {
  try {
    const totalPoints = cajeros.length;
    const origin = cajeros[0];
    const destination = cajeros[totalPoints - 1];
  
    cajeros.slice(0, 1);
    cajeros.splice(totalPoints - 1, 1);
  
    const waypoints = cajeros.reduce((prev, { lat, lng }) => prev + `via:${lat}%,${lng}|`, '');
  
    console.log('waypoints', waypoints);
  
    const { data } = await googleInstance.get('', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: 'AIzaSyB2Cj83JhIz00MNyvTZ7fNmqJs6sgu8OSE'
      }
    })
  
    res.status(200).json(data);
  } catch (error) {
    next(error);
  }
});

app.use(function (req, res, next) {
  next(new Error('404 Not Found. Ruta no encontrada'));
});

app.use((req, res, error) => {
  if (error.message.match(/404/)) return res.status(404).json({ error: error.message })
  res.status(500).json({ error: 'Ops, algo salió mal...' })
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Servidor Funcionando');
});
