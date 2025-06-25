"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Trash2, RefreshCw, Pencil } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { users, type UserWithSubscription } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function UsersPage() {
  const [userList, setUserList] = useState<UserWithSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(0)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<UserWithSubscription | null>(null)
  const limit = 100

  const [newUser, setNewUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
    storage_limit_bytes: 5368709120, // 5GB default
    max_users: 5, // 5 users default
  })

  const [editUser, setEditUser] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    storage_limit_bytes: 5368709120,
    max_users: 5,
  })

  const fetchUsers = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await users.getAllUsers({
        skip: page * limit,
        limit,
      })
      console.log(data)
      setUserList(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : "Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [page])

  useEffect(() => {
    console.log('editUser state changed:', editUser);
  }, [editUser]);

  const getFullName = (user: UserWithSubscription) => {
    return `${user.first_name} ${user.last_name}`.trim()
  }

  const filteredUsers = userList.filter(
    (user) =>
      getFullName(user).toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = async () => {
    setIsCreating(true)
    try {
      await users.createUser(newUser)
      setNewUser({
        first_name: "",
        last_name: "",
        email: "",
        password: "",
        role: "user",
        storage_limit_bytes: 5368709120,
        max_users: 5,
      })
      setIsAddDialogOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : "Failed to create user")
    } finally {
      setIsCreating(false)
    }
  }

  const confirmDelete = (user: UserWithSubscription) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirmed = async () => {
    if (!selectedUser) return;
    
    setIsDeleting(selectedUser.id);
    try {
      await users.deleteUser(selectedUser.id);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(null);
      setSelectedUser(null);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    
    setIsUpdating(true)
    try {
      await users.updateUser({
        ...editUser,
        id: selectedUser.id,
      })
      setIsEditDialogOpen(false)
      fetchUsers()
    } catch (err) {
      console.error('Error updating user:', err)
      setError(err instanceof Error ? err.message : "Failed to update user")
    } finally {
      setIsUpdating(false)
    }
  }

  const openEditDialog = (user: UserWithSubscription) => {
    console.log('Opening edit dialog with user:', user);
    setSelectedUser(user)
    setEditUser({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      role: user.role || "user",
      storage_limit_bytes: user.storage_limit_bytes || 5368709120,
      max_users: user.max_users || 5,
    })
    setIsEditDialogOpen(true)
  }

  const getRoleBadge = (role: string) => {
    const variants = {
      admin: "destructive",
      user: "default",
      moderator: "secondary",
    } as const

    return <Badge variant={variants[role as keyof typeof variants] || "default"}>{role}</Badge>
  }

  const getSubscriptionBadge = (subscription?: { status: string }) => {
    if (!subscription) return null;

    const variants = {
      active: "default",
      trialing: "secondary",
      canceled: "destructive",
      incomplete: "outline",
    } as const

    return (
      <Badge variant={variants[subscription.status as keyof typeof variants] || "default"}>
        {subscription.status}
      </Badge>
    )
  }

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 B'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`
  }

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage system users and their permissions</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={fetchUsers}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New User</DialogTitle>
                    <DialogDescription>Create a new user account with the specified details.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                          id="first_name"
                          value={newUser.first_name}
                          onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                          placeholder="Enter first name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                          id="last_name"
                          value={newUser.last_name}
                          onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                          placeholder="Enter last name"
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Enter email address"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="role">Role</Label>
                      <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="storage_limit">Storage Limit</Label>
                      <Select 
                        value={newUser.storage_limit_bytes.toString()} 
                        onValueChange={(value) => setNewUser({ ...newUser, storage_limit_bytes: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select storage limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5368709120">5 GB</SelectItem>
                          <SelectItem value="10737418240">10 GB</SelectItem>
                          <SelectItem value="21474836480">20 GB</SelectItem>
                          <SelectItem value="53687091200">50 GB</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="max_users">Max Users</Label>
                      <Select 
                        value={newUser.max_users.toString()} 
                        onValueChange={(value) => setNewUser({ ...newUser, max_users: parseInt(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select max users" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 users</SelectItem>
                          <SelectItem value="10">10 users</SelectItem>
                          <SelectItem value="20">20 users</SelectItem>
                          <SelectItem value="50">50 users</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddUser} disabled={isCreating}>
                      {isCreating ? "Creating..." : "Add User"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-4">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="relative">
            {loading && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Storage Limit</TableHead>
                  <TableHead>Max Users</TableHead>
                  <TableHead>Subscription</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{getFullName(user)}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>{formatBytes(user.storage_limit_bytes)}</TableCell>
                    <TableCell>{user.max_users} users</TableCell>
                    <TableCell>{getSubscriptionBadge(user.subscription)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(user)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {user.role !== 'admin' && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedUser(user)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete {user.first_name} {user.last_name}? This action cannot be undone.
                                  This will permanently delete their account and remove all their data from the server.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setSelectedUser(null)}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeleteConfirmed}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  {isDeleting === user.id ? (
                                    <div className="flex items-center gap-2">
                                      <div className="animate-spin h-4 w-4 border-b-2 border-primary-foreground" />
                                      <span>Deleting...</span>
                                    </div>
                                  ) : (
                                    "Delete User"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-500">
              Page {page + 1}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={filteredUsers.length < limit}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user account details.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit_first_name">First Name</Label>
                <Input
                  id="edit_first_name"
                  value={editUser.first_name}
                  onChange={(e) => setEditUser({ ...editUser, first_name: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit_last_name">Last Name</Label>
                <Input
                  id="edit_last_name"
                  value={editUser.last_name}
                  onChange={(e) => setEditUser({ ...editUser, last_name: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_email">Email</Label>
              <Input
                id="edit_email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_role">Role</Label>
              <Select 
                value={editUser.role} 
                onValueChange={(value) => setEditUser({ ...editUser, role: value })}
                disabled={selectedUser?.role === 'admin'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_storage_limit">Storage Limit</Label>
              <Select 
                value={editUser.storage_limit_bytes.toString()} 
                onValueChange={(value) => setEditUser({ ...editUser, storage_limit_bytes: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select storage limit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5368709120">5 GB</SelectItem>
                  <SelectItem value="10737418240">10 GB</SelectItem>
                  <SelectItem value="21474836480">20 GB</SelectItem>
                  <SelectItem value="53687091200">50 GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit_max_users">Max Users</Label>
              <Select 
                value={editUser.max_users.toString()} 
                onValueChange={(value) => setEditUser({ ...editUser, max_users: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select max users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 users</SelectItem>
                  <SelectItem value="10">10 users</SelectItem>
                  <SelectItem value="20">20 users</SelectItem>
                  <SelectItem value="50">50 users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
