"use client";

import { useState, useRef } from "react";
import { RecipeInstruction } from "@/types/recipes";

interface DisplayInstructionsProps {
  instructions: RecipeInstruction[];
  handleRemoveInstruction: (index: number) => void;
  handleReorderInstructions: (fromIndex: number, toIndex: number) => void;
  handleEditInstruction: (index: number, newText: string) => void;
}

export default function DisplayInstructions({
  instructions,
  handleRemoveInstruction,
  handleReorderInstructions,
  handleEditInstruction,
}: DisplayInstructionsProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const startEditing = (index: number, currentText: string) => {
    setEditingIndex(index);
    setEditingText(currentText);
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const saveEdit = () => {
    if (editingIndex !== null && editingText.trim()) {
      handleEditInstruction(editingIndex, editingText.trim());
    }
    setEditingIndex(null);
    setEditingText("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditingText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelEdit();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveEdit();
    }
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, toIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== toIndex) {
      handleReorderInstructions(dragIndex, toIndex);
    }
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  if (instructions.length === 0) return null;

  return (
    <div className="mb-4">
      <h3 className="font-bold mb-2 text-lg text-white">
        Recipe Instructions:
      </h3>
      <ul className="list-decimal pl-5 space-y-1">
        {instructions.map((instruction: RecipeInstruction, index) => (
          <li
            key={index}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 bg-slate-500 p-2 rounded mb-1 transition-opacity ${
              dragIndex === index ? "opacity-50" : ""
            } ${dragOverIndex === index && dragIndex !== index ? "ring-2 ring-trinidad-400" : ""}`}
          >
            <span
              className="cursor-grab active:cursor-grabbing text-slate-300 select-none"
              title="Drag to reorder"
            >
              ⠿
            </span>

            {editingIndex === index ? (
              <div className="flex-1 flex flex-col gap-1">
                <textarea
                  ref={textareaRef}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-1 rounded bg-slate-700 text-trinidad-100 border border-slate-400 focus:outline-none focus:ring-1 focus:ring-trinidad-400 resize-none"
                  rows={2}
                />
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={saveEdit}
                    className="text-green-400 hover:text-green-300 text-sm px-2"
                  >
                    ✓ Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-slate-300 hover:text-slate-200 text-sm px-2"
                  >
                    ✕ Cancel
                  </button>
                </div>
              </div>
            ) : (
              <span
                className="flex-1 text-trinidad-100 cursor-pointer hover:underline"
                onClick={() => startEditing(index, instruction.instruction)}
                title="Click to edit"
              >
                Step {instruction.step_number}: {instruction.instruction}
              </span>
            )}

            <button
              type="button"
              onClick={() => handleRemoveInstruction(index)}
              className="text-red-700 hover:text-red-700 focus:outline-none ml-auto"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
