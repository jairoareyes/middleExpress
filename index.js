const express = require('express')
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const { cajeros } = require('./data.json');
const distancesFromBodegasToCajeros = require('./findDistances');
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
    const end = cajeros.length - 1;

    let result = [];
    for (let i = 0; i < end; i++) {
      const origin = cajeros[i];
      const destination = cajeros[i+1];
      const { data } = await googleInstance.get('', {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: 'AIzaSyB2Cj83JhIz00MNyvTZ7fNmqJs6sgu8OSE'
        }
      })

      const route = data.routes[0];

      result.push({
        points: route.overview_polyline.points,
        distance: route.legs[0].distance
      });
    }  

    res.status(200).json(result);
    
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
