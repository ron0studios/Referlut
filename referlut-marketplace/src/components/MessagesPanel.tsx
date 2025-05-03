import React, { useState } from "react";
import { MessageCircle, X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { User } from "../types";

// Mock data for messages
const mockConversations = [
  {
    id: "1",
    user: {
      id: "user1",
      name: "Sarah Johnson",
      avatar:
        "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    lastMessage: "Hey, how do I use that Netflix referral code?",
    timestamp: "2 hrs ago",
    unread: true,
    referralType: "Netflix Family Plan",
  },
  {
    id: "2",
    user: {
      id: "user2",
      name: "Michael Williams",
      avatar:
        "https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    lastMessage: "Thanks for sharing the Spotify plan details!",
    timestamp: "Yesterday",
    unread: false,
    referralType: "Spotify Family Plan",
  },
  {
    id: "3",
    user: {
      id: "user3",
      name: "Emma Davis",
      avatar:
        "https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    lastMessage:
      "I just signed up for Revolut. Do you know how long until we both get the £5 bonus?",
    timestamp: "2 days ago",
    unread: true,
    referralType: "Revolut Referral",
  },
  {
    id: "4",
    user: {
      id: "user4",
      name: "James Wilson",
      avatar:
        "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    lastMessage: "When are you planning to make the donation to Oxfam?",
    timestamp: "3 days ago",
    unread: false,
    referralType: "Oxfam Donation Match",
  },
];

interface MessagesPanelProps {
  user: User;
}

const MessagesPanel: React.FC<MessagesPanelProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversation, setActiveConversation] = useState<string | null>(
    null,
  );
  const [inputMessage, setInputMessage] = useState("");

  const totalUnread = mockConversations.filter((conv) => conv.unread).length;

  const handleSendMessage = () => {
    if (inputMessage.trim() === "") return;

    // In a real app, this would send the message to an API
    console.log("Sending message:", inputMessage);
    setInputMessage("");
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
                    <img
                      src={
                        mockConversations.find(
                          (c) => c.id === activeConversation,
                        )?.user.avatar
                      }
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover mr-2"
                    />
                    <span className="font-medium text-sm">
                      {
                        mockConversations.find(
                          (c) => c.id === activeConversation,
                        )?.user.name
                      }
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {
                    mockConversations.find((c) => c.id === activeConversation)
                      ?.referralType
                  }
                </div>
              </div>

              {/* Chat area */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="flex flex-col space-y-3">
                  <div className="flex items-start">
                    <img
                      src={
                        mockConversations.find(
                          (c) => c.id === activeConversation,
                        )?.user.avatar
                      }
                      alt="User"
                      className="w-8 h-8 rounded-full object-cover mr-2 mt-1"
                    />
                    <div className="bg-gray-200 rounded-lg rounded-tl-none px-3 py-2 max-w-[80%]">
                      <p className="text-sm">
                        {
                          mockConversations.find(
                            (c) => c.id === activeConversation,
                          )?.lastMessage
                        }
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {
                          mockConversations.find(
                            (c) => c.id === activeConversation,
                          )?.timestamp
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start flex-row-reverse">
                    <img
                      src={user.avatar}
                      alt="Me"
                      className="w-8 h-8 rounded-full object-cover ml-2 mt-1"
                    />
                    <div className="bg-blue-500 text-white rounded-lg rounded-tr-none px-3 py-2 max-w-[80%]">
                      <p className="text-sm">
                        I'll check the details and let you know shortly. Thanks
                        for reaching out!
                      </p>
                      <p className="text-xs text-blue-100 mt-1">Just now</p>
                    </div>
                  </div>
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
              {mockConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b ${conversation.unread ? "bg-blue-50" : ""}`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="relative">
                    <img
                      src={conversation.user.avatar}
                      alt={conversation.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    {conversation.unread && (
                      <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  <div className="ml-3 flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span
                        className={`font-medium text-sm ${conversation.unread ? "text-gray-900" : "text-gray-700"}`}
                      >
                        {conversation.user.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <div className="flex items-start mt-1">
                      <p
                        className={`text-sm truncate ${conversation.unread ? "font-medium text-gray-800" : "text-gray-600"}`}
                      >
                        {conversation.lastMessage}
                      </p>
                    </div>
                    <div className="mt-1">
                      <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-2 py-0.5">
                        {conversation.referralType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessagesPanel;
