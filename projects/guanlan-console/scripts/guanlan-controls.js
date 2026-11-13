(function () {
  var themeStyleId = 'guanlan-jquan-controls-theme';
  var themeCss = `
[jq-select-wrap] {
  width: 100%;
  font-family: AlimamaAgileVF, "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
}
[jq-select-trigger] {
  min-height: 48px;
  border: 1px solid rgba(231, 234, 246, 0.96) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.74) !important;
  color: #30366F !important;
  box-shadow: 0 16px 40px rgba(86, 103, 214, 0.08) !important;
}
[jq-select-trigger]:hover,
[jq-select-trigger][data-open="true"] {
  border-color: rgba(89, 107, 232, 0.46) !important;
  background: rgba(255, 255, 255, 0.92) !important;
}
[jq-select-trigger]:focus-visible {
  border-color: #596BE8 !important;
  box-shadow: 0 0 0 4px rgba(89, 107, 232, 0.14) !important;
}
[jq-select-placeholder],
[jq-select-arrow] {
  color: #AEB5D1 !important;
}
[jq-select-clear] {
  color: #747BA8 !important;
}
[jq-select-clear]:hover {
  background: rgba(89, 107, 232, 0.1) !important;
  color: #596BE8 !important;
}
[jq-select-panel] {
  border: 1px solid rgba(231, 234, 246, 0.98) !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.97) !important;
  box-shadow: 0 22px 55px rgba(68, 77, 146, 0.16) !important;
  backdrop-filter: blur(18px);
}
[jq-select-search] {
  border: 1px solid #E7EAF6 !important;
  border-radius: 12px !important;
  background: #F7FAFF !important;
  color: #30366F !important;
}
[jq-select-search]:focus {
  border-color: #596BE8 !important;
  box-shadow: 0 0 0 3px rgba(89, 107, 232, 0.12) !important;
}
[jq-select-option] {
  border-radius: 12px !important;
  color: #30366F !important;
}
[jq-select-option]:hover,
[jq-select-option][data-active="true"] {
  border-color: rgba(89, 107, 232, 0.16) !important;
  background: rgba(89, 107, 232, 0.06) !important;
}
[jq-select-option][data-selected="true"] {
  border-color: rgba(89, 107, 232, 0.2) !important;
  background: rgba(89, 107, 232, 0.1) !important;
}
[jq-select-option][data-selected="true"] [jq-select-check] {
  background: #596BE8 !important;
  border-color: #596BE8 !important;
}
[jq-select-option-meta] {
  color: #596BE8 !important;
}
[jq-select-empty] {
  background: #F7FAFF !important;
  color: #747BA8 !important;
}
[jq-tag-input-wrap] {
  width: 100%;
  font-family: AlimamaAgileVF, "Microsoft YaHei UI", "Microsoft YaHei", sans-serif;
}
[jq-tag-input-control] {
  min-height: 48px;
  border: 1px solid rgba(231, 234, 246, 0.96) !important;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.74) !important;
  box-shadow: 0 16px 40px rgba(86, 103, 214, 0.08) !important;
}
[jq-tag-input-control][data-focused="true"] {
  border-color: #596BE8 !important;
  box-shadow: 0 0 0 4px rgba(89, 107, 232, 0.14) !important;
}
[jq-tag-chip] {
  min-height: 30px;
  border: 1px solid rgba(89, 107, 232, 0.14) !important;
  border-radius: 999px !important;
  background: rgba(89, 107, 232, 0.1) !important;
  color: #3858A8 !important;
}
[jq-tag-chip-remove] {
  color: #596BE8 !important;
}
[jq-tag-chip-remove]:hover {
  background: rgba(89, 107, 232, 0.14) !important;
}
[jq-tag-input-field] {
  color: #30366F !important;
}
[jq-tag-input-field]::placeholder {
  color: #AEB5D1 !important;
}
[jq-tag-input-meta],
[jq-tag-input-feedback] {
  color: #747BA8 !important;
}
[jq-tag-input-panel] {
  border: 1px solid rgba(231, 234, 246, 0.98) !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.97) !important;
  box-shadow: 0 22px 55px rgba(68, 77, 146, 0.16) !important;
}
[jq-tag-input-suggestion] {
  border-radius: 12px !important;
  color: #30366F !important;
}
[jq-tag-input-suggestion]:hover,
[jq-tag-input-suggestion][data-active="true"] {
  border-color: rgba(89, 107, 232, 0.16) !important;
  background: rgba(89, 107, 232, 0.06) !important;
}
[jq-upload] {
  gap: 14px !important;
}
[jq-upload-toolbar] button,
[jq-upload-actions] button {
  border-color: #E7EAF6 !important;
  border-radius: 10px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  color: #30366F !important;
  font-weight: 700;
}
[jq-upload-toolbar] button:hover,
[jq-upload-actions] button:hover {
  border-color: rgba(89, 107, 232, 0.35) !important;
  background: rgba(89, 107, 232, 0.06) !important;
  color: #596BE8 !important;
}
[jq-upload-dropzone] {
  min-height: 164px !important;
  border-color: rgba(89, 107, 232, 0.28) !important;
  border-radius: 18px !important;
  background: rgba(247, 250, 255, 0.74) !important;
  color: #747BA8 !important;
}
[jq-upload-dropzone][data-dragover="true"] {
  border-color: #596BE8 !important;
  background: rgba(89, 107, 232, 0.08) !important;
}
[jq-upload-item] {
  border-color: #E7EAF6 !important;
  border-radius: 14px !important;
  background: rgba(255, 255, 255, 0.74) !important;
}
[jq-upload-progress] {
  background: #EEF5FF !important;
}
[jq-upload-progress] span {
  background: #596BE8 !important;
}
.gl-media-asset {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #E7EAF6;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.72);
}
.gl-media-asset-preview {
  position: relative;
  display: grid;
  width: 64px;
  height: 52px;
  place-items: center;
  overflow: hidden;
  border-radius: 10px;
  background: #EEF5FF;
  color: #596BE8;
}
.gl-media-asset-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.gl-media-asset-preview i {
  position: absolute;
  display: none;
}
.gl-media-asset-preview img:not([src]),
.gl-media-asset-preview img[src=""] {
  display: none;
}
.gl-media-asset-preview img[src=""] + i {
  display: block;
}
.gl-icon-button {
  display: inline-flex;
  min-width: 32px;
  min-height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: background-color .2s ease;
}
.gl-icon-button:hover {
  background: rgba(255, 111, 134, 0.08);
}
`;

  function applyTheme() {
    var previous = document.getElementById(themeStyleId);
    if (previous) previous.remove();
    var style = document.createElement('style');
    style.id = themeStyleId;
    style.textContent = themeCss;
    document.head.appendChild(style);
  }

  applyTheme();
  document.addEventListener('jquan:ready', applyTheme, { once: true });
})();
