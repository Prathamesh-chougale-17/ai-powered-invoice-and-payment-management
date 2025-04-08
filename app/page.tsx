import Link from 'next/link';
import Image from 'next/image';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Wallet,
  CreditCard,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  AI-Powered Finance
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl">
                  Invoice Management with <span className="text-primary">AI Assistance</span>
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Generate invoices, track transactions, and manage payments—all with the help of AI and blockchain technology.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="inline-flex h-10 items-center justify-center">
                    <Link href="/dashboard">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="inline-flex h-10 items-center justify-center">
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="mx-auto lg:mx-0 relative aspect-video overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 z-10" />
                <Image
                  src="/placeholder.svg"
                  alt="Dashboard Preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything You Need for Financial Management
                </h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Our platform combines AI intelligence with blockchain security to streamline your invoicing and payment processes.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">AI-Generated Invoices</h3>
                  <p className="mt-2 text-muted-foreground">
                    Describe your service or product, and our AI will generate a professional invoice for you.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Natural language invoice generation</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Smart item and pricing suggestions</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Customizable templates</span>
                    </li>
                  </ul>
                </div>
                <Button asChild variant="ghost" className="mt-6" size="sm">
                  <Link href="/dashboard/invoices/new">
                    Try It Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Wallet Integration</h3>
                  <p className="mt-2 text-muted-foreground">
                    Connect your crypto wallet to seamlessly track and process payments across multiple blockchains.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Multiple blockchain support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Secure connection with Rainbow Kit</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Real-time transaction monitoring</span>
                    </li>
                  </ul>
                </div>
                <Button asChild variant="ghost" className="mt-6" size="sm">
                  <Link href="/dashboard/transactions">
                    View Transactions
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-col justify-between rounded-lg border bg-card p-6">
                <div>
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold">Direct Payments</h3>
                  <p className="mt-2 text-muted-foreground">
                    Send and receive payments directly through the platform with blockchain verification.
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">One-click payment processing</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Multiple token support</span>
                    </li>
                    <li className="flex items-center">
                      <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                      <span className="text-sm">Automatic invoice reconciliation</span>
                    </li>
                  </ul>
                </div>
                <Button asChild variant="ghost" className="mt-6" size="sm">
                  <Link href="/dashboard/payments">
                    Manage Payments
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container px-4 md:px-6">
            <div className="mx-auto max-w-3xl space-y-4 text-center">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">
                Ready to Streamline Your Invoicing?
              </h2>
              <p className="text-gray-500 md:text-xl/relaxed dark:text-gray-400">
                Join thousands of businesses already using our platform to manage their finances with AI assistance.
              </p>
              <div className="mx-auto flex flex-col gap-2 min-[400px]:flex-row justify-center pt-4">
                <Button asChild size="lg" className="inline-flex h-10 items-center justify-center">
                  <Link href="/dashboard">
                    Get Started for Free
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="inline-flex h-10 items-center justify-center">
                  <Link href="#features">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container px-4 py-8 md:px-6 md:py-12">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="flex flex-col items-center gap-2 md:items-start md:gap-1">
              <div className="flex items-center gap-2">
                <Wallet className="h-6 w-6" />
                <span className="font-bold">AI Finance</span>
              </div>
              <p className="text-sm text-muted-foreground">
                © 2025 AI Finance. All rights reserved.
              </p>
            </div>
            <div className="flex gap-4">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}