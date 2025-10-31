// components/ComingSoonPopup.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Rocket, BarChart2 } from 'lucide-react'; // Assuming you use lucide-react icons

interface ComingSoonPopupProps {
  // Handler to dismiss the popup, which will likely take the user back to the dashboard
  onClose: () => void;
}

/**
 * A simple 'Coming Soon' overlay/popup for a feature under development.
 */
export function ComingSoonPopup({ onClose }: ComingSoonPopupProps) {
  return (
    // Fixed container to center the modal over the main content area
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-10 max-w-lg w-full transform transition-all duration-300 ease-out scale-100 opacity-100 border-4 border-blue-500">
        
        <div className="text-center space-y-4">
          
          <Rocket className="w-12 h-12 text-blue-600 mx-auto" />
          <h2 className="text-3xl font-extrabold text-gray-900">
            Analytics is <span className="text-gray-800">Coming Soon!</span>
          </h2>
          <p className="text-lg text-gray-600">
            We're busy crunching the numbers to bring you powerful insights into your quote performance and client base.
          </p>
          <div className="border-t pt-4 mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500">
            <BarChart2 className="w-4 h-4" />
            <span>Expected Launch: Q4 2025</span>
          </div>

          <div className="pt-6">
            <Button
              onClick={onClose}
              className="w-full sm:w-auto px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition duration-150 font-semibold shadow-lg"
            >
              Back to Dashboard
            </Button>
          </div>
          
        </div>
      </div>
    </div>
  );
}