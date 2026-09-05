import axios from 'axios'
import config from '/src/config.js'

const API = axios.create({
  baseURL: `${config.PROTOCOL}//${config.BACKEND}:${config.PORT}${config.BASEURL}`,
})

function listMonitoredPlaylists() {
  return API.get('/api/monitor/playlists')
}

function addMonitoredPlaylist(url, intervalMinutes = 60, isPlaylist = true) {
  return API.post('/api/monitor/playlists', {
    url,
    interval_minutes: intervalMinutes,
    is_playlist: isPlaylist,
  })
}

function updateMonitoredPlaylist(id, updates) {
  return API.patch(`/api/monitor/playlists/${id}`, updates)
}

function deleteMonitoredPlaylist(id, deleteFiles = false) {
  return API.delete(`/api/monitor/playlists/${id}`, {
    params: { delete_files: deleteFiles },
  })
}

function checkMonitoredPlaylist(id) {
  return API.post(`/api/monitor/playlists/${id}/check`)
}

export default {
  listMonitoredPlaylists,
  addMonitoredPlaylist,
  updateMonitoredPlaylist,
  deleteMonitoredPlaylist,
  checkMonitoredPlaylist,
}
