<template>
  <div class="relative" ref="root">
    <button
      type="button"
      class="w-full text-left truncate transition-colors"
      :class="
        compact
          ? 'select-settings-xs text-xs h-8'
          : 'select-settings h-11 text-sm'
      "
      :class2="{ 'border-primary/60 shadow-glow-sm': open }"
      :disabled="disabled"
      @click="toggle"
      @keydown.escape="close"
    >
      <span class="truncate">{{ selectedLabel }}</span>
    </button>
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <ul
        v-if="open"
        class="absolute z-[60] mt-1.5 w-full rounded-xl bg-base-100/95 backdrop-blur-md border border-white/10 shadow-lg shadow-black/30 py-1.5 max-h-60 overflow-auto focus:outline-none"
      >
        <li
          v-for="opt in options"
          :key="opt.value"
          class="px-3 py-2 cursor-pointer transition-colors"
          :class="[
            compact ? 'text-xs' : 'text-sm',
            opt.value === modelValue
              ? 'bg-primary/15 text-primary font-medium'
              : 'text-base-content hover:bg-white/10',
          ]"
          @click="select(opt.value)"
        >
          {{ opt.label }}
        </li>
      </ul>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], required: true },
  options: {
    type: Array,
    required: true,
    validator: (v) => v.every((o) => 'value' in o && 'label' in o),
  },
  disabled: { type: Boolean, default: false },
  compact: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])

const open = ref(false)
const root = ref(null)

const selectedLabel = computed(
  () => props.options.find((o) => o.value === props.modelValue)?.label ?? ''
)

function toggle() {
  if (!props.disabled) open.value = !open.value
}

function close() {
  open.value = false
}

function select(val) {
  emit('update:modelValue', val)
  open.value = false
}

function onClickOutside(e) {
  if (root.value && !root.value.contains(e.target)) close()
}

onMounted(() => document.addEventListener('click', onClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', onClickOutside))
</script>
