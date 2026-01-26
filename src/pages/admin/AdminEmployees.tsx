import React, { useState } from 'react';
import {
    Users,
    UserPlus,
    Shield,
    Store,
    Trash2,
    Mail,
    ShieldCheck,
    Loader2,
    AlertCircle
} from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useEmployees, Employee } from '@/hooks/useEmployees';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';

const AdminEmployees: React.FC = () => {
    const { employees, isLoading, updatePermissions, deleteEmployee } = useEmployees();
    const { toast } = useToast();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        fullName: '',
        role: 'employee' as 'admin' | 'employee',
        store: 'laghouat'
    });

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Use Supabase Edge Function to create the Auth user securely
            const { data, error } = await supabase.functions.invoke('create-employee', {
                body: formData
            });

            if (error) throw error;

            toast({ title: "Employee account created successfully" });
            setIsDialogOpen(false);
            setFormData({ email: '', fullName: '', role: 'employee', store: 'laghouat' });
        } catch (error: any) {
            console.error("Creation error:", error);
            toast({
                title: "Creation Failed",
                description: "Make sure you have deployed the 'create-employee' Edge Function in your Supabase project.",
                variant: "destructive"
            });
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to remove this employee?')) {
            try {
                await deleteEmployee.mutateAsync(id);
                toast({ title: "Employee removed successfully" });
            } catch (error: any) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                    <p className="text-muted-foreground">
                        Manage your staff accounts and permissions.
                    </p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Add Employee
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Add New Employee</DialogTitle>
                            <DialogDescription>
                                Create a new account for a staff member. They will Receive an email to set their password.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateEmployee} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Role</Label>
                                <Select
                                    value={formData.role}
                                    onValueChange={(v: any) => setFormData({ ...formData, role: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="employee">Employee</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label>Assigned Store</Label>
                                <Select
                                    value={formData.store}
                                    onValueChange={(v) => setFormData({ ...formData, store: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="laghouat">Laghouat</SelectItem>
                                        <SelectItem value="aflou">Aflou</SelectItem>
                                        <SelectItem value="all">All Stores</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <DialogFooter>
                                <Button type="submit">Create Account</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-primary" />
                        Current Staff
                    </CardTitle>
                    <CardDescription>
                        Listing all users with administrative or employee access.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>ID</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees?.map((employee) => (
                                <TableRow key={employee.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                {employee.full_name?.charAt(0) || 'U'}
                                            </div>
                                            {employee.full_name || 'Unnamed'}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={employee.role === 'admin' ? 'default' : 'secondary'} className="gap-1">
                                            {employee.role === 'admin' ? <ShieldCheck className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                                            {employee.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1 text-sm text-muted-foreground capitalize">
                                            <Store className="w-3 h-3" />
                                            {employee.assigned_store || 'Not set'}
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-mono text-[10px] text-muted-foreground">
                                        {employee.id.slice(0, 8)}...
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={() => handleDelete(employee.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {employees?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                                        No employees found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminEmployees;
