"use client"

import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { metaService } from "@/services/api"
import { useEffect, useState } from "react"

interface CategoryFilterProps {
  selected: string
  onSelect: (category: string) => void
}

export function CategoryFilter({ selected, onSelect }: CategoryFilterProps) {
  const [categories, setCategories] = useState<string[]>(["All"])

  useEffect(() => {
    let isMounted = true

    async function load() {
      try {
        const data = await metaService.getCategories()
        if (isMounted && Array.isArray(data) && data.length > 0) {
          setCategories(data)
        }
      } catch (e) {
        console.error("Failed to load categories", e)
      }
    }

    load()
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-3">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selected.toLowerCase() === category.toLowerCase() ? "default" : "secondary"}
            size="sm"
            className="flex-shrink-0"
            onClick={() => onSelect(category.toLowerCase())}
          >
            {category}
          </Button>
        ))}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}
