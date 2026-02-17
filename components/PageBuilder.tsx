"use client";

import { useState, useRef, useEffect } from "react";
import CloudinaryUpload from "./CloudinaryUpload";
import TiptapEditor from "./TiptapEditor";
import Modal from "./Modal";

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface BlockStyle {
  fontSize?: string;
  fontWeight?: string;
  color?: string;
  backgroundColor?: string;
  textAlign?: string;
}

type BlockType = "text" | "image" | "heading" | "hero";

interface Block {
  id: string;
  type: BlockType;
  content: string;
  position: Position;
  size: Size;
  style?: BlockStyle;
}

interface PageBuilderProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  pageBackgroundColor?: string;
  onPageBackgroundChange?: (color: string) => void;
}

interface DragOffset {
  x: number;
  y: number;
}

export default function PageBuilder({ 
  blocks, 
  onChange,
  pageBackgroundColor = "#ffffff",
  onPageBackgroundChange 
}: PageBuilderProps) {
  const [selectedBlock, setSelectedBlock] = useState<string | null>(null);
  const [draggingBlock, setDraggingBlock] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const addBlock = (type: Block["type"]) => {
    const newBlock: Block = {
      id: `block-${Date.now()}`,
      type,
      content: type === "heading" ? "Heading Text" : type === "text" ? "Your text here..." : type === "hero" ? "Hero Title" : "",
      position: { x: 50, y: 50 },
      size: { 
        width: type === "hero" ? 800 : type === "heading" ? 400 : 300, 
        height: type === "hero" ? 400 : type === "image" ? 200 : 100 
      },
      style: {
        fontSize: type === "hero" ? "48px" : type === "heading" ? "32px" : "16px",
        fontWeight: type === "hero" || type === "heading" ? "bold" : "normal",
        color: type === "hero" || type === "heading" ? "#ffffff" : "#000000",
        backgroundColor: type === "hero" ? "#1f2937" : "transparent",
        textAlign: "left",
      },
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (id: string, updates: Partial<Block>) => {
    onChange(blocks.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const deleteBlock = (id: string) => {
    onChange(blocks.filter((block) => block.id !== id));
    setSelectedBlock(null);
  };

  const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
    if (e.button !== 0) return; // Only left click
    
    const block = blocks.find((b) => b.id === blockId);
    if (!block) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDraggingBlock(blockId);
    setSelectedBlock(blockId);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!draggingBlock || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - canvasRect.left - dragOffset.x;
    const y = e.clientY - canvasRect.top - dragOffset.y;

    updateBlock(draggingBlock, {
      position: { x: Math.max(0, x), y: Math.max(0, y) },
    });
  };

  const handleMouseUp = () => {
    setDraggingBlock(null);
  };

  const handleEditBlock = (block: Block) => {
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

  const handleResize = (blockId: string, newWidth: number, newHeight: number) => {
    updateBlock(blockId, {
      size: { width: Math.max(100, newWidth), height: Math.max(50, newHeight) },
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Page Settings</h3>
        
        {/* Page Background Color */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Page Background
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={pageBackgroundColor}
              onChange={(e) => onPageBackgroundChange?.(e.target.value)}
              className="w-12 h-10 rounded cursor-pointer"
            />
            <input
              type="text"
              value={pageBackgroundColor}
              onChange={(e) => onPageBackgroundChange?.(e.target.value)}
              className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
              placeholder="#ffffff"
            />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Add Elements</h3>
        <div className="space-y-2">
          <button
            onClick={() => addBlock("hero")}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🎯</span>
            <span>Hero Section</span>
          </button>
          <button
            onClick={() => addBlock("heading")}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📝</span>
            <span>Heading</span>
          </button>
          <button
            onClick={() => addBlock("text")}
            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>📄</span>
            <span>Text Box</span>
          </button>
          <button
            onClick={() => addBlock("image")}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
          >
            <span>🖼️</span>
            <span>Image</span>
          </button>
        </div>

        {selectedBlock && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">Properties</h3>
            {(() => {
              const block = blocks.find((b) => b.id === selectedBlock);
              if (!block) return null;

              return (
                <div className="space-y-3">
                  <button
                    onClick={() => handleEditBlock(block)}
                    className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    Edit Content
                  </button>
                  <button
                    onClick={() => deleteBlock(selectedBlock)}
                    className="w-full px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Delete Block
                  </button>
                  
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
                  
                  {/* Image Preview */}
                  {(block.type === "image" || block.type === "hero") && block.content && (
                    <div className="pt-3 border-t border-gray-200">
                      <p className="text-sm font-medium text-gray-600 mb-2">Current Image</p>
                      <img
                        src={block.content}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded border border-gray-300"
                      />
                      <p className="text-xs text-gray-500 mt-1 truncate">{block.content}</p>
                    </div>
                  )}
                  
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Position</p>
                    <p className="text-xs text-gray-500">X: {Math.round(block.position.x)}px</p>
                    <p className="text-xs text-gray-500">Y: {Math.round(block.position.y)}px</p>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">Size</p>
                    <p className="text-xs text-gray-500">W: {Math.round(block.size.width)}px</p>
                    <p className="text-xs text-gray-500">H: {Math.round(block.size.height)}px</p>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-auto bg-gray-100 p-8">
        <div
          ref={canvasRef}
          className="relative min-h-[2000px] shadow-lg mx-auto"
          style={{ width: "1200px", backgroundColor: pageBackgroundColor }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {blocks.map((block) => (
            <div
              key={block.id}
              className={`absolute cursor-move border-2 ${
                selectedBlock === block.id ? "border-blue-500" : "border-transparent"
              } hover:border-blue-300 transition-colors group`}
              style={{
                left: `${block.position.x}px`,
                top: `${block.position.y}px`,
                width: `${block.size.width}px`,
                minHeight: `${block.size.height}px`,
                backgroundColor: block.style?.backgroundColor,
              }}
              onMouseDown={(e) => handleMouseDown(e, block.id)}
              onClick={() => setSelectedBlock(block.id)}
            >
              {block.type === "text" && (
                <div
                  className="p-4 h-full overflow-auto"
                  style={{
                    fontSize: block.style?.fontSize,
                    fontWeight: block.style?.fontWeight,
                    color: block.style?.color,
                    textAlign: block.style?.textAlign as any,
                  }}
                  dangerouslySetInnerHTML={{ __html: block.content }}
                />
              )}
              {block.type === "heading" && (
                <div
                  className="p-4 h-full flex items-center"
                  style={{
                    fontSize: block.style?.fontSize,
                    fontWeight: block.style?.fontWeight,
                    color: block.style?.color,
                    textAlign: block.style?.textAlign as any,
                  }}
                >
                  {block.content}
                </div>
              )}
              {block.type === "hero" && (
                <div
                  className="p-8 h-full flex flex-col justify-center relative overflow-hidden"
                  style={{
                    backgroundImage: block.content.startsWith("http") ? `url(${block.content})` : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className="relative z-10">
                    <h1
                      style={{
                        fontSize: block.style?.fontSize,
                        fontWeight: block.style?.fontWeight,
                        color: block.style?.color,
                      }}
                    >
                      Hero Section
                    </h1>
                    <p className="text-white mt-2">Click Edit to customize</p>
                  </div>
                </div>
              )}
              {block.type === "image" && (
                <div className="w-full h-full">
                  {block.content ? (
                    <img src={block.content} alt="Block" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                      Click Edit to add image
                    </div>
                  )}
                </div>
              )}

              {/* Resize handle */}
              {selectedBlock === block.id && (
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    const startWidth = block.size.width;
                    const startHeight = block.size.height;

                    const handleResizeMove = (moveE: MouseEvent) => {
                      const deltaX = moveE.clientX - startX;
                      const deltaY = moveE.clientY - startY;
                      handleResize(block.id, startWidth + deltaX, startHeight + deltaY);
                    };

                    const handleResizeUp = () => {
                      document.removeEventListener("mousemove", handleResizeMove);
                      document.removeEventListener("mouseup", handleResizeUp);
                    };

                    document.addEventListener("mousemove", handleResizeMove);
                    document.addEventListener("mouseup", handleResizeUp);
                  }}
                />
              )}
            </div>
          ))}

          {blocks.length === 0 && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center text-gray-400">
                <p className="text-xl mb-2">Empty Canvas</p>
                <p className="text-sm">Add elements from the left sidebar to get started</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editingBlock && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Block">
          <div className="space-y-4">
            {editingBlock.type === "text" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <TiptapEditor
                  content={editingBlock.content}
                  onChange={(content) =>
                    setEditingBlock({ ...editingBlock, content })
                  }
                />
              </div>
            )}
            {editingBlock.type === "heading" && (
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
            )}
            {(editingBlock.type === "image" || editingBlock.type === "hero") && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <CloudinaryUpload
                  onUpload={(urls: string[]) =>
                    setEditingBlock({ ...editingBlock, content: urls[0] || "" })
                  }
                  currentImages={editingBlock.content ? [editingBlock.content] : []}
                />
                {editingBlock.content && (
                  <img
                    src={editingBlock.content}
                    alt="Preview"
                    className="mt-2 w-full h-40 object-cover rounded"
                  />
                )}
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
