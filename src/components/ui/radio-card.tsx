import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface RadioCardOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  description?: string;
}

interface RadioCardProps extends React.HTMLAttributes<HTMLDivElement> {
  options: RadioCardOption[];
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

const RadioCard = React.forwardRef<HTMLDivElement, RadioCardProps>(
  ({ options, value, onValueChange, className, ...props }, ref) => {
    return (
      <div className={cn("grid gap-2", className)} ref={ref} {...props}>
        <RadioGroup
          value={value}
          onValueChange={onValueChange}
        >
          {options.map((option) => (
            <div key={option.value} className="flex items-center">
              <RadioGroupItem
                value={option.value}
                id={option.value}
                className="peer sr-only"
              />
              <Label
                htmlFor={option.value}
                className={cn(
                  "flex flex-col items-center justify-center rounded-md border-2 border-muted p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer w-full transition-all",
                  option.icon ? "gap-2" : ""
                )}
              >
                {option.icon && <div className="mb-1">{option.icon}</div>}
                <div className="font-medium">{option.label}</div>
                {option.description && (
                  <div className="text-xs text-muted-foreground">
                    {option.description}
                  </div>
                )}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    );
  }
);

RadioCard.displayName = "RadioCard";

export { RadioCard };