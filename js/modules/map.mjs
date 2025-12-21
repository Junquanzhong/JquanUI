/**
 * 地图模块主入口文件 (v1.3.0 - 新增多语言支持)
 * 新增：通过 `language` 参数控制地图语言（如 'zh-CN', 'en'）
 * 修复：BaiduMapProvider 错误调用 AMap、options 冗余赋值、key 校验增强
 */

// --- 工具函数 ---

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${url}"]`);
        if (existing) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

function normalizeCoordinate(coordinate) {
    // 处理字符串 "[lng,lat]"
    if (typeof coordinate === 'string') {
        const parts = coordinate.split(',').map(s => parseFloat(s.trim()));
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            return parts;
        }
        throw new Error(`Invalid coordinate string: ${coordinate}`);
    }
    // 处理数组
    if (Array.isArray(coordinate)) {
        if (coordinate.length !== 2) {
            throw new Error('Coordinate array must have exactly 2 elements.');
        }
        const lng = parseFloat(coordinate[0]);
        const lat = parseFloat(coordinate[1]);
        if (isNaN(lng) || isNaN(lat)) {
            throw new Error('Coordinate array elements must be numbers or numeric strings.');
        }
        return [lng, lat];
    }
    // 处理对象 {lng, lat}
    if (coordinate && typeof coordinate === 'object') {
        let lng, lat;
        if (typeof coordinate.lng === 'number' || typeof coordinate.lng === 'string') {
            lng = parseFloat(coordinate.lng);
        } else if (typeof coordinate.lon === 'number' || typeof coordinate.lon === 'string') {
            lng = parseFloat(coordinate.lon);
        } else if (typeof coordinate.longitude === 'number' || typeof coordinate.longitude === 'string') {
            lng = parseFloat(coordinate.longitude);
        }
        if (typeof coordinate.lat === 'number' || typeof coordinate.lat === 'string') {
            lat = parseFloat(coordinate.lat);
        } else if (typeof coordinate.latitude === 'number' || typeof coordinate.latitude === 'string') {
            lat = parseFloat(coordinate.latitude);
        }
        if (isNaN(lng) || isNaN(lat)) {
            throw new Error('Invalid coordinate object: missing or non-numeric lng/lat.');
        }
        return [lng, lat];
    }
    throw new Error(`Invalid coordinate format: ${JSON.stringify(coordinate)}`);
}

// --- 全局加载状态（防重复加载）---
let isBaiduLoading = false;
let isGaodeLoading = false;

// --- 主工厂类 ---
class Map {
    static defaultOptions = {
        source: 'baidu',
        key: null,
        zoom: 12,
        mapType: 'normal',
        showZoomControl: true,
        showScaleControl: true,
        language: 'zh-CN', // ✅ 新增默认语言
    };

    static configure(defaults) {
        this.defaultOptions = Object.assign({}, this.defaultOptions, defaults);
        console.log('Map 全局配置已更新:', this.defaultOptions);
    }

    constructor(options) {
        if (!options || !options.container) {
            throw new Error('Map options must include "container" (DOM element ID or element).');
        }
        if (!options.center) {
            throw new Error('Map options must include "center" (e.g., {lng: 116, lat: 39} or [116, 39]).');
        }

        this.options = Object.assign({}, Map.defaultOptions, options);

        // 校验 key
        if (!this.options.key) {
            throw new Error('Map API key is required. Please set it via Map.configure({ key: "YOUR_KEY" }).');
        }

        // ✅ 统一语言格式为小写
        this.options.language = (this.options.language || 'zh-CN').toLowerCase();

        this.provider = null;
    }

    async init() {
        const { source } = this.options;

        if (source === 'baidu') {
            this.provider = new BaiduMapProvider(this.options);
        } else if (source === 'gaode') {
            this.provider = new GaodeMapProvider(this.options);
        } else {
            throw new Error(`Unsupported map source: ${source}. Use 'baidu' or 'gaode'.`);
        }

        await this.provider.init();
        return this._getController();
    }

    _getController() {
        if (!this.provider) return null;
        return {
            setCenter: (...args) => this.provider.setCenter(...args),
            setZoom: (...args) => this.provider.setZoom(...args),
            addMarker: (...args) => this.provider.addMarker(...args),
            removeMarkers: (...args) => this.provider.removeMarkers(...args),
            destroy: (...args) => this.provider.destroy(...args),
            getNativeMapInstance: () => this.provider.map,
        };
    }
}

// --- 百度地图 Provider ---
class BaiduMapProvider {
    constructor(options) {
        this.map = null;
        this.markers = [];
        this.options = options;
        this.autoOpenMarkers = [];
    }

    async init() {
        if (window.BMapGL) {
            this._createMap();
            return;
        }

        if (isBaiduLoading) {
            await new Promise(resolve => {
                const check = () => {
                    if (window.BMapGL) {
                        resolve();
                    } else {
                        setTimeout(check, 100);
                    }
                };
                check();
            });
            this._createMap();
            return;
        }

        isBaiduLoading = true;
        return new Promise((resolve, reject) => {
            const callbackName = `__bd_map_init_${Date.now()}`;
            window[callbackName] = () => {
                delete window[callbackName];
                isBaiduLoading = false;
                try {
                    this._createMap();
                    resolve();
                } catch (e) {
                    reject(e);
                }
            };

            // ✅ 加入 lang 参数
            const scriptUrl = `https://api.map.baidu.com/api?v=3.0&type=webgl&ak=${this.options.key}&lang=${this.options.language}&callback=${callbackName}`;
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onerror = () => {
                delete window[callbackName];
                isBaiduLoading = false;
                reject(new Error('百度地图 SDK 加载失败，请检查网络或 AK'));
            };
            document.head.appendChild(script);
        });
    }

    _createMap() {
        const center = normalizeCoordinate(this.options.center);
        this.map = new BMapGL.Map(this.options.container);
        const point = new BMapGL.Point(center[0], center[1]);
        this.map.centerAndZoom(point, this.options.zoom);
        this.map.enableScrollWheelZoom(true);

        if (this.options.mapType === 'satellite') {
            this.map.setMapType(BMAP_SATELLITE_MAP);
        }

        if (this.options.showZoomControl) {
            this.map.addControl(new BMapGL.NavigationControl({ anchor: BMAP_ANCHOR_TOP_RIGHT }));
        }
        if (this.options.showScaleControl) {
            this.map.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT }));
        }

        if (this.options.markers) {
            const markers = Array.isArray(this.options.markers) ? this.options.markers : [this.options.markers];
            markers.forEach(marker => this.addMarker(marker));
        }

        this.map.addEventListener('tilesloaded', () => {
            this.autoOpenMarkers.forEach(({ infoWindow, point }) => {
                this.map.openInfoWindow(infoWindow, point);
            });
            this.autoOpenMarkers = [];
        }, { once: true });
    }

    addMarker(markerOpts) {
    if (!markerOpts || markerOpts.position == null) {
        console.error('❌ Marker skipped: missing "position" field.', markerOpts);
        return;
    }

    let position;
    try {
        position = normalizeCoordinate(markerOpts.position);
    } catch (err) {
        console.error('❌ Invalid coordinate:', err.message, markerOpts.position);
        return;
    }

    const point = new BMapGL.Point(position[0], position[1]);
    const marker = new BMapGL.Marker(point);

    // ✅ 不再使用 setLabel() 显示 title
    // 如果只有 title 没有 content，我们仍可创建一个只含标题的 InfoWindow
    // 构建 InfoWindow 选项
    if (markerOpts.title || markerOpts.content) {
    // 构建内容：标题 + 内容
    let innerHTML = '';
    if (markerOpts.title) {
        innerHTML += `<div class="bmap-title" style="font-weight: bold; font-size: 14px; color: #2c3e50; margin-bottom: 4px;">${markerOpts.title}</div>`;
    }
    if (markerOpts.content) {
        innerHTML += `<div class="bmap-content" style="font-size: 13px; line-height: 1.4; color: #555;">${markerOpts.content}</div>`;
    }

    // 关键：注入全局 CSS（仅一次）
    if (!window.__bmap_custom_info_css_injected) {
        const style = document.createElement('style');
        style.textContent = `
            /* 确保关闭按钮浮动到右上角 */
            .BMapGL_infowindow .BMapGL_close {
                position: absolute !important;
                top: 8px !important;
                right: 10px !important;
                width: 18px !important;
                height: 18px !important;
                line-height: 18px !important;
                text-align: center !important;
                background: #fff !important;
                border: none !important;
                border-radius: 50% !important;
                color: #999 !important;
                cursor: pointer !important;
                font-weight: bold !important;
                font-size: 14px !important;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1) !important;
                z-index: 10 !important;
            }
            /* 给内容区域留出顶部空间，避免被 × 遮挡 */
            .BMapGL_infowindow .BMapGL_content > div:first-child {
                position: relative;
                padding-top: 20px !important;
            }
            /* 可选：美化 InfoWindow 整体 */
            .BMapGL_infowindow {
                border-radius: 8px !important;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                border: none !important;
            }
        `;
        document.head.appendChild(style);
        window.__bmap_custom_info_css_injected = true;
    }

    const infoWindow = new BMapGL.InfoWindow(`<div style="padding: 10px;">${innerHTML}</div>`);
    
    marker.addEventListener('click', () => {
        this.map.openInfoWindow(infoWindow, point);
    });

    if (markerOpts.autoOpen) {
        this.autoOpenMarkers.push({ infoWindow, point });
    }
}


    this.map.addOverlay(marker);
    this.markers.push(marker);
}


    removeMarkers() {
        this.markers.forEach(m => this.map.removeOverlay(m));
        this.markers = [];
    }

    setCenter(center) {
        const normalized = normalizeCoordinate(center);
        const point = new BMapGL.Point(normalized[0], normalized[1]);
        this.map.setCenter(point);
    }

    setZoom(zoom) {
        this.map.setZoom(zoom);
    }

    destroy() {
        if (this.map) this.map.destroy();
        this.markers = [];
    }
}

// --- 高德地图 Provider ---
class GaodeMapProvider {
    constructor(options) {
        this.map = null;
        this.markers = [];
        this.options = options;
        this.autoOpenMarkers = [];
    }

    async init() {
        if (window.AMap) {
            this._createMap();
            return;
        }

        if (isGaodeLoading) {
            await new Promise(resolve => {
                const check = () => window.AMap ? resolve() : setTimeout(check, 100);
            });
            this._createMap();
            return;
        }

        isGaodeLoading = true;
        try {
            // ✅ 加入 lang 参数
            await loadScript(`https://webapi.amap.com/maps?v=2.0&key=${this.options.key}&lang=${this.options.language}`);
            isGaodeLoading = false;
            this._createMap();
        } catch (error) {
            isGaodeLoading = false;
            throw new Error(`高德地图 SDK 加载失败: ${error.message}`);
        }
    }

    _createMap() {
        const center = normalizeCoordinate(this.options.center);
        const mapOptions = {
            zoom: this.options.zoom,
            center: center
        };
        if (this.options.mapType === 'satellite') {
            mapOptions.mapStyle = 'amap://styles/satellite';
        }
        this.map = new AMap.Map(this.options.container, mapOptions);

        if (this.options.markers) {
            const markers = Array.isArray(this.options.markers) ? this.options.markers : [this.options.markers];
            markers.forEach(marker => this.addMarker(marker));
        }

        this.map.on('complete', () => {
            this.autoOpenMarkers.forEach(({ infoWindow, marker }) => {
                infoWindow.open(this.map, marker.getPosition());
            });
            this.autoOpenMarkers = [];
        });
    }

    addMarker(markerOpts) {
        if (!markerOpts || markerOpts.position == null) {
            console.error('❌ Marker skipped: missing "position" field.', markerOpts);
            return;
        }
        let position;
        try {
            position = normalizeCoordinate(markerOpts.position);
        } catch (err) {
            console.error('❌ Invalid coordinate:', err.message, markerOpts.position);
            return;
        }
        const defaultIcon = new AMap.Icon({
            image: '//webapi.amap.com/theme/v1.3/markers/n/mark_b.png',
            size: new AMap.Size(24, 36),
            imageSize: new AMap.Size(24, 36)
        });
        const markerConfig = {
            position: position,
            title: markerOpts.title,
            icon: markerOpts.iconUrl
                ? new AMap.Icon({
                    image: markerOpts.iconUrl,
                    size: new AMap.Size(
                        markerOpts.iconSize?.width || 34,
                        markerOpts.iconSize?.height || 51
                    )
                })
                : defaultIcon
        };
        const marker = new AMap.Marker(markerConfig);
        this.map.add(marker);
        this.markers.push(marker);
        if (markerOpts.content) {
            const infoWindow = new AMap.InfoWindow({
                content: markerOpts.content,
                anchor: 'bottom-center'
            });
            marker.on('click', () => {
                infoWindow.open(this.map, marker.getPosition());
            });
            if (markerOpts.autoOpen) {
                this.autoOpenMarkers.push({ infoWindow, marker });
            }
        }
    }

    removeMarkers() {
        if (this.markers.length > 0) {
            this.map.remove(this.markers);
            this.markers = [];
        }
    }

    setCenter(center) {
        const normalized = normalizeCoordinate(center);
        this.map.setCenter(normalized);
    }

    setZoom(zoom) {
        this.map.setZoom(zoom);
    }

    destroy() {
        if (this.map) this.map.destroy();
        this.markers = [];
    }
}

export default Map;
export { BaiduMapProvider, GaodeMapProvider, normalizeCoordinate, loadScript };
