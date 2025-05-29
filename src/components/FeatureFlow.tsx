
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, VideoIcon, FileVideo, SplitSquareVertical, ScrollText, ArrowRight } from "lucide-react";
import { Step } from "@/components/types";

interface FeatureFlowProps {
  steps: Step[];
  onComplete: (data: any) => void;
  title: string;
  subtitle: string;
  onStepChange?: (stepIndex: number) => void;
}

const FeatureFlow: React.FC<FeatureFlowProps> = ({
  steps,
  onComplete,
  title,
  subtitle,
  onStepChange
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
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      if (onStepChange) {
        onStepChange(nextIndex);
      }
    }
  };
  
  const handleBack = () => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      if (onStepChange) {
        onStepChange(prevIndex);
      }
    }
  };
  
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">
          <span className="gradient-text">{title}</span>
        </h1>
        <p className="text-muted-foreground mt-2">{subtitle}</p>
      </div>
      
      {/* Progress indicator */}
      <div className="flex items-center justify-center mb-8">
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
                className={`h-0.5 w-12 
                  ${index < currentStepIndex ? 'bg-primary' : 'bg-secondary'}`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Current step */}
      <div className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-md slide-up">
        <div className="mb-6">
          <h2 className="text-xl font-bold">{currentStep.title}</h2>
          <p className="text-muted-foreground">{currentStep.description}</p>
        </div>
        
        <div className="mb-6">
          {currentStep.component}
        </div>
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStepIndex === 0}
          >
            Back
          </Button>
          
          <Button
            onClick={() => handleNext()}
            className="bg-gradient-purple-blue hover:opacity-90"
          >
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

export default FeatureFlow;
