<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit,
    Underline,
    Link.configure({ openOnClick: false }),
    Image,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    Placeholder.configure({ placeholder: props.placeholder ?? 'พิมพ์เนื้อหาที่นี่...' }),
  ],
  editorProps: {
    attributes: {
      class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none'
    }
  },
  onUpdate({ editor }) {
    emit('update:modelValue', editor.getHTML())
  }
})

watch(() => props.modelValue, (val) => {
  if (editor.value && editor.value.getHTML() !== val) {
    editor.value.commands.setContent(val, false)
  }
})

onBeforeUnmount(() => editor.value?.destroy())

// Toolbar helpers
function toggleBold() { editor.value?.chain().focus().toggleBold().run() }
function toggleItalic() { editor.value?.chain().focus().toggleItalic().run() }
function toggleUnderline() { editor.value?.chain().focus().toggleUnderline().run() }
function toggleStrike() { editor.value?.chain().focus().toggleStrike().run() }
function toggleH2() { editor.value?.chain().focus().toggleHeading({ level: 2 }).run() }
function toggleH3() { editor.value?.chain().focus().toggleHeading({ level: 3 }).run() }
function toggleBulletList() { editor.value?.chain().focus().toggleBulletList().run() }
function toggleOrderedList() { editor.value?.chain().focus().toggleOrderedList().run() }
function toggleBlockquote() { editor.value?.chain().focus().toggleBlockquote().run() }
function setAlignLeft() { editor.value?.chain().focus().setTextAlign('left').run() }
function setAlignCenter() { editor.value?.chain().focus().setTextAlign('center').run() }
function setAlignRight() { editor.value?.chain().focus().setTextAlign('right').run() }
function addHr() { editor.value?.chain().focus().setHorizontalRule().run() }

function setLink() {
  const url = window.prompt('ใส่ URL:')
  if (url === null) return
  if (url === '') {
    editor.value?.chain().focus().extendMarkRange('link').unsetLink().run()
  } else {
    editor.value?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }
}

function isActive(type: string, opts?: object) {
  return editor.value?.isActive(type, opts) ?? false
}
</script>

<template>
  <div class="border border-default rounded-xl overflow-hidden bg-default">
    <!-- Toolbar -->
    <div class="flex flex-wrap items-center gap-0.5 p-2 border-b border-default bg-elevated">

      <!-- Text style -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="toggleBold"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('bold') }"
          title="Bold (Ctrl+B)">
          <UIcon name="i-lucide-bold" class="w-4 h-4" />
        </button>
        <button type="button" @click="toggleItalic"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('italic') }"
          title="Italic (Ctrl+I)">
          <UIcon name="i-lucide-italic" class="w-4 h-4" />
        </button>
        <button type="button" @click="toggleUnderline"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('underline') }"
          title="Underline (Ctrl+U)">
          <UIcon name="i-lucide-underline" class="w-4 h-4" />
        </button>
        <button type="button" @click="toggleStrike"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('strike') }"
          title="Strikethrough">
          <UIcon name="i-lucide-strikethrough" class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-default mx-1" />

      <!-- Headings -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="toggleH2"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer px-2 text-xs font-bold" :class="{ 'bg-primary/10 text-primary': isActive('heading', { level: 2 }) }"
          title="Heading 2">
          H2
        </button>
        <button type="button" @click="toggleH3"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer px-2 text-xs font-bold" :class="{ 'bg-primary/10 text-primary': isActive('heading', { level: 3 }) }"
          title="Heading 3">
          H3
        </button>
      </div>

      <div class="w-px h-5 bg-default mx-1" />

      <!-- Lists -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="toggleBulletList"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('bulletList') }"
          title="Bullet List">
          <UIcon name="i-lucide-list" class="w-4 h-4" />
        </button>
        <button type="button" @click="toggleOrderedList"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('orderedList') }"
          title="Ordered List">
          <UIcon name="i-lucide-list-ordered" class="w-4 h-4" />
        </button>
        <button type="button" @click="toggleBlockquote"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('blockquote') }"
          title="Blockquote">
          <UIcon name="i-lucide-quote" class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-default mx-1" />

      <!-- Alignment -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="setAlignLeft"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive({ textAlign: 'left' }) }"
          title="Align Left">
          <UIcon name="i-lucide-align-left" class="w-4 h-4" />
        </button>
        <button type="button" @click="setAlignCenter"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive({ textAlign: 'center' }) }"
          title="Align Center">
          <UIcon name="i-lucide-align-center" class="w-4 h-4" />
        </button>
        <button type="button" @click="setAlignRight"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive({ textAlign: 'right' }) }"
          title="Align Right">
          <UIcon name="i-lucide-align-right" class="w-4 h-4" />
        </button>
      </div>

      <div class="w-px h-5 bg-default mx-1" />

      <!-- Link & HR -->
      <div class="flex items-center gap-0.5">
        <button type="button" @click="setLink"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer" :class="{ 'toolbar-btn-active': isActive('link') }"
          title="Link">
          <UIcon name="i-lucide-link" class="w-4 h-4" />
        </button>
        <button type="button" @click="addHr"
          class="flex items-center justify-center w-7 h-7 rounded-md text-muted hover:bg-default hover:text-default transition-colors cursor-pointer"
          title="Horizontal Rule">
          <UIcon name="i-lucide-minus" class="w-4 h-4" />
        </button>
      </div>

    </div>

    <!-- Editor area -->
    <EditorContent :editor="editor" class="text-sm text-default" />
  </div>
</template>

<style>
.tiptap h2 { font-size: 1.25rem; font-weight: 700; margin-top: 1rem; margin-bottom: 0.5rem; }
.tiptap h3 { font-size: 1.125rem; font-weight: 600; margin-top: 0.75rem; margin-bottom: 0.25rem; }
.tiptap p { margin-top: 0.25rem; margin-bottom: 0.25rem; }
.tiptap ul { list-style-type: disc; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
.tiptap ol { list-style-type: decimal; padding-left: 1.25rem; margin-top: 0.5rem; margin-bottom: 0.5rem; }
.tiptap blockquote { border-left: 4px solid color-mix(in srgb, var(--ui-primary) 40%, transparent); padding-left: 1rem; font-style: italic; opacity: 0.8; margin-top: 0.75rem; margin-bottom: 0.75rem; }
.tiptap hr { border-color: var(--ui-border); margin-top: 1rem; margin-bottom: 1rem; }
.tiptap a { color: var(--ui-primary); text-decoration: underline; }
.tiptap strong { font-weight: 700; }
.tiptap em { font-style: italic; }
.tiptap u { text-decoration: underline; }
.tiptap s { text-decoration: line-through; }
.tiptap p.is-editor-empty:first-child::before {
  content: attr(data-placeholder);
  color: var(--ui-text-muted);
  pointer-events: none;
  float: left;
  height: 0;
}
</style>