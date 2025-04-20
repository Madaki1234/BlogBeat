import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import PlaceholderExtension from '@tiptap/extension-placeholder';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  Bold, 
  Italic, 
  Underline as UnderlineIcon, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
  Code,
  Undo,
  Redo,
  X
} from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from './ui/popover';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, placeholder = 'Write something awesome...' }: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [showImageMenu, setShowImageMenu] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExtension,
      LinkExtension.configure({
        openOnClick: false,
        linkOnPaste: true,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg border border-gray-200',
        },
      }),
      PlaceholderExtension.configure({
        placeholder,
      }),
      TextAlignExtension.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;
    
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Check if the URL has the http/https protocol
    const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`;
    
    editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url })
      .run();
      
    setLinkUrl('');
    setShowLinkMenu(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!editor) return;
    
    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run();
      setImageUrl('');
      setShowImageMenu(false);
    }
  }, [editor, imageUrl]);

  if (!editor) {
    return null;
  }

  return (
    <div className="relative border border-gray-200 rounded-lg">
      {editor && (
        <BubbleMenu 
          editor={editor} 
          tippyOptions={{ duration: 100 }}
          className="bg-white shadow-lg rounded-lg border border-gray-200 flex p-1 gap-1"
        >
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('bold') ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('italic') ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('underline') ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('strike') ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant={editor.isActive('link') ? 'default' : 'ghost'}
            className="h-8 w-8 p-0"
            onClick={() => setShowLinkMenu(!showLinkMenu)}
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
        </BubbleMenu>
      )}

      <div className="border-b border-gray-200 p-2 flex flex-wrap items-center gap-1 bg-gray-50 rounded-t-lg">
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('underline') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('strike') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          className="h-8 px-2 text-sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          H1
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          className="h-8 px-2 text-sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          H2
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          className="h-8 px-2 text-sm"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          H3
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Popover open={showLinkMenu} onOpenChange={setShowLinkMenu}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant={editor.isActive('link') ? 'default' : 'ghost'}
              className="h-8 w-8 p-0"
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">Insert Link</div>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={linkUrl}
                  onChange={e => setLinkUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={setLink}>
                  Add
                </Button>
              </div>
              {editor.isActive('link') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    setShowLinkMenu(false);
                  }}
                >
                  Remove Link
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={showImageMenu} onOpenChange={setShowImageMenu}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-8 w-8 p-0"
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="flex flex-col space-y-2">
              <div className="text-sm font-medium">Insert Image</div>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" onClick={addImage}>
                  Add
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <EditorContent 
        editor={editor} 
        className="prose prose-sm sm:prose lg:prose-lg max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}