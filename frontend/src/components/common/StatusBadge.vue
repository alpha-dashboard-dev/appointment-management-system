<script setup lang="ts">
// StatusBadge — displays a coloured pill badge for entity status values.
// Accepts an optional `map` prop to override the default colour mappings,
// which is useful for domains that use non-standard status strings.
defineProps<{
  status: string                    // the status string to display (e.g. 'active', 'pending')
  map?: Record<string, string>      // optional override for status → Tailwind class mapping
}>()

// Default Tailwind class mappings for common statuses across the whole app
const defaultMap: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-gray-100 text-gray-600',
  pending:     'bg-yellow-100 text-yellow-700',
  confirmed:   'bg-blue-100 text-blue-700',
  completed:   'bg-green-100 text-green-700',
  cancelled:   'bg-red-100 text-red-700',
  rescheduled: 'bg-purple-100 text-purple-700',
  draft:       'bg-gray-100 text-gray-600',
  sent:        'bg-blue-100 text-blue-700',
  paid:        'bg-green-100 text-green-700',
}

// Resolve the CSS classes for a given status, falling back to neutral grey if unknown
function getClass(status: string, map?: Record<string, string>) {
  const m = map || defaultMap
  return m[status] ?? 'bg-gray-100 text-gray-600'
}
</script>

<template>
  <span :class="['inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize', getClass(status, map)]">
    {{ status?.replace(/_/g, ' ') }}
  </span>
</template>
