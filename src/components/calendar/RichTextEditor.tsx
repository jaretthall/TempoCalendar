import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Heading1,
  Heading2,
} from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "Start typing...",
  minHeight = "200px",
}) => {
  const [htmlContent, setHtmlContent] = useState(value);
  const [isHtmlMode, setIsHtmlMode] = useState(false);

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setHtmlContent(e.target.value);
    onChange(e.target.value);
  };

  const applyFormatting = (tag: string, attributes?: string) => {
    // This is a simple implementation. In a real app, you'd use a proper rich text editor library
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = range.toString();

    if (!selectedText) return;

    const element = document.createElement(tag);
    if (attributes) {
      const attrs = attributes.split(" ");
      attrs.forEach((attr) => {
        const [key, value] = attr.split("=");
        element.setAttribute(key, value.replace(/["']/g, ""));
      });
    }
    element.textContent = selectedText;

    range.deleteContents();
    range.insertNode(element);

    // Update the HTML content
    const tempDiv = document.createElement("div");
    tempDiv.appendChild(range.cloneContents());
    const newHtml = tempDiv.innerHTML;

    setHtmlContent((prevHtml) => {
      const updatedHtml = prevHtml.replace(selectedText, newHtml);
      onChange(updatedHtml);
      return updatedHtml;
    });
  };

  return (
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("b")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("i")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("h1")}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("h2")}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("ul")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("ol")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("div", 'class="text-left"')}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("div", 'class="text-center"')}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => applyFormatting("div", 'class="text-right"')}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const url = prompt("Enter URL:");
            if (url) applyFormatting("a", `href="${url}" target="_blank"`);
          }}
        >
          <Link className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) {
              const img = `<img src="${url}" alt="Image" style="max-width: 100%" />`;
              setHtmlContent((prev) => {
                const updated = prev + img;
                onChange(updated);
                return updated;
              });
            }
          }}
        >
          <Image className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsHtmlMode(!isHtmlMode)}
          >
            {isHtmlMode ? "Preview" : "HTML"}
          </Button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="p-2">
        {isHtmlMode ? (
          <Textarea
            value={htmlContent}
            onChange={handleHtmlChange}
            placeholder={placeholder}
            className="min-h-[150px] font-mono text-sm"
            style={{ minHeight }}
          />
        ) : (
          <div className="relative">
            <div
              contentEditable
              className="min-h-[150px] p-2 focus:outline-none prose max-w-none"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: htmlContent }}
              onInput={(e) => {
                const newContent = e.currentTarget.innerHTML;
                setHtmlContent(newContent);
                onChange(newContent);
              }}
              placeholder={placeholder}
            />
            {!htmlContent && (
              <div className="absolute top-2 left-2 text-gray-400 pointer-events-none">
                {placeholder}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
