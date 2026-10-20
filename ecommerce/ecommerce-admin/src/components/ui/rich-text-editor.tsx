import { lazy, Suspense } from 'react';
import 'react-quill/dist/quill.snow.css';

// Lazy load ReactQuill to reduce initial bundle size
const ReactQuill = lazy(() => import('react-quill'));

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
}

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, 4, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean']
  ],
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'indent',
  'blockquote', 'code-block',
  'link'
];

// Loading skeleton for the editor
const EditorSkeleton = ({ minHeight }: { minHeight: number }) => (
  <div 
    className="rounded-xl border border-gray-200 bg-gray-50 animate-pulse" 
    style={{ minHeight: `${minHeight + 42}px` }}
  >
    <div className="h-[42px] border-b border-gray-200 bg-white" />
    <div className="p-3" style={{ minHeight: `${minHeight}px` }} />
  </div>
);

export function RichTextEditor({ value, onChange, placeholder, disabled, minHeight = 150 }: RichTextEditorProps) {
  return (
    <div className="rich-text-editor">
      <Suspense fallback={<EditorSkeleton minHeight={minHeight} />}>
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          readOnly={disabled}
          className="rounded-xl"
          style={{ '--editor-min-height': `${minHeight}px` } as React.CSSProperties}
        />
      </Suspense>
    </div>
  );
}
