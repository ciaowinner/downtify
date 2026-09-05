<template>
  <div class="min-h-screen">
    <Navbar />
    <Settings />

    <div class="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold tracking-tight">
          {{ t('monitor.title') }}
        </h1>
        <p class="mt-1 text-sm text-base-content/60">
          {{ t('monitor.subtitle') }}
        </p>
      </div>

      <!-- Add playlist form -->
      <div class="surface rounded-2xl p-5 mb-8 relative z-30">
        <h2
          class="text-sm font-semibold uppercase tracking-wider text-base-content/50 mb-4"
        >
          {{ t('monitor.watchNew') }}
        </h2>
        <form @submit.prevent="onAdd">
          <div class="flex flex-col sm:flex-row gap-3 items-end">
            <div class="flex-1 min-w-0">
              <label
                class="block text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2"
              >
                URL
              </label>
              <input
                v-model="newUrl"
                type="text"
                :placeholder="t('monitor.urlPlaceholder')"
                class="input-modern w-full h-11 text-sm"
                :disabled="adding"
              />
            </div>
            <div class="w-full sm:w-36 shrink-0">
              <label
                class="block text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2"
              >
                {{ t('monitor.labelType') }}
              </label>
              <CustomSelect
                v-model="newType"
                :options="typeOptions"
                :disabled="adding"
              />
            </div>
            <div class="w-full sm:w-40 shrink-0">
              <label
                class="block text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-2"
              >
                {{ t('monitor.labelInterval') }}
              </label>
              <CustomSelect
                v-model="newInterval"
                :options="intervalOptions"
                :disabled="adding"
              />
            </div>
            <div class="shrink-0">
              <button
                type="submit"
                class="btn btn-primary btn-sm h-11 px-5 rounded-full"
                :disabled="adding || !newUrl.trim()"
              >
                <span v-if="adding" class="loading loading-spinner loading-xs" />
                <span v-else>{{ t('monitor.watch') }}</span>
              </button>
            </div>
          </div>
        </form>
        <p v-if="addError" class="mt-2 text-xs text-error">{{ addError }}</p>
      </div>

      <!-- Loading skeleton -->
      <div v-if="loading" class="space-y-3">
        <div v-for="n in 3" :key="n" class="skeleton h-24 rounded-2xl" />
      </div>

      <!-- Empty state -->
      <div
        v-else-if="playlists.length === 0"
        class="surface rounded-2xl p-12 flex flex-col items-center text-center"
      >
        <Icon
          icon="clarity:music-note-line"
          class="h-12 w-12 text-base-content/20 mb-4"
        />
        <p class="text-base-content/50 text-sm">
          {{ t('monitor.empty') }}
        </p>
        <p class="text-base-content/40 text-xs mt-1">
          {{ t('monitor.emptyHint') }}
        </p>
      </div>

      <!-- Playlist cards -->
      <ul v-else class="space-y-3">
        <li
          v-for="pl in playlists"
          :key="pl.id"
          class="surface rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 relative z-30"
        >
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold truncate">{{ pl.name }}</span>
              <span
                class="pill shrink-0"
                :class="pl.enabled ? 'badge-soft' : 'badge-neutral-soft'"
              >
                {{ pl.enabled ? t('monitor.active') : t('monitor.paused') }}
              </span>
              <span class="pill shrink-0 badge-soft">
                {{ pl.is_playlist ? t('monitor.typePlaylist') : t('monitor.typeArtist') }}
              </span>
            </div>
            <div
              class="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-base-content/50"
            >
              <span>
                <Icon
                  icon="clarity:refresh-line"
                  class="inline h-3 w-3 mr-0.5"
                />
                {{
                  t('monitor.everyInterval', {
                    interval: formatInterval(pl.interval_minutes),
                  })
                }}
              </span>
              <span>
                <Icon
                  icon="clarity:music-note-line"
                  class="inline h-3 w-3 mr-0.5"
                />
                {{
                  pl.last_track_count === 1
                    ? t('monitor.tracksOne', { count: pl.last_track_count })
                    : t('monitor.tracksMany', { count: pl.last_track_count })
                }}
              </span>
              <span v-if="pl.last_checked">
                <Icon icon="clarity:clock-line" class="inline h-3 w-3 mr-0.5" />
                {{ t('monitor.checked', { when: timeAgo(pl.last_checked) }) }}
              </span>
              <span v-else class="italic">{{ t('monitor.notChecked') }}</span>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 shrink-0">
            <!-- Interval selector -->
            <CustomSelect
              :model-value="pl.interval_minutes"
              :options="intervalShortOptions"
              :compact="true"
              @update:model-value="(val) => onChangeIntervalVal(pl, val)"
              class="w-20"
            />

            <!-- Toggle enabled -->
            <button
              class="icon-btn"
              :title="pl.enabled ? t('monitor.pause') : t('monitor.resume')"
              @click="onToggle(pl)"
            >
              <Icon
                :icon="pl.enabled ? 'clarity:pause-line' : 'clarity:play-line'"
                class="h-4 w-4"
              />
            </button>

            <!-- Manual check -->
            <button
              class="icon-btn"
              :title="t('monitor.checkNow')"
              :disabled="checking[pl.id]"
              @click="onCheck(pl)"
            >
              <span
                v-if="checking[pl.id]"
                class="loading loading-spinner loading-xs"
              />
              <Icon v-else icon="clarity:refresh-line" class="h-4 w-4" />
            </button>

            <!-- Delete -->
            <button
              class="icon-btn text-error/70 hover:text-error hover:bg-error/10"
              :title="t('monitor.stop')"
              @click="onDelete(pl)"
            >
              <Icon icon="clarity:trash-line" class="h-4 w-4" />
            </button>
          </div>
        </li>
      </ul>

      <!-- Info banner -->
      <div
        class="mt-8 surface rounded-2xl p-4 flex gap-3 text-sm text-base-content/60"
      >
        <Icon
          icon="clarity:info-standard-line"
          class="h-5 w-5 shrink-0 mt-0.5 text-primary/70"
        />
        <p>{{ t('monitor.info') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Icon } from '@iconify/vue'
import Navbar from '/src/components/Navbar.vue'
import Settings from '/src/components/Settings.vue'
import CustomSelect from '/src/components/CustomSelect.vue'
import monitorAPI from '/src/model/monitor.js'
import { useI18n } from '/src/i18n'

const { t } = useI18n()

const playlists = ref([])
const loading = ref(false)
const adding = ref(false)
const addError = ref('')
const newUrl = ref('')
const newInterval = ref(60)
const newType = ref('playlist')
const checking = ref({})

const typeOptions = computed(() => [
  { value: 'playlist', label: t('monitor.typePlaylist') },
  { value: 'artist', label: t('monitor.typeArtist') },
])

const intervalOptions = computed(() => [
  { value: 15, label: t('monitor.every15') },
  { value: 30, label: t('monitor.every30') },
  { value: 60, label: t('monitor.every1h') },
  { value: 180, label: t('monitor.every3h') },
  { value: 360, label: t('monitor.every6h') },
  { value: 720, label: t('monitor.every12h') },
  { value: 1440, label: t('monitor.every1d') },
  { value: 10080, label: t('monitor.every1w') },
  { value: 20160, label: t('monitor.every2w') },
  { value: 43200, label: t('monitor.every1mo') },
])

const intervalShortOptions = computed(() => [
  { value: 15, label: t('monitor.short15') },
  { value: 30, label: t('monitor.short30') },
  { value: 60, label: t('monitor.short1h') },
  { value: 180, label: t('monitor.short3h') },
  { value: 360, label: t('monitor.short6h') },
  { value: 720, label: t('monitor.short12h') },
  { value: 1440, label: t('monitor.short1d') },
  { value: 10080, label: t('monitor.short1w') },
  { value: 20160, label: t('monitor.short2w') },
  { value: 43200, label: t('monitor.short1mo') },
])

async function load() {
  loading.value = true
  try {
    const res = await monitorAPI.listMonitoredPlaylists()
    playlists.value = res.data || []
  } finally {
    loading.value = false
  }
}

async function onAdd() {
  addError.value = ''
  adding.value = true
  try {
    const res = await monitorAPI.addMonitoredPlaylist(
      newUrl.value.trim(),
      newInterval.value,
      newType.value === 'playlist'
    )
    playlists.value.unshift(res.data)
    newUrl.value = ''
  } catch (e) {
    addError.value = e?.response?.data?.detail || t('monitor.failedAdd')
  } finally {
    adding.value = false
  }
}

async function onToggle(pl) {
  try {
    const res = await monitorAPI.updateMonitoredPlaylist(pl.id, {
      enabled: !pl.enabled,
    })
    Object.assign(pl, res.data)
  } catch {
    // silently ignore
  }
}

async function onChangeIntervalVal(pl, val) {
  try {
    const res = await monitorAPI.updateMonitoredPlaylist(pl.id, {
      interval_minutes: val,
    })
    Object.assign(pl, res.data)
  } catch {
    // silently ignore
  }
}

async function onCheck(pl) {
  checking.value = { ...checking.value, [pl.id]: true }
  try {
    await monitorAPI.checkMonitoredPlaylist(pl.id)
    setTimeout(async () => {
      try {
        const res = await monitorAPI.listMonitoredPlaylists()
        playlists.value = res.data || []
      } finally {
        checking.value = { ...checking.value, [pl.id]: false }
      }
    }, 3000)
  } catch {
    checking.value = { ...checking.value, [pl.id]: false }
  }
}

async function onDelete(pl) {
  if (!confirm(t('monitor.deletePrompt', { name: pl.name }))) return
  const deleteFiles = confirm(t('monitor.deleteFilesPrompt', { name: pl.name }))
  try {
    await monitorAPI.deleteMonitoredPlaylist(pl.id, deleteFiles)
    playlists.value = playlists.value.filter((p) => p.id !== pl.id)
  } catch {
    // silently ignore
  }
}

function formatInterval(minutes) {
  if (minutes < 60) return `${minutes} ${t('monitor.minSuffix')}`
  if (minutes < 1440) return `${minutes / 60} ${t('monitor.hourSuffix')}`
  if (minutes < 10080) {
    const days = minutes / 1440
    return `${days} ${days === 1 ? t('monitor.daySuffix') : t('monitor.daysSuffix')}`
  }
  if (minutes < 43200) {
    const weeks = minutes / 10080
    return `${weeks} ${weeks === 1 ? t('monitor.weekSuffix') : t('monitor.weeksSuffix')}`
  }
  const months = Math.round(minutes / 43200)
  return `${months} ${months === 1 ? t('monitor.monthSuffix') : t('monitor.monthsSuffix')}`
}

function timeAgo(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return t('monitor.timeJustNow')
    if (mins < 60) return t('monitor.timeMinAgo', { n: mins })
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return t('monitor.timeHourAgo', { n: hrs })
    return t('monitor.timeDayAgo', { n: Math.floor(hrs / 24) })
  } catch {
    return ''
  }
}

onMounted(load)
</script>
