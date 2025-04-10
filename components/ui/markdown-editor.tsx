"use client"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

interface MarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  height?: number
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  className,
  height = 300,
}: MarkdownEditorProps) {

  return (
    <div className="w-full">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col h-full">

          <div className="text-sm font-medium mb-1">Markdown</div>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || "Type markdown here..."}
            className={cn("min-h-[250px] font-mono flex-grow", className)}
            style={{ height }}
          />
        </div>
        <div className="flex flex-col h-full">
          <div className="text-sm font-medium mb-1">Preview</div>
          <div 
            className={cn(
              "border rounded-md p-4 prose prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 dark:prose-invert max-w-none overflow-auto flex-grow", 
              className
            )}
            style={{ height, overflowY: "auto" }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({...props}) => <h1 className="text-2xl font-bold my-4" {...props} />,
                  h2: ({...props}) => <h2 className="text-xl font-bold my-3" {...props} />,
                  h3: ({...props}) => <h3 className="text-lg font-bold my-2" {...props} />,
                  a: ({...props}) => <a className="text-blue-500 hover:underline" {...props} />,
                  ul: ({...props}) => <ul className="list-disc pl-5 my-2" {...props} />,
                  ol: ({...props}) => <ol className="list-decimal pl-5 my-2" {...props} />,
                  blockquote: ({...props}) => <blockquote className="pl-4 border-l-4 border-gray-300 my-2 italic" {...props} />,
                  code: ({className, children, ...props}: React.HTMLProps<HTMLElement> & {inline?: boolean}) => {
                    const match = /language-(\w+)/.exec(className || '')
                    return props.inline ? (
                      <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded" {...props}>
                        {children}
                      </code>
                    ) : (
                      <pre className={cn("bg-gray-100 dark:bg-gray-800 p-2 rounded my-2", className)}>
                        <code className={match ? `language-${match[1]}` : ''} {...props}>
                          {children}
                        </code>
                      </pre>
                    )
                  },
                  p: ({...props}) => <p className="my-2" {...props} />,
                  hr: () => <hr className="my-4 border-t border-gray-300 dark:border-gray-700" />,
                  img: ({src, alt, ...props}) => {
                    // For the preview component, we need to handle both external and relative URLs
                    if (src && (src.startsWith('http://') || src.startsWith('https://'))) {
                      return (
                        <div className="relative w-full h-[250px] my-2">
                          <Image 
                            src={src} 
                            alt={alt || 'Preview image'} 
                            fill
                            className="object-contain rounded"
                          />
                        </div>
                      );
                    }
                    // For relative paths or non-URLs, we still need to use img for the preview
                    // Add a comment to silence the ESLint warning
                    // eslint-disable-next-line @next/next/no-img-element
                    return <img src={src} alt={alt || 'Preview image'} className="max-w-full rounded my-2" {...props} />;
                  }
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground">{placeholder || "Nothing to preview"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 