"use client";
import { useFormState } from "react-dom";
import { useRef, useState } from "react";

import { RecipeInstruction, RecipeIngredient } from "@/types/recipes";
import { createRecipeAction } from "@/actions/recipes";
import FormSubmitButton from "@/components/btns/form-submit";
import TextInput from "@/components/form-components/text-input";
import TextAreaInput from "@/components/recipes/text-area";
import IngredientSearch from "@/components/recipes/ingredient-search";
import SelectCountryInput from "@/components/recipes/select-country-input";
import DisplayIngredientes from "@/components/recipes/ingredients-display";
import InstructionsInput from "../recipes/instructions-input";
import DisplayInstructions from "../recipes/instructions-display";
import ImagePicker from "../recipes/image-picker";

export default function NewRecipeForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, formAction] = useFormState(createRecipeAction, {
    errors: {},
    message: "",
  });
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [instructions, setInstructions] = useState<RecipeInstruction[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIngredientAdd = (ingredient: RecipeIngredient) => {
    setIngredients((prev) => [...prev, ingredient]);
  };

  const handleRemoveIngredient = (index: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInstructionAdd = (instruction: string) => {
    setInstructions((prev) => [
      ...prev,
      {
        instruction: instruction,
        step_number: instructions.length + 1,
      },
    ]);
  };

  const handleRemoveInstruction = (index: number) => {
    setInstructions((prev) => {
      const updatedInstructions = prev.filter((_, i) => i !== index);

      // Reassign step numbers
      return updatedInstructions.map((instruction, i) => ({
        ...instruction,
        step_number: i + 1, // Recalculate step number based on new index
      }));
    });
  };

  const handleReorderInstructions = (fromIndex: number, toIndex: number) => {
    setInstructions((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated.map((inst, i) => ({ ...inst, step_number: i + 1 }));
    });
  };

  const handleEditInstruction = (index: number, newText: string) => {
    setInstructions((prev) =>
      prev.map((inst, i) =>
        i === index ? { ...inst, instruction: newText } : inst
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    const formData = new FormData();

    if (formRef.current) {
      const formElements = formRef.current
        .elements as HTMLFormControlsCollection;
      const nameInput = formElements.namedItem("name") as HTMLInputElement;
      const descriptionInput = formElements.namedItem(
        "description"
      ) as HTMLTextAreaElement;
      const countryInput = formElements.namedItem(
        "country"
      ) as HTMLSelectElement;
      const imageInput = formElements.namedItem(
        "recipe_image"
      ) as HTMLInputElement;

      formData.append("name", nameInput.value);
      formData.append("description", descriptionInput.value);
      formData.append("country", countryInput.value);
      formData.append("ingredients", JSON.stringify(ingredients));
      formData.append("instructions", JSON.stringify(instructions));
      if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
      }
    }

    try {
      await formAction(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="max-w-md mx-auto">
      <div className="grid grid-cols-2 gap-3">
        <TextInput
          id="name"
          label="Recipe name"
          name="name"
          type="text"
          errors={formState.errors?.name || []}
        />
        <SelectCountryInput
          id="country"
          label="Country"
          name="country"
          errors={formState.errors?.country || []}
        ></SelectCountryInput>
      </div>
      <div className="grid grid-cols-1">
        <TextAreaInput
          id="description"
          label="Description"
          name="description"
          rows={3}
          errors={formState.errors?.description || []}
        />
      </div>
      <div className="grid grid-cols-1">
        <IngredientSearch
          onIngredientAdd={handleIngredientAdd}
          alreadyContainIngredients={ingredients.length > 0}
          errors={formState.errors?.ingredients}
        />
      </div>
      <DisplayIngredientes
        handleRemoveIngredient={handleRemoveIngredient}
        ingredients={ingredients}
      />

      <div className="grid grid-cols-1">
        <InstructionsInput
          onInstructionAdd={handleInstructionAdd}
          alreadyContainInstructions={instructions.length > 0}
          errors={formState.errors?.instructions}
        />
      </div>
      <DisplayInstructions
        instructions={instructions}
        handleRemoveInstruction={handleRemoveInstruction}
        handleReorderInstructions={handleReorderInstructions}
        handleEditInstruction={handleEditInstruction}
      />
      <div className="grid grid-cols-1">
        <ImagePicker
          label="Add an image for the recipe"
          name="recipe_image"
          errors={formState.errors?.imageInput}
        />
      </div>
      <FormSubmitButton text="Create Recipe" loadingText="Creating Recipe..." disabled={isSubmitting} />
    </form>
  );
}
