
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

interface Step {
  title: string;
  component: React.ReactNode;
}

interface UnifiedFlowProps {
  steps: Step[];
  onComplete: (data: any) => void;
  title: string;
  subtitle?: string;
}

const UnifiedFlow: React.FC<UnifiedFlowProps> = ({
  steps,
  onComplete,
  title,
  subtitle
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [flowData, setFlowData] = useState<any>({});
  
  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  
  const handleNext = (stepData?: any) => {
    // Merge new data with existing flow data
    const updatedData = { ...flowData, ...(stepData || {}) };
    setFlowData(updatedData);
    
    if (isLastStep) {
      onComplete(updatedData);
    } else {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };
  
  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-6">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${index <= currentStepIndex ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}
            >
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div 
                className={`h-0.5 w-10 
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-secondary'}`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Current step */}
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">{currentStep.title}</h2>
          <div>{currentStep.component}</div>
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>
          
          <Button onClick={() => handleNext()}>
            {isLastStep ? (
              <>Complete <Sparkles className="ml-2 h-4 w-4" /></>
            ) : (
              <>Next <ArrowRight className="ml-2 h-4 w-4" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedFlow;
