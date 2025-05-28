
import React from "react";

interface FeatureStepProps {
  title: string;
  currentStep: number;
  totalSteps: number;
  stepTitle: string;
  children: React.ReactNode;
  className?: string;
}

const FeatureStep: React.FC<FeatureStepProps> = ({
  title,
  currentStep,
  totalSteps,
  stepTitle,
  children,
  className = ""
}) => {
  return (
    <div className={`bg-background border border-input rounded-xl p-5 ${className}`}>
      <div className="mb-5">
        <h2 className="text-base font-medium">{title}</h2>
        <div className="flex items-center justify-between mt-1">
          <p className="text-sm font-medium">{stepTitle}</p>
          <p className="text-xs text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>
      </div>
      
      <div className="mb-2">
        <div className="w-full bg-secondary/30 h-1.5 rounded-full">
          <div 
            className="bg-primary h-1.5 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <div className="mt-5">
        {children}
      </div>
    </div>
  );
};

export default FeatureStep;
