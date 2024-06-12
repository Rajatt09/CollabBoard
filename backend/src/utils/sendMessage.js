import twilio from "twilio";

async function sendMessage(to, body) {
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);
  try {
    const message = await client.messages.create({
      to: to,
      from: process.env.PHONE_NUMBER,
      body: body,
    });
    console.log("Message sent successfully:", message.sid);
  } catch (error) {
    console.error("Error sending message:", error);
  }
}

export default sendMessage;
