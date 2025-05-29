
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Sparkles, Star, ArrowRight, Check, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Credits = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const creditPackages = [
    {
      name: "Starter",
      credits: 50,
      price: 9.99,
      features: [
        "Generate up to 10 videos",
        "Access to basic templates",
        "720p video quality"
      ],
      popular: false
    },
    {
      name: "Pro",
      credits: 200,
      price: 29.99,
      features: [
        "Generate up to 40 videos",
        "Access to all templates",
        "1080p video quality",
        "Priority processing"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      credits: 500,
      price: 59.99,
      features: [
        "Generate up to 100 videos",
        "Access to all templates",
        "4K video quality",
        "Priority processing",
        "Custom branding options"
      ],
      popular: false
    }
  ];

  const handlePurchase = (packageName: string, price: number) => {
    setLoading(true);
    
    // In a real implementation, this would connect to a Stripe checkout session
    // For now, we'll simulate the process
    toast({
      title: "Redirecting to payment",
      description: `Setting up payment for ${packageName} package`,
    });
    
    // Simulate a payment process
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Payment successful!",
        description: "Your credits have been added to your account.",
      });
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full mb-4">
          <CreditCard className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Credits System</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Purchase credits to generate videos, create clips, and use all our AI features
        </p>
      </div>
      
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg mb-8">
        <div className="flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-primary" />
          <span className="font-medium">Current Balance: 25 credits</span>
        </div>
        <Button size="sm" variant="outline">View Transaction History</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {creditPackages.map((pkg) => (
          <Card key={pkg.name} className={`relative ${pkg.popular ? 'border-primary' : ''}`}>
            {pkg.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground text-xs font-medium py-1 px-3 rounded-full flex items-center">
                <Star className="h-3 w-3 mr-1 fill-current" /> Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{pkg.name}</CardTitle>
              <CardDescription>
                <span className="text-2xl font-bold">${pkg.price}</span>
                <span className="text-muted-foreground"> one-time payment</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4 text-lg font-semibold text-primary">
                <Sparkles className="h-5 w-5 mr-2" />
                {pkg.credits} Credits
              </div>
              <ul className="space-y-2">
                {pkg.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-4 w-4 mr-2 mt-1 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className={`w-full ${pkg.popular ? 'bg-gradient-purple-blue hover:opacity-90' : ''}`}
                onClick={() => handlePurchase(pkg.name, pkg.price)}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Purchase Credits'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      <div className="mt-8 p-4 border border-border rounded-lg flex items-start">
        <Info className="h-5 w-5 mr-3 text-blue-500 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="font-medium mb-1">How credits work</h3>
          <p className="text-sm text-muted-foreground">
            Credits are consumed when you generate videos or use AI features. Different operations use different amounts of credits depending on complexity and length. All purchased credits never expire and can be used at any time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Credits;
