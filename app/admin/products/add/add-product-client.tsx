"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Save, X, Loader2, Play } from "lucide-react";
import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const FITS = [
  { name: 'Slim Fit', value: 'slim' },
  { name: 'Regular Fit', value: 'regular' },
  { name: 'Oversize Fit', value: 'oversize' }
];

const GSMS = [
  { name: '150 GSM (Lightweight)', value: 150 },
  { name: '180 GSM (Standard)', value: 180 },
  { name: '220 GSM (Heavyweight)', value: 220 }
];

// Helper to check if file is video
const isVideoFile = (file: File) => file.type.startsWith('video/');

export default function AddProductClient() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    price: "",
    stock: "",
    description: "",
  });

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedFits, setSelectedFits] = useState<string[]>(['regular']); // Default to regular fit
  const [selectedGsms, setSelectedGsms] = useState<number[]>([180]); // Default to 180 GSM

  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);

      // Create preview URLs
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newUrls]);
    }
  }, []);

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => {
      URL.revokeObjectURL(prev[index]); // Cleanup memory
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const toggleSize = (size: string) => {
    setSelectedSizes(prev =>
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const toggleFit = (fit: string) => {
    setSelectedFits(prev =>
      prev.includes(fit) ? prev.filter(f => f !== fit) : [...prev, fit]
    );
  };

  const toggleGsm = (gsm: number) => {
    setSelectedGsms(prev =>
      prev.includes(gsm) ? prev.filter(g => g !== gsm) : [...prev, gsm]
    );
  };

  const handleSave = async () => {
    if (!formData.name || !formData.sku || !formData.price) {
      alert("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // 1. Insert Product
      const { data: product, error: productError } = await supabase
        .from('products')
        .insert({
          name: formData.name,
          description: formData.description,
          sku: formData.sku,
          base_price: parseFloat(formData.price),
          is_active: true,
          featured: false
        })
        .select()
        .single();

      if (productError) throw productError;

      // 2. Upload Media (Images & Videos) & Insert Records
      if (files.length > 0) {
        const mediaPromises = files.map(async (file, index) => {
          const fileExt = file.name.split('.').pop();
          const fileName = `${product.id}/${Date.now()}-${index}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          return {
            product_id: product.id,
            storage_path: fileName,
            media_type: isVideoFile(file) ? 'video' : 'image',
            is_primary: index === 0 && !isVideoFile(file), // First image is primary
            sort_order: index
          };
        });

        const mediaRecords = await Promise.all(mediaPromises);
        const { error: mediaError } = await supabase
          .from('product_images')
          .insert(mediaRecords);

        if (mediaError) throw mediaError;
      }

      // 3. Create Variants (Size x Fit combinations with GSM)
      const variants = [];
      // If no sizes/fits/gsms selected, create one default variant
      if (selectedSizes.length === 0 && selectedFits.length === 0 && selectedGsms.length === 0) {
        variants.push({
          product_id: product.id,
          sku: `${formData.sku}-DEFAULT`,
          size: 'ONESIZE',
          fit: 'regular',
          gsm: 180,
          price: parseFloat(formData.price),
          stock_quantity: parseInt(formData.stock) || 0,
          is_active: true
        });
      } else {
        // Cartesian product of sizes, fits, and gsms
        const sizes = selectedSizes.length > 0 ? selectedSizes : ['ONESIZE'];
        const fits = selectedFits.length > 0 ? selectedFits : ['regular'];
        const gsms = selectedGsms.length > 0 ? selectedGsms : [180];

        for (const size of sizes) {
          for (const fit of fits) {
            for (const gsm of gsms) {
              variants.push({
                product_id: product.id,
                sku: `${formData.sku}-${size}-${fit}-${gsm}`.toUpperCase().replace(/\s+/g, '-'),
                size: size,
                fit: fit,
                gsm: gsm,
                price: parseFloat(formData.price),
                stock_quantity: parseInt(formData.stock) || 0,
                is_active: true
              });
            }
          }
        }
      }

      const { error: variantsError } = await supabase
        .from('product_variants')
        .insert(variants);

      if (variantsError) throw variantsError;

      // 4. Sync to Stripe
      try {
        const syncResponse = await fetch('/api/stripe/sync-product', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }),
        });

        if (!syncResponse.ok) {
          console.warn('Failed to sync product to Stripe, but product was created successfully');
        }
      } catch (syncError) {
        console.warn('Failed to sync to Stripe:', syncError);
        // Don't throw - product was created successfully, just not synced
      }

      router.push('/admin/products');
      router.refresh();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error saving product: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 sm:gap-8 w-full">
      <div className="flex items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2">Add New Product</h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Create a new shirt product for your store
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Product Information */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>Basic details about the shirt</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Premium Cotton T-Shirt"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="e.g., SHIRT-001"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price (RM)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="29.99"
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock Quantity (per variant)</Label>
                <Input
                  id="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="100"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full min-h-[100px] px-3 py-2 border border-input bg-background text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-md"
                placeholder="Describe the shirt features, material, fit, etc."
              />
            </div>


          </CardContent>
        </Card>

        {/* Product Variants & Images */}
        <div className="space-y-6 sm:space-y-8">
          {/* Product Media (Images & Videos) */}
          <Card>
            <CardHeader>
              <CardTitle>Product Media</CardTitle>
              <CardDescription>Upload product photos and videos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center transition-colors ${dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                  }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  Images (PNG, JPG, GIF) and Videos (MP4, WebM) up to 50MB
                </p>
                <Input
                  id="media-upload"
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleChange}
                />
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById('media-upload')?.click()}
                >
                  Choose Files
                </Button>
              </div>

              {/* Media Previews */}
              {previewUrls.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-4">
                  {previewUrls.map((url, index) => (
                    <div key={url} className="relative aspect-square rounded-md overflow-hidden border">
                      {files[index] && isVideoFile(files[index]) ? (
                        <>
                          <video src={url} className="w-full h-full object-cover" muted />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <Play className="w-8 h-8 text-white" />
                          </div>
                        </>
                      ) : (
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      )}
                      <button
                        onClick={() => removeFile(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>


          {/* Variants: Size, Fit & GSM */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>Available sizes, fit types, and fabric weight</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Available Sizes</Label>
                <div className="flex flex-wrap gap-2">
                  {SIZES.map((size) => (
                    <label key={size} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                      />
                      <span className="text-sm">{size}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Fits</Label>
                <div className="flex flex-wrap gap-3">
                  {FITS.map((fit) => (
                    <label key={fit.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedFits.includes(fit.value)}
                        onChange={() => toggleFit(fit.value)}
                      />
                      <span className="text-sm">{fit.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Available Fabric Weights (GSM)</Label>
                <div className="flex flex-wrap gap-3">
                  {GSMS.map((gsm) => (
                    <label key={gsm.value} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={selectedGsms.includes(gsm.value)}
                        onChange={() => toggleGsm(gsm.value)}
                      />
                      <span className="text-sm">{gsm.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link href="/admin/products" className="flex-1 order-2 sm:order-1">
              <Button variant="outline" className="w-full">Cancel</Button>
            </Link>
            <Button className="flex-1 order-1 sm:order-2" onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
