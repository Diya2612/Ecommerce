import * as motion from 'motion/react-client';
import { Check, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { getAMCPlans } from '@/lib/data/amc';

// ============================================================================
// AMC Plans Page - Server Component
// ============================================================================
// Server-rendered Annual Maintenance Contract plans with SSR animations

export default async function AMCPlansPage() {
  // Server-side data fetching
  const plans = await getAMCPlans();

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen py-32">
      <div className="container mx-auto px-4 md:px-6">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16 space-y-4"
        >
          <Badge className="bg-[#31CDD4]/20 text-[#008A90] hover:bg-[#31CDD4]/30 px-4 py-1.5 text-sm font-bold rounded-full uppercase tracking-wider">
            Annual Maintenance Contracts
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-[#1C2A54] dark:text-white">
            Protect Your Purity.
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Choose a plan that guarantees clean water all year round. Expert service, genuine parts, and zero stress.
          </p>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`relative border-2 flex flex-col h-full ${plan.popular
                    ? 'border-[#31CDD4] shadow-xl scale-105 z-10'
                    : 'border-gray-100 dark:border-slate-800 hover:border-blue-200 dark:hover:border-slate-700'
                  } transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#31CDD4] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                <CardHeader className={`${plan.color} rounded-t-xl pb-8`}>
                  <CardTitle className="text-2xl font-bold text-[#1C2A54] dark:text-white mb-2">
                    {plan.name}
                  </CardTitle>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#1C2A54] dark:text-white">{plan.price}</span>
                    <span className="text-gray-500 dark:text-gray-400 font-medium">{plan.period}</span>
                  </div>
                  <CardDescription className="text-gray-600 dark:text-gray-300 mt-2 text-base">
                    {plan.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pt-8 grow">
                  <div className="space-y-4">
                    <p className="font-semibold text-[#1C2A54] dark:text-white text-sm uppercase tracking-wide">
                      What's Included
                    </p>
                    <ul className="space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {plan.notIncluded.length > 0 && (
                      <>
                        <div className="h-px bg-gray-100 dark:bg-slate-800 my-4" />
                        <p className="font-semibold text-gray-400 text-sm uppercase tracking-wide">
                          Not Included
                        </p>
                        <ul className="space-y-3">
                          {plan.notIncluded.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 text-gray-400">
                              <div className="w-5 h-5 rounded-full bg-red-50 dark:bg-red-900/10 flex items-center justify-center shrink-0 mt-0.5">
                                <X className="w-3 h-3 text-red-400" />
                              </div>
                              <span className="text-sm">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>

                <CardFooter className="pb-8">
                  <Button
                    className={`w-full h-12 text-lg font-bold rounded-xl shadow-lg transition-all ${plan.popular
                        ? 'bg-[#31CDD4] hover:bg-[#28b0b6] text-[#1C2A54] shadow-[#31CDD4]/20'
                        : 'bg-[#1C2A54] hover:bg-[#2a3c70] text-white'
                      }`}
                    asChild
                  >
                    <Link href="/contact">
                      Choose {plan.name} <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-24 text-center"
        >
          <h2 className="text-2xl font-bold text-[#1C2A54] dark:text-white mb-6">
            Have questions about AMC?
          </h2>
          <div className="flex justify-center gap-4">
            <Button variant="outline" className="rounded-full h-12 px-8 border-2" asChild>
              <Link href="/faq">View FAQs</Link>
            </Button>
            <Button variant="ghost" className="rounded-full h-12 px-8 text-[#31CDD4]" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
