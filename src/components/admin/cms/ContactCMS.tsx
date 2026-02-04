import React, { useState } from 'react';
import { useCMS } from '@/context/CMSContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Phone, Mail, Map } from 'lucide-react';
import { toast } from 'sonner';

const ContactCMS: React.FC = () => {
    const { content, updateContactInfo } = useCMS();

    const [address, setAddress] = useState(content.footer.contactInfo.address);
    const [addressLink, setAddressLink] = useState(content.footer.contactInfo.addressLink);
    const [phone, setPhone] = useState(content.footer.contactInfo.phone);
    const [email, setEmail] = useState(content.footer.contactInfo.email);

    const handleUpdate = () => {
        updateContactInfo({
            address,
            addressLink,
            phone,
            email,
        });
        toast.success('Contact information updated');
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Contact Information</CardTitle>
                    <CardDescription>
                        Manage contact details displayed in the footer and contact page
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Address */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <Label htmlFor="address" className="text-base font-semibold">Address</Label>
                        </div>
                        <div className="space-y-2">
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Enter your business address"
                            />
                            <Input
                                id="address-link"
                                value={addressLink}
                                onChange={(e) => setAddressLink(e.target.value)}
                                placeholder="Google Maps link (optional)"
                                type="url"
                            />
                            <p className="text-xs text-muted-foreground">
                                Add a Google Maps link to make the address clickable
                            </p>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-primary" />
                            <Label htmlFor="phone" className="text-base font-semibold">Phone Number</Label>
                        </div>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter phone number"
                            type="tel"
                        />
                        <p className="text-xs text-muted-foreground">
                            Format: +213 XXX XX XX XX or local format
                        </p>
                    </div>

                    {/* Email */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-primary" />
                            <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
                        </div>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter email address"
                            type="email"
                        />
                    </div>

                    {/* Preview Section */}
                    <div className="border-t pt-6">
                        <h4 className="font-semibold mb-4">Preview</h4>
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                            <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                    {addressLink ? (
                                        <a
                                            href={addressLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm hover:text-primary transition-colors"
                                        >
                                            {address || 'No address set'}
                                        </a>
                                    ) : (
                                        <span className="text-sm">{address || 'No address set'}</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                                <a href={`tel:${phone}`} className="text-sm hover:text-primary transition-colors">
                                    {phone || 'No phone number set'}
                                </a>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                                <a href={`mailto:${email}`} className="text-sm hover:text-primary transition-colors">
                                    {email || 'No email set'}
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Update Button */}
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleUpdate}>
                            Save Contact Information
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContactCMS;
