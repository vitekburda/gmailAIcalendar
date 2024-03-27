function createCalendarEvent(jsonData) {
  const calendarId = 'primary'; // Use the primary calendar
  const event = Calendar.Events.insert(jsonData.event, calendarId);
  console.log('Event ID: ' + event.id);
}

function listYesterdaysEmails() {
  // Calculate time range for yesterday
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0,0,0,0); // Start of yesterday
  const afterTime = yesterday.getTime();

  // Using the GmailApp search method with the after: and before: search operators
  const query = 'is:important after:' + formatDateForGmail(afterTime)  
  const threads = GmailApp.search(query);

  // Iterate through each thread in the search results
  for (let i = 0; i < threads.length; i++) {
    let messages = threads[i].getMessages();
    
    for (let j = 0; j < messages.length; j++) {
      let subject = messages[j].getSubject();
      let date = messages[j].getDate();
      let body = messages[j].getPlainBody();
      let emailTimestamp = new Date(date);
      emailTimestamp = emailTimestamp.getTime();

      if (emailTimestamp >= afterTime) {
        let jsonData = gptQueryCalendarEvent(subject + "\n" + body);
        // Check if 'event' and 'event.summary' properties exist
        if ("summary" in jsonData.event) {
          createCalendarEvent(jsonData);
        }
      }
    }
  }
}

// Helper function to format dates as yyyy/MM/dd for Gmail search compatibility
function formatDateForGmail(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);

  return `${year}/${month}/${day}`;
}

function gptQueryCalendarEvent(q) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const apiKey = scriptProperties.getProperty('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('API Key not found. Please set your OpenAI API key in the script properties.');
  }
  
  const systemQuery = "You are a helpful personal assistant that manages the shared calendar of a family. You keep an eye on important dates that should not be missed, especially regarding kids.";
  const today = new Date();
  const currentYear = today.getFullYear();

  const prompt = "Analyse the email below and identify if there is a need to create Google Calendar event. If yes, repond in a JSON with attributes needed to create the Google Calendar event, with the reminder 2880 minutes ahead. Otherwise response with an empty but valid JSON. Don't translate the email, use the language of the email, preferrably Czech language, if possible. If the text does not specify a year, assume the year " + currentYear + ", timezone Europe/Prague. Use complete email body to describe the calendar event. Your answer is plain JSON, without any decorators\nEmail\n-----\n{}";

  const userQuery = prompt.replace("{}", q);

  // Construct the body of the POST request
  const postData = JSON.stringify({
    "model": "gpt-4-turbo-preview",
    "messages": [
      {"role": "system", "content": systemQuery},
      {"role": "user", "content": userQuery}
    ],
    "temperature": 0.3,
    "max_tokens": 1500,
    "top_p": 1,
    "frequency_penalty": 0.5,
    "presence_penalty": 0.5
  });

  // Set up the API request options
  const options = {
    "method": "post",
    "contentType": "application/json",
    "payload": postData,
    "headers": {
      "Authorization": "Bearer " + apiKey
    },
    "muteHttpExceptions": true // To handle errors more gracefully
  };

  // Send the request to the OpenAI API
  const apiUrl = "https://api.openai.com/v1/chat/completions";
  // const response = UrlFetchApp.fetch(apiUrl, options);
  const response = fetchWithRetry(apiUrl, options);
  
  // Parse the API response
  const json = safeParseJSON(response.getContentText());

  // Assuming you want to check for errors or an empty response
  if (json.hasOwnProperty('choices') && json.choices.length > 0) {
    const message = json.choices[0].message.content; // Access the message content

    return {
      "event": safeParseJSON(cleanJsonString(message)),
    };
  } else {
    // Handle the possible error or no response situation
    console.log('No response or error: ', response.getContentText());
    return {};
  }
}

function cleanJsonString(input) {
  // Pattern to remove ```json from the start (including optional spaces after "json") and ``` from the end
  const pattern = /^```json\s*([\s\S]*?)\s*```$/;
  
  // Replace the matched patterns with the first captured group, which is the JSON content
  const cleanedInput = input.replace(pattern, '$1').trim();
  
  // If the input was plain JSON without the backticks and "json" word wrapping, cleanedInput remains unaffected
  return cleanedInput;
}

function safeParseJSON(input) {
  try {
    return JSON.parse(input);
  } catch (e) {
    console.error('Failed to parse JSON', { error: e.message, input });
    return null; // or a sensible default, like {}
  }
}

function fetchWithRetry(url, options, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode() < 500 || attempt == maxAttempts) {
      return response;
    }
    // Exponential backoff
    Utilities.sleep(Math.pow(2, attempt) * 1000);
  }
}