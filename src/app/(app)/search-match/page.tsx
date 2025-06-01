"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, setDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Search as SearchIcon, MapPin, Tag, User, Calendar, MessageCircle } from "lucide-react";
import { Header } from "@/components/Header";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  imageBase64?: string;
  userId: string;
  email: string;
  reportedAt: string;
  type: "lost" | "found";
}

export default function SearchMatchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "lost" | "found">("all");
  const [isLoading, setIsLoading] = useState(true);
  const [chatMessage, setChatMessage] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to view items.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }
    fetchItems();
  }, [user, authLoading, router, toast]);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const lostItemsQuery = query(
        collection(db, "lost-items"),
        where("visibility", "==", "public")
      );
      const foundItemsQuery = query(
        collection(db, "found-items"),
        where("visibility", "==", "public")
      );

      const [lostSnapshot, foundSnapshot] = await Promise.all([
        getDocs(lostItemsQuery),
        getDocs(foundItemsQuery),
      ]);

      const lostItems = lostSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "lost",
      })) as Item[];
      const foundItems = foundSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        type: "found",
      })) as Item[];

      const allItems = [...lostItems, ...foundItems].sort(
        (a, b) => new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime()
      );
      setItems(allItems);
      setFilteredItems(allItems);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load items.",
        variant: "destructive",
      });
      console.error("Error fetching items:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }
    if (typeFilter !== "all") {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }
    setFilteredItems(filtered);
  }, [searchTerm, categoryFilter, typeFilter, items]);

  const handleStartChat = async () => {
    if (!user || !selectedItem) return;
    try {
      // Create chat document
      const chatRef = doc(collection(db, "chats"));
      await setDoc(chatRef, {
        participants: [user.uid, selectedItem.userId],
        itemId: selectedItem.id,
        itemType: selectedItem.type,
        createdAt: serverTimestamp(),
      });

      // Add initial message to messages subcollection
      await addDoc(collection(db, "chats", chatRef.id, "messages"), {
        senderId: user.uid,
        text: chatMessage,
        timestamp: serverTimestamp(),
      });

      toast({
        title: "Chat Started",
        description: "Your message has been sent.",
      });
      setChatMessage("");
      setSelectedItem(null);
      router.push(`/chat/${chatRef.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to start chat.",
        variant: "destructive",
      });
      console.error("Error starting chat:", error.message);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight text-foreground">
          Lost & Found Feed
        </h1>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="search" className="sr-only">
              Search
            </Label>
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by name, description, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="category" className="sr-only">
                Category
              </Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger id="category" className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="electronics">Electronics</SelectItem>
                  <SelectItem value="books">Books</SelectItem>
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type" className="sr-only">
                Type
              </Label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as "all" | "lost" | "found")}>
                <SelectTrigger id="type" className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                  <SelectItem value="found">Found</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {filteredItems.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No items found. Try adjusting your search or filters.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <Card
                key={`${item.type}-${item.id}`}
                className="flex flex-col justify-between transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {item.type === "lost" ? (
                      <span className="text-red-500">Lost</span>
                    ) : (
                      <span className="text-green-500">Found</span>
                    )}
                    {item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.imageBase64 && (
                    <img
                      src={item.imageBase64}
                      alt={item.name}
                      className="mb-4 h-48 w-full rounded-md object-cover"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200.png'; }}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Tag className="h-4 w-4 text-primary" />
                      <span>{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{item.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-primary" />
                      <span>{item.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{new Date(item.reportedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  {user?.uid !== item.userId && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedItem(item)}
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          Contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Contact {item.email}</DialogTitle>
                          <DialogDescription>
                            Send a message to the person who {item.type === "lost" ? "lost" : "found"} this item.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="message">Message</Label>
                            <Input
                              id="message"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              placeholder={`Hi, I think I ${item.type === "lost" ? "found" : "lost"} your ${item.name}...`}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            onClick={handleStartChat}
                            disabled={!chatMessage.trim()}
                          >
                            Send Message
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}