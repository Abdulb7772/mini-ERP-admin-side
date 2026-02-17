"use client";

import React, { useState } from "react";
import TiptapEditor from "./TiptapEditor";
import Modal from "./Modal";

interface TextBlock {
  id: string;
  type: "text" | "heading";
  content: string;
  style?: {
    fontSize?: string;
    fontWeight?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: string;
  };
}

interface TextOnlyEditorProps {
  blocks: TextBlock[];
  onChange: (blocks: TextBlock[]) => void;
}

export default function TextOnlyEditor({ blocks, onChange }: TextOnlyEditorProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<TextBlock | null>(null);

  const addBlock = (type: "text" | "heading") => {
    const newBlock: TextBlock = {
      id: `block-${Date.now()}`,
      type,
      content: type === "heading" ? "New Heading" : "<p>Your text here...</p>",
      style: {
        fontSize: type === "heading" ? "32px" : "16px",
        fontWeight: type === "heading" ? "bold" : "normal",
        color: "#000000",
        backgroundColor: "transparent",
        textAlign: "left",
      },
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<TextBlock>) => {
    onChange(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
    setSelectedBlock(null);
  };

  const moveBlockUp = (index: number) => {
    if (index === 0) return;
    const newBlocks = [...blocks];
    [newBlocks[index - 1], newBlocks[index]] = [newBlocks[index], newBlocks[index - 1]];
    onChange(newBlocks);
  };

  const moveBlockDown = (index: number) => {
    if (index === blocks.length - 1) return;
    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[index + 1]] = [newBlocks[index + 1], newBlocks[index]];
    onChange(newBlocks);
  };

  const handleEditBlock = (block: TextBlock) => {
    setEditingBlock(block);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingBlock) {
      updateBlock(editingBlock.id, editingBlock);
      setIsEditModalOpen(false);
      setEditingBlock(null);
    }
  };

  return (
    <div className="flex h-full bg-gray-50">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Add Content</h3>
        <div className="space-y-2">
          <button
            onClick={() => addBlock("heading")}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📝</span>
            <span>Add Heading</span>
          </button>
          <button
            onClick={() => addBlock("text")}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>Add Text Block</span>
          </button>
        </div>

        {selectedBlock && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Block Options</h3>
            {(() => {
              const block = blocks.find((b) => b.id === selectedBlock);
              const blockIndex = blocks.findIndex((b) => b.id === selectedBlock);
              if (!block) return null;

              return (
                <div className="space-y-3">
                  <button
                    onClick={() => handleEditBlock(block)}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Edit Content
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => moveBlockUp(blockIndex)}
                      disabled={blockIndex === 0}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↑ Move Up
                    </button>
                    <button
                      onClick={() => moveBlockDown(blockIndex)}
                      disabled={blockIndex === blocks.length - 1}
                      className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ↓ Move Down
                    </button>
                  </div>
                  
                  <button
                    onClick={() => deleteBlock(selectedBlock)}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete Block
                  </button>
                  
                  {/* Text Color */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={block.style?.color || "#000000"}
                        onChange={(e) => updateBlock(block.id, {
                          style: { ...block.style, color: e.target.value }
                        })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={block.style?.color || "#000000"}
                        onChange={(e) => updateBlock(block.id, {
                          style: { ...block.style, color: e.target.value }
                        })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  
                  {/* Background Color */}
                  <div className="pt-3 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={block.style?.backgroundColor || "#ffffff"}
                        onChange={(e) => updateBlock(block.id, {
                          style: { ...block.style, backgroundColor: e.target.value }
                        })}
                        className="w-12 h-10 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={block.style?.backgroundColor || "#ffffff"}
                        onChange={(e) => updateBlock(block.id, {
                          style: { ...block.style, backgroundColor: e.target.value }
                        })}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Content Preview */}
      <div className="flex-1 overflow-auto bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="space-y-8">
            {blocks.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                <p className="text-xl mb-2">No content yet</p>
                <p className="text-sm">Add headings or text blocks to get started</p>
              </div>
            ) : (
              (() => {
                const renderedBlocks: React.ReactElement[] = [];
                let i = 0;
                
                while (i < blocks.length) {
                  const block = blocks[i];
                  
                  // Check if this is a feature card (backgroundColor #374151)
                  if (block.type === "text" && 
                      block.style?.backgroundColor === "#374151") {
                    
                    // Collect consecutive feature cards
                    const featureCards: typeof blocks = [];
                    while (i < blocks.length && 
                           blocks[i]?.type === "text" && 
                           blocks[i]?.style?.backgroundColor === "#374151") {
                      featureCards.push(blocks[i]);
                      i++;
                    }
                    
                    // Render feature cards in grid
                    renderedBlocks.push(
                      <div key={`grid-${featureCards[0].id}`} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featureCards.map((card) => (
                          <div
                            key={card.id}
                            onClick={() => setSelectedBlock(card.id)}
                            className={`cursor-pointer transition-all ${
                              selectedBlock === card.id
                                ? "ring-2 ring-blue-500"
                                : "hover:ring-2 hover:ring-gray-600"
                            }`}
                          >
                            <div
                              style={{
                                fontSize: card.style?.fontSize,
                                fontWeight: card.style?.fontWeight,
                                color: card.style?.color,
                                textAlign: card.style?.textAlign as any,
                              }}
                              dangerouslySetInnerHTML={{ __html: card.content }}
                            />
                          </div>
                        ))}
                      </div>
                    );
                  } else {
                    // Render single block
                    renderedBlocks.push(
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block.id)}
                        className={`p-4 rounded-lg cursor-pointer transition-all ${
                          selectedBlock === block.id
                            ? "ring-2 ring-blue-500"
                            : block.type === "text" ? "hover:bg-gray-800" : ""
                        }`}
                        style={{
                          backgroundColor: block.style?.backgroundColor !== "transparent" 
                            ? block.style?.backgroundColor 
                            : undefined,
                        }}
                      >
                        {block.type === "heading" ? (
                          <h2
                            style={{
                              fontSize: block.style?.fontSize,
                              fontWeight: block.style?.fontWeight,
                              color: block.style?.color,
                              textAlign: block.style?.textAlign as any,
                            }}
                          >
                            {block.content}
                          </h2>
                        ) : (
                          <div
                            style={{
                              fontSize: block.style?.fontSize,
                              fontWeight: block.style?.fontWeight,
                              color: block.style?.color,
                              textAlign: block.style?.textAlign as any,
                            }}
                            dangerouslySetInnerHTML={{ __html: block.content }}
                          />
                        )}
                      </div>
                    );
                    i++;
                  }
                }
                
                return renderedBlocks;
              })()
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingBlock && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Content">
          <div className="space-y-4">
            {editingBlock.type === "heading" ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Heading Text</label>
                <input
                  type="text"
                  value={editingBlock.content}
                  onChange={(e) =>
                    setEditingBlock({ ...editingBlock, content: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Content</label>
                <TiptapEditor
                  content={editingBlock.content}
                  onChange={(content) =>
                    setEditingBlock({ ...editingBlock, content })
                  }
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color</label>
                <input
                  type="color"
                  value={editingBlock.style?.color || "#000000"}
                  onChange={(e) =>
                    setEditingBlock({
                      ...editingBlock,
                      style: { ...editingBlock.style, color: e.target.value },
                    })
                  }
                  className="w-full h-10 rounded"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Background</label>
                <input
                  type="color"
                  value={editingBlock.style?.backgroundColor || "#ffffff"}
                  onChange={(e) =>
                    setEditingBlock({
                      ...editingBlock,
                      style: { ...editingBlock.style, backgroundColor: e.target.value },
                    })
                  }
                  className="w-full h-10 rounded"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
