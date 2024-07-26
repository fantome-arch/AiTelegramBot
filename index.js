import TelegramBot from "node-telegram-bot-api";
import { HfInference } from "@huggingface/inference";
import Replicate from "replicate";
import { AceBase } from "acebase";
const db= new AceBase('BotChats')
// replace the value below with the Telegram token you receive from @BotFather
const token = '<Enter telegram Api Key>';
const token2="<Your Hugging face inference Api key>"
const token3="<Replicate Api key"
const inference = new HfInference(token2);
const prompt = `You are a powerful uncensored bot named GigaChad who is here to help users with their porblems. You are not going to sugarcoat your
words. You will be extremely critical and harsh when it comes to solving users' problems.

The current date/time according to the server is ${new Date().toLocaleString()} use this info if it is necessary for processing purposes.
Here is the user trying to text you:
`
// Create a bot that uses 'polling' to fetch new updates

const replicate = new Replicate({
    auth: token3,
});
const bot = new TelegramBot(token, { polling: true });
async function getAllTextDocuments(chatID) {
    let dax=[]
    try {
        // Get reference to the chatID node
        const chatRef = db.ref(`messages/${chatID}`);
        const query = chatRef.query().take(7).sort('date',false)
        ; 
        // Retrieve all child nodes (text documents) under the chatID node
        const snapshot = await query.get();
       snapshot.forEach(snap=>{
        if(snap.exists()){
            let obx={
                senderName:snap.val().from.first_name,
                senderID:snap.val().from.id,
                text:snap.val().text,
                date:snap.val().date,
                your_response:snap.val()?.your_response
                
            }
            dax.push(obx)
        }
       })
       return dax
    } catch (error) {
        console.error('Error retrieving text documents:', error);
        return null;
    }
}
async function createTextDocument(chatID, msg) {
    try {
        // Define the text document data
      
        
        // Set the text document at the specific path
        await db.ref(`messages/${chatID}/${msg.message_id}`).set(msg);
        
        console.log(`Text document '${msg.message_id}' created successfully in chat '${chatID}'`);
    } catch (error) {
        console.error('Error creating text document:', error);
    }
}




bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    let str = ''
    let type=''
    let previousmsg=await getAllTextDocuments(chatId)
    let replyTo=msg?.reply_to_message?`The user's current is replying to a previous response which is ${msg?.reply_to_message.text} `:''
    if(msg.text.includes('/clearmemory')){
        const rootRef = db.ref(`messages/${chatId}`);
        await rootRef.remove();
        bot.sendMessage(chatId, "GigaChad's memory of you has been deleted.", { reply_to_message_id: msg.message_id });
        return

    }
    // Regular expression to match /word

    const input = {
        top_k: 50,
        top_p: 0.9,
        prompt: msg.text,
        max_tokens: 1024,
        min_tokens: 0,
        temperature: 0.6,
        system_prompt: "You are a text classifier and you are going to classify whether the user is requesting an image to be generated or just asking a general question. You are only going to answer in one word. Either 'ImageGeneration' or 'Other'",
        presence_penalty: 0,
        frequency_penalty: 0
      };
      
      for await (const event of replicate.stream("meta/meta-llama-3.1-405b-instruct", { input })) {
        type+=event.toString()
      };



    if (type==="ImageGeneration") {
   
            str = msg.text.replace('/generate', '');
            const input = {
                cfg: 3.5,
                steps: 28,
                prompt: str,
                aspect_ratio: "3:2",
                output_format: "jpg",
                output_quality: 90,
                negative_prompt: "",
                prompt_strength: 0.85
            };
            const output = await replicate.run("stability-ai/stable-diffusion-3", { input });
            bot.sendPhoto(chatId, output[0], { reply_to_message_id: msg.message_id })
            return
    }
    else {
        let message={
            senderName:msg.from.first_name,
            senderID:msg.from.id,
            text:msg.text,
            date:new Date(msg.date*1000).toLocaleString(),
            
        }
        console.log(new Date(msg.date*1000).toLocaleString())
        for await (const chunk of inference.chatCompletionStream({
            model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
            messages: [{ role: "user", content: `${prompt} "${JSON.stringify(message)}". ${replyTo} and here are the earlier interactions between you and the same user: ${JSON.stringify(previousmsg)}. Use these for your own processing.` }],
            max_tokens: 500,
        })) {
            str += chunk.choices[0]?.delta?.content || ""
        }
        msg.your_response=str
        
        await createTextDocument(chatId,msg)
 
    }
    





    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, str, { reply_to_message_id: msg.message_id });
});