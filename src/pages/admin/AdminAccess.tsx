import React, { useState } from 'react';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

const AdminAccess: React.FC = () => {
    const { employees, isLoading, createEmployee, updateEmployee, deleteEmployee } = useEmployees();
    const { toast } = useToast();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
    });

    const handleOpenAdd = () => {
        setSelectedEmployee(null);
        setFormData({ name: '', phone: '', password: '' });
        setIsDialogOpen(true);
    };

    const handleOpenEdit = (employee: Employee) => {
        setSelectedEmployee(employee);
        setFormData({
            name: employee.name,
            phone: employee.phone,
            password: employee.password || ''
        });
        setIsDialogOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedEmployee) {
                await updateEmployee.mutateAsync({
                    id: selectedEmployee.id,
                    name: formData.name,
                    phone: formData.phone,
                    password: formData.password
                });
                toast({ title: 'Success', description: 'Employee updated successfully.' });
            } else {
                await createEmployee.mutateAsync(formData);
                toast({ title: 'Success', description: 'Employee created successfully.' });
            }
            setIsDialogOpen(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to save employee.',
                variant: 'destructive'
            });
        }
    };

    const handleDelete = async () => {
        if (!selectedEmployee) return;
        try {
            await deleteEmployee.mutateAsync(selectedEmployee.id);
            toast({ title: 'Success', description: 'Employee deleted successfully.' });
            setShowDeleteConfirm(false);
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message || 'Failed to delete employee.',
                variant: 'destructive'
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Access Management</h1>
                    <p className="text-muted-foreground">Manage employee accounts and dashboard access</p>
                </div>
                <Button onClick={handleOpenAdd} className="gap-2">
                    <Plus className="w-4 h-4" /> Add Employee Account
                </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6 h-32 bg-muted/20" />
                        </Card>
                    ))
                ) : (
                    employees.map((emp) => (
                        <Card key={emp.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="bg-primary/10 p-3 rounded-full">
                                        <ShieldCheck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleOpenEdit(emp)}
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => {
                                                setSelectedEmployee(emp);
                                                setShowDeleteConfirm(true);
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                <h3 className="font-bold text-lg mb-1">{emp.name}</h3>
                                <div className="space-y-2 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-2">
                                        <Phone className="w-3.5 h-3.5" /> {emp.phone}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Key className="w-3.5 h-3.5" /> {emp.password ? '••••••••' : 'No password'}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}

                {!isLoading && employees.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-muted/20 rounded-xl border-2 border-dashed">
                        <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-medium">No employee accounts created yet</p>
                        <Button variant="outline" className="mt-4" onClick={handleOpenAdd}>
                            Create your first account
                        </Button>
                    </div>
                )}
            </div>

            {/* Add/Edit Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{selectedEmployee ? 'Edit Account' : 'New Employee Account'}</DialogTitle>
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
                                    placeholder="Employee Name"
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
                            <Button type="submit" disabled={createEmployee.isPending || updateEmployee.isPending}>
                                {(createEmployee.isPending || updateEmployee.isPending) && (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                )}
                                {selectedEmployee ? 'Save Changes' : 'Create Account'}
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
                            This will permanently delete the account for <strong>{selectedEmployee?.name}</strong>.
                            They will lose access to the employee dashboard immediately.
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
