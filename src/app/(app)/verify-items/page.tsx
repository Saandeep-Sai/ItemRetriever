"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Header } from "@/components/Header";

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
  status: string;
  type: "lost" | "found";
}

export default function VerifyItemsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access this page.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    const checkAdminAndFetch = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        if (userData?.role === "admin") {
          setIsAdmin(true);
          await fetchItems();
        } else {
          toast({
            title: "Access Denied",
            description: "You don’t have permission to access this page.",
            variant: "destructive",
          });
          router.push("/home");
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load data.",
          variant: "destructive",
        });
        console.error("Error checking admin:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAndFetch();
  }, [user, authLoading, router, toast]);

  const fetchItems = async () => {
    try {
      const lostItemsQuery = query(
        collection(db, "lost-items"),
        where("status", "==", "pending")
      );
      const foundItemsQuery = query(
        collection(db, "found-items"),
        where("status", "==", "pending")
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

      setItems([...lostItems, ...foundItems]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load items for verification.",
        variant: "destructive",
      });
      console.error("Error fetching items:", error.message);
    }
  };

  const handleApprove = async (item: Item) => {
    try {
      const collectionName = item.type === "lost" ? "lost-items" : "found-items";
      await updateDoc(doc(db, collectionName, item.id), {
        status: "open",
        visibility: "public",
      });
      setItems(items.filter((i) => i.id !== item.id));
      toast({
        title: "Item Approved",
        description: `${item.name} has been approved and is now public.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to approve item.",
        variant: "destructive",
      });
      console.error("Error approving item:", error.message);
    }
  };

  const handleReject = async (item: Item) => {
    try {
      const collectionName = item.type === "lost" ? "lost-items" : "found-items";
      await updateDoc(doc(db, collectionName, item.id), {
        status: "rejected",
      });
      setItems(items.filter((i) => i.id !== item.id));
      toast({
        title: "Item Rejected",
        description: `${item.name} has been rejected.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to reject item.",
        variant: "destructive",
      });
      console.error("Error rejecting item:", error.message);
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">Verify Items</h1>
        {items.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No items pending verification.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Card key={`${item.id}-${item.type}`} className="flex flex-col">
                <CardHeader>
                  <CardTitle>
                    {item.type === "lost" ? "Lost: " : "Found: "}{item.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {item.imageBase64 && (
                    <img
                      src={item.imageBase64}
                      alt={item.name}
                      className="mb-4 h-48 w-full rounded-md object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = 'https://placehold.co/200x200.png';
                      }}
                    />
                  )}
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                  <p className="mt-2 text-sm">Category: {item.category}</p>
                  <p className="text-sm">Location: {item.location}</p>
                  <p className="text-sm">Reported by: {item.email}</p>
                  <p className="text-sm">Date: {new Date(item.reportedAt).toLocaleDateString()}</p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(item)}
                    variant="default"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(item)}
                    variant="destructive"
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </>
  );
}