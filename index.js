const express = require('express')
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const { cajeros } = require('./data.json');
const axios = require('axios')
var request = require( 'request' );
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
const btoa = require("btoa");
const wml_credentials = new Map();

const googleInstance = axios.create({
  baseURL: 'https://maps.googleapis.com/maps/api/directions/json'
})
let token = '';

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



function apiPost(scoring_url, token, mlInstanceID, payload, loadCallback, errorCallback){
	const oReq = new XMLHttpRequest();
	oReq.addEventListener("load", loadCallback);
	oReq.addEventListener("error", errorCallback);
	oReq.open("POST", scoring_url);
	oReq.setRequestHeader("Accept", "application/json");
	oReq.setRequestHeader("Authorization", token);
	oReq.setRequestHeader("ML-Instance-ID", mlInstanceID);
	oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	oReq.send(payload);
}


app.get('/modeloML', async function (req, res, next) {
  try {
    const wmlToken = "Bearer " + token
    const mlInstanceId = 'de642664-1a14-4124-91d6-d7f894e8c6e3';
    // NOTE: manually define and pass the array(s) of values to be scored in the next line
    const payload = '{"input_data": [{"fields": ["ATM", "Dia", "Hora", "Cant. 50.000", "Cant. 20.000", "Cant. 10.000"],'+
    ' "values":[[1,3,9,50,50,50]]}]}'; // Aqui se insertan los valores
    const scoring_url = "https://us-south.ml.cloud.ibm.com/v4/deployments/ee242229-9b06-4356-a695-cedbab3a81fc/predictions";
    
    apiPost(scoring_url, wmlToken, mlInstanceId, payload, function (resp) {
      let parsedPostResponse;
      try {
        parsedPostResponse = JSON.parse(this.responseText);
      } catch (ex) {
        // TODO: handle parsing exception
      }
      console.log("Scoring response");
      console.log(parsedPostResponse);
      res.status(200).json(parsedPostResponse);
    }, function (error) {
      console.log(error);
    });

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

var apikey = "rIzGkXFDe-xgrvKsX0hoonZ06XY7LV2PrQH1MWLWqLE4";
var IBM_Cloud_IAM_uid = "bx";
var IBM_Cloud_IAM_pwd = "bx";

var options = { url     : "https://iam.bluemix.net/oidc/token",
                headers : { "Content-Type"  : "application/x-www-form-urlencoded",
                            "Authorization" : "Basic " + btoa( IBM_Cloud_IAM_uid + ":" + IBM_Cloud_IAM_pwd ) },
                body    : "apikey=" + apikey + "&grant_type=urn:ibm:params:oauth:grant-type:apikey" };

request.post( options, function( error, response, body )
{
    var iam_token = JSON.parse( body )["access_token"];
    token = iam_token;
    //console.log(iam_token)
} );

  console.log('Servidor Funcionando');
});
