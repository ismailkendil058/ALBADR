import React, { useState } from 'react';
import { useContactMessages, ContactMessage } from '@/hooks/useContactMessages';
import {
    Mail,
    Phone,
    Calendar,
    CheckCircle2,
    Clock,
    Trash2,
    MessageSquare,
    Search,
    ChevronRight,
    User
} from 'lucide-react';
import { format } from 'date-fns';
import { arDZ } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';

const AdminMessages = () => {
    const { messages, isLoading, updateMessage, deleteMessage } = useContactMessages();
    const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { toast } = useToast();

    const filteredMessages = messages?.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.phone.includes(searchTerm) ||
        (m.email && m.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            await updateMessage({ id, updatedFields: { status } });
            toast({ title: 'Success', description: `Message marked as ${status}.` });
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => prev ? { ...prev, status } : null);
            }
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to update message status.', variant: 'destructive' });
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this message?')) return;
        try {
            await deleteMessage(id);
            toast({ title: 'Deleted', description: 'Message deleted successfully.' });
            setSelectedMessage(null);
        } catch (error) {
            toast({ title: 'Error', description: 'Failed to delete message.', variant: 'destructive' });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        Contact Messages
                    </h1>
                    <p className="text-muted-foreground">Manage and respond to client inquiries</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Search messages..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Messages List */}
                <div className="lg:col-span-1 space-y-4">
                    <Card className="h-[calc(100vh-250px)] overflow-hidden flex flex-col">
                        <CardHeader className="py-3 border-b">
                            <CardTitle className="text-sm font-medium">Messages History</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0 overflow-y-auto flex-1">
                            {isLoading ? (
                                <div className="p-8 text-center text-muted-foreground">Loading...</div>
                            ) : filteredMessages?.length === 0 ? (
                                <div className="p-8 text-center text-muted-foreground">No messages found.</div>
                            ) : (
                                <div className="divide-y">
                                    {filteredMessages?.map((message) => (
                                        <button
                                            key={message.id}
                                            onClick={() => setSelectedMessage(message)}
                                            className={`w-full text-left p-4 hover:bg-muted/50 transition-colors flex items-start gap-3 ${selectedMessage?.id === message.id ? 'bg-muted' : ''}`}
                                        >
                                            <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${message.status === 'new' ? 'bg-primary' : 'bg-transparent'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-semibold truncate">{message.name}</p>
                                                    <span className="text-[10px] text-muted-foreground">
                                                        {format(new Date(message.created_at), 'MMM dd')}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-muted-foreground truncate">{message.message}</p>
                                                <div className="mt-2 flex gap-2">
                                                    {message.status === 'read' && <Badge variant="outline" className="text-[10px] py-0">Read</Badge>}
                                                    {message.status === 'new' && <Badge className="text-[10px] py-0">New</Badge>}
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground self-center" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Message Content */}
                <div className="lg:col-span-2">
                    {selectedMessage ? (
                        <Card className="h-full border-primary/20 bg-primary/5 shadow-sm">
                            <CardHeader className="border-b bg-card py-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                            <User className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg">{selectedMessage.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">Received {format(new Date(selectedMessage.created_at), 'PPP pp', { locale: arDZ })}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 w-full md:w-auto">
                                        {selectedMessage.status === 'new' && (
                                            <Button size="sm" onClick={() => handleStatusUpdate(selectedMessage.id, 'read')} className="flex-1 md:flex-none">
                                                <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Read
                                            </Button>
                                        )}
                                        <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedMessage.id)} className="flex-1 md:flex-none">
                                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="bg-card min-h-[400px] p-6">
                                <div className="grid md:grid-cols-2 gap-6 mb-8 p-4 bg-muted/30 rounded-lg">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                            <Phone className="w-3 h-3" /> Phone
                                        </p>
                                        <a href={`tel:${selectedMessage.phone}`} className="text-sm font-medium hover:text-primary transition-colors block">
                                            {selectedMessage.phone}
                                        </a>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1 uppercase tracking-wider">
                                            <Mail className="w-3 h-3" /> Email
                                        </p>
                                        {selectedMessage.email ? (
                                            <a href={`mailto:${selectedMessage.email}`} className="text-sm font-medium hover:text-primary transition-colors block underline">
                                                {selectedMessage.email}
                                            </a>
                                        ) : (
                                            <span className="text-sm text-muted-foreground italic tracking-tight">Not provided</span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2">
                                        <MessageSquare className="w-4 h-4 text-primary" />
                                        Message Content
                                    </h3>
                                    <div className="bg-muted px-6 py-6 rounded-xl border border-border shadow-inner whitespace-pre-wrap font-body text-foreground leading-relaxed">
                                        {selectedMessage.message}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="h-full flex items-center justify-center p-12 border-dashed border-2">
                            <div className="text-center space-y-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto opacity-50">
                                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">No message selected</h3>
                                    <p className="text-sm text-muted-foreground">Choose a message from the history to view its details.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminMessages;
