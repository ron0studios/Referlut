
import { useState } from "react";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FinancialChart } from "@/components/FinancialChart";
import { ExpertTips } from "@/components/ExpertTips";
import { MessagesPreview } from "@/components/MessagesPreview";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    // In a real app, you would implement actual search functionality here
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4 sm:px-6">
        {/* Header */}
        <header className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Hi, Jonathan</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Post
              </Button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
            <Input
              type="search"
              placeholder="Search for savings offers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit">
              <Search className="h-4 w-4" />
              <span className="ml-2 hidden sm:inline">Search</span>
            </Button>
          </form>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Financial Chart - Takes up 2/3 on larger screens */}
          <div className="lg:col-span-2">
            <FinancialChart />
          </div>
          
          {/* Expert Tips - Takes up 1/3 on larger screens */}
          <div className="lg:col-span-1">
            <ExpertTips />
          </div>
        </div>

        {/* Messages Section */}
        <div className="mt-8">
          <MessagesPreview />
        </div>
      </div>
    </div>
  );
};

export default Index;
