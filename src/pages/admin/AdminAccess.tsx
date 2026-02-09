import React, { useState } from 'react';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useManagers, Manager } from '@/hooks/useManagers';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    Users,
    Plus,
    Pencil,
    Trash2,
    Phone,
    User,
    Key,
    Loader2,
    ShieldCheck
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type AccessType = 'employee' | 'manager';
type UserType = Employee | Manager;

const AdminAccess: React.FC = () => {
    const { employees, isLoading: employeesLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const { managers, isLoading: managersLoading, createManager, updateManager, deleteManager } = useManagers();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [currentAccessType, setCurrentAccessType] = useState<AccessType>('employee');
    const [activeTab, setActiveTab] = useState('employee');

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
    });

    const isLoading = employeesLoading || managersLoading;
    const employeesList = employees;
    const managersList = managers;

    const handleOpenAdd = (type: AccessType) => {
        setCurrentAccessType(type);
        setSelectedUser(null);
        setFormData({ name: '', phone: '', password: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (user: UserType, type: AccessType) => {
        setCurrentAccessType(type);
        setSelectedUser(user);
        setFormData({
            name: user.name,
            phone: user.phone,
            password: user.password || ''
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentAccessType === 'manager') {
                if (selectedUser) {
                    await updateManager.mutateAsync({
                        id: selectedUser.id,
                        name: formData.name,
                        phone: formData.phone,
                        password: formData.password,
                        is_active: 'is_active' in selectedUser ? selectedUser.is_active : true
                    });
                    toast({ title: 'Success', description: 'Manager updated successfully.' });
                } else {
                    await createManager.mutateAsync({
                        name: formData.name,
                        phone: formData.phone,
                        password: formData.password,
                        is_active: true
                    });
                    toast({ title: 'Success', description: 'Manager created successfully.' });
                }
            } else {
                if (selectedUser) {
                    await updateEmployee.mutateAsync({
                        id: selectedUser.id,
                        name: formData.name,
                        phone: formData.phone,
                        password: formData.password,
                    });
                    toast({ title: 'Success', description: 'Employee updated successfully.' });
                } else {
                    await createEmployee.mutateAsync({
                        name: formData.name,
                        phone: formData.phone,
                        password: formData.password,
                    });
                    toast({ title: 'Success', description: 'Employee created successfully.' });
                }
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || `Failed to save ${currentAccessType}.`,
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedUser) return;
        try {
            if (currentAccessType === 'manager') {
                await deleteManager.mutateAsync(selectedUser.id);
            } else {
                await deleteEmployee.mutateAsync(selectedUser.id);
            }
            toast({ title: 'Success', description: `${currentAccessType === 'manager' ? 'Manager' : 'Employee'} deleted successfully.` });
            setShowDeleteConfirm(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || `Failed to delete ${currentAccessType}.`,
                variant: 'destructive'
            });
        }
    };

    const UserCard = ({ user, type }: { user: UserType; type: AccessType }) => (
        <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div className={`p-3 rounded-full ${type === 'manager' ? 'bg-purple-100' : 'bg-primary/10'}`}>
                        <ShieldCheck className={`w-6 h-6 ${type === 'manager' ? 'text-purple-600' : 'text-primary'}`} />
                    </div>
                    <div className="flex gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(user, type)}
                        >
                            <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                                setCurrentAccessType(type);
                                setSelectedUser(user);
                                setShowDeleteConfirm(true);
                            }}
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <h3 className="font-bold text-lg mb-1">{user.name}</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5" /> {user.phone}
                    </div>
                    <div className="flex items-center gap-2">
                        <Key className="w-3.5 h-3.5" /> {user.password ? '••••••••' : 'No password'}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Access Management</h1>
                <p className="text-muted-foreground">Manage employee and manager accounts and dashboard access</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="employee">Employees</TabsTrigger>
                    <TabsTrigger value="manager">Managers</TabsTrigger>
                </TabsList>

                {/* Employees Tab */}
                <TabsContent value="employee" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Employee Accounts</h2>
                            <p className="text-sm text-muted-foreground">Manage warehouse and delivery staff</p>
                        </div>
                        <Button onClick={() => handleOpenAdd('employee')} className="gap-2">
                            <Plus className="w-4 h-4" /> Add Employee
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-6 h-32 bg-muted/20" />
                                </Card>
                            ))
                        ) : employeesList.length > 0 ? (
                            employeesList.map((emp) => (
                                <UserCard key={emp.id} user={emp} type="employee" />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">No employee accounts created yet</p>
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenAdd('employee')}>
                                    Create your first employee
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>

                {/* Managers Tab */}
                <TabsContent value="manager" className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Manager Accounts</h2>
                            <p className="text-sm text-muted-foreground">Manage manager dashboard access</p>
                        </div>
                        <Button onClick={() => handleOpenAdd('manager')} className="gap-2">
                            <Plus className="w-4 h-4" /> Create Manager
                        </Button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {isLoading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <Card key={i} className="animate-pulse">
                                    <CardContent className="p-6 h-32 bg-muted/20" />
                                </Card>
                            ))
                        ) : managersList.length > 0 ? (
                            managersList.map((mgr) => (
                                <UserCard key={mgr.id} user={mgr} type="manager" />
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                                <p className="text-muted-foreground font-medium">No manager accounts created yet</p>
                                <Button variant="outline" className="mt-4" onClick={() => handleOpenAdd('manager')}>
                                    Create your first manager
                                </Button>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedUser ? `Edit ${currentAccessType === 'manager' ? 'Manager' : 'Employee'}` : `New ${currentAccessType === 'manager' ? 'Manager' : 'Employee'} Account`}
                        </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Name"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="0xxxxxxxxx"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Login Password</Label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="text"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Set password"
                                    className="pl-10"
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending || createManager.isPending || updateManager.isPending}>
                                {(createEmployee.isPending || updateEmployee.isPending || createManager.isPending || updateManager.isPending) && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {selectedUser ? 'Save Changes' : 'Create Account'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the account for <strong>{selectedUser?.name}</strong>.
                            They will lose access to the {currentAccessType === 'manager' ? 'manager' : 'employee'} dashboard immediately.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete Account
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminAccess;
