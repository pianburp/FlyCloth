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
  color: string;
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg">
      <Link href={`/user/products/${item.productId}`} className="flex-shrink-0 w-full sm:w-auto">
        <div className="w-full sm:w-20 h-32 sm:h-20 bg-muted rounded-md flex items-center justify-center overflow-hidden hover:opacity-80 transition-opacity">
          {item.image ? (
            <img 
              src={item.image} 
              alt={item.name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <ShirtIcon className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
      </Link>
      
      <div className="flex-1 w-full sm:w-auto">
        <Link href={`/user/products/${item.productId}`} className="hover:underline">
          <h3 className="font-semibold">{item.name}</h3>
        </Link>
        <p className="text-sm text-muted-foreground">
          Size: {item.size} • Color: {item.color}
        </p>
        <p className="font-bold text-lg">RM{item.price.toFixed(2)}</p>
      </div>
      
      <div className="flex items-center justify-between w-full sm:w-auto gap-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8"
            onClick={() => handleQuantityChange(quantity - 1)}
          >
            <Minus className="w-4 h-4" />
          </Button>
          <Input 
            type="number" 
            value={quantity}
            onChange={handleInputChange}
            className="w-14 sm:w-16 text-center"
            min="1"
          />
          <Button 
            variant="outline" 
            size="icon" 
            className="w-8 h-8"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-right flex items-center gap-2 sm:flex-col sm:gap-0">
          <p className="font-semibold">RM{(item.price * quantity).toFixed(2)}</p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-red-600 hover:text-red-700"
            onClick={() => onRemove(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}