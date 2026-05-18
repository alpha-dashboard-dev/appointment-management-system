<script setup lang="ts">
// PageHeader — consistent section heading used at the top of each view.
// Renders a title, an optional subtitle, and an optional primary action button.
defineProps<{
  title: string          // main heading text
  subtitle?: string      // smaller descriptive text beneath the title
  actionLabel?: string   // label for the primary action button (hidden if not provided)
  actionIcon?: string    // SVG path for the button icon (optional)
}>()
defineEmits<{ action: [] }>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h2 class="text-xl font-semibold text-gray-800">{{ title }}</h2>
      <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5">{{ subtitle }}</p>
    </div>
    <button v-if="actionLabel" class="btn-primary" @click="$emit('action')">
      <svg v-if="actionIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="actionIcon"/>
      </svg>
      {{ actionLabel }}
    </button>
  </div>
</template>
