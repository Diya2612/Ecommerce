import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Plus, GripVertical, X, Package } from 'lucide-react';
import type { BundleItem } from '../types/bundle.types';
import { productCatalog } from '../data/bundle.constants';

interface BundleItemsProps {
    items: BundleItem[];
    onAddProduct: (product: any) => void;
    onRemoveProduct: (id: string) => void;
    onUpdateItem: (id: string, field: keyof BundleItem, value: any) => void;
}

export const BundleItems = ({
    items,
    onAddProduct,
    onRemoveProduct,
    onUpdateItem
}: BundleItemsProps) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">Bundle Items</h2>
                    <p className="text-sm text-slate-600 mt-1">Add products to this bundle</p>
                </div>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Plus className="size-4 mr-2" />
                            Add Product
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0" align="end">
                        <Command>
                            <CommandInput placeholder="Search products..." />
                            <CommandList>
                                <CommandEmpty>No products found.</CommandEmpty>
                                <CommandGroup>
                                    {productCatalog.map((product) => (
                                        <CommandItem
                                            key={product.id}
                                            onSelect={() => onAddProduct(product)}
                                            className="cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between w-full">
                                                <div>
                                                    <p className="font-medium">{product.name}</p>
                                                    <p className="text-xs text-slate-500">{product.sku}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold">₹{product.price}</p>
                                                    <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                                                </div>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </div>

            {items.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
                    <Package className="size-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-900 mb-1">No products added</p>
                    <p className="text-sm text-slate-500 mb-4">Start building your bundle by adding products</p>
                </div>
            ) : (
                <div className="border border-slate-200 rounded-lg overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10"></TableHead>
                                <TableHead>Product</TableHead>
                                <TableHead>Qty</TableHead>
                                <TableHead>Optional</TableHead>
                                <TableHead>Min</TableHead>
                                <TableHead>Max</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {items.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell>
                                        <GripVertical className="size-4 text-gray-400 cursor-move" />
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <p className="font-medium text-slate-900">{item.productName}</p>
                                            <p className="text-xs text-slate-500">{item.sku}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => onUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                                            className="w-20"
                                            min="1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={item.isOptional}
                                            onCheckedChange={(checked) => onUpdateItem(item.id, 'isOptional', checked)}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.minSelect}
                                            onChange={(e) => onUpdateItem(item.id, 'minSelect', parseInt(e.target.value) || 0)}
                                            className="w-16"
                                            disabled={!item.isOptional}
                                            min="0"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            value={item.maxSelect}
                                            onChange={(e) => onUpdateItem(item.id, 'maxSelect', parseInt(e.target.value) || 1)}
                                            className="w-16"
                                            disabled={!item.isOptional}
                                            min="1"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={item.stock > 20 ? "default" : "destructive"}>
                                            {item.stock}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onRemoveProduct(item.id)}
                                            className="text-gray-400 hover:text-gray-600 hover:bg-slate-50"
                                        >
                                            <X className="size-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
