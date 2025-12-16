"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, X } from "lucide-react"

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [category, setCategory] = useState(searchParams.get("category") || "all")
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "")
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "")

  // Update local state when URL params change
  useEffect(() => {
    setCategory(searchParams.get("category") || "all")
    setMinPrice(searchParams.get("minPrice") || "")
    setMaxPrice(searchParams.get("maxPrice") || "")
  }, [searchParams])

  // Debounce update URL when filters change
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      
      const currentCat = searchParams.get("category") || "all"
      const currentMin = searchParams.get("minPrice") || ""
      const currentMax = searchParams.get("maxPrice") || ""

      if (category === currentCat && minPrice === currentMin && maxPrice === currentMax) {
        return
      }

      if (category && category !== "all") {
        params.set("category", category)
      } else {
        params.delete("category")
      }

      if (minPrice) {
        params.set("minPrice", minPrice)
      } else {
        params.delete("minPrice")
      }

      if (maxPrice) {
        params.set("maxPrice", maxPrice)
      } else {
        params.delete("maxPrice")
      }

      params.delete("page")
      router.push(`/user?${params.toString()}#products`, { scroll: false })
    }, 500)

    return () => clearTimeout(timer)
  }, [category, minPrice, maxPrice, router, searchParams])

  const clearFilters = () => {
    setCategory("all")
    setMinPrice("")
    setMaxPrice("")
    router.push("/user#products")
  }

  const hasActiveFilters = category !== "all" || minPrice !== "" || maxPrice !== ""

  return (
    <div className="flex flex-col lg:flex-row gap-4 items-end lg:items-center bg-card p-4 rounded-lg border shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto flex-1">
        <div className="space-y-2 w-full sm:w-[250px]">
          <Label className="text-xs text-muted-foreground">Category</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {category === "all" ? "All Categories" : categories.find(c => c.id === category)?.name || "Select Category"}
                <Filter className="ml-2 h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[250px]">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={category} onValueChange={setCategory}>
                <DropdownMenuRadioItem value="all">All Categories</DropdownMenuRadioItem>
                {categories.map((cat) => (
                  <DropdownMenuRadioItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-2 w-full sm:w-auto flex-1">
          <Label className="text-xs text-muted-foreground">Price Range</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">RM</span>
              <Input 
                placeholder="Min" 
                type="number" 
                min="0"
                className="pl-10" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
            </div>
            <span className="text-muted-foreground">-</span>
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">RM</span>
              <Input 
                placeholder="Max" 
                type="number" 
                min="0"
                className="pl-10" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full lg:w-auto pt-2 lg:pt-0">
        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="w-full lg:w-auto">
            Clear Filters <X className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
