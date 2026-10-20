import { useState } from 'react';
import type { Bundle, BundleItem } from '../types/bundle.types';
import { productCatalog } from '../data/bundle.constants';

export const useBundleForm = (initialData?: Bundle | null) => {
    // Basic Details
    const [bundleTitle, setBundleTitle] = useState(initialData?.title || '');
    const [bundleDescription, setBundleDescription] = useState(initialData?.description || '');
    const [bundleType, setBundleType] = useState(initialData?.type || '');
    const [bundleImage, setBundleImage] = useState<File | null>(null);
    const [tags, setTags] = useState<string[]>(initialData?.tags || []);
    const [adminComment, setAdminComment] = useState(initialData?.adminComment || '');

    // Pricing
    const [priceType, setPriceType] = useState<Bundle['priceType']>(initialData?.priceType || 'Fixed Price');
    const [fixedPrice, setFixedPrice] = useState(initialData?.price?.toString() || '');
    const [discountPercentage, setDiscountPercentage] = useState(initialData?.discount?.toString() || '');

    // Items
    const [bundleItems, setBundleItems] = useState<BundleItem[]>([]);

    // Advanced Rules
    const [maxItemsSelect, setMaxItemsSelect] = useState('');
    const [minTotalQuantity, setMinTotalQuantity] = useState('');
    const [allowDuplicates, setAllowDuplicates] = useState(false);
    const [autoAdjustPrice, setAutoAdjustPrice] = useState(true);
    const [disableOnOutOfStock, setDisableOnOutOfStock] = useState(true);

    // Status & Sched
    const [status, setStatus] = useState<Bundle['status']>(initialData?.status || 'Draft');
    const [startDate, setStartDate] = useState(initialData?.startDate || '');
    const [endDate, setEndDate] = useState(initialData?.endDate || '');

    // Inventory
    const [stopOnStockOut, setStopOnStockOut] = useState(true);
    const [allowBackorder, setAllowBackorder] = useState(false);
    const [purchaseLimit, setPurchaseLimit] = useState('');

    // Conditional
    const [conditionalCartValue, setConditionalCartValue] = useState('');
    const [conditionalSegment, setConditionalSegment] = useState('');
    const [conditionalProduct, setConditionalProduct] = useState('');


    // Handlers
    const handleAddProduct = (product: typeof productCatalog[0]) => {
        const newItem: BundleItem = {
            id: `item-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            sku: product.sku,
            quantity: 1,
            isOptional: false,
            minSelect: 1,
            maxSelect: 1,
            sortOrder: bundleItems.length + 1,
            stock: product.stock,
            price: product.price
        };
        setBundleItems([...bundleItems, newItem]);
    };

    const handleRemoveProduct = (itemId: string) => {
        setBundleItems(bundleItems.filter(item => item.id !== itemId));
    };

    const handleItemChange = (itemId: string, field: keyof BundleItem, value: any) => {
        setBundleItems(bundleItems.map(item =>
            item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const calculateTotalPrice = () => {
        const mandatoryTotal = bundleItems
            .filter(item => !item.isOptional)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (priceType === 'Fixed Price' && fixedPrice) {
            return parseFloat(fixedPrice);
        } else if (priceType === 'Percentage Discount' && discountPercentage) {
            return mandatoryTotal * (1 - parseFloat(discountPercentage) / 100);
        }
        return mandatoryTotal;
    };

    const calculateDiscount = () => {
        const mandatoryTotal = bundleItems
            .filter(item => !item.isOptional)
            .reduce((sum, item) => sum + (item.price * item.quantity), 0);

        const finalPrice = calculateTotalPrice();
        return mandatoryTotal - finalPrice;
    };

    return {
        formState: {
            bundleTitle, setBundleTitle,
            bundleDescription, setBundleDescription,
            bundleType, setBundleType,
            bundleImage, setBundleImage,
            priceType, setPriceType,
            fixedPrice, setFixedPrice,
            discountPercentage, setDiscountPercentage,
            bundleItems, setBundleItems,
            maxItemsSelect, setMaxItemsSelect,
            minTotalQuantity, setMinTotalQuantity,
            allowDuplicates, setAllowDuplicates,
            autoAdjustPrice, setAutoAdjustPrice,
            disableOnOutOfStock, setDisableOnOutOfStock,
            status, setStatus,
            startDate, setStartDate,
            endDate, setEndDate,
            stopOnStockOut, setStopOnStockOut,
            allowBackorder, setAllowBackorder,
            purchaseLimit, setPurchaseLimit,
            conditionalCartValue, setConditionalCartValue,
            conditionalSegment, setConditionalSegment,
            conditionalProduct, setConditionalProduct,
            tags, setTags,
            adminComment, setAdminComment
        },
        handlers: {
            handleAddProduct,
            handleRemoveProduct,
            handleItemChange,
            calculateTotalPrice,
            calculateDiscount
        }
    };
};
