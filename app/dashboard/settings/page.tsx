'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, Mail, Loader2, User, Bot } from 'lucide-react';

import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { saveTelegramSettings, testTelegramConnection } from '@/lib/actions/telegram-settings-actions';
import { toast } from 'sonner';

// Form schema for notification settings
const notificationFormSchema = z.object({
    emailNotifications: z.boolean(),
    telegramNotifications: z.boolean(),
    newInvoiceNotification: z.boolean(),
    paymentReceivedNotification: z.boolean(),
    invoiceOverdueNotification: z.boolean(),
    newTransactionNotification: z.boolean(),
    telegramBotToken: z.string().optional(),
    telegramChatId: z.string().optional(),
    telegramWebhookUrl: z.string().optional(),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Form schema for email settings
const emailFormSchema = z.object({
    senderName: z.string().min(1, 'Sender name is required'),
    senderEmail: z.string().email('Invalid email address'),
    emailHost: z.string().min(1, 'SMTP host is required'),
    emailPort: z.coerce.number().int().positive('Port must be a positive number'),
    emailUser: z.string().min(1, 'SMTP username is required'),
    emailPassword: z.string().min(1, 'SMTP password is required'),
    emailSecure: z.boolean(),
});

type EmailFormValues = z.infer<typeof emailFormSchema>;

// Form schema for profile settings
const profileFormSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email address'),
    company: z.string().optional(),
    walletAddresses: z.array(
        z.object({
            address: z.string().min(1, 'Wallet address is required'),
            chainId: z.number().int().positive(),
            isPrimary: z.boolean(),
        })
    ).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
    const [isSubmittingNotifications, setIsSubmittingNotifications] = useState(false);
    const [isSubmittingEmail, setIsSubmittingEmail] = useState(false);
    const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);

    // Initialize notification settings form
    const notificationForm = useForm<NotificationFormValues>({
        resolver: zodResolver(notificationFormSchema),
        defaultValues: {
            emailNotifications: true,
            telegramNotifications: false,
            newInvoiceNotification: true,
            paymentReceivedNotification: true,
            invoiceOverdueNotification: true,
            newTransactionNotification: true,
            telegramBotToken: '',
            telegramChatId: '',
            telegramWebhookUrl: '',
        },
    });

    // Initialize email settings form
    const emailForm = useForm<EmailFormValues>({
        resolver: zodResolver(emailFormSchema),
        defaultValues: {
            senderName: '',
            senderEmail: '',
            emailHost: '',
            emailPort: 587,
            emailUser: '',
            emailPassword: '',
            emailSecure: true,
        },
    });

    // Initialize profile settings form
    const profileForm = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            name: '',
            email: '',
            company: '',
            walletAddresses: [],
        },
    });

    // Handle notification settings submission
    const onSubmitNotifications = async (data: NotificationFormValues) => {
        try {
            setIsSubmittingNotifications(true);

            // If Telegram notifications are enabled, save Telegram settings
            if (data.telegramNotifications && data.telegramBotToken && data.telegramChatId) {
                // Create form data for saving Telegram settings
                const telegramForm = new FormData();
                telegramForm.append('telegramBotToken', data.telegramBotToken);
                telegramForm.append('telegramChatId', data.telegramChatId);

                // Only add webhook URL if provided
                if (data.telegramWebhookUrl) {
                    telegramForm.append('telegramWebhookUrl', data.telegramWebhookUrl);
                } else {
                    // Use default webhook URL based on window location
                    // This would work in production but not in development
                    const baseUrl = typeof window !== 'undefined'
                        ? `${window.location.protocol}//${window.location.host}`
                        : '';

                    if (baseUrl) {
                        const webhookUrl = `${baseUrl}/api/webhooks/telegram`;
                        telegramForm.append('telegramWebhookUrl', webhookUrl);
                    }
                }

                // Save Telegram settings
                const result = await saveTelegramSettings(telegramForm);

                if (!result.success) {
                    throw new Error(result.error || 'Failed to save Telegram settings');
                }
            }

            // Simulate saving other notification settings
            await new Promise(resolve => setTimeout(resolve, 500));

            toast.success(
                "Notification settings updated",
                { description: 'Your notification settings have been saved successfully.' }
            );
        } catch (error) {
            console.error('Error updating notification settings:', error);

            toast.error(
                'Failed to update notification settings',
                { description: 'There was an error updating your notification settings.' }
            );
        } finally {
            setIsSubmittingNotifications(false);
        }
    };

    // Handle email settings submission
    const onSubmitEmail = async (data: EmailFormValues) => {
        console.log('Email settings submitted:', data);
        try {
            setIsSubmittingEmail(true);

            // Simulate API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(
                'Email settings updated',
                { description: 'Your email settings have been saved successfully.' }
            );
        } catch (error) {
            console.error('Error updating email settings:', error);

            toast.error(
                'Failed to update email settings',
                { description: 'There was an error updating your email settings.' }
            );
        } finally {
            setIsSubmittingEmail(false);
        }
    };

    // Handle profile settings submission
    const onSubmitProfile = async (data: ProfileFormValues) => {
        console.log('Profile settings submitted:', data);
        try {
            setIsSubmittingProfile(true);

            // Simulate API call to save settings
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success(
                'Profile settings updated',
                { description: 'Your profile information has been saved successfully.' }
            );
        } catch (error) {
            console.error('Error updating profile:', error);

            toast.error(
                'Failed to update profile',
                { description: 'There was an error updating your profile information.' }
            );
        } finally {
            setIsSubmittingProfile(false);
        }
    };

    // Toggle Telegram notifications
    const handleTelegramToggle = (checked: boolean) => {
        notificationForm.setValue('telegramNotifications', checked);
    };

    return (
        <div className="space-y-6">
            <DashboardHeader
                title="Settings"
                description="Manage your account settings and preferences."
            />

            <Tabs defaultValue="notifications" className="space-y-6">
                <TabsList>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications" className="space-y-6">
                    <Form {...notificationForm}>
                        <form onSubmit={notificationForm.handleSubmit(onSubmitNotifications)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                    <CardDescription>
                                        Configure how you want to receive notifications.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Notification Channels</h3>

                                        <FormField
                                            control={notificationForm.control}
                                            name="emailNotifications"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base flex items-center">
                                                            <Mail className="mr-2 h-4 w-4" />
                                                            Email Notifications
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Receive notifications via email.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={notificationForm.control}
                                            name="telegramNotifications"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base flex items-center">
                                                            <Bot className="mr-2 h-4 w-4" />
                                                            Telegram Notifications
                                                        </FormLabel>
                                                        <FormDescription>
                                                            Receive real-time notifications via Telegram.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={handleTelegramToggle}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        {notificationForm.watch('telegramNotifications') && (
                                            <div className="space-y-4 rounded-lg border p-4">
                                                <h4 className="font-medium">Telegram Configuration</h4>

                                                <FormField
                                                    control={notificationForm.control}
                                                    name="telegramBotToken"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Bot Token</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter your Telegram bot token" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Create a bot using @BotFather on Telegram and enter the token here.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={notificationForm.control}
                                                    name="telegramChatId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Chat ID</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Enter your Telegram chat ID" {...field} />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Start a chat with your bot and use the /start command to get your Chat ID.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <FormField
                                                    control={notificationForm.control}
                                                    name="telegramWebhookUrl"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Webhook URL</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    placeholder="https://your-domain.com/api/webhooks/telegram"
                                                                    {...field}
                                                                />
                                                            </FormControl>
                                                            <FormDescription>
                                                                Your webhook URL for receiving Telegram updates.
                                                                This should be a publicly accessible URL pointing to your webhook endpoint.
                                                            </FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />

                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={async () => {
                                                            // Create form data for testing connection
                                                            const testForm = new FormData();
                                                            testForm.append('telegramBotToken', notificationForm.getValues('telegramBotToken') || '');
                                                            testForm.append('telegramChatId', notificationForm.getValues('telegramChatId') || '');

                                                            // Call test action
                                                            const result = await testTelegramConnection(testForm);

                                                            if (result.success) {
                                                                toast.success(
                                                                    "Test successful",
                                                                    { description: 'Telegram connection is successful!' }
                                                                );
                                                            } else {
                                                                toast.error(
                                                                    "Test failed",
                                                                    { description: result.error || 'Failed to connect to Telegram.' }
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Test Connection
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <h3 className="text-lg font-medium">Notification Types</h3>

                                        <FormField
                                            control={notificationForm.control}
                                            name="newInvoiceNotification"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">New Invoice</FormLabel>
                                                        <FormDescription>
                                                            Get notified when a new invoice is created.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={notificationForm.control}
                                            name="paymentReceivedNotification"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Payment Received</FormLabel>
                                                        <FormDescription>
                                                            Get notified when a payment is received for an invoice.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={notificationForm.control}
                                            name="invoiceOverdueNotification"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">Invoice Overdue</FormLabel>
                                                        <FormDescription>
                                                            Get notified when an invoice becomes overdue.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={notificationForm.control}
                                            name="newTransactionNotification"
                                            render={({ field }) => (
                                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                                                    <div className="space-y-0.5">
                                                        <FormLabel className="text-base">New Transaction</FormLabel>
                                                        <FormDescription>
                                                            Get notified when a new transaction is detected.
                                                        </FormDescription>
                                                    </div>
                                                    <FormControl>
                                                        <Switch
                                                            checked={field.value}
                                                            onCheckedChange={field.onChange}
                                                        />
                                                    </FormControl>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmittingNotifications}>
                                        {isSubmittingNotifications ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Bell className="mr-2 h-4 w-4" />
                                                Save Notification Settings
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="email" className="space-y-6">
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Email Settings</CardTitle>
                                    <CardDescription>
                                        Configure your email server for sending invoices and notifications.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={emailForm.control}
                                            name="senderName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sender Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your Name or Company" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Name displayed as the sender of emails.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={emailForm.control}
                                            name="senderEmail"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Sender Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="you@example.com" {...field} />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Email address emails will be sent from.
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <h3 className="text-lg font-medium">SMTP Server Settings</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Configure your SMTP server for sending emails.
                                    </p>

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={emailForm.control}
                                            name="emailHost"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Host</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="smtp.example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={emailForm.control}
                                            name="emailPort"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Port</FormLabel>
                                                    <FormControl>
                                                        <Input type="number" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={emailForm.control}
                                            name="emailUser"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Username</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="username" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={emailForm.control}
                                            name="emailPassword"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>SMTP Password</FormLabel>
                                                    <FormControl>
                                                        <Input type="password" placeholder="••••••••" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={emailForm.control}
                                        name="emailSecure"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                    />
                                                </FormControl>
                                                <div className="space-y-1 leading-none">
                                                    <FormLabel>Use Secure Connection (TLS/SSL)</FormLabel>
                                                    <FormDescription>
                                                        Use a secure connection when connecting to the SMTP server.
                                                    </FormDescription>
                                                </div>
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmittingEmail}>
                                        {isSubmittingEmail ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Save Email Settings
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="profile" className="space-y-6">
                    <Form {...profileForm}>
                        <form onSubmit={profileForm.handleSubmit(onSubmitProfile)} className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Profile Information</CardTitle>
                                    <CardDescription>
                                        Update your personal and business information.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                        <FormField
                                            control={profileForm.control}
                                            name="name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={profileForm.control}
                                            name="email"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input type="email" placeholder="you@example.com" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={profileForm.control}
                                            name="company"
                                            render={({ field }) => (
                                                <FormItem className="col-span-1 sm:col-span-2">
                                                    <FormLabel>Company (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Your Company Name" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <Separator />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-medium">Wallet Addresses</h3>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const currentAddresses = profileForm.getValues('walletAddresses') || [];
                                                    profileForm.setValue('walletAddresses', [
                                                        ...currentAddresses,
                                                        { address: '', chainId: 1, isPrimary: currentAddresses.length === 0 }
                                                    ]);
                                                }}
                                            >
                                                Add Wallet
                                            </Button>
                                        </div>

                                        {/* Wallet addresses will be dynamically rendered here */}
                                        <div className="space-y-4">
                                            {profileForm.watch('walletAddresses')?.map((_, index) => (
                                                <div key={index} className="rounded-lg border p-4">
                                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                                                        <div className="sm:col-span-2">
                                                            <FormField
                                                                control={profileForm.control}
                                                                name={`walletAddresses.${index}.address`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Wallet Address {index + 1}</FormLabel>
                                                                        <FormControl>
                                                                            <Input placeholder="0x..." {...field} />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <div>
                                                            <FormField
                                                                control={profileForm.control}
                                                                name={`walletAddresses.${index}.chainId`}
                                                                render={({ field }) => (
                                                                    <FormItem>
                                                                        <FormLabel>Chain ID</FormLabel>
                                                                        <FormControl>
                                                                            <Input
                                                                                type="number"
                                                                                {...field}
                                                                                onChange={(e) => field.onChange(parseInt(e.target.value))}
                                                                            />
                                                                        </FormControl>
                                                                        <FormMessage />
                                                                    </FormItem>
                                                                )}
                                                            />
                                                        </div>

                                                        <div className="flex items-center space-x-2">
                                                            <FormField
                                                                control={profileForm.control}
                                                                name={`walletAddresses.${index}.isPrimary`}
                                                                render={({ field }) => (
                                                                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                                                        <FormControl>
                                                                            <Switch
                                                                                checked={field.value}
                                                                                onCheckedChange={field.onChange}
                                                                            />
                                                                        </FormControl>
                                                                        <div className="space-y-1 leading-none">
                                                                            <FormLabel>Primary Address</FormLabel>
                                                                        </div>
                                                                    </FormItem>
                                                                )}
                                                            />

                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="ml-auto text-destructive"
                                                                onClick={() => {
                                                                    const currentAddresses = profileForm.getValues('walletAddresses') || [];
                                                                    profileForm.setValue(
                                                                        'walletAddresses',
                                                                        currentAddresses.filter((_, i) => i !== index)
                                                                    );
                                                                }}
                                                            >
                                                                Remove
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={isSubmittingProfile}>
                                        {isSubmittingProfile ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <User className="mr-2 h-4 w-4" />
                                                Save Profile
                                            </>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </form>
                    </Form>
                </TabsContent>
            </Tabs>
        </div>
    );
}