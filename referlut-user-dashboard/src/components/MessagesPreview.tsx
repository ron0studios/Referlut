
import { Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: number;
  sender: string;
  subject: string;
  preview: string;
  date: string;
  unread: boolean;
}

const messages: Message[] = [
  {
    id: 1,
    sender: "Wealth Wave Team",
    subject: "Your monthly statement is ready",
    preview: "Your June 2025 statement is now available for viewing...",
    date: "2h ago",
    unread: true,
  },
  {
    id: 2,
    sender: "Investment Advisor",
    subject: "Recommended portfolio adjustments",
    preview: "Based on current market trends, we suggest the following...",
    date: "1d ago",
    unread: false,
  },
  {
    id: 3,
    sender: "Security Team",
    subject: "New login detected",
    preview: "We detected a new login to your account from...",
    date: "3d ago",
    unread: false,
  },
];

export function MessagesPreview() {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Messages</CardTitle>
        <Badge variant="secondary">{messages.filter(m => m.unread).length} new</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex items-start gap-4 border-l-2 pl-4 ${
              message.unread ? "border-primary" : "border-transparent"
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
              <Mail className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex justify-between">
                <p className="font-medium">{message.sender}</p>
                <span className="text-xs text-muted-foreground">{message.date}</span>
              </div>
              <p className={`text-sm ${message.unread ? "font-medium" : ""}`}>{message.subject}</p>
              <p className="text-xs text-muted-foreground truncate">{message.preview}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
