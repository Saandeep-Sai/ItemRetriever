"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { collection, query, getDocs, updateDoc, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LoaderCircle, Download } from 'lucide-react';

interface Item {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  userId: string;
  email: string;
  reportedAt: string;
  status: string;
}

interface VerificationRequest {
  id: string;
  itemId: string;
  itemType: string;
  userId: string;
  email: string;
  proof: string;
  status: string;
  submittedAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [lostItems, setLostItems] = useState<Item[]>([]);
  const [foundItems, setFoundItems] = useState<Item[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists() || userDoc.data().role !== 'admin') {
          toast({
            title: 'Access Denied',
            description: 'You do not have permission to access this page.',
            variant: 'destructive',
          });
          router.push('/');
          return;
        }

        const lostQuery = query(collection(db, 'lost-items'));
        const foundQuery = query(collection(db, 'found-items'));
        const verificationQuery = query(collection(db, 'verification-requests'));
        const usersQuery = query(collection(db, 'users'));

        const [lostSnapshot, foundSnapshot, verificationSnapshot, usersSnapshot] = await Promise.all([
          getDocs(lostQuery),
          getDocs(foundQuery),
          getDocs(verificationQuery),
          getDocs(usersQuery),
        ]);

        setLostItems(lostSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
        setFoundItems(foundSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Item)));
        setVerificationRequests(verificationSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as VerificationRequest)));
        setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive',
        });
        console.error('Error fetching dashboard data:', error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, authLoading, router, toast]);

  const handleVerification = async (requestId: string, action: 'approve' | 'reject') => {
    try {
      await updateDoc(doc(db, 'verification-requests', requestId), {
        status: action === 'approve' ? 'approved' : 'rejected',
        updatedAt: new Date().toISOString(),
      });
      toast({
        title: `Verification ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        description: `The verification request has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
      });
      setVerificationRequests(prev =>
        prev.map(req => req.id === requestId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req)
      );
    } catch (error: any) {
      toast({
        title: 'Error',
        description: `Failed to ${action} verification request.`,
        variant: 'destructive',
      });
      console.error(`Error ${action}ing verification:`, error.message);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      toast({
        title: 'Role Updated',
        description: `User role updated to ${newRole}.`,
      });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error: any) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
      console.error('Error updating role:', error.message);
    }
  };

  const exportData = [
    ...lostItems.map(item => ({
      Type: 'Lost',
      Name: item.name,
      Description: item.description,
      Category: item.category,
      Location: item.location,
      Email: item.email,
      ReportedAt: item.reportedAt,
      Status: item.status,
    })),
    ...foundItems.map(item => ({
      Type: 'Found',
      Name: item.name,
      Description: item.description,
      Category: item.category,
      Location: item.location,
      Email: item.email,
      ReportedAt: item.reportedAt,
      Status: item.status,
    })),
  ];

  const handleExport = () => {
    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'item-report.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-center text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Lost Items</h2>
          {lostItems.length === 0 ? (
            <p className="text-muted-foreground">No lost items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lostItems.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Email:</strong> {item.email}</p>
                    <p><strong>Reported:</strong> {new Date(item.reportedAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Found Items</h2>
          {foundItems.length === 0 ? (
            <p className="text-muted-foreground">No found items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {foundItems.map(item => (
                <Card key={item.id}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Description:</strong> {item.description}</p>
                    <p><strong>Category:</strong> {item.category}</p>
                    <p><strong>Location:</strong> {item.location}</p>
                    <p><strong>Email:</strong> {item.email}</p>
                    <p><strong>Reported:</strong> {new Date(item.reportedAt).toLocaleString()}</p>
                    <p><strong>Status:</strong> {item.status}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Verification Requests</h2>
          {verificationRequests.length === 0 ? (
            <p className="text-muted-foreground">No verification requests found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {verificationRequests.map(request => (
                <Card key={request.id}>
                  <CardHeader>
                    <CardTitle>{request.itemType === 'lost' ? 'Found Item Claim' : 'Lost Item Verification'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p><strong>Item ID:</strong> {request.itemId}</p>
                    <p><strong>Email:</strong> {request.email}</p>
                    <p><strong>Proof:</strong> {request.proof}</p>
                    <p><strong>Status:</strong> {request.status}</p>
                    <p><strong>Submitted:</strong> {new Date(request.submittedAt).toLocaleString()}</p>
                    {request.status === 'pending' && (
                      <div className="flex gap-2 mt-4">
                        <Button onClick={() => handleVerification(request.id, 'approve')}>
                          Approve
                        </Button>
                        <Button variant="destructive" onClick={() => handleVerification(request.id, 'reject')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {users.map(user => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle>{user.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Role:</strong> {user.role || 'user'}</p>
                  <Select
                    onValueChange={(value: string) => handleRoleChange(user.id, value)}
                    defaultValue={user.role || 'user'}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-semibold mb-4">Export Reports</h2>
          <Button onClick={handleExport} className="flex items-center">
            <Download className="mr-2 h-4 w-4" />
            Export Item Report
          </Button>
        </div>
      </div>
    </div>
  );
}