"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X, Loader2, Upload } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";

// Helper to check if file is video
const isVideoFile = (file: File) => file.type.startsWith('video/');

interface ProductImage {
    id: string;
    storage_path: string;
    media_type: 'image' | 'video';
    is_primary: boolean;
    sort_order: number;
}

interface Product {
    id: string;
    name: string;
    sku: string;
    base_price: number;
    description: string;
    is_active: boolean;
    featured: boolean;
    stripe_product_id?: string | null;
    stripe_price_id?: string | null;
}

interface EditProductClientProps {
    product: Product;
    images: ProductImage[];
}

export default function EditProductClient({ product: initialProduct, images: initialImages }: EditProductClientProps) {
    const router = useRouter();
    const supabase = useMemo(() => createClient(), []);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Product State
    const [productData, setProductData] = useState({
        name: initialProduct.name,
        sku: initialProduct.sku,
        price: initialProduct.base_price,
        description: initialProduct.description || "",
        is_active: initialProduct.is_active,
        featured: initialProduct.featured
    });

    // Images State
    const [images, setImages] = useState<ProductImage[]>(initialImages);
    const [dragActive, setDragActive] = useState(false);
    const [newFiles, setNewFiles] = useState<{ file: File, preview: string }[]>([]);

    const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setProductData(prev => ({ ...prev, [id]: value }));
    };

    const handleToggleChange = (field: 'is_active' | 'featured', checked: boolean) => {
        setProductData(prev => ({ ...prev, [field]: checked }));
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const files = Array.from(e.dataTransfer.files);
            processNewFiles(files);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            processNewFiles(files);
        }
    }

    const processNewFiles = (files: File[]) => {
        const newFileObjs = files.map(file => ({
            file,
            preview: URL.createObjectURL(file)
        }));
        setNewFiles(prev => [...prev, ...newFileObjs]);
    }

    const removeNewFile = (index: number) => {
        setNewFiles(prev => {
            const newArr = [...prev];
            URL.revokeObjectURL(newArr[index].preview);
            newArr.splice(index, 1);
            return newArr;
        });
    }

    const deleteImageNow = async (id: string, path: string) => {
        if (!confirm("Delete this image?")) return;

        // Delete from storage
        await supabase.storage.from('product-images').remove([path]);
        // Delete from DB
        const { error } = await supabase.from('product_images').delete().eq('id', id);

        if (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to delete image" });
        } else {
            setImages(prev => prev.filter(img => img.id !== id));
            toast({ title: "Success", description: "Image deleted" });
        }
    }

    const setPrimaryImage = async (id: string) => {
        setLoading(true);
        // Reset all to false locally first for UI
        setImages(prev => prev.map(img => ({ ...img, is_primary: img.id === id })));

        // Update DB
        // 1. Set all to false
        await supabase.from('product_images').update({ is_primary: false }).eq('product_id', initialProduct.id);
        // 2. Set selected to true
        await supabase.from('product_images').update({ is_primary: true }).eq('id', id);

        setLoading(false);
        toast({ title: "Updated", description: "Primary image updated" });
    }

    const getImageUrl = (path: string) => {
        return supabase.storage.from('product-images').getPublicUrl(path).data.publicUrl;
    }

    const handleSaveAll = async () => {
        setLoading(true);

        try {
            // Ensure browser Supabase client has a valid session
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                throw new Error('Session expired. Please log in again.');
            }

            // 1. Update Product Details
            const { error: productError } = await supabase
                .from('products')
                .update({
                    name: productData.name,
                    description: productData.description,
                    sku: productData.sku,
                    base_price: Number(productData.price),
                    is_active: productData.is_active,
                    featured: productData.featured
                })
                .eq('id', initialProduct.id);

            if (productError) throw productError;

            // 2. Upload New Images
            if (newFiles.length > 0) {
                const mediaPromises = newFiles.map(async ({ file }, index) => {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${initialProduct.id}/${Date.now()}-${index}-new.${fileExt}`;
                    const { error: uploadError } = await supabase.storage
                        .from('product-images')
                        .upload(fileName, file);

                    if (uploadError) throw uploadError;

                    return {
                        product_id: initialProduct.id,
                        storage_path: fileName,
                        media_type: isVideoFile(file) ? 'video' : 'image',
                        is_primary: false, // Default new ones to false unless none exist?
                        sort_order: images.length + index
                    };
                });

                const mediaRecords = await Promise.all(mediaPromises);
                // @ts-ignore
                const { error: mediaError } = await supabase.from('product_images').insert(mediaRecords);
                if (mediaError) throw mediaError;

                // Cleanup previews
                newFiles.forEach(f => URL.revokeObjectURL(f.preview));
                setNewFiles([]);
            }

            // 3. Sync to Stripe (creates new or updates existing)
            try {
                const syncResponse = await fetch('/api/stripe/sync-product', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ productId: initialProduct.id }),
                });

                const syncResult = await syncResponse.json();

                if (syncResponse.ok && syncResult.success) {
                    const actionVerb = syncResult.action === 'updated' ? 'updated in' : 'synced to';
                    toast({
                        title: "Success",
                        description: `Product saved and ${actionVerb} Stripe successfully`
                    });
                } else {
                    toast({
                        variant: "destructive",
                        title: "Product Saved",
                        description: syncResult.error || "Product saved but Stripe sync failed."
                    });
                }
            } catch (syncError: any) {
                toast({
                    variant: "destructive",
                    title: "Product Saved",
                    description: "Product saved but Stripe sync failed."
                });
            }
            router.refresh(); // Refresh server state

        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-6 sm:gap-8 w-full">
            <div className="flex items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Edit Product</h1>
                    <p className="text-muted-foreground text-sm sm:text-base">
                        Manage details for {initialProduct.name}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Product Information */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Product Information</CardTitle>
                        <CardDescription>Update basic details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input
                                    id="name"
                                    value={productData.name}
                                    onChange={handleProductChange}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sku">Base SKU</Label>
                                <Input
                                    id="sku"
                                    value={productData.sku}
                                    onChange={handleProductChange}
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-8">
                            <div className="flex items-center space-x-2">
                                <Label>Active Status</Label>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm ${productData.is_active ? 'text-green-600' : 'text-muted-foreground'}`}>
                                        {productData.is_active ? 'Active' : 'Draft'}
                                    </span>
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handleToggleChange('is_active', !productData.is_active)}
                                        className={productData.is_active ? "border-green-500 bg-green-50" : ""}
                                    >
                                        {productData.is_active ? 'Deactivate' : 'Activate'}
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label>Featured</Label>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline" size="sm"
                                        onClick={() => handleToggleChange('featured', !productData.featured)}
                                        className={productData.featured ? "border-yellow-500 bg-yellow-50" : ""}
                                    >
                                        {productData.featured ? 'Featured' : 'Standard'}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="price">Base Price ($)</Label>
                            <Input
                                id="price"
                                type="number"
                                step="0.01"
                                value={productData.price}
                                onChange={handleProductChange}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                                value={productData.description}
                                onChange={handleProductChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Media Management */}
                <div className="space-y-6 sm:space-y-8">
                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Product Media</CardTitle>
                            <CardDescription>Manage images and videos</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Existing Images */}
                                {images.map((img) => (
                                    <div key={img.id} className={`relative aspect-square rounded-md overflow-hidden border ${img.is_primary ? 'ring-2 ring-primary' : ''}`}>
                                        <img src={getImageUrl(img.storage_path)} alt="Product" className="w-full h-full object-cover" />
                                        <div className="absolute top-1 right-1 flex gap-1">
                                            <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => deleteImageNow(img.id, img.storage_path)}>
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </div>
                                        {!img.is_primary && (
                                            <div className="absolute bottom-1 left-0 right-0 px-2">
                                                <Button size="sm" variant="secondary" className="w-full h-6 text-xs" onClick={() => setPrimaryImage(img.id)}>
                                                    Make Primary
                                                </Button>
                                            </div>
                                        )}
                                        {img.is_primary && (
                                            <div className="absolute bottom-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                                                Primary
                                            </div>
                                        )}
                                    </div>
                                ))}

                                {/* New Uploads Previews */}
                                {newFiles.map((file, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-md overflow-hidden border opacity-70">
                                        <img src={file.preview} alt="New Upload" className="w-full h-full object-cover" />
                                        <Button size="icon" variant="ghost" className="absolute top-1 right-1 h-6 w-6 text-destructive" onClick={() => removeNewFile(idx)}>
                                            <X className="w-3 h-3" />
                                        </Button>
                                        <div className="absolute bottom-1 right-1 bg-green-500 text-white text-xs px-2 py-0.5 rounded">
                                            New
                                        </div>
                                    </div>
                                ))}

                                {/* Drop Zone */}
                                <div
                                    className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => document.getElementById('edit-media-upload')?.click()}
                                >
                                    <Upload className="w-6 h-6 text-muted-foreground mb-2" />
                                    <span className="text-xs text-muted-foreground">Upload</span>
                                    <input
                                        id="edit-media-upload"
                                        type="file"
                                        multiple
                                        accept="image/*,video/*"
                                        className="hidden"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <Link href="/admin/products" className="flex-1 order-2 sm:order-1">
                            <Button variant="outline" className="w-full">
                                Cancel
                            </Button>
                        </Link>
                        <Button className="flex-1 order-1 sm:order-3" onClick={handleSaveAll} disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Changes
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
