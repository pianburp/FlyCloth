"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2, ShirtIcon } from "lucide-react";

interface CartItem {
  id: string;
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
    <div className="flex items-center gap-4 p-4 border rounded-lg">
      <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0 overflow-hidden">
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
      
      <div className="flex-1">
        <h3 className="font-semibold">{item.name}</h3>
        <p className="text-sm text-muted-foreground">
          Size: {item.size} • Color: {item.color}
        </p>
        <p className="font-bold text-lg">${item.price.toFixed(2)}</p>
      </div>
      
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
          className="w-16 text-center"
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
      
      <div className="text-right">
        <p className="font-semibold">${(item.price * quantity).toFixed(2)}</p>
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
  );
}