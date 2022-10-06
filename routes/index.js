var express = require('express');
var router = express.Router();
// const axios = require('axios');
// const dotenv = require('dotenv').config();

// let token = process.env.STRAPI_BEARER;

// const config = {
//   headers: { Authorization: `Bearer ${token}` }
// };

// const buildings = require('../models/building')

/* GET home page. */
router.get('/', function(req, res, next) {

//   axios.get(`https://tcd-sense-map-back-zssh2.ondigitalocean.app/api/welcome-text`, config)
//     .then(function (response) {

//       let B = response.data.data.attributes;
//       // console.log(response.data.data.attributes);
//       // console.log(response.data);

//       var welcome = {
//         "Heading": B.Heading || "Welcome",
//         "MainContent": B.MainContent || "TCD Sense - The Trinity Sensory Processing Project - aims to make Trinity more inclusive by reviewing and improving new and existing spaces, building sensory awareness and delivering specialist supports to students who experience barriers to managing and adapting the sensory environments of college.",
//         "CloseButtonText": B.CloseButtonText || "Close!",
//         "ExternalButton": {
//           "Exists": B.ExternalButton || false,
//           "link": B.Link || "https://www.tcd.ie/disability/services/tcdsense.php",
//           "Text": B.LinkText || "About TCDSense"
//         }
//       }

      res.render('index');
//     }
//   );
});


module.exports = router;
