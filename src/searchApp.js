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
  async handleTeamsMessagingExtensionQuery(context, query) {
    // Get the search query
    const searchQuery = query.parameters[0].value.toLowerCase();

    // Execute search logic
    const response = await axios.get(`https://rickandmortyapi.com/api/character/?${querystring.stringify({
      name: searchQuery
    })}`);
    
    console.log("response es:", response);
    console.log(" *****FIN de response es:");

    // Filter the results
    const characterDetails = response.data.results[0];
    //console.log("characterDetails es:", characterDetails);

    if (!characterDetails) {
      throw new Error("No se encontró ningún personaje con ese nombre.");
    }

    // Create a Hero Card for the preview
    const preview = CardFactory.heroCard(
      characterDetails.name.toUpperCase(),
      `status: ${characterDetails.status} | Gender: ${characterDetails.gender}`,
      [`https://rickandmortyapi.com/api/character/avatar/${characterDetails.id}.jpeg`]
    );

    // Create an Adaptive Card based on the template
    const template = new ACData.Template(rickVerso);
    const card = template.expand({
      $root: {
        id: characterDetails.id,
        name: characterDetails.name,
        status: characterDetails.status,
        gender: characterDetails.gender,
        species: characterDetails.species
      },
    });

    // Combine Hero Card and Adaptive Card in the attachment
    const attachment = { ...CardFactory.adaptiveCard(card), preview };

    // Return the results using the attachment
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
