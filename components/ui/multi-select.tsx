"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react" // Importa X aquí

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectOption {
    label: string
    value: string
}

interface MultiSelectProps {
    options: MultiSelectOption[]
    selected: string[]
    onSelectedChange: (selected: string[]) => void // Asegúrate de que esta prop siempre sea una función
    placeholder?: string
    className?: string
}

export function MultiSelect({
    options,
    selected,
    onSelectedChange,
    placeholder = "Seleccione...",
    className,
}: MultiSelectProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState("")

    const handleSelect = (value: string) => {
        const newSelected = selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
        // Aquí es donde se llama a onSelectedChange. Debe ser una función.
        onSelectedChange(newSelected)
        setInputValue("") // Clear input after selection
    }

    const filteredOptions = options.filter(
        (option) =>
            option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
            option.value.toLowerCase().includes(inputValue.toLowerCase()),
    )

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn("w-full justify-between h-auto min-h-[36px] flex-wrap", className)}
                >
                    {selected.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {selected.map((value) => {
                                const option = options.find((o) => o.value === value)
                                return (
                                    <Badge key={value} variant="secondary" className="flex items-center gap-1">
                                        {option?.label || value}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation() // Evita que el clic en la X cierre el popover
                                                handleSelect(value)
                                            }}
                                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                        >
                                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                        </button>
                                    </Badge>
                                )
                            })}
                        </div>
                    ) : (
                        <span className="text-muted-foreground">{placeholder}</span>
                    )}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Buscar estado..." value={inputValue} onValueChange={setInputValue} />
                    <CommandList>
                        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                        <CommandGroup>
                            {filteredOptions.map((option) => (
                                <CommandItem key={option.value} value={option.value} onSelect={() => handleSelect(option.value)}>
                                    <Check
                                        className={cn("mr-2 h-4 w-4", selected.includes(option.value) ? "opacity-100" : "opacity-0")}
                                    />
                                    {option.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    )
}
