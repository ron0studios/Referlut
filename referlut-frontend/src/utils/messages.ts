import { getCookie, setCookie } from "../lib/cookies";
import { User, Offer } from "../types/marketplace/marketplace";
import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you should use server-side API calls
});

// Generate a random user to be the offer owner
export const generateRandomUser = (): User => {
  const names = [
    "Sarah Johnson",
    "Michael Williams",
    "Emma Davis",
    "James Wilson",
    "Olivia Brown",
    "David Miller",
    "Sophia Lee",
    "Daniel Taylor",
  ];

  const avatars = [
    "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

  return {
    id: `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    name: randomName,
    avatar: randomAvatar,
    unreadMessages: 0,
  };
};

// Get existing conversations or initialize empty array
export const getConversations = () => {
  const conversationsCookie = getCookie("userConversations");
  if (conversationsCookie) {
    try {
      const parsed = JSON.parse(conversationsCookie);
      // Convert date strings back to Date objects for timestamps
      return parsed.map((conversation: any) => ({
        ...conversation,
        messages: conversation.messages.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp),
        })),
      }));
    } catch (error) {
      console.error("Error parsing conversations from cookie:", error);
      return [];
    }
  }
  return [];
};

// Save conversations to cookie
export const saveConversations = (conversations: any[]) => {
  setCookie("userConversations", JSON.stringify(conversations), 30);
};

// Generate AI response based on the message and offer
export const generateAIResponse = (
  message: string,
  offer: Offer,
  otherUser: User,
): string => {
  // In a real implementation, this would call the OpenAI API

  // Create responses based on the offer type
  let response = "";

  if (offer.type === "referral") {
    response = `Thanks for your interest in my ${offer.brand} referral! I'd be happy to share the details. ${offer.description.slice(0, 80)}... Once you confirm, I'll send you the referral code right away. Let me know if you have any other questions! - ${otherUser.name}`;
  } else if (offer.type === "loyalty") {
    response = `Hi there! I'm glad you're interested in my ${offer.brand} loyalty program. This is a great way to enjoy the benefits without paying full price. ${offer.description.slice(0, 70)}... I can add you to my account once you confirm. Feel free to ask any questions! - ${otherUser.name}`;
  } else if (offer.type === "charity") {
    response = `Thank you for your interest in supporting the ${offer.brand} initiative! I'm coordinating this donation pool to maximize our impact. ${offer.description.slice(0, 80)}... Your contribution will make a real difference. Let me know if you have any questions about the process. - ${otherUser.name}`;
  } else {
    response = `Thanks for reaching out about my ${offer.brand} offer! I appreciate your interest. ${offer.description.slice(0, 100)}... Please let me know if you need more information or are ready to proceed. - ${otherUser.name}`;
  }

  return response;
};

// Generate AI response with OpenAI based on message context and offer details
export const generateChatResponseWithOpenAI = async (
  userMessage: string,
  offer: Offer,
  otherUser: User,
): Promise<string> => {
  try {
    const offerType = offer.type.charAt(0).toUpperCase() + offer.type.slice(1);

    // Create a detailed system prompt with all the offer information
    const systemPrompt = `You are ${otherUser.name}, the college student advertiser of a ${offerType} refer-a-friend for ${offer.brand}.

referral Details:
- Title: ${offer.title}
- Brand: ${offer.brand}
- Type: ${offerType}
- Description: ${offer.description}
- Price: £${offer.price}
- Available spots: ${offer.total - offer.used} of ${offer.total}
${offer.instructions ? `- Instructions: ${offer.instructions}` : ""}

Respond as if you are the discoverer of this offer and, being a student, are excited to find someone to profit with from the referral bonus. Be helpful, friendly, and provide specific details about the offer when asked. Keep responses conversational and under 150 words.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    let aiResponse = response.choices[0].message.content.trim();

    // Make sure the response is signed properly
    if (!aiResponse.includes(`- ${otherUser.name}`)) {
      aiResponse += `\n\n- ${otherUser.name}`;
    }

    return aiResponse;
  } catch (error) {
    console.error("Error generating AI response with OpenAI:", error);

    // Fallback response if API call fails
    return generateFallbackResponse(offer, otherUser);
  }
};

// Generate a fallback response if the OpenAI call fails
const generateFallbackResponse = (offer: Offer, otherUser: User): string => {
  if (offer.type === "referral") {
    return `Thanks for your interest in my ${offer.brand} referral! I'd be happy to share the details. ${offer.description.slice(0, 100)}... Once you confirm, I'll send you the referral code right away. Let me know if you have any other questions!\n\n- ${otherUser.name}`;
  } else if (offer.type === "loyalty") {
    return `Hi there! I'm glad you're interested in my ${offer.brand} loyalty program. This is a great way to enjoy the benefits without paying full price. ${offer.description.slice(0, 90)}... I can add you to my account once you confirm. Feel free to ask any questions!\n\n- ${otherUser.name}`;
  } else if (offer.type === "charity") {
    return `Thank you for your interest in supporting the ${offer.brand} initiative! I'm coordinating this donation pool to maximize our impact. ${offer.description.slice(0, 100)}... Your contribution will make a real difference. Let me know if you have any questions about the process.\n\n- ${otherUser.name}`;
  } else {
    return `Thanks for reaching out about my ${offer.brand} offer! I appreciate your interest. ${offer.description.slice(0, 120)}... Please let me know if you need more information or are ready to proceed.\n\n- ${otherUser.name}`;
  }
};

// Add a new message to a conversation
export const addMessage = (
  currentUser: User,
  otherUser: User,
  messageText: string,
  offer: Offer,
) => {
  const conversations = getConversations();

  // Try to find existing conversation between these users about this offer
  let conversation = conversations.find(
    (c: any) =>
      c.offerId === offer.id &&
      c.participants.some((p: any) => p.id === currentUser.id) &&
      c.participants.some((p: any) => p.id === otherUser.id),
  );

  // If no existing conversation, create a new one
  if (!conversation) {
    conversation = {
      id: `conv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      participants: [
        {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        {
          id: otherUser.id,
          name: otherUser.name,
          avatar: otherUser.avatar,
        },
      ],
      messages: [],
      offerId: offer.id,
      offerType: offer.type,
      offerBrand: offer.brand,
    };
    conversations.push(conversation);
  }

  // Add the new message
  const newMessage = {
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    senderId: currentUser.id,
    receiverId: otherUser.id,
    text: messageText,
    timestamp: new Date(),
    offerId: offer.id,
  };

  conversation.messages.push(newMessage);

  // Save updated conversations
  saveConversations(conversations);

  return conversation;
};

// Add AI response to a conversation
export const addAIResponse = async (
  conversation: any,
  currentUser: User,
  offer: Offer,
) => {
  // Find the other user in the conversation
  const otherUser = conversation.participants.find(
    (p: any) => p.id !== currentUser.id,
  );
  if (!otherUser) return;

  // Get the last message from the current user
  const lastUserMessage = conversation.messages
    .filter((m: any) => m.senderId === currentUser.id)
    .pop();

  if (!lastUserMessage) return;

  try {
    // Generate AI response using OpenAI
    const responseText = await generateChatResponseWithOpenAI(
      lastUserMessage.text,
      offer,
      otherUser,
    );

    // Add the AI response as a new message
    const aiResponse = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: otherUser.id,
      receiverId: currentUser.id,
      text: responseText,
      timestamp: new Date(Date.now() + 30000), // 30 seconds later to simulate typing
      offerId: offer.id,
      read: false, // Ensure messages are marked as unread
    };

    // Update the conversation
    conversation.messages.push(aiResponse);

    // Save all conversations
    const conversations = getConversations();
    const conversationIndex = conversations.findIndex(
      (c: any) => c.id === conversation.id,
    );
    if (conversationIndex !== -1) {
      conversations[conversationIndex] = conversation;
      saveConversations(conversations);
    }

    // Trigger a storage event so other components know to refresh
    window.dispatchEvent(new Event("storage"));

    return conversation;
  } catch (error) {
    console.error("Error in addAIResponse:", error);

    // Use fallback response if something goes wrong
    const responseText = generateFallbackResponse(offer, otherUser);

    // Add the fallback response as a new message
    const aiResponse = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: otherUser.id,
      receiverId: currentUser.id,
      text: responseText,
      timestamp: new Date(Date.now() + 5000),
      offerId: offer.id,
      read: false,
    };

    // Update the conversation
    conversation.messages.push(aiResponse);

    // Save all conversations
    const conversations = getConversations();
    const conversationIndex = conversations.findIndex(
      (c: any) => c.id === conversation.id,
    );
    if (conversationIndex !== -1) {
      conversations[conversationIndex] = conversation;
      saveConversations(conversations);
    }

    // Trigger a storage event so other components know to refresh
    window.dispatchEvent(new Event("storage"));

    return conversation;
  }
};
