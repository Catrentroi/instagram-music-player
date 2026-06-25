// --- State Variables ---
let audioState = {
  fileLoaded: false,
  totalDuration: 360, // in seconds, default fallback
  startTime: 0,      // selected trimmer start time
  duration: 30,      // selected duration (15s or 30s) — default 30 to match IG
  isPlaying: false,
  isRecording: false, // guard to prevent audio loop during video recording
  animationFrameId: null,
  audioContext: null,
  decodedBuffer: null,
  lastActiveBarIndex: -1
};

let lyricsState = {
  enabled: true,
  style: 'scroll', // scroll, fade, neon, typewriter
  font: 'modern',  // modern, classic, gothic, script, typewriter, neon
  position: 'bottom', // top, center, bottom
  size: 20,
  color: '#ffffff',
  rawText: '',
  parsedLines: []
};

const DEFAULT_LYRICS = `[00:00.00] hot girl bummer - blackbear
[00:02.00] (Fuck you, and you, and you)
[00:05.00] I hate your friends and they hate me too
[00:09.00] I'm through, I'm through, I'm through
[00:12.50] This that hot girl bummer anthem
[00:15.50] Turn it up and throw a tantrum
[00:18.50] This that hot girl bummer anthem
[00:21.50] Turn it up and throw a tantrum
[00:24.50] (Fuck you, and you, and you)
[00:27.50] And you and your friends...`;

let audioSourceNode = null;
let mediaStreamDestination = null;

// --- DOM Elements ---
const dom = {
  // Inputs
  // Inputs
  modeBtns: document.querySelectorAll('.mode-btn'),
  groupCoverSingle: document.getElementById('group-cover-single'),
  groupCoverDouble: document.getElementById('group-cover-double'),

  coverInput: document.getElementById('cover-input'),
  coverDropzone: document.getElementById('cover-dropzone'),
  coverFileInfo: document.getElementById('cover-file-info'),
  coverUrlInput: document.getElementById('cover-url-input'),
  btnLoadCoverUrl: document.getElementById('btn-load-cover-url'),

  cover1Input: document.getElementById('cover1-input'),
  cover1Dropzone: document.getElementById('cover1-dropzone'),
  cover1FileInfo: document.getElementById('cover1-file-info'),
  cover1UrlInput: document.getElementById('cover1-url-input'),
  btnLoadCover1Url: document.getElementById('btn-load-cover1-url'),

  cover2Input: document.getElementById('cover2-input'),
  cover2Dropzone: document.getElementById('cover2-dropzone'),
  cover2FileInfo: document.getElementById('cover2-file-info'),
  cover2UrlInput: document.getElementById('cover2-url-input'),
  btnLoadCover2Url: document.getElementById('btn-load-cover2-url'),
  
  audioInput: document.getElementById('audio-input'),
  audioDropzone: document.getElementById('audio-dropzone'),
  audioFileInfo: document.getElementById('audio-file-info'),
  audioUrlInput: document.getElementById('audio-url-input'),
  btnLoadAudioUrl: document.getElementById('btn-load-audio-url'),
  
  groupTitleSingle: document.getElementById('group-title-single'),
  groupTitlesDouble: document.getElementById('group-titles-double'),
  trackTitleInput: document.getElementById('track-title-input'),
  trackTitle1Input: document.getElementById('track-title1-input'),
  trackTitle2Input: document.getElementById('track-title2-input'),
  groupArtistSingle: document.getElementById('group-artist-single'),
  artistInput: document.getElementById('artist-input'),
  
  groupArtistsDouble: document.getElementById('group-artists-double'),
  artist1Input: document.getElementById('artist1-input'),
  artist2Input: document.getElementById('artist2-input'),
  separatorSelect: document.getElementById('separator-select'),

  explicitInput: document.getElementById('explicit-input'),
  watermarkInput: document.getElementById('watermark-input'),
  
  fontBtns: document.querySelectorAll('.font-btn'),
  bgBtns: document.querySelectorAll('.bg-btn'),
  durationBtns: document.querySelectorAll('.duration-btn'),
  btnExport: document.getElementById('btn-export'),
  btnExportVideo: document.getElementById('btn-export-video'),
  
  // Preview
  storyCanvas: document.getElementById('story-canvas'),
  storyBgLayer: document.getElementById('story-bg-layer'),
  blurBgImg: document.getElementById('blur-bg-img'),
  
  stickerCoversContainer: document.getElementById('sticker-covers-container'),
  stickerCoverSingleWrapper: document.getElementById('sticker-cover-single-wrapper'),
  stickerCoverImg: document.getElementById('sticker-cover-img'),
  stickerCoverImgLeft: document.getElementById('sticker-cover-img-left'),
  stickerCoverImgRight: document.getElementById('sticker-cover-img-right'),
  separatorHeartIcon: document.getElementById('separator-heart-icon'),

  stickerInfoSingle: document.getElementById('sticker-info-single'),
  stickerTitleText: document.getElementById('sticker-title-text'),
  stickerExplicitBadge: document.getElementById('sticker-explicit-badge'),
  stickerArtistText: document.getElementById('sticker-artist-text'),

  stickerDualLayout: document.getElementById('sticker-dual-layout'),
  stickerTitleTextLeft: document.getElementById('sticker-title-text-left'),
  stickerTitleTextRight: document.getElementById('sticker-title-text-right'),
  stickerExplicitBadgeLeft: document.getElementById('sticker-explicit-badge-left'),
  stickerExplicitBadgeRight: document.getElementById('sticker-explicit-badge-right'),
  stickerArtistTextLeft: document.getElementById('sticker-artist-text-left'),
  stickerArtistTextRight: document.getElementById('sticker-artist-text-right'),
  
  stickerProgress: document.getElementById('sticker-progress'),
  stickerHandle: document.getElementById('sticker-handle'),
  stickerDurationVal: document.getElementById('sticker-duration-val'),
  stickerPlayBtn: document.getElementById('sticker-play-btn'),
  stickerPlayIcon: document.getElementById('sticker-play-icon'),
  stickerStopBtn: document.getElementById('sticker-stop-btn'),

  previewDurationBtn: document.getElementById('preview-duration-btn'),
  storyWatermarkText: document.getElementById('story-watermark-text'),
  
  // Trimmer
  trimStartVal: document.getElementById('trim-start-time'),
  trimEndVal: document.getElementById('trim-end-time'),
  waveformTrimmerContainer: document.getElementById('waveform-trimmer-container'),
  waveformWrapper: document.getElementById('waveform-wrapper'),
  waveformTrack: document.getElementById('waveform-track'),
  waveformSelection: document.getElementById('waveform-selection'),
  selectionPlayhead: document.getElementById('selection-playhead'),
  
  // Lyrics Controls
  lyricsEnableInput: document.getElementById('lyrics-enable-input'),
  lyricsStyleSelect: document.getElementById('lyrics-style-select'),
  lyricsFontSelect: document.getElementById('lyrics-font-select'),
  lyricsPositionSelect: document.getElementById('lyrics-position-select'),
  lyricsSizeInput: document.getElementById('lyrics-size-input'),
  lyricsSizeVal: document.getElementById('lyrics-size-val'),
  lyricsColorInput: document.getElementById('lyrics-color-input'),
  lyricsTextInput: document.getElementById('lyrics-text-input'),
  storyLyricsContainer: document.getElementById('story-lyrics-container'),

  // Audio Element
  mainAudio: document.getElementById('main-audio')
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
  setupTabs();
  setupEventListeners();
  generateDefaultWaveform();
  updateBackgroundBlur();
  updateTrimmerSelectionWidth();
  syncAllInputs();
  // Sync 30s duration button as active on load
  dom.durationBtns.forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-duration') === '30');
  });
});

// --- Setup Event Listeners ---
function setupEventListeners() {
  // Title and Artist updates
  dom.trackTitleInput.addEventListener('input', (e) => {
    dom.stickerTitleText.textContent = e.target.value || 'Không có tên';
  });

  dom.trackTitle1Input.addEventListener('input', (e) => {
    dom.stickerTitleTextLeft.textContent = e.target.value || 'Tên bài hát 1';
  });

  dom.trackTitle2Input.addEventListener('input', (e) => {
    dom.stickerTitleTextRight.textContent = e.target.value || 'Tên bài hát 2';
  });
  
  dom.artistInput.addEventListener('input', (e) => {
    dom.stickerArtistText.textContent = e.target.value || 'Nghệ sĩ ẩn danh';
  });
  
  dom.explicitInput.addEventListener('change', (e) => {
    const show = e.target.checked ? 'inline-flex' : 'none';
    dom.stickerExplicitBadge.style.display = show;
    if (dom.stickerExplicitBadgeLeft) dom.stickerExplicitBadgeLeft.style.display = show;
    if (dom.stickerExplicitBadgeRight) dom.stickerExplicitBadgeRight.style.display = show;
  });
  
  // Watermark text updates
  dom.watermarkInput.addEventListener('input', (e) => {
    dom.storyWatermarkText.textContent = e.target.value || '';
  });
  
  // Font Selector
  dom.fontBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.fontBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const font = btn.getAttribute('data-font');
      // Reset font classes
      dom.storyWatermarkText.className = 'story-watermark';
      dom.storyWatermarkText.classList.add(`font-${font}`);
    });
  });
  
  // Background Selector
  dom.bgBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.bgBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const bg = btn.getAttribute('data-bg');
      // Reset classes
      dom.storyBgLayer.className = 'story-bg';
      
      if (bg === 'black') {
        dom.storyBgLayer.classList.add('bg-black-mode');
      } else if (bg === 'neon-grad') {
        dom.storyBgLayer.classList.add('bg-neon-grad-mode');
      } else {
        // 'blur' is the default visual blurred image
        updateBackgroundBlur();
      }
    });
  });
  
  // Duration Toggle
  dom.durationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.durationBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const dur = parseInt(btn.getAttribute('data-duration'));
      setClipDuration(dur);
    });
  });
  
  // Also clicking duration circle on the sticker toggles it
  dom.previewDurationBtn.addEventListener('click', () => {
    const currentDur = audioState.duration;
    const newDur = currentDur === 15 ? 30 : 15;
    
    // Sync to buttons
    dom.durationBtns.forEach(btn => {
      if (parseInt(btn.getAttribute('data-duration')) === newDur) {
        btn.click();
      }
    });
  });
  
  // Display Mode toggle events
  dom.modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      dom.modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const mode = btn.getAttribute('data-mode');
      if (mode === 'double') {
        // Toggle Left Panel Inputs
        dom.groupCoverSingle.style.display = 'none';
        dom.groupCoverDouble.style.display = 'block';
        dom.groupTitleSingle.style.display = 'none';
        dom.groupTitlesDouble.style.display = 'block';
        dom.groupArtistSingle.style.display = 'none';
        dom.groupArtistsDouble.style.display = 'block';
        
        // Toggle Sticker Preview Elements
        dom.stickerCoversContainer.style.display = 'none';
        dom.stickerInfoSingle.style.display = 'none';
        dom.stickerDualLayout.style.display = 'flex';
      } else {
        // Toggle Left Panel Inputs
        dom.groupCoverSingle.style.display = 'block';
        dom.groupCoverDouble.style.display = 'none';
        dom.groupTitleSingle.style.display = 'block';
        dom.groupTitlesDouble.style.display = 'none';
        dom.groupArtistSingle.style.display = 'block';
        dom.groupArtistsDouble.style.display = 'none';
        
        // Toggle Sticker Preview Elements (Use empty string to restore default flex styling)
        dom.stickerCoversContainer.style.display = '';
        dom.stickerInfoSingle.style.display = '';
        dom.stickerDualLayout.style.display = 'none';
      }
      // Re-trigger background blur
      updateBackgroundBlur();
    });
  });

  // Artist 1 and 2 changes
  dom.artist1Input.addEventListener('input', (e) => {
    dom.stickerArtistTextLeft.textContent = e.target.value || 'Nghệ sĩ 1';
  });
  
  dom.artist2Input.addEventListener('input', (e) => {
    dom.stickerArtistTextRight.textContent = e.target.value || 'Nghệ sĩ 2';
  });

  // Separator select change
  dom.separatorSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    const iconEl = dom.separatorHeartIcon;
    const container = document.getElementById('covers-separator-container');
    
    if (val === 'none') {
      container.style.display = 'none';
    } else {
      container.style.display = 'flex';
      iconEl.className = 'separator-icon'; // reset
      if (val === 'heart') {
        iconEl.className = 'fa-solid fa-heart separator-icon';
        iconEl.style.color = '#ff3366';
      } else if (val === 'heart-white') {
        iconEl.className = 'fa-solid fa-heart separator-icon';
        iconEl.style.color = '#ffffff';
      } else if (val === 'heart-pink') {
        iconEl.className = 'fa-solid fa-heart separator-icon';
        iconEl.style.color = '#ff85a2';
      } else if (val === 'bolt') {
        iconEl.className = 'fa-solid fa-bolt separator-icon';
        iconEl.style.color = '#fcd34d';
      } else if (val === 'cross') {
        iconEl.className = 'fa-solid fa-xmark separator-icon';
        iconEl.style.color = '#ffffff';
      }
    }
  });

  // Cover art file upload (Single)
  setupDragAndDrop(dom.coverDropzone, dom.coverInput, handleCoverFile);

  // Cover art file uploads (Double)
  setupDragAndDrop(dom.cover1Dropzone, dom.cover1Input, handleCover1File);
  setupDragAndDrop(dom.cover2Dropzone, dom.cover2Input, handleCover2File);
  
  // Audio file upload
  setupDragAndDrop(dom.audioDropzone, dom.audioInput, handleAudioFile);
  
  // Play / Pause controls
  dom.stickerPlayBtn.addEventListener('click', togglePlayback);
  dom.stickerCoverImg.addEventListener('click', togglePlayback);
  dom.stickerCoverImgLeft.addEventListener('click', togglePlayback);
  dom.stickerCoverImgRight.addEventListener('click', togglePlayback);

  // Stop button
  dom.stickerStopBtn.addEventListener('click', () => {
    pausePlayback();
    // Reset progress bar to beginning
    dom.mainAudio.currentTime = audioState.startTime;
    updateProgressBarUI(0);
  });

  // Waveform trimmer drag
  setupTrimmerDragging();
  
  // Timeline click seeking (within clip)
  dom.waveformWrapper.addEventListener('click', (e) => {
    // Prevent seeking if clicking inside selection window (handled separately)
    if (e.target.closest('#waveform-selection')) return;
    
    // Jump selection window to the clicked point
    const wrapperRect = dom.waveformWrapper.getBoundingClientRect();
    const clickX = e.clientX - wrapperRect.left;
    const selectionWidth = dom.waveformSelection.offsetWidth;
    let newLeft = clickX - (selectionWidth / 2);
    
    // Constrain within boundaries
    newLeft = Math.max(0, Math.min(newLeft, wrapperRect.width - selectionWidth));
    dom.waveformSelection.style.left = `${newLeft}px`;
    
    updateClipRangeFromSelection();
  });
  
  // Export image
  dom.btnExport.addEventListener('click', exportStoryImage);
  
  // Export video
  dom.btnExportVideo.addEventListener('click', exportStoryVideo);
  
  // Listen to audio events
  dom.mainAudio.addEventListener('timeupdate', syncPlaybackProgress);
  dom.mainAudio.addEventListener('ended', () => {
    if (audioState.isPlaying) {
      dom.mainAudio.currentTime = audioState.startTime;
      dom.mainAudio.play().catch(() => {});
    }
  });

  // Load Cover Art from URL
  dom.btnLoadCoverUrl.addEventListener('click', handleCoverUrl);
  dom.coverUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCoverUrl();
    }
  });

  // Load Cover Art 1 from URL
  dom.btnLoadCover1Url.addEventListener('click', handleCover1Url);
  dom.cover1UrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCover1Url();
    }
  });

  // Load Cover Art 2 from URL
  dom.btnLoadCover2Url.addEventListener('click', handleCover2Url);
  dom.cover2UrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCover2Url();
    }
  });

  // Load Audio from URL
  dom.btnLoadAudioUrl.addEventListener('click', () => {
    const url = dom.audioUrlInput.value.trim();
    handleAudioUrl(url);
  });
  dom.audioUrlInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const url = dom.audioUrlInput.value.trim();
      handleAudioUrl(url);
    }
  });

  // Load metadata backup for external URL playing (e.g. if CORS prevents decoding but allows playback)
  dom.mainAudio.addEventListener('loadedmetadata', () => {
    if (!audioState.fileLoaded && dom.mainAudio.duration && !isNaN(dom.mainAudio.duration)) {
      audioState.totalDuration = dom.mainAudio.duration;
      audioState.fileLoaded = true;
      
      updateTrimmerSelectionWidth();
      
      resetTrimmerPosition();
      updateClipRangeFromSelection();
      
      const currentName = dom.audioFileInfo.textContent;
      if (currentName.includes('Sử dụng sóng giả lập')) {
        dom.audioFileInfo.textContent = `URL Audio (Sóng giả lập, ${formatSeconds(dom.mainAudio.duration)})`;
      }
    }
  });

  // Lyrics configuration inputs change listeners
  dom.lyricsEnableInput.addEventListener('change', syncLyricsFromDOM);
  dom.lyricsStyleSelect.addEventListener('change', syncLyricsFromDOM);
  dom.lyricsFontSelect.addEventListener('change', syncLyricsFromDOM);
  dom.lyricsPositionSelect.addEventListener('change', syncLyricsFromDOM);
  
  dom.lyricsSizeInput.addEventListener('input', () => {
    lyricsState.size = parseInt(dom.lyricsSizeInput.value, 10);
    updateLyricsUIConfig();
  });
  
  dom.lyricsColorInput.addEventListener('input', () => {
    lyricsState.color = dom.lyricsColorInput.value;
    updateLyricsUIConfig();
  });
  
  dom.lyricsTextInput.addEventListener('input', syncLyricsFromDOM);
}

// --- Sync Inputs at start ---
function syncAllInputs() {
  dom.stickerTitleText.textContent = dom.trackTitleInput.value;
  dom.stickerArtistText.textContent = dom.artistInput.value;
  
  // Dual mode syncs
  if (dom.trackTitle1Input) {
    dom.stickerTitleTextLeft.textContent = dom.trackTitle1Input.value || 'Tên bài hát 1';
  }
  if (dom.trackTitle2Input) {
    dom.stickerTitleTextRight.textContent = dom.trackTitle2Input.value || 'Tên bài hát 2';
  }
  if (dom.artist1Input) {
    dom.stickerArtistTextLeft.textContent = dom.artist1Input.value || 'Nghệ sĩ 1';
  }
  if (dom.artist2Input) {
    dom.stickerArtistTextRight.textContent = dom.artist2Input.value || 'Nghệ sĩ 2';
  }
  
  dom.storyWatermarkText.textContent = dom.watermarkInput.value;
  
  const explicitShow = dom.explicitInput.checked ? 'inline-flex' : 'none';
  dom.stickerExplicitBadge.style.display = explicitShow;
  if (dom.stickerExplicitBadgeLeft) dom.stickerExplicitBadgeLeft.style.display = explicitShow;
  if (dom.stickerExplicitBadgeRight) dom.stickerExplicitBadgeRight.style.display = explicitShow;
  
  // Set default lyrics
  if (dom.lyricsTextInput && !dom.lyricsTextInput.value.trim()) {
    dom.lyricsTextInput.value = DEFAULT_LYRICS;
  }
  syncLyricsFromDOM();

  // Set default cover image blur
  updateBackgroundBlur();
}

// --- Drag and Drop Helper ---
function setupDragAndDrop(dropzone, input, fileHandler) {
  dropzone.addEventListener('click', () => input.click());
  
  input.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      fileHandler(e.target.files[0]);
    }
  });
  
  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });
  
  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });
  
  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      input.files = e.dataTransfer.files;
      fileHandler(e.dataTransfer.files[0]);
    }
  });
}

// --- Setup Tabs for File Upload and URL inputs ---
function setupTabs() {
  const tabBtns = document.querySelectorAll('.tab-header-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const tabGroup = btn.parentElement;
      const section = btn.closest('.upload-group');
      
      // Remove active class from sibling buttons in this tab group
      tabGroup.querySelectorAll('.tab-header-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Hide all tab contents in this upload group and show the active one
      const targetTab = btn.getAttribute('data-tab');
      section.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `tab-${targetTab}`);
      });
    });
  });
}

// --- Handle Cover Image URL ---
function handleCoverUrl() {
  const url = dom.coverUrlInput.value.trim();
  if (!url) {
    alert('Vui lòng nhập URL ảnh bìa hợp lệ.');
    return;
  }
  
  dom.stickerCoverImg.src = url;
  updateBackgroundBlur(url);
  dom.coverFileInfo.textContent = `URL: ${url.substring(0, 30)}...`;
}

// --- Handle Cover Image 1 URL ---
function handleCover1Url() {
  const url = dom.cover1UrlInput.value.trim();
  if (!url) {
    alert('Vui lòng nhập URL ảnh bìa 1 hợp lệ.');
    return;
  }
  
  dom.stickerCoverImgLeft.src = url;
  updateBackgroundBlur(url);
  dom.cover1FileInfo.textContent = `URL: ${url.substring(0, 30)}...`;
}

// --- Handle Cover Image 2 URL ---
function handleCover2Url() {
  const url = dom.cover2UrlInput.value.trim();
  if (!url) {
    alert('Vui lòng nhập URL ảnh bìa 2 hợp lệ.');
    return;
  }
  
  dom.stickerCoverImgRight.src = url;
  dom.cover2FileInfo.textContent = `URL: ${url.substring(0, 30)}...`;
}

// --- Helper: Parse song title and artist from URL ---
function parseTitleArtistFromUrl(url) {
  try {
    const decodedUrl = decodeURIComponent(url);
    const urlObj = new URL(decodedUrl);
    const pathname = urlObj.pathname;
    const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
    if (filename) {
      return parseTitleArtistFromFilename(filename);
    }
  } catch (e) {
    console.error('Lỗi phân tích URL nhạc:', e);
  }
  return { title: 'Nhạc từ URL', artist: 'Nghệ sĩ ẩn danh' };
}

// --- Handle Audio URL ---
async function handleAudioUrl(url) {
  if (!url) {
    alert('Vui lòng nhập URL nhạc hợp lệ.');
    return;
  }
  
  pausePlayback();
  dom.audioFileInfo.textContent = 'Đang tải nhạc từ URL...';
  
  // Set source to audio element
  dom.mainAudio.src = url;
  
  // Try to parse metadata via jsmediatags
  if (window.jsmediatags) {
    window.jsmediatags.read(url, {
      onSuccess: function(tag) {
        let title = tag.tags.title;
        let artist = tag.tags.artist;
        
        if (!title && !artist) {
          const parsed = parseTitleArtistFromUrl(url);
          title = parsed.title;
          artist = parsed.artist;
        }
        updateSongMetadata(title, artist, tag.tags.picture);
      },
      onError: function(error) {
        console.warn('Lỗi jsmediatags khi đọc URL:', error);
        const parsed = parseTitleArtistFromUrl(url);
        updateSongMetadata(parsed.title, parsed.artist);
      }
    });
  } else {
    const parsed = parseTitleArtistFromUrl(url);
    updateSongMetadata(parsed.title, parsed.artist);
  }
  
  // Fetch remote audio as array buffer to decode waveform (needs CORS)
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    
    dom.audioFileInfo.textContent = 'Đang phân tích âm thanh...';
    
    if (!audioState.audioContext) {
      audioState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    audioState.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      audioState.decodedBuffer = buffer;
      audioState.totalDuration = buffer.duration;
      audioState.fileLoaded = true;
      
      updateTrimmerSelectionWidth();
      
      dom.audioFileInfo.textContent = `URL Audio (${formatSeconds(buffer.duration)})`;
      
      generateDecodedWaveform(buffer);
      audioState.startTime = 0;
      resetTrimmerPosition();
      updateClipRangeFromSelection();
    }, (error) => {
      console.error('Lỗi giải mã âm thanh từ URL:', error);
      dom.audioFileInfo.textContent = 'Lỗi phân tích âm thanh, sử dụng sóng giả lập.';
      audioState.fileLoaded = false;
      generateDefaultWaveform();
    });
  } catch (err) {
    console.warn('Không thể fetch file âm thanh để vẽ sóng nhạc (thường do CORS):', err);
    dom.audioFileInfo.textContent = 'Đã tải liên kết (Sử dụng sóng giả lập do CORS).';
    audioState.fileLoaded = false;
    generateDefaultWaveform();
  }
}

// --- Handle Cover Image File ---
function handleCoverFile(file) {
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn một tệp hình ảnh hợp lệ.');
    return;
  }
  
  dom.coverFileInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    dom.stickerCoverImg.src = dataUrl;
    updateBackgroundBlur(dataUrl);
  };
  reader.readAsDataURL(file);
}

// --- Handle Cover Image 1 File ---
function handleCover1File(file) {
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn một tệp hình ảnh hợp lệ.');
    return;
  }
  
  dom.cover1FileInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    dom.stickerCoverImgLeft.src = dataUrl;
    updateBackgroundBlur(dataUrl);
  };
  reader.readAsDataURL(file);
}

// --- Handle Cover Image 2 File ---
function handleCover2File(file) {
  if (!file.type.startsWith('image/')) {
    alert('Vui lòng chọn một tệp hình ảnh hợp lệ.');
    return;
  }
  
  dom.cover2FileInfo.textContent = `${file.name} (${formatBytes(file.size)})`;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    dom.stickerCoverImgRight.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

// --- Generate a blurred version of an image URL using canvas ---
function generateBlurredDataUrl(imgUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 180;
        canvas.height = 320;
        const ctx = canvas.getContext('2d');
        
        // Calculate cover proportions
        const imgRatio = img.width / img.height;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let offsetX = 0;
        let offsetY = 0;
        
        if (imgRatio > canvasRatio) {
          drawWidth = canvas.height * imgRatio;
          offsetX = (canvas.width - drawWidth) / 2;
        } else {
          drawHeight = canvas.width / imgRatio;
          offsetY = (canvas.height - drawHeight) / 2;
        }
        
        // Use native canvas blur filter if supported
        if ('filter' in ctx) {
          ctx.filter = 'blur(20px)';
          ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        } else {
          // Fallback: draw small and scale up for bilinear interpolation blur
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = 16;
          tempCanvas.height = 16;
          const tempCtx = tempCanvas.getContext('2d');
          tempCtx.drawImage(img, 0, 0, 16, 16);
          
          ctx.imageSmoothingEnabled = true;
          ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height);
        }
        
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      } catch (e) {
        console.error('Error generating blurred background:', e);
        resolve(imgUrl); // Fallback to raw image
      }
    };
    img.onerror = () => {
      resolve(imgUrl); // Fallback to raw image
    };
    img.src = imgUrl;
  });
}

// --- Update blurred background image ---
async function updateBackgroundBlur(customUrl = null) {
  let url = customUrl;
  if (!url) {
    const activeModeBtn = document.querySelector('.mode-btn.active');
    const mode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : 'single';
    if (mode === 'double') {
      url = dom.stickerCoverImgLeft?.src || '';
    } else {
      url = dom.stickerCoverImg?.src || '';
    }
  }
  if (url && !url.startsWith('data:image/svg+xml')) {
    if (url.startsWith('data:image') || url.startsWith('blob:') || url.startsWith('http') || url.startsWith('/')) {
      const blurredUrl = await generateBlurredDataUrl(url);
      dom.blurBgImg.style.backgroundImage = `url('${blurredUrl}')`;
    } else {
      dom.blurBgImg.style.backgroundImage = `url('${url}')`;
    }
  }
}

// --- Format bytes to readable size ---
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// --- Helper: Parse song title and artist from filename ---
function parseTitleArtistFromFilename(filename) {
  const nameWithoutExt = filename.substring(0, filename.lastIndexOf('.')) || filename;
  let title = '';
  let artist = '';
  
  if (nameWithoutExt.includes(' - ')) {
    const parts = nameWithoutExt.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (nameWithoutExt.includes('-')) {
    const parts = nameWithoutExt.split('-');
    artist = parts[0].trim();
    title = parts.slice(1).join('-').trim();
  } else {
    title = nameWithoutExt.trim();
    artist = '';
  }
  
  return { title, artist };
}

// --- Helper: Update UI and sticker with extracted metadata ---
function updateSongMetadata(title, artist, picture = null) {
  const finalTitle = title ? title.trim() : 'Không có tên';
  const finalArtist = artist ? artist.trim() : 'Nghệ sĩ ẩn danh';
  
  dom.trackTitleInput.value = title ? title.trim() : '';
  dom.artistInput.value = artist ? artist.trim() : '';
  
  dom.stickerTitleText.textContent = finalTitle;
  dom.stickerArtistText.textContent = finalArtist;
  
  // Smart split for Mashup (double mode)
  // E.g., title: "Hate That I Love You x Let Me Love You"
  // E.g., artist: "Ne-Yo x DJ Snake"
  let title1 = '';
  let title2 = '';
  if (finalTitle.toLowerCase().includes(' x ')) {
    const tParts = finalTitle.split(/ x /i);
    title1 = tParts[0].trim();
    title2 = tParts.slice(1).join(' x ').trim();
  } else if (finalTitle.includes(' & ')) {
    const tParts = finalTitle.split(' & ');
    title1 = tParts[0].trim();
    title2 = tParts.slice(1).join(' & ').trim();
  } else {
    title1 = finalTitle;
    title2 = '';
  }

  let artist1 = '';
  let artist2 = '';
  if (finalArtist.toLowerCase().includes(' x ')) {
    const aParts = finalArtist.split(/ x /i);
    artist1 = aParts[0].trim();
    artist2 = aParts.slice(1).join(' x ').trim();
  } else if (finalArtist.includes(' & ')) {
    const aParts = finalArtist.split(' & ');
    artist1 = aParts[0].trim();
    artist2 = aParts.slice(1).join(' & ').trim();
  } else {
    artist1 = finalArtist;
    artist2 = '';
  }

  if (dom.trackTitle1Input) dom.trackTitle1Input.value = title1;
  if (dom.trackTitle2Input) dom.trackTitle2Input.value = title2;
  if (dom.stickerTitleTextLeft) dom.stickerTitleTextLeft.textContent = title1 || 'Tên bài hát 1';
  if (dom.stickerTitleTextRight) dom.stickerTitleTextRight.textContent = title2 || 'Tên bài hát 2';

  if (dom.artist1Input) dom.artist1Input.value = artist1;
  if (dom.artist2Input) dom.artist2Input.value = artist2;
  if (dom.stickerArtistTextLeft) dom.stickerArtistTextLeft.textContent = artist1 || 'Nghệ sĩ 1';
  if (dom.stickerArtistTextRight) dom.stickerArtistTextRight.textContent = artist2 || 'Nghệ sĩ 2';
  
  if (picture) {
    try {
      let base64String = "";
      const bytes = picture.data;
      for (let i = 0; i < bytes.length; i++) {
        base64String += String.fromCharCode(bytes[i]);
      }
      const dataUrl = "data:" + picture.format + ";base64," + window.btoa(base64String);
      
      dom.stickerCoverImg.src = dataUrl;
      if (dom.stickerCoverImgLeft) {
        dom.stickerCoverImgLeft.src = dataUrl;
      }
      updateBackgroundBlur(dataUrl);
      dom.coverFileInfo.textContent = `Trích xuất từ Audio (${formatBytes(bytes.length)})`;
    } catch (e) {
      console.error('Lỗi trích xuất ảnh bìa bài hát:', e);
    }
  }
}

// --- Handle Audio File ---
function handleAudioFile(file) {
  if (!file.type.startsWith('audio/')) {
    alert('Vui lòng chọn một tệp âm thanh hợp lệ.');
    return;
  }
  
  // Stop current playback
  pausePlayback();
  
  dom.audioFileInfo.textContent = `${file.name} (${formatBytes(file.size)})`;

  // Read ID3 metadata (Title, Artist, Album Art) or fallback to filename parsing
  if (window.jsmediatags) {
    window.jsmediatags.read(file, {
      onSuccess: function(tag) {
        let title = tag.tags.title;
        let artist = tag.tags.artist;
        
        // Fallback if metadata is blank/missing
        if (!title && !artist) {
          const parsed = parseTitleArtistFromFilename(file.name);
          title = parsed.title;
          artist = parsed.artist;
        }
        
        updateSongMetadata(title, artist, tag.tags.picture);
      },
      onError: function(error) {
        console.warn('Error parsing ID3 tags:', error);
        const parsed = parseTitleArtistFromFilename(file.name);
        updateSongMetadata(parsed.title, parsed.artist);
      }
    });
  } else {
    const parsed = parseTitleArtistFromFilename(file.name);
    updateSongMetadata(parsed.title, parsed.artist);
  }
  
  // Set source to audio element
  const audioUrl = URL.createObjectURL(file);
  dom.mainAudio.src = audioUrl;
  
  // Prepare Web Audio API context for decoding
  const reader = new FileReader();
  reader.onload = function(e) {
    const arrayBuffer = e.target.result;
    
    // Show decoding status
    dom.audioFileInfo.textContent = `Đang phân tích âm thanh...`;
    
    if (!audioState.audioContext) {
      audioState.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    audioState.audioContext.decodeAudioData(arrayBuffer, (buffer) => {
      audioState.decodedBuffer = buffer;
      audioState.totalDuration = buffer.duration;
      audioState.fileLoaded = true;
      
      updateTrimmerSelectionWidth();
      
      dom.audioFileInfo.textContent = `${file.name} (${formatSeconds(buffer.duration)})`;
      
      // Generate actual waveform representation
      generateDecodedWaveform(buffer);
      
      // Update trimmer range constraints
      audioState.startTime = 0;
      resetTrimmerPosition();
      updateClipRangeFromSelection();
      
    }, (error) => {
      console.error('Lỗi giải mã âm thanh:', error);
      dom.audioFileInfo.textContent = `Lỗi phân tích âm thanh, sử dụng sóng giả lập.`;
      audioState.fileLoaded = false;
      generateDefaultWaveform();
    });
  };
  reader.readAsArrayBuffer(file);
}

// --- Generate Placeholder Waveform ---
function generateDefaultWaveform() {
  dom.waveformTrack.innerHTML = '';
  const barCount = 36; // Set to 36 to increase bar spacing by exactly 0.5px
  
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    
    // Alternating tall and short symmetrical bars
    const height = (i % 2 === 0) ? 28 : 12;
    bar.style.height = `${height}px`;
    dom.waveformTrack.appendChild(bar);
  }
  highlightTrimmerBars();
}

// --- Generate Waveform from decoded audio buffer ---
function generateDecodedWaveform(buffer) {
  // We keep the stylized symmetrical look even for uploaded audio to match IG visualizer
  dom.waveformTrack.innerHTML = '';
  const barCount = 36;
  
  for (let i = 0; i < barCount; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    
    // Alternating tall and short symmetrical bars
    const height = (i % 2 === 0) ? 28 : 12;
    bar.style.height = `${height}px`;
    dom.waveformTrack.appendChild(bar);
  }
  highlightTrimmerBars();
}

// --- Sync clip duration (15s or 30s) ---
function setClipDuration(dur) {
  audioState.duration = dur;
  dom.stickerDurationVal.textContent = dur;
  
  updateTrimmerSelectionWidth();
  
  // Enforce trimmer constraints if new width overflows
  resetTrimmerPosition();
  updateClipRangeFromSelection();

  // Re-sync lyrics for new duration partitioning if needed
  syncLyricsFromDOM();
}

// --- Update trimmer selection overlay box width ---
function updateTrimmerSelectionWidth() {
  const wrapperWidth = dom.waveformWrapper.offsetWidth || 335; // Default mockup size fallback
  
  // 30 seconds -> 40% of wrapper width
  // 15 seconds -> 20% of wrapper width
  const percent = audioState.duration === 15 ? 0.20 : 0.40;
  const width = percent * wrapperWidth;
  dom.waveformSelection.style.width = `${width}px`;
}

// --- Reset selection box position to start ---
function resetTrimmerPosition() {
  dom.waveformSelection.style.left = '0px';
}

// --- Trimmer Selection Drag & Drop Controls ---
function setupTrimmerDragging() {
  let isDragging = false;
  let startX = 0;
  let initialLeft = 0;
  
  dom.waveformSelection.addEventListener('mousedown', dragStart);
  dom.waveformSelection.addEventListener('touchstart', dragStart, { passive: true });
  
  function dragStart(e) {
    // Prevent playing while dragging
    isDragging = true;
    startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    initialLeft = parseInt(dom.waveformSelection.style.left || 0);
    
    document.addEventListener('mousemove', dragMove);
    document.addEventListener('touchmove', dragMove, { passive: false });
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('touchend', dragEnd);
  }
  
  function dragMove(e) {
    if (!isDragging) return;
    if (e.type === 'touchmove') e.preventDefault(); // Stop page scrolling
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const deltaX = clientX - startX;
    
    const wrapperWidth = dom.waveformWrapper.offsetWidth;
    const selectionWidth = dom.waveformSelection.offsetWidth;
    const maxLeft = wrapperWidth - selectionWidth;
    
    let newLeft = initialLeft + deltaX;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    
    dom.waveformSelection.style.left = `${newLeft}px`;
    
    updateClipRangeFromSelection();
  }
  
  function dragEnd() {
    if (isDragging) {
      isDragging = false;
      document.removeEventListener('mousemove', dragMove);
      document.removeEventListener('touchmove', dragMove);
      document.removeEventListener('mouseup', dragEnd);
      document.removeEventListener('touchend', dragEnd);
      
      // If playing, reset audio playback to the new start time
      if (audioState.isPlaying) {
        dom.mainAudio.currentTime = audioState.startTime;
        dom.mainAudio.play().catch(() => {});
      }
    }
  }
}

// --- Calculate and Sync Range from Selection Overlay ---
function updateClipRangeFromSelection() {
  const wrapperWidth = dom.waveformWrapper.offsetWidth || 335;
  const selectionWidth = dom.waveformSelection.offsetWidth || 130;
  const selectionLeft = parseInt(dom.waveformSelection.style.left || 0);
  
  const maxLeft = wrapperWidth - selectionWidth;
  const scrollRatio = maxLeft > 0 ? (selectionLeft / maxLeft) : 0;
  
  if (audioState.fileLoaded) {
    const totalPlayableRange = audioState.totalDuration - audioState.duration;
    // Map selection window position to start time
    audioState.startTime = scrollRatio * Math.max(0, totalPlayableRange);
  } else {
    // Simulated fallback: map selection box position to simulated 60s track
    const totalPlayableRange = 60 - audioState.duration;
    audioState.startTime = scrollRatio * totalPlayableRange;
  }
  
  const endTime = audioState.startTime + audioState.duration;
  
  // Format numbers to UI display
  dom.trimStartVal.textContent = formatSeconds(audioState.startTime);
  dom.trimEndVal.textContent = formatSeconds(endTime);
  
  highlightTrimmerBars();

  // Update sticker seekbar highlight segment (showing the selected clip range statically)
  const totalTrackDuration = audioState.fileLoaded ? audioState.totalDuration : 60;
  const leftPercent = (audioState.startTime / totalTrackDuration) * 100;
  const widthPercent = (audioState.duration / totalTrackDuration) * 100;
  dom.stickerProgress.style.left = `${leftPercent}%`;
  dom.stickerProgress.style.width = `${widthPercent}%`;
  
  // Seek audio player if loaded
  if (audioState.fileLoaded && !audioState.isPlaying) {
    dom.mainAudio.currentTime = audioState.startTime;
  }
}

// --- Format seconds into 00:00 format ---
function formatSeconds(secs) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// --- Highlight bars inside/outside selection window ---
function highlightTrimmerBars() {
  const wrapperWidth = dom.waveformWrapper.offsetWidth || 335;
  const selectionLeft = dom.waveformSelection.offsetLeft || 0;
  const selectionWidth = dom.waveformSelection.offsetWidth || 130;
  
  const bars = dom.waveformTrack.children;
  if (!bars.length) return;
  
  const selectionRight = selectionLeft + selectionWidth;
  const step = wrapperWidth / bars.length;
  
  for (let i = 0; i < bars.length; i++) {
    const barLeft = i * step;
    const barCenter = barLeft + (step / 2);
    // Check if bar center is inside selection window boundaries
    if (barCenter >= selectionLeft && barCenter <= selectionRight) {
      bars[i].classList.add('highlighted');
      
      // Calculate color gradient based on position relative to the selection window
      const relativePos = (barLeft - selectionLeft) / selectionWidth; // 0 to 1
      let hue;
      if (relativePos < 0.5) {
        // Orange/Yellow (35) to Pink/Magenta (345)
        hue = 35 - (relativePos * 2) * 50;
      } else {
        // Pink/Magenta (345) to Indigo/Purple (275)
        hue = 345 - ((relativePos - 0.5) * 2) * 70;
      }
      if (hue < 0) hue += 360;
      
      // Apply HSL color
      bars[i].style.backgroundColor = `hsl(${hue}, 95%, 60%)`;
    } else {
      bars[i].classList.remove('highlighted');
      bars[i].style.backgroundColor = ''; // Reverts to gray CSS styling
    }
  }
}

// --- Play / Pause Triggers ---
function togglePlayback() {
  if (audioState.isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  audioState.isPlaying = true;
  
  dom.stickerPlayIcon.className = 'fa-solid fa-pause play-icon';
  dom.stickerPlayBtn.classList.add('playing');
  
  dom.selectionPlayhead.style.display = 'block';
  
  if (audioState.fileLoaded) {
    dom.mainAudio.currentTime = audioState.startTime;
    dom.mainAudio.play().then(() => {
      startPlaybackAnimation();
    }).catch((err) => {
      console.warn("Lỗi phát nhạc, có thể do trình duyệt chặn:", err);
      startPlaybackAnimation();
    });
  } else {
    startPlaybackAnimation();
  }
}

function pausePlayback() {
  audioState.isPlaying = false;
  
  dom.stickerPlayIcon.className = 'fa-solid fa-play play-icon';
  dom.stickerPlayBtn.classList.remove('playing');
  
  dom.selectionPlayhead.style.display = 'none';
  if (dom.stickerHandle) dom.stickerHandle.style.display = 'none';
  
  if (audioState.fileLoaded) {
    dom.mainAudio.pause();
  }
  
  cancelAnimationFrame(audioState.animationFrameId);
  
  // Restore style of the last active playing bar
  if (audioState.lastActiveBarIndex >= 0) {
    const bars = dom.waveformTrack.children;
    if (bars && bars[audioState.lastActiveBarIndex]) {
      const activeBar = bars[audioState.lastActiveBarIndex];
      activeBar.classList.remove('playing-active');
      
      if (activeBar.classList.contains('highlighted')) {
        const selectionLeft = dom.waveformSelection.offsetLeft || 0;
        const selectionWidth = dom.waveformSelection.offsetWidth || 130;
        const step = (dom.waveformWrapper.offsetWidth || 335) / bars.length;
        const barLeft = audioState.lastActiveBarIndex * step;
        const relativePos = (barLeft - selectionLeft) / selectionWidth;
        let hue;
        if (relativePos < 0.5) {
          hue = 35 - (relativePos * 2) * 50;
        } else {
          hue = 345 - ((relativePos - 0.5) * 2) * 70;
        }
        if (hue < 0) hue += 360;
        activeBar.style.backgroundColor = `hsl(${hue}, 95%, 60%)`;
      } else {
        activeBar.style.backgroundColor = '';
      }
    }
    audioState.lastActiveBarIndex = -1;
  }
  
  // Stop waveform bar animation
  const bars = dom.waveformTrack.querySelectorAll('.wave-bar');
  bars.forEach(b => b.classList.remove('dancing-bar'));
}

// --- Playback Progress Syncing (keeps interpolation locked to audio element timeline) ---
function syncPlaybackProgress() {
  if (!audioState.isPlaying || !audioState.fileLoaded) return;
  if (audioState.isRecording) return; // Don't interfere with video recording playback
  if (dom.mainAudio.seeking) return;
  
  const current = dom.mainAudio.currentTime;
  const start = audioState.startTime;
  const dur = audioState.duration;
  
  // Enforce looping within the selected range (start to start + dur)
  if (current >= start + dur || current < start) {
    dom.mainAudio.currentTime = start;
    audioState.lastActiveBarIndex = -1;
    audioState.lastAudioTime = start;
    audioState.lastSyncPerfTime = performance.now();
    updateProgressBarUI(0);
  } else {
    // Synchronize baseline to prevent drift
    audioState.lastAudioTime = current;
    audioState.lastSyncPerfTime = performance.now();
  }
}

// --- Silky Smooth Playback Animation (60 FPS) ---
function startPlaybackAnimation() {
  cancelAnimationFrame(audioState.animationFrameId);
  
  audioState.lastActiveBarIndex = -1;
  audioState.lastAudioTime = audioState.fileLoaded ? dom.mainAudio.currentTime : audioState.startTime;
  audioState.lastSyncPerfTime = performance.now();
  
  function updateAnimation() {
    if (!audioState.isPlaying) return;
    
    const now = performance.now();
    const elapsed = (now - audioState.lastSyncPerfTime) / 1000;
    
    let current = audioState.lastAudioTime + elapsed;
    const start = audioState.startTime;
    const dur = audioState.duration;
    
    let relativeProgress = (current - start) / dur;
    
    if (relativeProgress >= 1) {
      relativeProgress = relativeProgress % 1;
      if (!audioState.fileLoaded) {
        audioState.lastAudioTime = start;
        audioState.lastSyncPerfTime = now;
      }
    } else if (relativeProgress < 0) {
      relativeProgress = 0;
    }
    
    updateProgressBarUI(relativeProgress);
    audioState.animationFrameId = requestAnimationFrame(updateAnimation);
  }
  
  audioState.animationFrameId = requestAnimationFrame(updateAnimation);
}

// --- Render Progress bar & seekbar values ---
function updateProgressBarUI(progress) {
  // Constrain 0 - 1
  progress = Math.max(0, Math.min(progress, 1));
  
  const selectionLeft = dom.waveformSelection.offsetLeft || 0;
  const selectionWidth = dom.waveformSelection.offsetWidth || 130;
  const playheadPixelX = selectionLeft + (progress * selectionWidth);
  dom.selectionPlayhead.style.display = 'block'; // Guarantee playhead is visible whenever progress is updated
  
  // Update selection trimmer playhead (now relative to the waveform-wrapper)
  dom.selectionPlayhead.style.left = `${playheadPixelX}px`;
  
  // Update sticker seekbar progress handle (dot)
  const totalTrackDuration = audioState.fileLoaded ? audioState.totalDuration : 60;
  const leftPercent = (audioState.startTime / totalTrackDuration);
  const widthPercent = (audioState.duration / totalTrackDuration);
  const handlePercent = (leftPercent + progress * widthPercent) * 100;
  if (dom.stickerHandle) {
    dom.stickerHandle.style.left = `${handlePercent}%`;
    dom.stickerHandle.style.display = 'block';
  }
  
  // Highlight waveform bar currently playing
  highlightPlayingBar(progress);

  // Synchronize dynamic lyrics preview
  updateLyricsPreview(progress);
}

// --- Highlight the wave bar under active playhead ---
function highlightPlayingBar(progress) {
  const bars = dom.waveformTrack.children;
  if (!bars.length) return;
  
  // Calculate active bar index inside selection window
  const wrapperWidth = dom.waveformWrapper.offsetWidth || 335;
  const selectionLeft = dom.waveformSelection.offsetLeft || 0;
  const selectionWidth = dom.waveformSelection.offsetWidth || 130;
  
  const playheadPixelX = selectionLeft + (progress * selectionWidth);
  const step = wrapperWidth / bars.length;
  
  const activeIndex = Math.max(0, Math.min(Math.floor(playheadPixelX / step), bars.length - 1));
  
  if (activeIndex === audioState.lastActiveBarIndex) return; // Skip DOM updates if active bar hasn't changed
  
  // Restore the style of the previously active bar
  if (audioState.lastActiveBarIndex >= 0 && audioState.lastActiveBarIndex < bars.length) {
    const oldBar = bars[audioState.lastActiveBarIndex];
    oldBar.classList.remove('playing-active');
    
    // Restore the dynamic HSL gradient color for other highlighted bars
    if (oldBar.classList.contains('highlighted')) {
      const barLeft = audioState.lastActiveBarIndex * step;
      const relativePos = (barLeft - selectionLeft) / selectionWidth;
      let hue;
      if (relativePos < 0.5) {
        hue = 35 - (relativePos * 2) * 50;
      } else {
        hue = 345 - ((relativePos - 0.5) * 2) * 70;
      }
      if (hue < 0) hue += 360;
      oldBar.style.backgroundColor = `hsl(${hue}, 95%, 60%)`;
    } else {
      oldBar.style.backgroundColor = '';
    }
  }
  
  // Apply white active style to the new active bar
  if (activeIndex >= 0 && activeIndex < bars.length) {
    const newBar = bars[activeIndex];
    if (newBar.classList.contains('highlighted')) {
      newBar.classList.add('playing-active');
      newBar.style.backgroundColor = '#ffffff';
    }
  }
  
  audioState.lastActiveBarIndex = activeIndex;
}

// --- Exporter Function (PNG Screenshot) ---
function exportStoryImage() {
  // Add exporting loading styling
  const origBtnText = dom.btnExport.innerHTML;
  dom.btnExport.disabled = true;
  dom.btnExport.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang trích xuất ảnh...';
  
  // Temporary hide some UI components during export (like trimmer playhead and notch highlight)
  const isPlayingBefore = audioState.isPlaying;
  if (isPlayingBefore) {
    pausePlayback();
  }
  
  // Run html2canvas capture
  // We specify high scale to export in high-res, and set useCORS to load cross-origin cover assets
  html2canvas(dom.storyCanvas, {
    useCORS: true,
    scale: 2,
    backgroundColor: '#000000',
    logging: false
  }).then(canvas => {
    // Generate file download link
    const imageLink = document.createElement('a');
    imageLink.download = `${dom.trackTitleInput.value.replace(/\s+/g, '_')}_ig_story.png`;
    imageLink.href = canvas.toDataURL('image/png');
    imageLink.click();
    
    // Restore button state
    dom.btnExport.disabled = false;
    dom.btnExport.innerHTML = origBtnText;
    
    // Resume playback if it was active
    if (isPlayingBefore) {
      startPlayback();
    }
  }).catch(error => {
    console.error('Lỗi khi xuất ảnh:', error);
    alert('Không thể xuất ảnh do sự cố kỹ thuật. Hãy chụp lại màn hình hoặc thử lại.');
    dom.btnExport.disabled = false;
    dom.btnExport.innerHTML = origBtnText;
  });
}

// --- Exporter Function (DOM capture → pixel-perfect video) ---
async function exportStoryVideo() {
  if (!audioState.fileLoaded) {
    alert('Vui lòng tải tệp âm thanh hoặc nhập link nhạc trước khi xuất video.');
    return;
  }

  const origBtnText = dom.btnExportVideo.innerHTML;
  dom.btnExportVideo.disabled = true;
  dom.btnExport.disabled = true;
  dom.btnExportVideo.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang chụp giao diện...';

  if (audioState.isPlaying) pausePlayback();

  const resetButtons = () => {
    dom.btnExportVideo.disabled = false;
    dom.btnExport.disabled = false;
    dom.btnExportVideo.innerHTML = origBtnText;
  };

  try {
    // Measure the story canvas DOM element size
    const domW = dom.storyCanvas.offsetWidth;
    const domH = dom.storyCanvas.offsetHeight;

    // Target output: 1080x1920 (TikTok portrait Full HD)
    const W = 1080, H = 1920, FPS = 30;
    const scaleX = W / domW;
    const scaleY = H / domH;

    // ── Step 1: Capture the ACTUAL story DOM as a static base frame ──────────
    // Use html2canvas to capture the story canvas div (the phone preview element)
    const domCapture = await html2canvas(dom.storyCanvas, {
      useCORS: true,
      scale: scaleX, // Match the target export scale for Full HD resolution
      backgroundColor: null,
      logging: false,
      ignoreElements: (el) => el.id === 'selection-playhead' || el.id === 'story-lyrics-container',
    });

    // Restore elements
    dom.selectionPlayhead.style.display = '';

    // Convert the html2canvas result to an ImageBitmap (GPU texture, free to copy each frame)
    const staticBitmap = await createImageBitmap(domCapture);
    domCapture.width = 1; domCapture.height = 1; // free

    // ── Step 2: Measure seekbar geometry in DOM space for playhead overlay ───
    // We need to know where the highlighted segment is so we can animate the dot
    const timelineEl = dom.storyCanvas.querySelector('.sticker-timeline .timeline-bar');
    const progressEl = dom.stickerProgress;

    // Get bounding boxes relative to the story canvas
    const canvasRect = dom.storyCanvas.getBoundingClientRect();
    const barRect = timelineEl ? timelineEl.getBoundingClientRect() : null;
    const progressRect = progressEl ? progressEl.getBoundingClientRect() : null;

    // Convert to canvas-output coordinates
    let barStartX = 0, barEndX = W, barY = H / 2, dotR = 4;
    if (barRect && progressRect) {
      const pLeft = (progressRect.left - canvasRect.left) * scaleX;
      const pRight = pLeft + progressRect.width * scaleX;
      barY = (progressRect.top - canvasRect.top + progressRect.height / 2) * scaleY;
      barStartX = pLeft;
      barEndX = pRight;
      dotR = Math.max(3, progressRect.height * scaleY * 0.9);
    }

    // ── Step 3: Setup recording canvas ──────────────────────────────────────
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = W; exportCanvas.height = H;
    const ctx = exportCanvas.getContext('2d', { willReadFrequently: false });

    const canvasStream = exportCanvas.captureStream(0);
    const videoTrack = canvasStream.getVideoTracks()[0];

    // Audio via element.captureStream()
    let audioStream = null;
    try {
      audioStream = dom.mainAudio.captureStream
        ? dom.mainAudio.captureStream()
        : dom.mainAudio.mozCaptureStream
          ? dom.mainAudio.mozCaptureStream() : null;
    } catch(e) {}

    const tracks = [videoTrack];
    if (audioStream) audioStream.getAudioTracks().forEach(t => tracks.push(t));
    const stream = new MediaStream(tracks);

    let recOptions = {};
    let extension = 'webm';
    
    const mimeTypes = [
      'video/mp4;codecs=avc1.64003E,mp4a.40.2',
      'video/mp4;codecs=avc1.4d401f,mp4a.40.2',
      'video/mp4',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    
    for (const m of mimeTypes) {
      if (MediaRecorder.isTypeSupported(m)) {
        recOptions = { mimeType: m };
        if (m.includes('video/mp4')) {
          extension = 'mp4';
        }
        break;
      }
    }

    const recorder = new MediaRecorder(stream, recOptions);
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data && e.data.size > 0) chunks.push(e.data); };
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      const name = (dom.trackTitleInput.value || 'story').replace(/\s+/g, '_').replace(/[^\w-]/g, '');
      const a = document.createElement('a');
      a.download = `${name}_tiktok.${extension}`;
      a.href = url;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      staticBitmap.close();
      audioState.isRecording = false;

      // Reset playhead in DOM preview after recording finishes
      dom.selectionPlayhead.style.display = 'none';
      if (dom.stickerHandle) dom.stickerHandle.style.display = 'none';
      if (audioState.lastActiveBarIndex >= 0) {
        const bars = dom.waveformTrack.children;
        if (bars && bars[audioState.lastActiveBarIndex]) {
          const activeBar = bars[audioState.lastActiveBarIndex];
          activeBar.classList.remove('playing-active');
          if (activeBar.classList.contains('highlighted')) {
            const selectionLeft = dom.waveformSelection.offsetLeft || 0;
            const selectionWidth = dom.waveformSelection.offsetWidth || 130;
            const step = (dom.waveformWrapper.offsetWidth || 335) / bars.length;
            const barLeft = audioState.lastActiveBarIndex * step;
            const relativePos = (barLeft - selectionLeft) / selectionWidth;
            let hue = relativePos < 0.5 ? 35 - (relativePos * 2) * 50 : 345 - ((relativePos - 0.5) * 2) * 70;
            if (hue < 0) hue += 360;
            activeBar.style.backgroundColor = `hsl(${hue}, 95%, 60%)`;
          } else {
            activeBar.style.backgroundColor = '';
          }
        }
        audioState.lastActiveBarIndex = -1;
      }

      resetButtons();
    };

    // ── Step 4: Record ───────────────────────────────────────────────────────
    audioState.isRecording = true;
    dom.selectionPlayhead.style.display = 'block'; // Make playhead visible in DOM preview during recording
    recorder.start(500);
    dom.mainAudio.currentTime = audioState.startTime;
    dom.btnExportVideo.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang quay 0%...';
    await dom.mainAudio.play().catch(() => {});

    const startMs = performance.now();
    const durationMs = audioState.duration * 1000;
    const frameMs = Math.round(1000 / FPS);

    const wrapLine = (text, maxW, font) => {
      ctx.save();
      ctx.font = font;
      const words = text.split(' ');
      let currentLine = '';
      const subLines = [];
      for (let n = 0; n < words.length; n++) {
        const testLine = currentLine + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxW && n > 0) {
          subLines.push(currentLine.trim());
          currentLine = words[n] + ' ';
        } else {
          currentLine = testLine;
        }
      }
      subLines.push(currentLine.trim());
      ctx.restore();
      return subLines;
    };

    function tick() {
      if (recorder.state === 'inactive') return;
      const elapsed = performance.now() - startMs;
      const progress = Math.min(1.0, elapsed / durationMs);

      // Draw static background (pixel-perfect DOM capture, scaled to 360×640)
      ctx.drawImage(staticBitmap, 0, 0, W, H);

      // Draw dynamic lyrics on the exported video
      if (lyricsState.enabled && lyricsState.parsedLines.length) {
        const currentTime = audioState.startTime + progress * audioState.duration;
        const lines = lyricsState.parsedLines;
        
        let activeIndex = -1;
        for (let i = 0; i < lines.length; i++) {
          if (currentTime >= lines[i].time) {
            activeIndex = i;
          } else {
            break;
          }
        }
        
        if (activeIndex >= -1) {
          ctx.save();
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = lyricsState.color;
          
          // Map position to Y coordinate on Full HD canvas (W=1080, H=1920)
          let lyricY = H - 65 * scaleY; // pos-bottom default
          if (lyricsState.position === 'top') {
            lyricY = 50 * scaleY;
          } else if (lyricsState.position === 'center') {
            lyricY = H * 0.45;
          }
          
          // Font family mapping
          const fm = { 
            gothic: "'UnifrakturMaguntia', serif", 
            classic: "'Playfair Display', serif", 
            modern: "'Montserrat', sans-serif", 
            script: "'Pacifico', cursive", 
            typewriter: "'Courier Prime', monospace", 
            neon: "'Comfortaa', sans-serif" 
          };
          const lyricFontName = fm[lyricsState.font] || "sans-serif";
          const baseSize = lyricsState.size * scaleX;
          
          // Apply text shadows
          if (lyricsState.style === 'neon') {
            ctx.shadowColor = lyricsState.color;
            ctx.shadowBlur = 24;
          } else {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
            ctx.shadowBlur = 8 * scaleX;
          }
          
          const maxW = W - 80 * scaleX; // Keep margins safe
          const activeFont = `bold ${baseSize * 1.08}px ${lyricFontName}`;
          const sideFont = `${baseSize * 0.85}px ${lyricFontName}`;
          
          if (lyricsState.style === 'scroll') {
            const prevLine = activeIndex > 0 ? lines[activeIndex - 1] : null;
            const activeLine = activeIndex >= 0 ? lines[activeIndex] : null;
            const nextLine = activeIndex + 1 < lines.length ? lines[activeIndex + 1] : null;
            
            const activeSublines = activeLine 
              ? wrapLine(activeLine.text, maxW, activeFont) 
              : (lines.length > 0 ? wrapLine(lines[0].text, maxW, sideFont) : []);
            
            const activeLineHeight = (activeLine ? baseSize * 1.08 : baseSize * 0.85) * 1.4;
            const sideLineHeight = baseSize * 0.85 * 1.4;
            
            // Draw active line centered at lyricY
            ctx.save();
            ctx.font = activeLine ? activeFont : sideFont;
            if (!activeLine) ctx.globalAlpha = 0.35;
            
            let currentY = lyricY - ((activeSublines.length - 1) * activeLineHeight) / 2;
            for (let i = 0; i < activeSublines.length; i++) {
              ctx.fillText(activeSublines[i], W / 2, currentY);
              currentY += activeLineHeight;
            }
            ctx.restore();
            
            // Draw previous line (semi-transparent) above active block
            if (prevLine) {
              const prevSublines = wrapLine(prevLine.text, maxW, sideFont);
              const topOfActive = lyricY - (activeSublines.length * activeLineHeight) / 2;
              const bottomOfPrev = topOfActive - 15 * scaleY;
              
              ctx.save();
              ctx.globalAlpha = 0.35;
              ctx.font = sideFont;
              let prevY = bottomOfPrev - (prevSublines.length - 1) * sideLineHeight;
              for (let i = 0; i < prevSublines.length; i++) {
                ctx.fillText(prevSublines[i], W / 2, prevY);
                prevY += sideLineHeight;
              }
              ctx.restore();
            }
            
            // Draw next line (semi-transparent) below active block
            if (nextLine && activeLine) {
              const nextSublines = wrapLine(nextLine.text, maxW, sideFont);
              const bottomOfActive = lyricY + (activeSublines.length * activeLineHeight) / 2;
              const topOfNext = bottomOfActive + 15 * scaleY;
              
              ctx.save();
              ctx.globalAlpha = 0.35;
              ctx.font = sideFont;
              let nextY = topOfNext;
              for (let i = 0; i < nextSublines.length; i++) {
                ctx.fillText(nextSublines[i], W / 2, nextY);
                nextY += sideLineHeight;
              }
              ctx.restore();
            }
          } else if (lyricsState.style === 'typewriter' && activeIndex >= 0) {
            const line = lines[activeIndex];
            const nextLine = lines[activeIndex + 1];
            const lineStartTime = line.time;
            const lineEndTime = nextLine ? nextLine.time : (audioState.startTime + audioState.duration);
            const lineDuration = lineEndTime - lineStartTime;
            const elapsedInLine = currentTime - lineStartTime;
            
            const charCount = line.text.length;
            const typeDuration = Math.max(0.5, lineDuration * 0.7);
            const progressRatio = Math.min(1.0, elapsedInLine / typeDuration);
            const charsToShow = Math.ceil(progressRatio * charCount);
            
            const textToShow = line.text.substring(0, charsToShow);
            const typewriterFont = `${baseSize}px ${lyricFontName}`;
            const typewriterSublines = wrapLine(textToShow, maxW, typewriterFont);
            const lineHeight = baseSize * 1.4;
            
            ctx.save();
            ctx.font = typewriterFont;
            let currentY = lyricY - ((typewriterSublines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < typewriterSublines.length; i++) {
              ctx.fillText(typewriterSublines[i], W / 2, currentY);
              currentY += lineHeight;
            }
            ctx.restore();
          } else if (activeIndex >= 0) {
            // Fade / Neon style (single line)
            const line = lines[activeIndex];
            const singleFont = `${baseSize}px ${lyricFontName}`;
            const singleSublines = wrapLine(line.text, maxW, singleFont);
            const lineHeight = baseSize * 1.4;
            
            ctx.save();
            ctx.font = singleFont;
            let currentY = lyricY - ((singleSublines.length - 1) * lineHeight) / 2;
            for (let i = 0; i < singleSublines.length; i++) {
              ctx.fillText(singleSublines[i], W / 2, currentY);
              currentY += lineHeight;
            }
            ctx.restore();
          }
          
          ctx.restore();
        }
      }

      // Draw animated playhead dot on top
      const phX = barStartX + progress * (barEndX - barStartX);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = 'rgba(0,0,0,0.5)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(phX, barY, dotR, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      // Draw animated pink vertical playhead line on the bottom waveform trimmer in the exported video!
      const wrapperEl = dom.storyCanvas.querySelector('#waveform-wrapper');
      const selectionEl = dom.storyCanvas.querySelector('#waveform-selection');
      if (wrapperEl && selectionEl) {
        const canvasRect = dom.storyCanvas.getBoundingClientRect();
        const wrapperRect = wrapperEl.getBoundingClientRect();
        
        // Convert wrapper dimensions to canvas space
        const wrapperLeft = (wrapperRect.left - canvasRect.left) * scaleX;
        const wrapperTop = (wrapperRect.top - canvasRect.top) * scaleY;
        const wrapperHeight = wrapperRect.height * scaleY;
        
        // Measure selection positions relative to wrapper
        const selectionLeft = selectionEl.offsetLeft * scaleX;
        const selectionWidth = selectionEl.offsetWidth * scaleX;
        
        // Calculate playhead X on canvas
        const phPinkX = wrapperLeft + selectionLeft + (progress * selectionWidth);
        
        // Draw the vertical line on the canvas
        ctx.strokeStyle = '#e1306c';
        ctx.lineWidth = 3 * scaleX; // Match thick line for Full HD scale
        ctx.beginPath();
        ctx.moveTo(phPinkX, wrapperTop);
        ctx.lineTo(phPinkX, wrapperTop + wrapperHeight);
        ctx.stroke();
      }

      // Update DOM preview playhead and waveform bars in real-time
      updateProgressBarUI(progress);

      if (typeof videoTrack.requestFrame === 'function') videoTrack.requestFrame();

      const pct = Math.min(100, Math.floor(progress * 100));
      dom.btnExportVideo.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Đang quay ' + pct + '%...';

      if (elapsed >= durationMs) { recorder.stop(); dom.mainAudio.pause(); }
      else setTimeout(tick, frameMs);
    }
    setTimeout(tick, 100);

  } catch (err) {
    audioState.isRecording = false;
    console.error('Video export error:', err);
    alert('Lỗi xuất video: ' + err.message + '\n\nHãy đảm bảo đã tải nhạc từ file máy (không phải URL).');
    resetButtons();
  }
}

// --- Lightweight Canvas Frame (uses pre-baked ImageBitmaps — no per-frame blur) ---
function drawCanvasFrameLite(ctx, W, H, progress, bgBitmap, coverBitmap) {
  const s = W / 375;
  const cx = W / 2, cy = H / 2;
  const scy = cy - 55 * s;

  // Background (GPU texture blit — essentially free)
  if (bgBitmap) ctx.drawImage(bgBitmap, 0, 0, W, H);
  else { ctx.fillStyle = '#1e1e24'; ctx.fillRect(0, 0, W, H); }

  const activeModeBtn = document.querySelector('.mode-btn.active');
  const displayMode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : 'single';

  // Cover art
  const cs = 78 * s, cx0 = cx - cs / 2, cy0 = scy - cs / 2 - 36 * s, r = 11 * s, b = 4 * s;
  
  if (displayMode === 'double') {
    const coverLeftImg = document.getElementById('sticker-cover-img-left');
    const coverRightImg = document.getElementById('sticker-cover-img-right');
    const csDouble = 68 * s;
    const gap = 15 * s;
    const cxLeft = cx - csDouble - (gap / 2);
    const cxRight = cx + (gap / 2);
    const cyDouble = cy0 + 5 * s;
    
    // Draw Left cover
    ctx.save();
    ctx.fillStyle = '#fff';
    drawRoundedRect(ctx, cxLeft - b, cyDouble - b, csDouble + b * 2, csDouble + b * 2, r + b); ctx.fill();
    ctx.beginPath(); drawRoundedRect(ctx, cxLeft, cyDouble, csDouble, csDouble, r); ctx.clip();
    if (coverLeftImg && coverLeftImg.complete && coverLeftImg.naturalWidth !== 0) {
      ctx.drawImage(coverLeftImg, cxLeft, cyDouble, csDouble, csDouble);
    } else {
      ctx.fillStyle = '#1e222b'; ctx.fillRect(cxLeft, cyDouble, csDouble, csDouble);
    }
    ctx.restore();
    
    // Draw Right cover
    ctx.save();
    ctx.fillStyle = '#fff';
    drawRoundedRect(ctx, cxRight - b, cyDouble - b, csDouble + b * 2, csDouble + b * 2, r + b); ctx.fill();
    ctx.beginPath(); drawRoundedRect(ctx, cxRight, cyDouble, csDouble, csDouble, r); ctx.clip();
    if (coverRightImg && coverRightImg.complete && coverRightImg.naturalWidth !== 0) {
      ctx.drawImage(coverRightImg, cxRight, cyDouble, csDouble, csDouble);
    } else {
      ctx.fillStyle = '#1e222b'; ctx.fillRect(cxRight, cyDouble, csDouble, csDouble);
    }
    ctx.restore();
    
    // Draw separator icon
    const separatorSelect = document.getElementById('separator-select');
    const separatorType = separatorSelect ? separatorSelect.value : 'heart';
    if (separatorType !== 'none') {
      let heartChar = '❤️';
      if (separatorType === 'heart-white') heartChar = '🤍';
      else if (separatorType === 'heart-pink') heartChar = '💖';
      else if (separatorType === 'bolt') heartChar = '⚡';
      else if (separatorType === 'cross') heartChar = '✖';
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${14 * s}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(heartChar, cx, cyDouble + csDouble / 2);
      ctx.restore();
    }
  } else {
    ctx.save();
    ctx.fillStyle = '#fff';
    drawRoundedRect(ctx, cx0 - b, cy0 - b, cs + b * 2, cs + b * 2, r + b); ctx.fill();
    ctx.beginPath(); drawRoundedRect(ctx, cx0, cy0, cs, cs, r); ctx.clip();
    if (coverBitmap) ctx.drawImage(coverBitmap, cx0, cy0, cs, cs);
    else { ctx.fillStyle = '#1e222b'; ctx.fillRect(cx0, cy0, cs, cs); }
    ctx.restore();
  }

  // Title & Artist
  const title = dom.trackTitleInput.value.trim() || 'Tên bài hát';
  const ty = cy0 + cs + 21 * s;
  ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff';
  ctx.font = 'bold ' + Math.round(18 * s) + 'px system-ui,sans-serif';
  ctx.fillText(title, cx, ty);

  if (dom.explicitInput.checked) {
    const tw = ctx.measureText(title).width, bs = 11 * s, bx = cx + tw / 2 + 7, by = ty - bs;
    ctx.save(); ctx.fillStyle = '#fff';
    drawRoundedRect(ctx, bx, by, bs, bs, 2 * s); ctx.fill();
    ctx.fillStyle = '#000'; ctx.font = 'bold ' + Math.round(6.5 * s) + 'px system-ui,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('E', bx + bs / 2, by + bs / 2); ctx.restore();
  }

  const cw = 200 * s;
  if (displayMode === 'double') {
    const artist1 = dom.artist1Input?.value.trim() || 'Nghệ sĩ 1';
    const artist2 = dom.artist2Input?.value.trim() || 'Nghệ sĩ 2';
    
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = Math.round(13 * s) + 'px system-ui,sans-serif';
    ctx.textBaseline = 'alphabetic';
    
    ctx.textAlign = 'left';
    ctx.fillText(artist1, cx - cw / 2 + 8 * s, ty + 15 * s);
    
    ctx.textAlign = 'right';
    ctx.fillText(artist2, cx + cw / 2 - 8 * s, ty + 15 * s);
  } else {
    const artist = dom.artistInput.value.trim() || 'Tên ca sĩ';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    ctx.font = Math.round(13 * s) + 'px system-ui,sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillText(artist, cx, ty + 15 * s);
  }

  // Controls
  const cty = ty + 50 * s, ctX = cx - cw / 2, cr = 12 * s;
  ctx.strokeStyle = 'rgba(255,255,255,0.8)'; ctx.lineWidth = 1.5 * s;
  ctx.beginPath(); ctx.arc(ctX + cr, cty, cr, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.font = 'bold ' + Math.round(9 * s) + 'px system-ui,sans-serif';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('' + audioState.duration, ctX + cr, cty);
  ctx.beginPath(); ctx.arc(ctX + cw - cr, cty, cr, 0, Math.PI * 2); ctx.stroke();
  const sq = 4.5 * s; ctx.fillStyle = '#fff';
  ctx.fillRect(ctX + cw - cr - sq / 2, cty - sq / 2, sq, sq);

  // Seekbar
  const bx1 = ctX + cr * 2 + 7 * s, bx2 = ctX + cw - cr * 2 - 7 * s, bwid = bx2 - bx1;
  const tot = audioState.fileLoaded ? audioState.totalDuration : 60;
  const hl = bx1 + (audioState.startTime / tot) * bwid;
  const hr = hl + (audioState.duration / tot) * bwid;
  ctx.lineCap = 'round';
  ctx.strokeStyle = 'rgba(255,255,255,0.2)'; ctx.lineWidth = 2.5 * s;
  ctx.beginPath(); ctx.moveTo(bx1, cty); ctx.lineTo(bx2, cty); ctx.stroke();
  ctx.strokeStyle = '#fff';
  ctx.beginPath(); ctx.moveTo(hl, cty); ctx.lineTo(hr, cty); ctx.stroke();
  ctx.fillStyle = '#fff'; ctx.beginPath();
  ctx.arc(hl + progress * (hr - hl), cty, 3.5 * s, 0, Math.PI * 2); ctx.fill();

  // Slideshow dots
  const dy = cty + 36 * s, dg = 5.5 * s, ds = 3.2 * s;
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx - dg - ds, dy, ds, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.28)'; ctx.beginPath();
  ctx.arc(cx, dy, ds, 0, Math.PI * 2); ctx.arc(cx + dg + ds, dy, ds, 0, Math.PI * 2); ctx.fill();

  // Watermark
  const wm = dom.watermarkInput.value.trim();
  if (wm) {
    const ft = (document.querySelector('.font-btn.active') || { getAttribute: () => 'gothic' }).getAttribute('data-font');
    const fm = { gothic: "'UnifrakturMaguntia',serif", classic: "'Playfair Display',serif", modern: "'Montserrat',sans-serif", script: "'Pacifico',cursive", typewriter: "'Courier Prime',monospace", neon: "'Comfortaa',sans-serif" };
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff';
    if (ft === 'neon') { ctx.shadowColor = 'rgba(255,255,255,0.9)'; ctx.shadowBlur = 8; }
    ctx.font = Math.round(16 * s) + 'px ' + (fm[ft] || 'system-ui,sans-serif');
    ctx.fillText(wm, cx, H * 0.74);
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
  }
}

// --- Draw Full Story Frame to Canvas ---
function drawCanvasFrame(ctx, width, height, progress, coverImg, blurredBgCanvas) {
  const bgType = document.querySelector('.bg-btn.active').getAttribute('data-bg');
  
  // 1. Render background layers
  if (bgType === 'black') {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
  } else if (bgType === 'neon-grad') {
    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#f953c6');
    grad.addColorStop(0.5, '#b91d73');
    grad.addColorStop(1, '#1e1e24');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);
  } else {
    // Draw pre-rendered blurred background canvas directly (prevents GPU crashes)
    if (blurredBgCanvas) {
      ctx.drawImage(blurredBgCanvas, 0, 0);
    } else {
      ctx.fillStyle = '#1e1e24';
      ctx.fillRect(0, 0, width, height);
    }
  }



  // 3. Draw Center Music Sticker
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = width / 375; // Dynamic scale: 375px is the iPhone 12 base width
  const stickerCenterY = centerY - (60 * scale); // Shift upward to keep safe from TikTok caption zone
  const controlWidth = (375 - 120) * scale; // Narrower control width to stay safe from TikTok interaction icons on the right

  const activeModeBtn = document.querySelector('.mode-btn.active');
  const displayMode = activeModeBtn ? activeModeBtn.getAttribute('data-mode') : 'single';

  // A. Draw Cover Art with rounded white border
  if (displayMode === 'double') {
    // Draw two covers and a separator in between
    const coverSize = 68 * scale;
    const gap = 15 * scale;
    
    // Left cover
    const coverLeftX = centerX - coverSize - (gap / 2);
    const coverLeftY = stickerCenterY - (40 * scale);
    
    // Right cover
    const coverRightX = centerX + (gap / 2);
    const coverRightY = stickerCenterY - (40 * scale);
    
    // Draw left cover art
    ctx.save();
    ctx.fillStyle = '#ffffff';
    const borderThickness = 3 * scale;
    const outerSize = coverSize + (borderThickness * 2);
    drawRoundedRect(ctx, coverLeftX - borderThickness, coverLeftY - borderThickness, outerSize, outerSize, 15 * scale);
    ctx.fill();
    
    ctx.beginPath();
    drawRoundedRect(ctx, coverLeftX, coverLeftY, coverSize, coverSize, 12 * scale);
    ctx.clip();
    const coverLeftImg = document.getElementById('sticker-cover-img-left');
    if (coverLeftImg && coverLeftImg.complete && coverLeftImg.naturalWidth !== 0) {
      ctx.drawImage(coverLeftImg, coverLeftX, coverLeftY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#1e222b';
      ctx.fillRect(coverLeftX, coverLeftY, coverSize, coverSize);
    }
    ctx.restore();
    
    // Draw right cover art
    ctx.save();
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, coverRightX - borderThickness, coverRightY - borderThickness, outerSize, outerSize, 15 * scale);
    ctx.fill();
    
    ctx.beginPath();
    drawRoundedRect(ctx, coverRightX, coverRightY, coverSize, coverSize, 12 * scale);
    ctx.clip();
    const coverRightImg = document.getElementById('sticker-cover-img-right');
    if (coverRightImg && coverRightImg.complete && coverRightImg.naturalWidth !== 0) {
      ctx.drawImage(coverRightImg, coverRightX, coverRightY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#1e222b';
      ctx.fillRect(coverRightX, coverRightY, coverSize, coverSize);
    }
    ctx.restore();
    
    // Draw separator icon
    const separatorSelect = document.getElementById('separator-select');
    const separatorType = separatorSelect ? separatorSelect.value : 'heart';
    if (separatorType !== 'none') {
      let heartChar = '❤️';
      if (separatorType === 'heart-white') heartChar = '🤍';
      else if (separatorType === 'heart-pink') heartChar = '💖';
      else if (separatorType === 'bolt') heartChar = '⚡';
      else if (separatorType === 'cross') heartChar = '✖';
      
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = `${15 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
      ctx.fillText(heartChar, centerX, coverLeftY + (coverSize / 2));
      ctx.restore();
    }
  } else {
    const coverSize = 82 * scale; // ~236px at 1080 / ~118px at 540
    const coverX = centerX - (coverSize / 2);
    const coverY = stickerCenterY - (50 * scale);
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    const borderThickness = 3.5 * scale; // 10px
    const outerSize = coverSize + (borderThickness * 2);
    const outerX = coverX - borderThickness;
    const outerY = coverY - borderThickness;
    drawRoundedRect(ctx, outerX, outerY, outerSize, outerSize, 18 * scale);
    ctx.fill();
    
    // Clip and Draw Cover Image
    ctx.beginPath();
    drawRoundedRect(ctx, coverX, coverY, coverSize, coverSize, 14 * scale);
    ctx.clip();
    if (coverImg && coverImg.complete && coverImg.naturalWidth !== 0) {
      ctx.drawImage(coverImg, coverX, coverY, coverSize, coverSize);
    } else {
      ctx.fillStyle = '#1e222b';
      ctx.fillRect(coverX, coverY, coverSize, coverSize);
    }
    ctx.restore();
  }

  // B. Draw Metadata text
  const title = dom.trackTitleInput.value.trim() || 'Tên bài hát';
  const artist = dom.artistInput.value.trim() || 'Tên ca sĩ';
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#ffffff';
  
  // Title text
  ctx.font = `bold ${19 * scale}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
  const titleY = stickerCenterY + 100;
  ctx.fillText(title, centerX, titleY);
  
  // Explicit badge if checked
  const explicitChecked = dom.explicitInput.checked;
  if (explicitChecked) {
    // Measure title width to draw explicit badge on the right
    const titleWidth = ctx.measureText(title).width;
    const badgeSize = 13 * scale;
    const badgeX = centerX + (titleWidth / 2) + 12;
    const badgeY = titleY - (13 * scale);
    
    ctx.save();
    ctx.fillStyle = '#ffffff';
    drawRoundedRect(ctx, badgeX, badgeY, badgeSize, badgeSize, 3 * scale);
    ctx.fill();
    
    ctx.fillStyle = '#000000';
    ctx.font = `bold ${8 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', badgeX + (badgeSize / 2), badgeY + (badgeSize / 2));
    ctx.restore();
  }
  
  // Artist text
  ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
  ctx.font = `${14 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
  const artistY = titleY + (18 * scale);

  if (displayMode === 'double') {
    const artist1 = dom.artist1Input?.value.trim() || 'Nghệ sĩ 1';
    const artist2 = dom.artist2Input?.value.trim() || 'Nghệ sĩ 2';
    
    ctx.textAlign = 'left';
    ctx.fillText(artist1, centerX - (controlWidth / 2) + (8 * scale), artistY);
    
    ctx.textAlign = 'right';
    ctx.fillText(artist2, centerX + (controlWidth / 2) - (8 * scale), artistY);
  } else {
    ctx.textAlign = 'center';
    ctx.fillText(artist, centerX, artistY);
  }

  // C. Draw Controls Row
  const controlY = artistY + (45 * scale);
  const controlX = centerX - (controlWidth / 2);
  
  // Duration circle (Left)
  const circleRadius = 14 * scale;
  const leftCircleX = controlX + circleRadius;
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.arc(leftCircleX, controlY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${10 * scale}px -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(audioState.duration.toString(), leftCircleX, controlY);
  
  // Stop circle (Right)
  const rightCircleX = controlX + controlWidth - circleRadius;
  ctx.beginPath();
  ctx.arc(rightCircleX, controlY, circleRadius, 0, Math.PI * 2);
  ctx.stroke();
  
  ctx.fillStyle = '#ffffff';
  const stopSize = 6 * scale;
  ctx.fillRect(rightCircleX - (stopSize / 2), controlY - (stopSize / 2), stopSize, stopSize);
  
  // Seekbar (Center)
  const barStartX = leftCircleX + circleRadius + (10 * scale);
  const barEndX = rightCircleX - circleRadius - (10 * scale);
  const barWidth = barEndX - barStartX;
  
  // Gray background line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 3 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(barStartX, controlY);
  ctx.lineTo(barEndX, controlY);
  ctx.stroke();
  
  // Highlight range line
  const totalTrackDuration = audioState.fileLoaded ? audioState.totalDuration : 60;
  const highlightLeftPercent = audioState.startTime / totalTrackDuration;
  const highlightWidthPercent = audioState.duration / totalTrackDuration;
  
  const hStart = barStartX + (highlightLeftPercent * barWidth);
  const hEnd = hStart + (highlightWidthPercent * barWidth);
  
  ctx.strokeStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(hStart, controlY);
  ctx.lineTo(hEnd, controlY);
  ctx.stroke();
  
  // Playhead dot on top
  const playheadX = hStart + (progress * (hEnd - hStart));
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(playheadX, controlY, 4 * scale, 0, Math.PI * 2);
  ctx.fill();

  // 4. Draw Slideshow Dots (Centered, below control row)
  const dotsY = controlY + (45 * scale);
  const dotGap = 6 * scale;
  const dotSize = 3.5 * scale;
  
  const dotX1 = centerX - dotGap - dotSize;
  const dotX2 = centerX;
  const dotX3 = centerX + dotGap + dotSize;
  
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(dotX1, dotsY, dotSize, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(dotX2, dotsY, dotSize, 0, Math.PI * 2);
  ctx.arc(dotX3, dotsY, dotSize, 0, Math.PI * 2);
  ctx.fill();

  // 5. Draw Watermark
  const watermarkText = dom.watermarkInput.value.trim();
  if (watermarkText) {
    const activeFontBtn = document.querySelector('.font-btn.active');
    const fontType = activeFontBtn ? activeFontBtn.getAttribute('data-font') : 'gothic';
    
    let fontName = '-apple-system, BlinkMacSystemFont, sans-serif';
    let sizeMultiplier = 1.0;
    if (fontType === 'gothic') {
      fontName = "'UnifrakturMaguntia', serif";
      sizeMultiplier = 1.15;
    } else if (fontType === 'classic') {
      fontName = "'Playfair Display', serif";
      sizeMultiplier = 1.05;
    } else if (fontType === 'modern') {
      fontName = "'Montserrat', sans-serif";
      sizeMultiplier = 0.95;
    } else if (fontType === 'script') {
      fontName = "'Pacifico', cursive";
      sizeMultiplier = 1.05;
    } else if (fontType === 'typewriter') {
      fontName = "'Courier Prime', monospace";
      sizeMultiplier = 0.9;
    } else if (fontType === 'neon') {
      fontName = "'Comfortaa', sans-serif";
      sizeMultiplier = 0.95;
    }
    
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    
    if (fontType === 'neon') {
      ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 10;
    }
    
    ctx.font = `${18 * scale * sizeMultiplier}px ${fontName}`;
    const watermarkY = height * 0.72; // Raised to stay safe from TikTok bottom caption overlays
    ctx.fillText(watermarkText, centerX, watermarkY);
    
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
}

// --- Helper: Draw Rounded Rectangle ---
function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

// --- Lyrics Parsing and Synchronization Helpers ---
function parseLRC(lrcText) {
  const lines = lrcText.split('\n');
  const lyrics = [];
  const timeRegex = /\[(\d+):(\d+)(?:\.(\d+))?\]/g;
  
  for (let line of lines) {
    line = line.trim();
    if (!line) continue;
    
    let match;
    const timestamps = [];
    let cleanText = line;
    
    timeRegex.lastIndex = 0;
    while ((match = timeRegex.exec(line)) !== null) {
      timestamps.push(match);
      cleanText = cleanText.replace(match[0], '');
    }
    
    cleanText = cleanText.trim();
    
    for (const ts of timestamps) {
      const min = parseInt(ts[1], 10);
      const sec = parseInt(ts[2], 10);
      const ms = ts[3] ? parseInt(ts[3].padEnd(3, '0').substring(0, 3), 10) : 0;
      const timeInSeconds = min * 60 + sec + ms / 1000;
      lyrics.push({ time: timeInSeconds, text: cleanText });
    }
  }
  
  lyrics.sort((a, b) => a.time - b.time);
  return lyrics;
}

function parseLyrics(inputText, duration) {
  if (/\[\d+:\d+(?:\.\d+)?\]/.test(inputText)) {
    return parseLRC(inputText);
  }
  
  const lines = inputText.split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
  
  if (lines.length === 0) return [];
  
  const step = duration / lines.length;
  return lines.map((text, idx) => ({
    time: idx * step,
    text: text
  }));
}

let lastRenderedLyricIndex = -2;
let lastRenderedLyricStyle = '';

function syncLyricsFromDOM() {
  if (!dom.lyricsEnableInput) return;
  
  lyricsState.enabled = dom.lyricsEnableInput.checked;
  lyricsState.style = dom.lyricsStyleSelect.value;
  lyricsState.font = dom.lyricsFontSelect.value;
  lyricsState.position = dom.lyricsPositionSelect.value;
  lyricsState.size = parseInt(dom.lyricsSizeInput.value, 10);
  lyricsState.color = dom.lyricsColorInput.value;
  lyricsState.rawText = dom.lyricsTextInput.value;
  
  lyricsState.parsedLines = parseLyrics(lyricsState.rawText, audioState.duration);
  
  updateLyricsUIConfig();
  
  // Force active lyric text re-render on DOM/settings edit
  lastRenderedLyricIndex = -2;
  lastRenderedLyricStyle = '';
  
  const currentProgress = audioState.fileLoaded 
    ? (dom.mainAudio.currentTime - audioState.startTime) / audioState.duration
    : 0;
  updateLyricsPreview(currentProgress);
}

function updateLyricsUIConfig() {
  const container = dom.storyLyricsContainer;
  if (!container) return;
  
  if (!lyricsState.enabled) {
    container.style.display = 'none';
    return;
  }
  
  container.style.display = 'flex';
  
  container.className = `story-lyrics-container pos-${lyricsState.position} lyrics-style-${lyricsState.style}`;
  
  const fontClasses = ['font-modern', 'font-classic', 'font-gothic', 'font-script', 'font-typewriter', 'font-neon'];
  fontClasses.forEach(c => container.classList.remove(c));
  container.classList.add(`font-${lyricsState.font}`);
  
  container.style.fontSize = `${lyricsState.size}px`;
  container.style.color = lyricsState.color;
  
  if (lyricsState.style === 'neon') {
    container.style.textShadow = `0 0 6px ${lyricsState.color}, 0 0 14px ${lyricsState.color}, 0 0 22px rgba(255,255,255,0.6)`;
  } else {
    container.style.textShadow = '0 2px 6px rgba(0, 0, 0, 0.6)';
  }
  
  if (dom.lyricsSizeVal) {
    dom.lyricsSizeVal.textContent = `${lyricsState.size}px`;
  }
}

// --- Live sync preview updating ---
function updateLyricsPreview(progress) {
  if (!lyricsState.enabled || !lyricsState.parsedLines.length) {
    if (dom.storyLyricsContainer) dom.storyLyricsContainer.innerHTML = '';
    return;
  }
  
  // Cap progress between 0 and 1
  progress = Math.max(0, Math.min(progress, 1));
  const currentTime = audioState.startTime + progress * audioState.duration;
  const lines = lyricsState.parsedLines;
  
  let activeIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    if (currentTime >= lines[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }
  
  if (activeIndex === -1) {
    if (lyricsState.style === 'scroll') {
      renderScrollLyrics(-1);
    } else {
      if (dom.storyLyricsContainer) dom.storyLyricsContainer.innerHTML = '';
    }
    return;
  }
  
  if (lyricsState.style === 'scroll') {
    renderScrollLyrics(activeIndex);
  } else if (lyricsState.style === 'typewriter') {
    renderTypewriterLyric(activeIndex, currentTime);
  } else {
    renderSingleLineLyric(activeIndex);
  }
}

function renderSingleLineLyric(index) {
  const line = lyricsState.parsedLines[index];
  if (lastRenderedLyricIndex === index && lastRenderedLyricStyle === lyricsState.style) return;
  lastRenderedLyricIndex = index;
  lastRenderedLyricStyle = lyricsState.style;
  
  const container = dom.storyLyricsContainer;
  if (!container) return;
  
  container.innerHTML = `<div class="lyric-line active">${escapeHTML(line.text)}</div>`;
}

function renderScrollLyrics(index) {
  if (lastRenderedLyricIndex === index && lastRenderedLyricStyle === 'scroll') return;
  lastRenderedLyricIndex = index;
  lastRenderedLyricStyle = 'scroll';
  
  const container = dom.storyLyricsContainer;
  if (!container) return;
  
  const lines = lyricsState.parsedLines;
  
  const prevLineText = index > 0 ? lines[index - 1].text : '';
  const activeLineText = index >= 0 ? lines[index].text : '';
  const nextLineText = index + 1 < lines.length ? lines[index + 1].text : '';
  
  let html = '';
  if (prevLineText) {
    html += `<div class="lyric-line previous">${escapeHTML(prevLineText)}</div>`;
  }
  if (activeLineText) {
    html += `<div class="lyric-line active">${escapeHTML(activeLineText)}</div>`;
  } else {
    html += `<div class="lyric-line next">${escapeHTML(lines[0].text)}</div>`;
  }
  if (nextLineText && activeLineText) {
    html += `<div class="lyric-line next">${escapeHTML(nextLineText)}</div>`;
  }
  
  container.innerHTML = html;
}

function renderTypewriterLyric(index, currentTime) {
  const lines = lyricsState.parsedLines;
  const line = lines[index];
  const nextLine = lines[index + 1];
  
  const lineStartTime = line.time;
  const lineEndTime = nextLine ? nextLine.time : (audioState.startTime + audioState.duration);
  const lineDuration = lineEndTime - lineStartTime;
  const elapsedInLine = currentTime - lineStartTime;
  
  const charCount = line.text.length;
  const typeDuration = Math.max(0.5, lineDuration * 0.7); // type over 70% of duration, at least 0.5s
  const progressRatio = Math.min(1.0, elapsedInLine / typeDuration);
  const charsToShow = Math.ceil(progressRatio * charCount);
  
  const textToShow = line.text.substring(0, charsToShow);
  
  const container = dom.storyLyricsContainer;
  if (!container) return;
  
  lastRenderedLyricIndex = index;
  lastRenderedLyricStyle = 'typewriter';
  
  container.innerHTML = `<div class="lyric-line active">${escapeHTML(textToShow)}</div>`;
}

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

