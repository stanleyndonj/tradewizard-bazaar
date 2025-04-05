
import { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User } from '@/lib/backend';
import { useBackend } from '@/context/BackendContext';
import { Loader2, Search, UserIcon, MoreHorizontal, Mail, Calendar, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const UserManagement = () => {
  const { getUsers } = useBackend();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const fetchedUsers = await getUsers();
        if (fetchedUsers && Array.isArray(fetchedUsers)) {
          setUsers(fetchedUsers);
        } else {
          console.error('Invalid users data format:', fetchedUsers);
          toast({
            title: "Error loading users",
            description: "Received invalid data format from the server",
            variant: "destructive",
          });
          setUsers([]);
        }
      } catch (error) {
        console.error('Error loading users:', error);
        toast({
          title: "Error loading users",
          description: "Failed to load user data. Please try again.",
          variant: "destructive",
        });
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [getUsers, toast]);

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground mt-1">Manage platform users and their access</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full md:w-[300px] bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </motion.div>

      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16 bg-gray-800 rounded-md border border-gray-700"
        >
          <UserIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-white">No Users Found</h3>
          <p className="mt-2 text-gray-400">
            There are no users in the system yet.
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-gray-700 bg-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-900 border-gray-700">
                    <TableHead className="text-white">Name</TableHead>
                    <TableHead className="text-white">Email</TableHead>
                    <TableHead className="text-white">Role</TableHead>
                    <TableHead className="text-white">Subscription</TableHead>
                    <TableHead className="text-white">Joined</TableHead>
                    <TableHead className="text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-700/50 border-gray-700"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                            <UserIcon className="h-4 w-4 text-gray-300" />
                          </div>
                          {user.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {user.email}
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_admin ? (
                          <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-800/50">
                            <Shield className="h-3 w-3 mr-1" />
                            Admin
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            Customer
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {user.robots_delivered ? (
                          <Badge variant="secondary" className="bg-green-900/50 text-green-300 hover:bg-green-800/50">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-gray-600 text-gray-300">
                            None
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-700">
                          <MoreHorizontal className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
          
          <div className="mt-4 text-sm text-gray-400">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UserManagement;
