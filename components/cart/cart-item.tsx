"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ShirtIcon } from "lucide-react";
import Link from "next/link";

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  size: string;
  variantInfo: string;
  quantity: number;
  image: string;
}

interface CartItemComponentProps {
  item: CartItem;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export function CartItemComponent({ item, onQuantityChange, onRemove }: CartItemComponentProps) {
  const [quantity, setQuantity] = useState(item.quantity);

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return;
    setQuantity(newQuantity);
    onQuantityChange(item.id, newQuantity);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1;
    handleQuantityChange(value);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 transition-colors hover:bg-muted/30">
      {/* Product Image */}
      <Link href={`/user/products/${item.productId}`} className="flex-shrink-0 w-full sm:w-auto group">
        <div className="w-full sm:w-24 h-32 sm:h-28 bg-muted/50 flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-md">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <ShirtIcon className="w-8 h-8 text-muted-foreground/40" />
          )}
        </div>
      </Link>

      {/* Product Details */}
      <div className="flex-1 w-full sm:w-auto space-y-1">
        <Link href={`/user/products/${item.productId}`} className="group">
          <h3 className="font-medium text-sm sm:text-base tracking-tight group-hover:text-muted-foreground transition-colors">
            {item.name}
          </h3>
        </Link>
        <p className="text-xs text-muted-foreground font-light tracking-wide">
          {item.size} · {item.variantInfo}
        </p>
        <p className="text-sm font-medium mt-1">RM {item.price.toFixed(2)}</p>
      </div>

      {/* Quantity & Actions */}
      <div className="flex items-center justify-between w-full sm:w-auto gap-6">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-muted"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            <Minus className="w-3.5 h-3.5" />
          </Button>
          <Input
            type="number"
            value={quantity}
            onChange={handleInputChange}
            className="w-12 text-center text-sm h-8 luxury-input"
            min="1"
          />
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 hover:bg-muted"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="text-right flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
          <p className="font-medium text-sm">RM {(item.price * quantity).toFixed(2)}</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive h-7 px-2"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}