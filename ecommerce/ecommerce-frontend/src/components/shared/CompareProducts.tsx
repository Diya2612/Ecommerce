"use client";
import React, { useState } from 'react';
import { Check, X, Plus, Trash2, RefreshCw, ChevronRight, ChevronLeft, Search, ShoppingCart } from 'lucide-react';
import Image from "next/image";
import { Button } from '../ui/button';
import { cn } from '@/utils/utils';
import { motion, AnimatePresence } from 'motion/react';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Input } from '../ui/input';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

import { useCart } from '@/hooks/useCart';
import { toast } from 'sonner';
import { ComparisonProduct } from '@/types/home';

const ATTRIBUTES = [
  { key: 'technology', label: 'Purification Technology' },
  { key: 'storage', label: 'Storage Capacity' },
  { key: 'stages', label: 'Filtration Stages' },
  { key: 'mineral', label: 'Mineral Enhancer', type: 'boolean' },
  { key: 'display', label: 'Smart LED Display', type: 'boolean' },
  { key: 'power', label: 'Power Consumption' },
  { key: 'warranty', label: 'Warranty' },
  { key: 'dimensions', label: 'Dimensions' },
  { key: 'certification', label: 'Certifications' },
];

interface CompareProductsProps {
  products: ComparisonProduct[];
}

export function CompareProducts({ products: availableProducts }: CompareProductsProps) {
  // --- State ---
  const [selectedProducts, setSelectedProducts] = useState<ComparisonProduct[]>([]);
  const [showDifferences, setShowDifferences] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null); // For adding/replacing specific slot
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileCarouselIndex, setMobileCarouselIndex] = useState(0); // For mobile carousel
  const { addToCart } = useCart();

  // --- Actions ---

  const handleAddProduct = (index: number) => {
    setActiveSlotIndex(index);
    setIsAddModalOpen(true);
    setSearchQuery('');
  };

  const handleSelectProduct = (product: ComparisonProduct) => {
    if (activeSlotIndex !== null) {
      const newProducts = [...selectedProducts];
      if (activeSlotIndex < selectedProducts.length) {
        newProducts[activeSlotIndex] = product;
      } else {
        newProducts.push(product);
      }
      setSelectedProducts(newProducts);
      setIsAddModalOpen(false);
      setActiveSlotIndex(null);
      setMobileCarouselIndex(0);
    }
  };

  const handleRemoveProduct = (index: number) => {
    const newProducts = [...selectedProducts];
    newProducts.splice(index, 1);
    setSelectedProducts(newProducts);
    if (mobileCarouselIndex >= newProducts.length && mobileCarouselIndex > 0) {
      setMobileCarouselIndex(mobileCarouselIndex - 1);
    }
  };

  const handleClearAll = () => {
    setSelectedProducts([]);
    setIsClearModalOpen(false);
    setMobileCarouselIndex(0);
  };

  const handleAddToCart = (product: ComparisonProduct) => {
    addToCart({
      productId: String(product.id),
      quantity: 1,
      variant: 'Standard',
      preventDuplicates: true
    });
  };

  const handlePrevSlide = () => {
    setMobileCarouselIndex((prev) => (prev === 0 ? selectedProducts.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setMobileCarouselIndex((prev) => (prev === selectedProducts.length - 1 ? 0 : prev + 1));
  };

  const filteredProducts = availableProducts.filter(p =>
    !selectedProducts.find(sp => sp.id === p.id) &&
    (p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  return (
    <section className="py-16 bg-[#F7F9FB]">
      <div className="container mx-auto px-4 md:px-6">

        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0F2346] mb-4">Compare Models</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Select products to compare features, specs & pricing side-by-side.
          </p>
        </div>

        {/* Controls */}
        <AnimatePresence>
          {selectedProducts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center justify-between gap-4 mb-8 sticky top-20 z-20 bg-[#F7F9FB]/90 backdrop-blur-sm py-4"
            >
              <div className="flex items-center gap-6">
                {selectedProducts.length > 1 && (
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-xs">
                    <Switch
                      id="diff-mode"
                      checked={showDifferences}
                      onCheckedChange={setShowDifferences}
                    />
                    <Label htmlFor="diff-mode" className="text-sm font-medium text-[#0F2346] cursor-pointer">Highlight Differences</Label>
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                onClick={() => setIsClearModalOpen(true)}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Clear All
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedProducts.length === 0 ? (
          <EmptyState onStart={() => handleAddProduct(0)} />
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden lg:block relative overflow-x-auto pb-12">
              <div className={cn(
                "grid gap-6",
                selectedProducts.length > 1 ? "min-w-[800px]" : "w-full",
                selectedProducts.length === 1 ? "grid-cols-1 md:grid-cols-3" :
                  "grid-cols-[200px_1fr_1fr_1fr]"
              )}>

                {selectedProducts.length > 1 && (
                  <div className="flex flex-col pt-[340px]">
                    {ATTRIBUTES.map((attr, i) => (
                      <div key={attr.key} className={cn(
                        "h-16 flex items-center font-medium text-sm text-gray-500 px-4",
                        i % 2 === 0 ? "bg-white/50" : "bg-transparent"
                      )}>
                        {attr.label}
                      </div>
                    ))}
                    <div className="h-20 flex items-center font-bold text-[#0F2346] px-4 bg-white/50 mt-4 rounded-l-xl">Price</div>
                    <div className="h-16 px-4" />
                  </div>
                )}

                {Array.from({ length: 3 }).map((_, slotIndex) => {
                  const product = selectedProducts[slotIndex];

                  return (
                    <div key={slotIndex} className={cn(
                      "flex flex-col transition-all duration-500"
                    )}>
                      {product ? (
                        <>
                          <div className="bg-white rounded-2xl shadow-xs border border-gray-100 h-[320px] flex flex-col relative group hover:shadow-md transition-shadow mb-4 overflow-hidden">
                            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white shadow-xs" onClick={() => handleAddProduct(slotIndex)}>
                                <RefreshCw className="w-4 h-4 text-gray-600" />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full bg-red-50/90 hover:bg-red-100 shadow-xs" onClick={() => handleRemoveProduct(slotIndex)}>
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>

                            <div className="h-[200px] w-full flex items-center justify-center relative">
                              <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover mix-blend-multiply transition-transform duration-700 group-hover:scale-105"
                              />
                            </div>

                            <div className="mt-auto text-center p-5">
                              {product.bestValue && <Badge className="bg-[#31CDD4] hover:bg-[#2bbbc1] mb-2">Best Value</Badge>}
                              <h3 className="font-bold text-lg text-[#0F2346] mb-1 line-clamp-1">{product.name}</h3>
                              <p className="text-sm text-gray-500">{product.specs.technology}</p>
                            </div>
                          </div>

                          {selectedProducts.length > 1 ? (
                            <div className="flex flex-col">
                              {ATTRIBUTES.map((attr, i) => {
                                const val = product.specs[attr.key];
                                const isDiff = showDifferences && selectedProducts.some(p => {
                                  const otherVal = p.specs[attr.key];
                                  return otherVal !== val;
                                });

                                return (
                                  <div key={attr.key} className={cn(
                                    "h-16 flex items-center justify-center text-sm px-4 border-l border-dashed border-gray-200",
                                    i % 2 === 0 ? "bg-white" : "bg-[#F7F9FB]",
                                    isDiff ? "bg-blue-50/50" : ""
                                  )}>
                                    {attr.type === 'boolean' ? (
                                      val ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-300" />
                                    ) : (
                                      <span className={cn("text-center", isDiff ? "font-semibold text-[#1C4E8E]" : "text-gray-700")}>
                                        {String(val || '-')}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}

                              <div className="h-20 flex items-center justify-center bg-white mt-4 border-l border-dashed border-gray-200 rounded-b-xl shadow-xs">
                                <span className="text-2xl font-bold text-[#0F2346]">₹{product.price.toLocaleString()}</span>
                              </div>

                              <div className="mt-8 px-2">
                                <Button
                                  className="w-full bg-[#1C4E8E] hover:bg-[#163a6b] text-white"
                                  onClick={() => handleAddToCart(product)}
                                >
                                  <ShoppingCart className="w-4 h-4 mr-2" /> Add to Cart
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-8 text-center p-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50">
                              <p className="text-gray-500 mb-4">Add another product to compare specifications side-by-side.</p>
                              <Button variant="outline" onClick={() => handleAddProduct(1)}>
                                <Plus className="w-4 h-4 mr-2" /> Add Product
                              </Button>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="h-[320px] bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-6 hover:border-[#31CDD4] hover:bg-blue-50/30 transition-all cursor-pointer group"
                          onClick={() => handleAddProduct(slotIndex)}>
                          <div className="w-16 h-16 rounded-full bg-gray-100 group-hover:bg-white flex items-center justify-center mb-4 transition-colors shadow-xs">
                            <Plus className="w-8 h-8 text-gray-400 group-hover:text-[#31CDD4]" />
                          </div>
                          <span className="font-semibold text-gray-500 group-hover:text-[#1C4E8E]">Add Product</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Carousel View */}
            <div className="lg:hidden relative">
              <div className="relative overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `-${mobileCarouselIndex * 100}%` }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                  {selectedProducts.map((product, index) => (
                    <div key={product.id} className="w-full shrink-0 px-4">
                      <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden mb-6">
                        <div className="relative">
                          <div className="h-[240px] w-full flex items-center justify-center bg-gray-50 relative">
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              className="object-cover mix-blend-multiply"
                            />
                          </div>
                          <div className="absolute top-4 right-4 flex gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-full bg-white/95 hover:bg-white shadow-xs"
                              onClick={() => handleAddProduct(index)}
                            >
                              <RefreshCw className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-9 w-9 rounded-full bg-red-50/95 hover:bg-red-100 shadow-xs"
                              onClick={() => handleRemoveProduct(index)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>

                        <div className="p-6">
                          {/* ... Mobile Product Content ... (similar logic) */}
                          <div className="text-center mb-6">
                            {product.bestValue && (
                              <Badge className="bg-[#31CDD4] hover:bg-[#2bbbc1] mb-3">Best Value</Badge>
                            )}
                            <h3 className="font-bold text-xl text-[#0F2346] mb-2">{product.name}</h3>
                            <p className="text-sm text-gray-500">{product.specs.technology}</p>
                          </div>

                          <div className="space-y-3 mb-6">
                            {ATTRIBUTES.map((attr, i) => {
                              const val = product.specs[attr.key];
                              return (
                                <div
                                  key={attr.key}
                                  className={cn(
                                    "flex items-center justify-between p-3 rounded-lg",
                                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                                  )}
                                >
                                  <span className="text-sm font-medium text-gray-600">{attr.label}</span>
                                  <span className="text-sm font-semibold text-[#0F2346]">
                                    {attr.type === 'boolean' ? (
                                      val ? <Check className="w-5 h-5 text-green-500" /> : <X className="w-5 h-5 text-gray-300" />
                                    ) : (
                                      String(val || '-')
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="bg-linear-to-r from-blue-50 to-teal-50 rounded-xl p-4 mb-4 text-center">
                            <p className="text-sm text-gray-600 mb-1">Price</p>
                            <p className="text-3xl font-bold text-[#0F2346]">₹{product.price.toLocaleString()}</p>
                          </div>

                          <div className="mt-8">
                            <Button
                              className="w-full bg-[#1C4E8E] hover:bg-[#163a6b] text-white h-12"
                              onClick={() => handleAddToCart(product)}
                            >
                              <ShoppingCart className="w-5 h-5 mr-2" /> Add to Cart
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </div>

              {selectedProducts.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-0 top-[120px] -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                    onClick={handlePrevSlide}
                  >
                    <ChevronLeft className="w-6 h-6 text-[#1C4E8E]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-[120px] -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/95 hover:bg-white shadow-lg border border-gray-200"
                    onClick={handleNextSlide}
                  >
                    <ChevronRight className="w-6 h-6 text-[#1C4E8E]" />
                  </Button>
                </>
              )}

              {selectedProducts.length > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  {selectedProducts.map((_, index) => (
                    <button
                      key={index}
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        index === mobileCarouselIndex
                          ? "w-8 bg-[#1C4E8E]"
                          : "w-2 bg-gray-300 hover:bg-gray-400"
                      )}
                      onClick={() => setMobileCarouselIndex(index)}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              {selectedProducts.length < 3 && (
                <div className="mt-8 text-center">
                  <Button
                    variant="outline"
                    className="border-2 border-dashed border-[#31CDD4] text-[#1C4E8E] hover:bg-blue-50"
                    onClick={() => handleAddProduct(selectedProducts.length)}
                  >
                    <Plus className="w-5 h-5 mr-2" /> Add Another Product
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Select Product</DialogTitle>
              <DialogDescription>
                Search and select a product to add to your comparison table.
              </DialogDescription>
            </DialogHeader>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="flex-1 overflow-y-auto -mx-6 px-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
                {filteredProducts.length > 0 ? filteredProducts.map(product => (
                  <div
                    key={product.id}
                    className="flex flex-col p-4 border rounded-xl hover:border-[#31CDD4] hover:bg-blue-50/30 cursor-pointer transition-all group overflow-hidden"
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg mb-3 overflow-hidden p-4 relative">
                      <Image src={product.image} alt={product.name} fill className="object-contain mix-blend-multiply" />
                    </div>
                    <h4 className="font-semibold text-[#0F2346] group-hover:text-[#1C4E8E] line-clamp-2">{product.name}</h4>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm font-medium text-gray-500">₹{product.price.toLocaleString()}</span>
                      <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                    </div>
                  </div>
                )) : (
                  <div className="col-span-full text-center py-12 text-gray-500">
                    No matching products found.
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear Comparison?</DialogTitle>
              <DialogDescription>
                Are you sure you want to remove all products from the comparison?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsClearModalOpen(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleClearAll}>Clear All</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </section>
  );
}

function EmptyState({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="aspect-3/4 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center p-8 hover:border-[#31CDD4] hover:bg-blue-50/30 transition-all cursor-pointer group bg-white"
          onClick={onStart}
        >
          <div className="w-20 h-20 rounded-full bg-gray-50 group-hover:bg-white flex items-center justify-center mb-6 transition-colors shadow-xs">
            <Plus className="w-10 h-10 text-gray-300 group-hover:text-[#31CDD4]" />
          </div>
          <h3 className="font-bold text-lg text-gray-400 group-hover:text-[#1C4E8E]">Add Product</h3>
          {i === 0 && <p className="text-sm text-center text-gray-400 mt-2">Start here</p>}
        </motion.div>
      ))}
    </div>
  );
}
