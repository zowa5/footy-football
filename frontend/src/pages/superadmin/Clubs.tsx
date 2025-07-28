import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  Shield,
  Users,
  Trophy,
  Star,
  Search,
  Eye,
  Trash2,
  Edit,
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
  useClubs,
  useCreateClub,
  useUpdateClub,
  useDeleteClub,
} from "@/hooks/api";
import { Club } from "@/types/api";
import { ColumnDef } from "@tanstack/react-table";

const getClubColumns = (
  onEdit: (club: Club) => void,
  onDelete: (club: Club) => void
): ColumnDef<Club>[] => [
  {
    accessorKey: "clubName",
    header: "Club Name",
  },
  {
    accessorKey: "managerName",
    header: "Manager",
  },
  {
    accessorKey: "playerCount",
    header: "Players",
    cell: ({ row }) => {
      const count = row.getValue("playerCount") as number;
      return <span className="font-medium">{count}</span>;
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
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <span>{date.toLocaleDateString()}</span>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const club = row.original;
      return (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEdit(club)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => onDelete(club)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

export default function ClubsManagement() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [deletingClub, setDeletingClub] = useState<Club | null>(null);
  const [isAddingClub, setIsAddingClub] = useState(false);
  const [editForm, setEditForm] = useState({
    clubName: "",
    username: "",
    email: "",
    isActive: true,
  });
  const [addForm, setAddForm] = useState({
    clubName: "",
    username: "",
    email: "",
    password: "",
  });
  const limit = 10;

  const { data, isLoading, error } = useClubs({
    page: currentPage,
    limit,
    search: searchQuery || undefined,
  });

  const createClubMutation = useCreateClub();
  const updateClubMutation = useUpdateClub();
  const deleteClubMutation = useDeleteClub();

  const clubs = data?.data?.clubs || [];
  const pagination = data?.data?.pagination;

  const handleSearch = () => {
    setSearchQuery(searchInput);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleEdit = (club: Club) => {
    setEditingClub(club);
    setEditForm({
      clubName: club.clubName,
      username: club.managerName,
      email: club.managerEmail || "",
      isActive: club.isActive,
    });
  };

  const handleDelete = (club: Club) => {
    setDeletingClub(club);
  };

  const handleAddClub = () => {
    setIsAddingClub(true);
    setAddForm({
      clubName: "",
      username: "",
      email: "",
      password: "",
    });
  };

  const handleAddSubmit = () => {
    createClubMutation.mutate(addForm, {
      onSuccess: () => {
        setIsAddingClub(false);
        setAddForm({
          clubName: "",
          username: "",
          email: "",
          password: "",
        });
      },
    });
  };

  const handleEditSubmit = () => {
    if (!editingClub) return;

    updateClubMutation.mutate(
      {
        id: editingClub._id,
        clubData: editForm,
      },
      {
        onSuccess: () => {
          setEditingClub(null);
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deletingClub) return;

    deleteClubMutation.mutate(deletingClub._id, {
      onSuccess: () => {
        setDeletingClub(null);
      },
    });
  };

  // Calculate stats from current data
  const totalClubs = pagination?.total || 0;
  const activeClubs = clubs.filter((club) => club.isActive).length;
  const totalPlayers = clubs.reduce((sum, club) => sum + club.playerCount, 0);

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error loading clubs: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Clubs Management</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clubs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalClubs}</div>
            <p className="text-xs text-muted-foreground">Registered clubs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clubs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClubs}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Across all clubs</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Clubs List</CardTitle>
            <Button onClick={handleAddClub}>
              <Shield className="mr-2 h-4 w-4" />
              Add New Club
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="Search by club name, manager..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading clubs...</div>
          ) : (
            <>
              <DataTable
                columns={getClubColumns(handleEdit, handleDelete)}
                data={clubs}
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
                  {pagination.total} clubs
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Add New Club Dialog */}
      <Dialog open={isAddingClub} onOpenChange={() => setIsAddingClub(false)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Club</DialogTitle>
            <DialogDescription>
              Create a new club with a manager account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-clubName" className="text-right">
                Club Name
              </Label>
              <Input
                id="add-clubName"
                value={addForm.clubName}
                onChange={(e) =>
                  setAddForm({ ...addForm, clubName: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter club name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-username" className="text-right">
                Manager
              </Label>
              <Input
                id="add-username"
                value={addForm.username}
                onChange={(e) =>
                  setAddForm({ ...addForm, username: e.target.value })
                }
                className="col-span-3"
                placeholder="Manager username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-email" className="text-right">
                Email
              </Label>
              <Input
                id="add-email"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                className="col-span-3"
                placeholder="manager@example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="add-password" className="text-right">
                Password
              </Label>
              <Input
                id="add-password"
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
                className="col-span-3"
                placeholder="Enter password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingClub(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={handleAddSubmit}
              disabled={
                createClubMutation.isPending ||
                !addForm.clubName ||
                !addForm.username ||
                !addForm.email ||
                !addForm.password
              }
            >
              {createClubMutation.isPending ? "Creating..." : "Create Club"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Club Dialog */}
      <Dialog open={!!editingClub} onOpenChange={() => setEditingClub(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Club</DialogTitle>
            <DialogDescription>
              Make changes to the club information here.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="clubName" className="text-right">
                Club Name
              </Label>
              <Input
                id="clubName"
                value={editForm.clubName}
                onChange={(e) =>
                  setEditForm({ ...editForm, clubName: e.target.value })
                }
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Manager
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
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleEditSubmit}
              disabled={updateClubMutation.isPending}
            >
              {updateClubMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Club Dialog */}
      <AlertDialog
        open={!!deletingClub}
        onOpenChange={() => setDeletingClub(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              club <strong>{deletingClub?.clubName}</strong> and remove the
              manager account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteClubMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClubMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
