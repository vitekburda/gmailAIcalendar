# Email to Calendar Event Importer

This project provides a Google Apps Script that automates the process of scanning yesterday's important emails and creating Google Calendar events based on the content identified as event-worthy by an AI model (using OpenAI's GPT). It's ideal for individuals looking to streamline their scheduling process directly from their email content.

## Features

- **Email Scanning**: Automatically scans your Gmail for important emails from the previous day.
- **AI Integration**: Leverages OpenAI's GPT model to analyze email content and determine if it describes an event.
- **Calendar Event Creation**: Automatically creates a Google Calendar event based on the AI's analysis.

## Prerequisites

Before you begin, ensure you have the following:

- A Google account with access to Google Apps Script, Gmail, and Google Calendar.
- An API key from OpenAI.

## Setting Up

### Setting the OpenAI API Key in Script Properties

1. Open your Google Apps Script project.
2. Go to `File` > `Project Properties` > `Script properties`.
3. Click `Add row`.
4. Enter `OPENAI_API_KEY` for the Property name.
5. Enter your OpenAI API key for the Value.
6. Click `Save`.

### Deployment with Clasp

[Clasp](https://github.com/google/clasp) is a command-line tool that lets you develop and manage Google Apps Script projects.

1. Install Clasp globally via npm (if you haven't already):

   ```bash
   npm install -g @google/clasp
   ```

2. Login to your Google account:

   ```bash
   clasp login
   ```

3. If you already have a google project, you can clone it using Clasp (replace `your-script-id` with your actual script ID):

   ```bash
   clasp clone your-script-id
   ```

4. After making changes to your script, push your code to the script project:

   ```bash
   clasp push
   ```

5. To deploy your project, first create a deployment:

   ```bash
   clasp deploy --description "Your deployment description"
   ```

## Usage

The script is designed to run automatically once a day, scanning for yesterday's important emails and creating events accordingly. You can also manually trigger the script execution through the Google Apps Script interface.

1. Open your Google Apps Script project.
2. Select the `listYesterdaysEmails` function.
3. Click the play (▶️) button to run the function.

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

Distributed under the MIT License.

## Acknowledgements

- [Google Apps Script](https://developers.google.com/apps-script)
- [OpenAI API](https://openai.com/api/)