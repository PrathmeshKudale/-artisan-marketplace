"use client";

import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { User as UserIcon, Mail, Badge } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MessageInbox from "@/components/messaging/message-inbox";
import MyArtworks from "@/components/artisan/my-artworks";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <AnimatedIndicatorNavbar />
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <p className="text-center text-gray-600">Please sign in to view your profile.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className={`container mx-auto px-4 ${user.type === 'artisan' ? 'max-w-7xl' : 'max-w-2xl'}`}>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

          <div className={`${user.type === 'artisan' ? 'grid grid-cols-1 lg:grid-cols-3 gap-8' : ''}`}>
            <Card className={user.type === 'artisan' ? 'lg:col-span-1' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className={`text-lg ${user.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'}`}>
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-xl font-semibold">{user.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={`${user.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-orange-800'} border-0`}>
                        {user.type === 'user' ? 'Customer' : 'Artisan'}
                      </Badge>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{user.email || user.phone || "Phone verified account"}</span>
                </div>

                <div className="pt-4">
                  <h3 className="font-semibold mb-2">Account Type</h3>
                  <p className="text-sm text-muted-foreground">
                    {user.type === 'user'
                      ? 'You are a customer. You can browse and purchase beautiful handcrafted items from our artisan marketplace.'
                      : 'You are an artisan. You can sell your artwork, manage your inventory, and track your business statistics.'
                    }
                  </p>
                </div>

                {user.type === 'artisan' && (
                  <div className="pt-4 border-t">
                    <h3 className="font-semibold mb-2">Artisan Features</h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Add and manage your artwork listings</li>
                      <li>• Track sales and revenue statistics</li>
                      <li>• Manage customer communications</li>
                      <li>• Build your brand presence</li>
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Artisan Features */}
            {user.type === 'artisan' && (
              <div className="lg:col-span-2 space-y-8">
                {/* My Artworks Section */}
                <MyArtworks />
                
                {/* Message Inbox */}
                <MessageInbox />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
