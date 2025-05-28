
import React from "react";
import { Clock } from "lucide-react";

const ProcessingState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mb-6"></div>
      <h3 className="text-xl font-semibold mb-2">Processing Your Video</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Our AI is working on your request. This may take a few moments.
      </p>
      <div className="mt-6 flex items-center text-primary">
        <Clock className="animate-pulse mr-2 h-5 w-5" />
        <span>Please wait...</span>
      </div>
    </div>
  );
};

export default ProcessingState;
