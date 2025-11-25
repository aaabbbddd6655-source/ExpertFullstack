import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getUser } from "@/lib/auth";
import { Users, Plus, Pencil, Trash2, Shield, Loader2 } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const ROLES = ["ADMIN", "OPERATIONS", "PRODUCTION", "QUALITY", "INSTALLATION", "SUPPORT"] as const;

const getRoleBadgeColor = (role: string) => {
  const colors: Record<string, string> = {
    ADMIN: "bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100",
    OPERATIONS: "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-100",
    PRODUCTION: "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-100",
    QUALITY: "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-100",
    INSTALLATION: "bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-100",
    SUPPORT: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-100",
  };
  return colors[role] || colors.SUPPORT;
};

export default function UserManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const currentUser = getUser();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "SUPPORT" as typeof ROLES[number]
  });
  
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "" as typeof ROLES[number],
    password: ""
  });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: currentUser?.role === "ADMIN"
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsAddDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "SUPPORT" });
      toast({
        title: t("common.success"),
        description: t("admin.users.userCreated")
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("admin.users.createError"),
        variant: "destructive"
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof editForm> }) => {
      const updateData: any = {};
      if (data.name) updateData.name = data.name;
      if (data.email) updateData.email = data.email;
      if (data.role) updateData.role = data.role;
      if (data.password) updateData.password = data.password;
      
      return apiRequest("PATCH", `/api/admin/users/${id}`, updateData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: t("common.success"),
        description: t("admin.users.userUpdated")
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("admin.users.updateError"),
        variant: "destructive"
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/admin/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setDeleteUserId(null);
      toast({
        title: t("common.success"),
        description: t("admin.users.userDeleted")
      });
    },
    onError: (error: any) => {
      toast({
        title: t("common.error"),
        description: error.message || t("admin.users.deleteError"),
        variant: "destructive"
      });
    }
  });

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      name: user.name,
      email: user.email,
      role: user.role as typeof ROLES[number],
      password: ""
    });
    setIsEditDialogOpen(true);
  };

  if (currentUser?.role !== "ADMIN") {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <CardTitle>{t("admin.users.title")}</CardTitle>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-testid="button-add-user">
                <Plus className="w-4 h-4 mr-2" />
                {t("admin.users.addUser")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("admin.users.addNewUser")}</DialogTitle>
                <DialogDescription>
                  {t("admin.users.addUserDescription")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="new-name">{t("admin.users.name")}</Label>
                  <Input
                    id="new-name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder={t("admin.users.namePlaceholder")}
                    data-testid="input-new-user-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-email">{t("admin.users.email")}</Label>
                  <Input
                    id="new-email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder={t("admin.users.emailPlaceholder")}
                    data-testid="input-new-user-email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">{t("admin.users.password")}</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    placeholder={t("admin.users.passwordPlaceholder")}
                    data-testid="input-new-user-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-role">{t("admin.users.role")}</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as typeof ROLES[number] })}
                  >
                    <SelectTrigger id="new-role" data-testid="select-new-user-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES.map((role) => (
                        <SelectItem key={role} value={role} data-testid={`option-role-${role.toLowerCase()}`}>
                          {t(`admin.roles.${role}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                  data-testid="button-cancel-add-user"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={() => createUserMutation.mutate(newUser)}
                  disabled={createUserMutation.isPending || !newUser.name || !newUser.email || !newUser.password}
                  data-testid="button-confirm-add-user"
                >
                  {createUserMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {t("common.loading")}
                    </>
                  ) : (
                    t("admin.users.createUser")
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          {t("admin.users.description")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("admin.users.noUsers")}
          </p>
        ) : (
          <div className="space-y-3">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between gap-3 p-3 rounded-md border"
                data-testid={`user-row-${user.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-medium text-sm" data-testid={`text-user-name-${user.id}`}>
                      {user.name}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`${getRoleBadgeColor(user.role)} text-xs`}
                      data-testid={`badge-user-role-${user.id}`}
                    >
                      {t(`admin.roles.${user.role}`)}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1" data-testid={`text-user-email-${user.id}`}>
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => handleEditUser(user)}
                    data-testid={`button-edit-user-${user.id}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  {user.id !== currentUser?.id && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDeleteUserId(user.id)}
                      data-testid={`button-delete-user-${user.id}`}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("admin.users.editUser")}</DialogTitle>
            <DialogDescription>
              {t("admin.users.editUserDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("admin.users.name")}</Label>
              <Input
                id="edit-name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                data-testid="input-edit-user-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">{t("admin.users.email")}</Label>
              <Input
                id="edit-email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                data-testid="input-edit-user-email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">{t("admin.users.role")}</Label>
              <Select
                value={editForm.role}
                onValueChange={(value) => setEditForm({ ...editForm, role: value as typeof ROLES[number] })}
              >
                <SelectTrigger id="edit-role" data-testid="select-edit-user-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {t(`admin.roles.${role}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">{t("admin.users.newPassword")}</Label>
              <Input
                id="edit-password"
                type="password"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                placeholder={t("admin.users.leaveBlank")}
                data-testid="input-edit-user-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              data-testid="button-cancel-edit-user"
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => selectedUser && updateUserMutation.mutate({ id: selectedUser.id, data: editForm })}
              disabled={updateUserMutation.isPending}
              data-testid="button-confirm-edit-user"
            >
              {updateUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.save")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("admin.users.deleteConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("admin.users.deleteConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete-user">
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && deleteUserMutation.mutate(deleteUserId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-user"
            >
              {deleteUserMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("common.delete")
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
