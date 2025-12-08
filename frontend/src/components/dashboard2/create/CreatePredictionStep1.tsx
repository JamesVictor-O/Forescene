import React, { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Select from "../ui/Select";
import Textarea from "../ui/Textarea";
import { Category, PredictionFormState } from "../types";

export const CreatePredictionStep1: React.FC = () => {
  const [formState, setFormState] = useState<PredictionFormState>({
    title: "",
    category: Category.MUSIC,
    description: "",
  });

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const categories = Object.values(Category);

  return (
    <div className="flex flex-col gap-8 max-w-[960px] mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-6">
        <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          Create a New Prediction
        </h1>
        {/* Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <p className="text-white text-base font-medium leading-normal">
              Step 1 of 3: The Question
            </p>
          </div>
          <div className="w-full h-2 rounded-full bg-white/10">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-300 ease-in-out"
              style={{ width: "33%" }}
            ></div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
        {/* Title Input */}
        <div className="lg:col-span-1">
          <Input
            label="Prediction Title / Question"
            name="title"
            placeholder="e.g., Who will win 'Artist of the Year' at the 2024 Headies Awards?"
            value={formState.title}
            onChange={handleInputChange}
          />
        </div>
        {/* Category Select */}
        <div className="lg:col-span-1">
          <Select
            label="Category"
            name="category"
            options={categories}
            value={formState.category}
            onChange={handleInputChange}
          />
        </div>
        {/* Description Textarea */}
        <div className="lg:col-span-2">
          <Textarea
            label="Brief Description"
            name="description"
            placeholder="Add some context for the prediction event"
            value={formState.description}
            onChange={handleInputChange}
          />
        </div>
      </div>

      {/* Footer / Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10 mt-4">
        <Button variant="secondary" className="w-full sm:w-auto">
          Save as Draft
        </Button>
        <div className="flex flex-col-reverse sm:flex-row gap-4 w-full sm:w-auto">
          <Button variant="secondary" disabled className="w-full sm:w-auto">
            Back
          </Button>
          <Button className="w-full sm:w-auto">Next: Add Outcomes</Button>
        </div>
      </div>
    </div>
  );
};

export default CreatePredictionStep1;


