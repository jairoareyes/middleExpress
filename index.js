const express = require('express')
const app = express();
const morgan = require ('morgan');
const request = require('request');
var cors = require('cors');
const cron = require('node-cron');
var fs = require('fs');

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

app.get('/', function (req, res) { 
    res.writeHead(200, {'Content-Type': 'application/json'});
    contents = "Hola mundo MiddleWare";
    res.end(contents);
  });


app.get('/login', (req, res) => {
    res.end('Aqui va el Login');
});

app.get('/prueba', (req, res1) => {
    precio1=precio;

      res1.json({
        'precio':precio1
    }
  );  
  
});


app.get('*', (req, res) => {
    res.end('Archivo no encontrado :(');
});

app.listen(process.env.PORT || 5000, ()=>{
    console.log('Servidor Funcionando');
});
