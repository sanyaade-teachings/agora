/**
 * Agora - Close the loop
 * © 2021-2024 Brian Gormanly
 * BSD 3-Clause License
 * see included LICENSE or https://opensource.org/licenses/BSD-3-Clause 
 * 
 * Description: Decision Engine for dynamic input. This file deals with what should be
 * happening every so often such as paper references, tone analysis, and
 * paper structure
 * 
 * Authors: Christian Sarmiento, Luke Pecovic
 * 
 * Date Created: 7/8/2024
 * 
 * Last Updated: 7/24/2024
 */

// Imports
import { makeAPICall } from "./agnesAI.js"

// Card visibility
const toneCardsContainer = document.querySelector( '.tone-cards' );
const loadingSpinnerContainer = document.getElementById( 'loadingSpinnerContainer' );
const toneAnalysisContainer = document.getElementById( 'tone-analysis-cont' );

// Variables
const minWordsRef = 50  // arbitrary value for paper references, can be changed
const minWordsTone = 150  // arbitrary value for parsed tone analysis

/**
 * Main function that directs input to different events such as paper references
 * and tone analysis
 * 
 * @param {*} resource current resource to send content to AI API
 */
async function getDecisionEngine( resource ) {

    // Variables
    let apiCalled = false;

    if ( resource ) {

        let resourceID = resource.resourceId
        let parsedResourceText = extractText(resource.resourceContentHtml);
        let resourceTextLength = parsedResourceText.length;

        // Paper References
        if ( resourceTextLength >= minWordsRef ) {

            await makeAPICall();
            apiCalled = true;

        } // if

        // TODO: card output incase there aren't enough words

        // Tone Analysis
        if ( apiCalled ) {

            setInterval(getToneAnalysis(parsedResourceText, resourceID), 
                        120000); // every 2 minutes

        } // if

    } // if

    // TODO: card output incase there is an error with the resource

}  // getDecisionEngine()

// getDecisionEngine

/**
 * Function that deals with the tone analysis component of the decision engine.
 * 
 * @param {*} resourceText text within the resource to be passed to API
 */
async function getToneAnalysis( resourceText, id ) {

    // Variables
    let paragraphs = []
    let i = 0;

    // Parsed text tone analysis
    if ( resourceText.length > minWordsTone ) {

        // Full text tone analysis
        callToneAnalysisAPI(resourceText, id);

        // Paragraph tone analysis
        paragraphs = parseText(resourceText);
        console.log("Paragraph length: " + paragraphs.length);
        if ( paragraphs.length > 1 )
            for (i; i < paragraphs.length; i++) 
                callToneAnalysisAPI(paragraphs[i], id);

    } // if

    // TODO: card output incase there aren't enough words

} // getToneAnalysis()

/**
 * Takes in whole reosurce text and breaks it down into paragraphs for 
 * tone analysis of each paragraph.
 * @param {*} text Text from resource to be parsed.
 * @returns Returns a list of different text blocks to pass along to the API
 */
function parseText(text) {

    // Split the text by two or more consecutive line breaks to get paragraphs
    let paragraphs = []
    paragraphs = text.split(/\n\s*\n/);
    
    // Trim leading and trailing whitespace from each paragraph
    paragraphs = paragraphs.map(paragraph => paragraph.trim());

    // Filter out empty entries
    paragraphs = paragraphs.filter(paragraph => paragraph.length > 0);

    return paragraphs;

} // parseText()

/**
 * Function similar to makeAPICall() that calls the endpoint for tone analysis
 * @param {*} text raw text from resource to be given to tone analysis
 */
async function callToneAnalysisAPI( text, identifier ) {

    // Variables
    loadingSpinnerContainer.hidden = false;
    toneAnalysisContainer.hidden = true;
    let requestData = {
        resourceId: identifier,
        resourceText: text
    }

    // API call
    try {

        // Make fetch call to "aiController.js" API
        const response = await fetch( 'api/v1/auth/ai/tone-analysis', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',},
            body: JSON.stringify(requestData)
        });
        console.log('attempted fetch');

        // Card visibily
        toneCardsContainer.innerHTML = ""; // Clear the current cards.
        selectedContent.classList.remove( 'hidden' );

        if ( response.ok ) {
            console.log('fetch successful');

            // logic to deal with API response
            let toneAnalysisKeywords = await response.json();
            formatToneOutput(toneAnalysisKeywords.keywords, text);
            
            // Visibility
            loadingSpinnerContainer.hidden = true;
            toneAnalysisContainer.hidden = false;

        } // if
        else {
            console.log('fetch not successful');

            // Card visibility
            selectedContent.classList.remove( 'hidden' );
            loadingSpinnerContainer.hidden = true;
            toneAnalysisContainer.hidden = false;
            
            // Error
            let responseJSON = await response.json();

            // Create card element
            const toneCard = document.createElement( 'div' );
            toneCard.classList.add('tone-card');

            // Card template
            toneCard.innerHTML = `
                <div>
                    <h2>Tone Analysis</h2>
                    <div class="tone-text-center">
                        <span class="tone-card-text">There was an error: ${responseJSON.error}.</span>
                    </div>
                </div>
            `;

            // Append the card to the container
            toneCardsContainer.appendChild(toneCard);

        } // else

    } // try
    catch ( error ) {

        // Handle network or other errors here
        loadingSpinnerContainer.hidden = true;
        toneAnalysisContainer.hidden = false;
        console.error( 'Fetch request failed: - Network or other errors', error );
    
    } // catch

} // callToneAnalysisAPI()

// Helper Functions

/**
 * Function that takes raw HTML to get the raw text within
 * 
 * @param {*} htmlString raw HTML from resource
 * @returns raw text from resource
 */
function extractText( htmlString ) {
    // Replace <br> and <br /> with \n
    htmlString = htmlString.replace(/<br\s*\/?>/gi, '\n');

    // Replace <p> with \n\n
    htmlString = htmlString.replace(/<p>/gi, '\n\n');

    // Remove all other HTML tags
    htmlString = htmlString.replace(/<\/?[^>]+(>|$)/g, "");

    // Remove specific inline styles
    htmlString = htmlString.replace(/style="[^"]*"/gi, "");

    // Optional: Clean up extra whitespaces/newlines
    //htmlString = htmlString.replace( /\n\s*\n/g, '\n\n' ); // Remove extra newlines

    return htmlString;

} // extractText()

/**
 * Helper function that formats the HTML for the tone analysis card.
 * @param {*} keywords generated tone analysis keywords.
 * @param {*} originalText text that comes from the text editor.
 */
function formatToneOutput( keywords, originalText ) {

    // Create card element
    const toneCard = document.createElement( 'div' );
    toneCard.classList.add('tone-card');

    // Card template
    toneCard.innerHTML = `
        <div>
            <!-- Text Content -->
            <div class="tone-analyzed-text-cont">
                <span class="tone-analyzed-text"></span>
            </div>
            <div class="tone-text-center">
                <span class="tone-card-text"></span>
            </div>

            <!-- Info Bubble -->
            <div class="info-bubble">
                <img src="/assets/img/buttons/info-bubble.png" class="info-bubble-image">
                <div class="tone-tooltip">
                    <span class="tone-analysis-explanation"></span>
                </div>
            </div>

        </div>
    `;

    // Give snippet of original text
    let content = '"' + originalText.substring(0, 39) + '..."';
    const cardOriginalText = toneCard.querySelector('.tone-analyzed-text');
    cardOriginalText.textContent = content;

    // Give the card the keywords
    const cardKeywords = toneCard.querySelector('.tone-card-text');
    cardKeywords.textContent = keywords;

    /*
    TODO: waiting on tone analysis explanation to be developed;
    once that is done, add "explanation" as a parameter to the function

    // Give the explanation to the tooltip
    const cardExplanation = toneCard.querySelector('.tone-analysis-explanation');
    cardExplanation.textContent = explanation;
    */
    // Add card to main container
    toneCardsContainer.appendChild( toneCard );

} // formatToneOutput()

// Exports
export { getDecisionEngine }

