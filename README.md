# AiTelegramBot
A powerful AI telegram chatbot that is here to provide advice and solve your problems. It also has the ability to generate images.


# Features
1. The bot uses acebase database to store records of previous messages.
2. The bot has the ability to detect if the prompt is a general prompt or a prompt requesting an image generation. If it is the latter, then an image is generated based on the prompt.
3. To clear the bot's memory text "/clearmemory" .
4. The bot receives 7 of the previous messages for context.

# Installation 

Follow these steps to get the bot working

1. To run the bot on your local machine, ensure you have node installed. If you don't have it installed then download it from: https://nodejs.org/en/download/package-manager.
2. Run `npm install`
 to install all the dependencies.
3. Open telegram, create a new bot using bot father and obtain the bot token.
4. You must have a replicate and hugging face account as the bot uses their apis to access the relavent AI models hence api keys are required. Visit https://huggingface.co and https://replicate.com to create the accounts.
5. Once you have a hugging face and a replicate account, retrieve the api keys from the settings.
6. Open index.js file using vs code or any other code editor and replace token1 variable with the telegram bot api key you obtained earlier.
7. Similairly, paste the api key from hugging face in the token2 variable and the api key from replicate in token3 variable.
8. Modify the default prompt or change the bot's name if you don't like the default one.
9. Once done, run `node index.js` to run your bot in the local machine.



