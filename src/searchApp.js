const axios = require("axios");
const querystring = require("querystring");
const { TeamsActivityHandler, CardFactory } = require("botbuilder");
const ACData = require("adaptivecards-templating");
const rickVerso = require("./adaptiveCards/rickVerso.json");

class SearchApp extends TeamsActivityHandler {
  constructor() {
    super();
  }

  // Message extension Code
  // Search.
  async handleTeamsMessagingExtensionQuery(context, query) {
    // get the search query
    //there is a single search parameter (query.parameters[0]) being accessed and used as the search query
    const searchQuery = query.parameters[0].value.toLowerCase();
    // execute search logic
    
      // Ejecutar la consulta en PokeAPI
      const response = await axios.get(`https://rickandmortyapi.com/api/character/?name=${searchQuery}`);

      

      // Filtrar los resultados según el término de búsqueda
      const characterDetails = response.data.results[0];
      console.log("characterDetails es : ",characterDetails)

      if (!characterDetails) {
        throw new Error("No se encontró ningún personaje con ese nombre.");
      }

      // Crear una tarjeta de héroe con la información básica del Pokémon
  const preview = CardFactory.heroCard(
    characterDetails.name.toUpperCase(),
    `status: ${characterDetails.status} | Gender: ${characterDetails.gender}`,
    [`https://rickandmortyapi.com/api/character/avatar/${characterDetails.id}.jpeg`]
  );
  
    // Configurar el tap para abrir los detalles del personaje
    preview.content.tap = {
      type: "invoke",
      value: {
        id: characterDetails.id,
        name: characterDetails.name,
        status: characterDetails.status,
        gender: characterDetails.gender,
        species: characterDetails.species
      }
    };

    // Crear el attachment con la heroCard
    const attachment = { ...preview };

    // Devolver los resultados usando heroCard
    return {
      composeExtension: {
        type: "result",
        attachmentLayout: "list",
        attachments: [attachment],
      },
    };
  }
}

module.exports.SearchApp = SearchApp;