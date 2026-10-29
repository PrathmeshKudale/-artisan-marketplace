"use client";

import { useState } from "react";
import { AnimatedIndicatorNavbar } from "@/components/navbars/animated-indicator-navbar";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, DollarSign, Package, TrendingUp, Wallet, Download, CreditCard } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Types for bank details form
interface BankDetailsForm {
  accountHolderName: string;
  accountNumber: string;
  confirmAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName: string;
  accountType: "savings" | "current";
}

// Sample artisan earnings data
const artisanEarnings = {
  totalEarnings: 45750,
  availableBalance: 23400,
  pendingClearance: 8500,
  totalWithdrawn: 13850,
  recentSales: [
    { id: 1, artwork: "Madhubani Painting", amount: 4500, date: "2024-01-15", status: "cleared" },
    { id: 2, artwork: "Blue Pottery Bowl", amount: 2200, date: "2024-01-12", status: "cleared" },
    { id: 3, artwork: "Warli Art Canvas", amount: 3200, date: "2024-01-10", status: "pending" },
    { id: 4, artwork: "Kalamkari Fabric", amount: 5600, date: "2024-01-08", status: "cleared" },
    { id: 5, artwork: "Pattachitra Scroll", amount: 3800, date: "2024-01-05", status: "cleared" }
  ],
  monthlyGrowth: 15.2
};

export default function ArtisanDashboardPage() {
  const { user } = useAuth();
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const [withdrawalAmount, setWithdrawalAmount] = useState("");

  const form = useForm<BankDetailsForm>({
    defaultValues: {
      accountHolderName: "",
      accountNumber: "",
      confirmAccountNumber: "",
      ifscCode: "",
      bankName: "",
      branchName: "",
      accountType: "savings"
    }
  });

  const onSubmit = (data: BankDetailsForm) => {
    // Validate account numbers match
    if (data.accountNumber !== data.confirmAccountNumber) {
      form.setError("confirmAccountNumber", {
        type: "manual",
        message: "Account numbers do not match"
      });
      return;
    }

    // Here you would normally send the data to your backend
    console.log("Withdrawal request:", {
      ...data,
      amount: parseFloat(withdrawalAmount),
      timestamp: new Date().toISOString()
    });

    // Show success message and close dialog
    alert(`Withdrawal request of ₹${withdrawalAmount} submitted successfully! You will receive the amount in 3-5 business days.`);
    setIsWithdrawalDialogOpen(false);
    form.reset();
    setWithdrawalAmount("");
  };

  return (
    <>
      <AnimatedIndicatorNavbar />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard & Statistics</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{artisanEarnings.totalEarnings.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">All time earnings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <Wallet className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">₹{artisanEarnings.availableBalance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Ready for withdrawal</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Clearance</CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">₹{artisanEarnings.pendingClearance.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Processing payments</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">+{artisanEarnings.monthlyGrowth}%</div>
                <p className="text-xs text-muted-foreground">vs last month</p>
              </CardContent>
            </Card>
          </div>

          {/* Earnings Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    Recent Sales
                    <Badge variant="outline">{artisanEarnings.recentSales.length} transactions</Badge>
                  </CardTitle>
                  <CardDescription>
                    Track your recent artwork sales and payment status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {artisanEarnings.recentSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{sale.artwork}</p>
                          <p className="text-sm text-gray-500">{sale.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₹{sale.amount.toLocaleString()}</p>
                          <Badge
                            variant={sale.status === "cleared" ? "default" : "secondary"}
                            className={sale.status === "cleared" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}
                          >
                            {sale.status === "cleared" ? "Cleared" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {/* Withdrawal Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Withdraw Funds
                  </CardTitle>
                  <CardDescription>
                    Transfer your earnings to your bank account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="text-center">
                      <p className="text-sm text-green-700 mb-1">Available Balance</p>
                      <p className="text-2xl font-bold text-green-800">₹{artisanEarnings.availableBalance.toLocaleString()}</p>
                    </div>
                  </div>

                  <Dialog open={isWithdrawalDialogOpen} onOpenChange={setIsWithdrawalDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={artisanEarnings.availableBalance <= 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Withdraw Funds
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                      <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>
                          Enter your bank details to withdraw ₹{artisanEarnings.availableBalance.toLocaleString()} to your account.
                        </DialogDescription>
                      </DialogHeader>

                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                              <Label htmlFor="withdrawalAmount">Withdrawal Amount</Label>
                              <Input
                                id="withdrawalAmount"
                                type="number"
                                placeholder="Enter amount"
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                max={artisanEarnings.availableBalance}
                                min="1"
                                required
                              />
                              <p className="text-xs text-gray-500 mt-1">
                                Maximum: ₹{artisanEarnings.availableBalance.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <Separator />

                          <div className="space-y-4">
                            <h4 className="font-medium">Bank Account Details</h4>

                            <FormField
                              control={form.control}
                              name="accountHolderName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Account Holder Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter full name as per bank records" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="accountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Enter account number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="confirmAccountNumber"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm Account Number</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Re-enter account number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="ifscCode"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>IFSC Code</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., HDFC0000123" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="accountType"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Account Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Select account type" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="savings">Savings Account</SelectItem>
                                        <SelectItem value="current">Current Account</SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <FormField
                                control={form.control}
                                name="bankName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Bank Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., HDFC Bank" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="branchName"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Branch Name</FormLabel>
                                    <FormControl>
                                      <Input placeholder="e.g., Connaught Place" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>

                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsWithdrawalDialogOpen(false)}
                            >
                              Cancel
                            </Button>
                            <Button type="submit" className="bg-green-600 hover:bg-green-700">
                              Submit Withdrawal Request
                            </Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Withdrawn</span>
                    <span className="font-medium">₹{artisanEarnings.totalWithdrawn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">This Month Sales</span>
                    <span className="font-medium text-green-600">+{artisanEarnings.monthlyGrowth}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Processing Time</span>
                    <span className="font-medium">3-5 days</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
