import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Package } from 'lucide-react';

interface BundleBasicDetailsProps {
    title: string;
    setTitle: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    type: string;
    setType: (v: string) => void;
    image: File | null;
    setImage: (f: File | null) => void;
}

export const BundleBasicDetails = ({
    title, setTitle,
    description, setDescription,
    type, setType,
    image, setImage
}: BundleBasicDetailsProps) => {

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-8 space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">Basic Bundle Details</h2>
                <p className="text-sm text-slate-600 mt-1">Essential information about your bundle</p>
            </div>

            <div className="space-y-5">
                <div className="space-y-2">
                    <Label>Bundle Title</Label>
                    <Input
                        placeholder="e.g., Cricket Starter Pack"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700">Bundle Description</Label>
                    <Textarea
                        placeholder="Describe what's included and the value proposition..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                    />
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700">Bundle Type</Label>
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select bundle type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Fixed Bundle">Fixed Bundle</SelectItem>
                            <SelectItem value="Mix & Match">Mix & Match</SelectItem>
                            <SelectItem value="Buy X Get Y">Buy X Get Y</SelectItem>
                            <SelectItem value="Tiered Bundle">Tiered Bundle</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-slate-500">Choose how customers can interact with this bundle</p>
                </div>

                <div className="space-y-2">
                    <Label className="text-slate-700">Bundle Image</Label>
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-slate-300 transition-colors">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                            id="bundle-image"
                        />
                        <label htmlFor="bundle-image" className="cursor-pointer">
                            <Package className="size-8 text-slate-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-600 mb-1">
                                <span className="font-semibold text-indigo-600">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-slate-500">PNG, JPG up to 5MB (1200x630px recommended)</p>
                            {image && (
                                <p className="text-xs text-green-600 mt-2">✓ {image.name}</p>
                            )}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
};
