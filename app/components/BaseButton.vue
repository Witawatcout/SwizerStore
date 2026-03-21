<template>
  <component
    :is="isLink ? 'NuxtLink' : 'button'"
    :[linkAttr]="to || href"
    :type="!isLink ? type : undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none transform-gpu',
      variantClasses[variant],
      sizeClasses[size],
      pill ? 'rounded-full' : 'rounded-2xl',
      customClass
    ]"
  >
    <!-- Loading Spinner -->
    <Icon v-if="loading" name="mynaui:sphere-solid" class="animate-spin" />
    
    <!-- Leading Icon -->
    <Icon v-if="icon && iconPosition === 'left' && !loading" :name="icon" :class="iconSizeClasses[size]" />
    
    <slot />
    
    <!-- Trailing Icon -->
    <Icon v-if="icon && iconPosition === 'right' && !loading" :name="icon" :class="iconSizeClasses[size]" />
    
    <!-- Subtle Shine Effect for Primary/Dark -->
    <span v-if="['primary', 'dark'].includes(variant)" class="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></span>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'dark' | 'white'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  icon?: string
  iconPosition?: 'left' | 'right'
  loading?: boolean
  disabled?: boolean
  pill?: boolean
  to?: string
  href?: string
  type?: 'button' | 'submit' | 'reset'
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  iconPosition: 'right',
  loading: false,
  disabled: false,
  pill: true,
  type: 'button',
  customClass: ''
})

const isLink = computed(() => !!(props.to || props.href))
const linkAttr = computed(() => props.to ? 'to' : 'href')

const variantClasses = {
  primary: 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-600/20 hover:shadow-primary-600/30 overflow-hidden relative group',
  secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 border border-secondary-300/50',
  outline: 'bg-transparent border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
  ghost: 'bg-transparent text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900',
  dark: 'bg-neutral-950 text-white hover:bg-neutral-900 shadow-xl shadow-black/10 relative overflow-hidden group',
  white: 'bg-white text-neutral-900 border border-neutral-100 hover:bg-neutral-50 shadow-md'
}

const sizeClasses = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base md:text-lg',
  xl: 'px-10 py-5 text-lg md:text-xl'
}

const iconSizeClasses = {
  sm: 'text-sm',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl'
}
</script>
