import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
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
} from "@/components/ui/alert-dialog";
import {
  Users,
  UserPlus,
  UserX,
  Shield,
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
} from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  useUsers,
  useUpdateUser,
  useDeleteUser,
  useAddCoinsToUser,
} from "@/hooks/api";
import { User } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";

interface UserActionsProps {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onAddCoins: (user: User) => void;
}

const UserActions = ({
  user,
  onEdit,
  onDelete,
  onAddCoins,
}: UserActionsProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" size="sm" onClick={() => onEdit(user)}>
        <Edit className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onAddCoins(user)}>
        <Plus className="h-4 w-4" />
      </Button>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            disabled={user.role === "super_admin"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {user.username}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(user)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const getUserColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onAddCoins: (user: User) => void
): ColumnDef<User>[] => [
  {
    accessorKey: "username",
    header: "Username",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as string;
      return (
        <Badge
          variant={
            role === "player"
              ? "default"
              : role === "manager"
              ? "secondary"
              : "destructive"
          }
        >
          {role}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "coins",
    header: "Coins",
    cell: ({ row }) => {
      const coins = row.getValue("coins") as number;
      return <span className="font-medium">{coins.toLocaleString()}</span>;
    },
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <UserActions
          user={user}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddCoins={onAddCoins}
        />
      );
    },
  },
];

export default function UsersManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [coinsDialogOpen, setCoinsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [coinsAmount, setCoinsAmount] = useState("");
  const [coinsReason, setCoinsReason] = useState("");
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    role: "",
    isActive: true,
    playerInfo: {
      firstName: "",
      lastName: "",
      position: "",
      age: 0,
      height: 0,
      weight: 0,
      nationality: "",
      club: "",
      offensiveAwareness: 0,
      dribbling: 0,
      lowPass: 0,
      finishing: 0,
      placeKicking: 0,
      speed: 0,
      kickingPower: 0,
      physicalContact: 0,
      stamina: 0,
      ballWinning: 0,
      ballControl: 0,
      tightPossession: 0,
      loftedPass: 0,
      heading: 0,
      curl: 0,
      acceleration: 0,
      jump: 0,
      balance: 0,
      defensiveAwareness: 0,
      aggression: 0,
      gkAwareness: 0,
      gkClearing: 0,
      gkReach: 0,
      gkCatching: 0,
      gkReflexes: 0,
      weakFootUsage: 0,
      weakFootAcc: 0,
      form: 0,
      injuryResistance: 0,
      style: "",
    },
  });

  const limit = 10;

  const { data, isLoading, error, refetch } = useUsers({
    page: currentPage,
    limit,
    role: roleFilter || undefined,
    search: searchQuery || undefined,
  });

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const addCoinsMutation = useAddCoinsToUser();

  const users = data?.data?.users || [];
  const pagination = data?.data?.pagination;

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      playerInfo: user.playerInfo ? { ...user.playerInfo } : {
        firstName: "",
        lastName: "",
        position: "",
        age: 0,
        height: 0,
        weight: 0,
        nationality: "",
        club: "",
        offensiveAwareness: 0,
        dribbling: 0,
        lowPass: 0,
        finishing: 0,
        placeKicking: 0,
        speed: 0,
        kickingPower: 0,
        physicalContact: 0,
        stamina: 0,
        ballWinning: 0,
        ballControl: 0,
        tightPossession: 0,
        loftedPass: 0,
        heading: 0,
        curl: 0,
        acceleration: 0,
        jump: 0,
        balance: 0,
        defensiveAwareness: 0,
        aggression: 0,
        gkAwareness: 0,
        gkClearing: 0,
        gkReach: 0,
        gkCatching: 0,
        gkReflexes: 0,
        weakFootUsage: 0,
        weakFootAcc: 0,
        form: 0,
        injuryResistance: 0,
        style: "",
      },
    });
    setEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    deleteUserMutation.mutate(user._id, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  const handleAddCoins = (user: User) => {
    setSelectedUser(user);
    setCoinsAmount("");
    setCoinsReason("");
    setCoinsDialogOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editingUser) return;

    updateUserMutation.mutate(
      {
        id: editingUser._id,
        updates: {
          username: editForm.username,
          email: editForm.email,
          role: editForm.role as "player" | "manager" | "super_admin",
          isActive: editForm.isActive,
          playerInfo: editForm.playerInfo,
        },
      },
      {
        onSuccess: () => {
          setEditDialogOpen(false);
          setEditingUser(null);
          refetch();
        },
      }
    );
  };

  const handleCoinsSubmit = () => {
    if (!selectedUser || !coinsAmount) return;

    const amount = parseInt(coinsAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }

    addCoinsMutation.mutate(
      {
        id: selectedUser._id,
        amount,
        reason: coinsReason || "Added by admin",
      },
      {
        onSuccess: () => {
          setCoinsDialogOpen(false);
          setSelectedUser(null);
          refetch();
        },
      }
    );
  };

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role === "all" ? "" : role);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate stats from current data
  const totalUsers = pagination?.total || 0;
  const activeUsers = users.filter((user) => user.isActive).length;
  const inactiveUsers = users.filter((user) => !user.isActive).length;

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error loading users: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalUsers.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeUsers}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Inactive Users
            </CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inactiveUsers}</div>
            <p className="text-xs text-muted-foreground">Inactive accounts</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by username or email..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Select
                value={roleFilter || "all"}
                onValueChange={handleRoleFilter}
              >
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="player">Players</SelectItem>
                  <SelectItem value="manager">Managers</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : (
            <>
              <DataTable
                columns={getUserColumns(
                  handleEdit,
                  handleDelete,
                  handleAddCoins
                )}
                data={users}
              />

              {pagination && pagination.pages > 1 && (
                <div className="mt-4 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() =>
                            handlePageChange(Math.max(1, currentPage - 1))
                          }
                          className={
                            currentPage === 1
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>

                      {Array.from(
                        { length: pagination.pages },
                        (_, i) => i + 1
                      ).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            onClick={() => handlePageChange(page)}
                            isActive={page === currentPage}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() =>
                            handlePageChange(
                              Math.min(pagination.pages, currentPage + 1)
                            )
                          }
                          className={
                            currentPage === pagination.pages
                              ? "pointer-events-none opacity-50"
                              : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}

              {pagination && (
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  Showing {(currentPage - 1) * limit + 1} to{" "}
                  {Math.min(currentPage * limit, pagination.total)} of{" "}
                  {pagination.total} users
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit User - {editingUser?.username}</DialogTitle>
            <DialogDescription>
              Make changes to the user account and player information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Basic Info */}
            <div className="space-y-3 border-b pb-4">
              <h3 className="font-semibold text-sm">Basic Information</h3>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <Input
                  id="username"
                  value={editForm.username}
                  onChange={(e) =>
                    setEditForm({ ...editForm, username: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={editForm.email}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select
                  value={editForm.role}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, role: value })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="player">Player</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="active" className="text-right">
                  Status
                </Label>
                <Select
                  value={editForm.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, isActive: value === "active" })
                  }
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Player Info */}
            <div className="space-y-3 border-b pb-4">
              <h3 className="font-semibold text-sm">Player Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={editForm.playerInfo.firstName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          firstName: e.target.value,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={editForm.playerInfo.lastName}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          lastName: e.target.value,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position" className="text-sm">
                    Position
                  </Label>
                  <Input
                    id="position"
                    value={editForm.playerInfo.position}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          position: e.target.value,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="style" className="text-sm">
                    Style
                  </Label>
                  <Input
                    id="style"
                    value={editForm.playerInfo.style}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          style: e.target.value,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="age" className="text-sm">
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    value={editForm.playerInfo.age}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          age: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="height" className="text-sm">
                    Height (cm)
                  </Label>
                  <Input
                    id="height"
                    type="number"
                    value={editForm.playerInfo.height}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          height: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="weight" className="text-sm">
                    Weight (kg)
                  </Label>
                  <Input
                    id="weight"
                    type="number"
                    value={editForm.playerInfo.weight}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          weight: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-sm">
                    Nationality
                  </Label>
                  <Input
                    id="nationality"
                    value={editForm.playerInfo.nationality}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        playerInfo: {
                          ...editForm.playerInfo,
                          nationality: e.target.value,
                        },
                      })
                    }
                    className="h-8"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="club" className="text-sm">
                  Club
                </Label>
                <Input
                  id="club"
                  value={editForm.playerInfo.club}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      playerInfo: {
                        ...editForm.playerInfo,
                        club: e.target.value,
                      },
                    })
                  }
                  className="h-8"
                />
              </div>
            </div>

            {/* Player Stats */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm">Player Attributes</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "offensiveAwareness", label: "Offensive Awareness" },
                  { key: "dribbling", label: "Dribbling" },
                  { key: "lowPass", label: "Low Pass" },
                  { key: "finishing", label: "Finishing" },
                  { key: "placeKicking", label: "Place Kicking" },
                  { key: "speed", label: "Speed" },
                  { key: "kickingPower", label: "Kicking Power" },
                  { key: "physicalContact", label: "Physical Contact" },
                  { key: "stamina", label: "Stamina" },
                  { key: "ballWinning", label: "Ball Winning" },
                  { key: "ballControl", label: "Ball Control" },
                  { key: "tightPossession", label: "Tight Possession" },
                  { key: "loftedPass", label: "Lofted Pass" },
                  { key: "heading", label: "Heading" },
                  { key: "curl", label: "Curl" },
                  { key: "acceleration", label: "Acceleration" },
                  { key: "jump", label: "Jump" },
                  { key: "balance", label: "Balance" },
                  { key: "defensiveAwareness", label: "Defensive Awareness" },
                  { key: "aggression", label: "Aggression" },
                  { key: "gkAwareness", label: "GK Awareness" },
                  { key: "gkClearing", label: "GK Clearing" },
                  { key: "gkReach", label: "GK Reach" },
                  { key: "gkCatching", label: "GK Catching" },
                  { key: "gkReflexes", label: "GK Reflexes" },
                  { key: "weakFootUsage", label: "Weak Foot Usage" },
                  { key: "weakFootAcc", label: "Weak Foot Accuracy" },
                  { key: "form", label: "Form" },
                  { key: "injuryResistance", label: "Injury Resistance" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <Label htmlFor={key} className="text-xs">
                      {label}
                    </Label>
                    <Input
                      id={key}
                      type="number"
                      value={editForm.playerInfo[key as keyof typeof editForm.playerInfo]}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          playerInfo: {
                            ...editForm.playerInfo,
                            [key]: parseInt(e.target.value) || 0,
                          },
                        })
                      }
                      className="h-8"
                      min="0"
                      max="99"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditSubmit}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Coins Dialog */}
      <Dialog open={coinsDialogOpen} onOpenChange={setCoinsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Coins to {selectedUser?.username}</DialogTitle>
            <DialogDescription>
              Add coins to the user's account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={coinsAmount}
                onChange={(e) => setCoinsAmount(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reason" className="text-right">
                Reason
              </Label>
              <Textarea
                id="reason"
                placeholder="Reason for adding coins..."
                value={coinsReason}
                onChange={(e) => setCoinsReason(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleCoinsSubmit}
              disabled={addCoinsMutation.isPending}
            >
              {addCoinsMutation.isPending ? "Adding..." : "Add Coins"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
