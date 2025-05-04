import React, { useState, useEffect } from "react";
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { User } from "../../types/marketplace/marketplace";
import { getConversations } from "../../utils/messages";

interface MessagesPanelProps {
  user: User;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [inputMessage, setInputMessage] = useState("");
  const [conversations, setConversations] = useState<any[]>([]);

  // Load conversations from cookies when component mounts
  useEffect(() => {
    loadConversations();

    // Listen for storage events (when messages are added in another component)
    window.addEventListener("storage", loadConversations);

    // Also listen for custom storage event dispatched in addAIResponse
    window.addEventListener("storage", loadConversations);

    return () => {
      window.removeEventListener("storage", loadConversations);
    };
  }, []);

  // Function to load conversations from cookies
  const loadConversations = () => {
    const storedConversations = getConversations();
    setConversations(storedConversations);
  };

  // Calculate total unread messages
  const totalUnread = conversations.reduce((count, conv) => {
    // Count messages where the current user is the recipient and hasn't read them
    const unreadCount = conv.messages.filter(
      (m: any) => m.receiverId === user.id && !m.read,
    ).length;
    return count + unreadCount;
  }, 0);

  const handleSendMessage = () => {
    if (inputMessage.trim() === "" || !activeConversation) return;

    // Find the active conversation
    const conversation = conversations.find((c) => c.id === activeConversation);
    if (!conversation) return;

    // Add message to conversation
    // In a real app, this would update the cookie storage
    // For now, we'll just update the local state
    const newMessage = {
      id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      senderId: user.id,
      receiverId: conversation.participants.find((p: any) => p.id !== user.id)
        .id,
      text: inputMessage,
      timestamp: new Date(),
      offerId: conversation.offerId,
    };

    // Update the conversation in our state
    const updatedConversations = conversations.map((c) => {
      if (c.id === activeConversation) {
        return {
          ...c,
          messages: [...c.messages, newMessage],
        };
      }
      return c;
    });

    setConversations(updatedConversations);
    setInputMessage("");

    // In a real implementation, we would save this to cookies
    // and trigger an AI response
  };

  return (
    <div
      className={`fixed bottom-0 right-6 z-10 transition-all duration-300 ${isOpen ? "h-[500px] w-[360px]" : ""}`}
    >
      {/* Message panel header and toggle button */}
      <div
        className={`flex items-center justify-between ${isOpen ? "bg-white shadow-md rounded-t-lg" : "rounded-full shadow-lg"} px-4 py-3 cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <>
            <h3 className="font-bold text-gray-800">Messages</h3>
            <div className="flex items-center space-x-2">
              {totalUnread > 0 && (
                <span className="bg-red-500 text-white w-5 h-5 rounded-full flex items-center justify-center text-xs">
                  {totalUnread}
                </span>
              )}
              <ChevronDown className="w-5 h-5 text-gray-600" />
            </div>
          </>
        ) : (
          <button className="flex items-center justify-center bg-blue-500 text-white rounded-full p-4 hover:bg-blue-600 transition-colors duration-200 group relative">
            <MessageCircle className="w-6 h-6" />

            {totalUnread > 0 && (
              <div className="absolute -top-1 -right-1 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 animate-pulse">
                {totalUnread}
              </div>
            )}
          </button>
        )}
      </div>

      {/* Message panel body */}
      {isOpen && (
        <div className="bg-white shadow-lg rounded-b-lg flex flex-col h-[calc(500px-48px)]">
          {activeConversation ? (
            <div className="flex flex-col h-full">
              {/* Active conversation header */}
              <div className="flex items-center justify-between p-3 border-b">
                <div className="flex items-center">
                  <button
                    className="mr-2 text-gray-500 hover:text-gray-700"
                    onClick={() => setActiveConversation(null)}
                  >
                    <ChevronUp className="w-5 h-5" />
                  </button>
                  <div className="flex items-center">
                    {conversations
                      .find((c) => c.id === activeConversation)
                      ?.participants.find((p: any) => p.id !== user.id) && (
                      <>
                        <img
                          src={
                            conversations
                              .find((c) => c.id === activeConversation)
                              ?.participants.find((p: any) => p.id !== user.id)
                              .avatar
                          }
                          alt="User"
                          className="w-8 h-8 rounded-full object-cover mr-2"
                        />
                        <span className="font-medium text-sm">
                          {
                            conversations
                              .find((c) => c.id === activeConversation)
                              ?.participants.find((p: any) => p.id !== user.id)
                              .name
                          }
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {
                    conversations.find((c) => c.id === activeConversation)
                      ?.offerBrand
                  }{" "}
                  {
                    conversations.find((c) => c.id === activeConversation)
                      ?.offerType
                  }
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="flex flex-col space-y-3">
                  {conversations
                    .find((c) => c.id === activeConversation)
                    ?.messages.map((message: any) => {
                      // Correctly identify messages from the current user
                      const isFromUser = message.senderId === user.id;
                      const sender = conversations
                        .find((c) => c.id === activeConversation)
                        ?.participants.find(
                          (p: any) => p.id === message.senderId,
                        );

                      return (
                        <div
                          key={message.id}
                          className={`flex items-start ${isFromUser ? "flex-row-reverse" : ""}`}
                        >
                          <img
                            src={sender?.avatar}
                            alt={sender?.name}
                            className={`w-8 h-8 rounded-full object-cover ${isFromUser ? "ml-2" : "mr-2"} mt-1`}
                          />
                          <div
                            className={`px-3 py-2 max-w-[80%] ${
                              isFromUser
                                ? "bg-blue-500 text-white rounded-lg rounded-tr-none"
                                : "bg-gray-200 text-gray-800 rounded-lg rounded-tl-none"
                            }`}
                          >
                            <p className="text-sm">{message.text}</p>
                            <p
                              className={`text-xs mt-1 ${isFromUser ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {new Date(message.timestamp).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Input area */}
              <div className="p-3 border-t">
                <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button
                    onClick={handleSendMessage}
                    className={`ml-2 ${inputMessage.trim() ? "text-blue-500" : "text-gray-400"}`}
                    disabled={!inputMessage.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Conversation list */
            <div className="overflow-y-auto">
              {conversations.length > 0 ? (
                conversations.map((conversation) => {
                  // Find the other participant (not the current user)
                  const otherParticipant = conversation.participants.find(
                    (p: any) => p.id !== user.id,
                  );
                  if (!otherParticipant) return null;

                  // Get the last message in the conversation
                  const lastMessage =
                    conversation.messages[conversation.messages.length - 1];
                  if (!lastMessage) return null;

                  // Check if there are any unread messages for this user
                  const unreadCount = conversation.messages.filter(
                    (m: any) => m.receiverId === user.id && !m.read,
                  ).length;

                  return (
                    <div
                      key={conversation.id}
                      className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${unreadCount > 0 ? "bg-blue-50" : ""}`}
                      onClick={() => setActiveConversation(conversation.id)}
                    >
                      <div className="relative">
                        <img
                          src={otherParticipant.avatar}
                          alt={otherParticipant.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        {unreadCount > 0 && (
                          <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                        )}
                      </div>

                      <div className="ml-3 flex-1 overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span
                            className={`font-medium text-sm ${unreadCount > 0 ? "text-gray-900" : "text-gray-700"}`}
                          >
                            {otherParticipant.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              lastMessage.timestamp,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-start mt-1">
                          <p
                            className={`text-sm truncate ${unreadCount > 0 ? "font-medium text-gray-800" : "text-gray-600"}`}
                          >
                            {lastMessage.text}
                          </p>
                        </div>
                        <div className="mt-1">
                          <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                            {conversation.offerBrand} {conversation.offerType}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <MessageCircle className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                  <p>No messages yet.</p>
                  <p className="text-sm mt-1">
                    Start a conversation by messaging an offer owner.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;
