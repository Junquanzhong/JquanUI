/**
 * 地图模块主入口文件 (v1.4.0 - 集成 Google Maps)
 * 新增：GoogleMapProvider 支持
 * 修复：BaiduMapProvider 移动端白屏问题 (v1.0 GL)
 * 优化：统一坐标格式转换逻辑
 */

// --- 工具函数 ---

function loadScript(url) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        // 简单去重：检查是否已有相同域名的脚本
        const existing = document.querySelector(`script[src*="${urlObj.hostname}${urlObj.pathname}"]`);
        if (existing) {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = url;
        script.crossOrigin = "anonymous"; // 移动端友好
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
        document.head.appendChild(script);
    });
}

/**
 * 统一将坐标标准化为 [lng, lat] 数组
 * 注意：Google Maps 使用 {lat, lng}，在 Provider 内部会进行二次转换
 */
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
        // 兼容 lng, lon, longitude
        if (typeof coordinate.lng !== 'undefined') lng = parseFloat(coordinate.lng);
        else if (typeof coordinate.lon !== 'undefined') lng = parseFloat(coordinate.lon);
        else if (typeof coordinate.longitude !== 'undefined') lng = parseFloat(coordinate.longitude);

        // 兼容 lat, latitude
        if (typeof coordinate.lat !== 'undefined') lat = parseFloat(coordinate.lat);
        else if (typeof coordinate.latitude !== 'undefined') lat = parseFloat(coordinate.latitude);

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
let isGoogleLoading = false;

// --- 主工厂类 ---
class Map {
    static defaultOptions = {
        source: 'baidu', // 'baidu' | 'gaode' | 'google'
        key: null,
        zoom: 12,
        mapType: 'normal', // 'normal' | 'satellite'
        showZoomControl: true,
        showScaleControl: true,
        language: 'zh-CN',
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

        // 获取 DOM
        if (typeof this.options.container === 'string') {
            this.containerElement = document.getElementById(this.options.container);
        } else {
            this.containerElement = this.options.container;
        }

        if (!this.containerElement) {
            throw new Error(`Map container not found: ${options.container}`);
        }

        if (!this.options.key) {
            throw new Error('Map API key is required.');
        }

        this.options.language = (this.options.language || 'zh-CN').toLowerCase();
        this.provider = null;
    }

    async init() {
        // 容器高度检查
        const height = this.containerElement.clientHeight;
        if (height === 0) {
            console.warn('⚠️ Map Warning: 容器高度为 0。请设置 CSS height。');
        }

        const { source } = this.options;
        const providerOptions = { ...this.options, container: this.containerElement };

        if (source === 'baidu') {
            this.provider = new BaiduMapProvider(providerOptions);
        } else if (source === 'gaode') {
            this.provider = new GaodeMapProvider(providerOptions);
        } else if (source === 'google') {
            this.provider = new GoogleMapProvider(providerOptions);
        } else {
            throw new Error(`Unsupported map source: ${source}. Use 'baidu', 'gaode', or 'google'.`);
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

// --- 百度地图 Provider (BMapGL) ---
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
            await this._waitFor(() => window.BMapGL);
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
            // 修复：WebGL 版必须用 v=1.0
            const scriptUrl = `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${this.options.key}&lang=${this.options.language}&callback=${callbackName}`;
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onerror = () => {
                isBaiduLoading = false;
                reject(new Error('百度地图加载失败'));
            };
            document.head.appendChild(script);
        });
    }

    _waitFor(condition) {
        return new Promise(resolve => {
            const check = () => condition() ? resolve() : setTimeout(check, 100);
            check();
        });
    }

    _createMap() {
        const center = normalizeCoordinate(this.options.center);
        this.map = new BMapGL.Map(this.options.container);
        const point = new BMapGL.Point(center[0], center[1]);
        this.map.centerAndZoom(point, this.options.zoom);
        
        this.map.enableScrollWheelZoom(true);
        this.map.enablePinchToZoom();
        this.map.enableRotate();

        if (this.options.mapType === 'satellite') {
            try { this.map.setMapType(window.BMAP_SATELLITE_MAP); } catch(e){}
        }

        if (this.options.showZoomControl) {
            this.map.addControl(new BMapGL.ZoomControl({ anchor: BMAP_ANCHOR_BOTTOM_RIGHT }));
        }
        if (this.options.showScaleControl) {
            this.map.addControl(new BMapGL.ScaleControl({ anchor: BMAP_ANCHOR_BOTTOM_LEFT }));
        }

        if (this.options.markers) {
            const markers = Array.isArray(this.options.markers) ? this.options.markers : [this.options.markers];
            markers.forEach(m => this.addMarker(m));
        }

        this.map.addEventListener('tilesloaded', () => {
            this.autoOpenMarkers.forEach(({ infoWindow, point }) => {
                this.map.openInfoWindow(infoWindow, point);
            });
            this.autoOpenMarkers = [];
        }, { once: true });
    }

    addMarker(markerOpts) {
        if (!markerOpts || !markerOpts.position) return;
        const pos = normalizeCoordinate(markerOpts.position);
        const point = new BMapGL.Point(pos[0], pos[1]);

        let marker;
        if (markerOpts.iconUrl) {
            const icon = new BMapGL.Icon(markerOpts.iconUrl, new BMapGL.Size(
                markerOpts.iconSize?.width || 24, markerOpts.iconSize?.height || 36
            ));
            marker = new BMapGL.Marker(point, { icon });
        } else {
            marker = new BMapGL.Marker(point);
        }

        if (markerOpts.title || markerOpts.content) {
            let html = '';
            if (markerOpts.title) html += `<div style="font-weight:bold;margin-bottom:4px">${markerOpts.title}</div>`;
            if (markerOpts.content) html += `<div style="font-size:13px">${markerOpts.content}</div>`;

            const infoWindow = new BMapGL.InfoWindow(html, { offset: new BMapGL.Size(0, -20) });
            marker.addEventListener('click', () => this.map.openInfoWindow(infoWindow, point));
            if (markerOpts.autoOpen) this.autoOpenMarkers.push({ infoWindow, point });
        }

        this.map.addOverlay(marker);
        this.markers.push(marker);
    }

    removeMarkers() {
        this.markers.forEach(m => this.map.removeOverlay(m));
        this.markers = [];
    }
    setCenter(c) {
        const n = normalizeCoordinate(c);
        this.map.setCenter(new BMapGL.Point(n[0], n[1]));
    }
    setZoom(z) { this.map.setZoom(z); }
    destroy() { if(this.map) this.map.destroy(); this.markers = []; }
}

// --- 高德地图 Provider (AMap v2.0) ---
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
            await new Promise(r => { const c = () => window.AMap ? r() : setTimeout(c, 100); c(); });
            this._createMap();
            return;
        }

        isGaodeLoading = true;
        try {
            await loadScript(`https://webapi.amap.com/maps?v=2.0&key=${this.options.key}&lang=${this.options.language}`);
            isGaodeLoading = false;
            this._createMap();
        } catch (e) {
            isGaodeLoading = false;
            throw e;
        }
    }

    _createMap() {
        const center = normalizeCoordinate(this.options.center);
        const opts = {
            zoom: this.options.zoom,
            center: center,
            resizeEnable: true
        };
        if (this.options.mapType === 'satellite') opts.layers = [new AMap.TileLayer.Satellite()];

        this.map = new AMap.Map(this.options.container, opts);

        this.map.plugin(['AMap.ToolBar', 'AMap.Scale'], () => {
            if (this.options.showZoomControl) this.map.addControl(new AMap.ToolBar());
            if (this.options.showScaleControl) this.map.addControl(new AMap.Scale());
        });

        if (this.options.markers) {
            const markers = Array.isArray(this.options.markers) ? this.options.markers : [this.options.markers];
            markers.forEach(m => this.addMarker(m));
        }

        this.map.on('complete', () => {
            this.autoOpenMarkers.forEach(({ infoWindow, marker }) => infoWindow.open(this.map, marker.getPosition()));
            this.autoOpenMarkers = [];
        });
    }

    addMarker(markerOpts) {
        if (!markerOpts || !markerOpts.position) return;
        const pos = normalizeCoordinate(markerOpts.position);
        
        const config = { position: pos, title: markerOpts.title };
        if (markerOpts.iconUrl) {
            config.icon = new AMap.Icon({
                image: markerOpts.iconUrl,
                size: new AMap.Size(markerOpts.iconSize?.width||34, markerOpts.iconSize?.height||51),
                imageSize: new AMap.Size(markerOpts.iconSize?.width||34, markerOpts.iconSize?.height||51)
            });
        }

        const marker = new AMap.Marker(config);
        this.map.add(marker);
        this.markers.push(marker);

        if (markerOpts.content || markerOpts.title) {
            let html = '';
            if (markerOpts.title) html += `<b>${markerOpts.title}</b><br/>`;
            if (markerOpts.content) html += markerOpts.content;
            
            const infoWindow = new AMap.InfoWindow({ content: `<div style="padding:5px">${html}</div>`, offset: new AMap.Pixel(0, -30) });
            marker.on('click', () => infoWindow.open(this.map, marker.getPosition()));
            if (markerOpts.autoOpen) this.autoOpenMarkers.push({ infoWindow, marker });
        }
    }

    removeMarkers() { this.map.remove(this.markers); this.markers = []; }
    setCenter(c) { this.map.setCenter(normalizeCoordinate(c)); }
    setZoom(z) { this.map.setZoom(z); }
    destroy() { if(this.map) this.map.destroy(); this.markers = []; }
}

// --- Google Maps Provider (新增) ---
class GoogleMapProvider {
    constructor(options) {
        this.map = null;
        this.markers = [];
        this.options = options;
        this.autoOpenMarkers = [];
    }

    async init() {
        if (window.google && window.google.maps) {
            this._createMap();
            return;
        }

        if (isGoogleLoading) {
            await new Promise(resolve => {
                const check = () => window.google && window.google.maps ? resolve() : setTimeout(check, 100);
                check();
            });
            this._createMap();
            return;
        }

        isGoogleLoading = true;
        return new Promise((resolve, reject) => {
            const callbackName = `__google_map_init_${Date.now()}`;
            window[callbackName] = () => {
                delete window[callbackName];
                isGoogleLoading = false;
                this._createMap();
                resolve();
            };

            // 注意：Google Maps 必须启用 Billing 才能使用 JS API
            const scriptUrl = `https://maps.googleapis.com/maps/api/js?key=${this.options.key}&language=${this.options.language}&callback=${callbackName}`;
            const script = document.createElement('script');
            script.src = scriptUrl;
            script.onerror = () => {
                delete window[callbackName];
                isGoogleLoading = false;
                reject(new Error('Google Maps SDK 加载失败'));
            };
            document.head.appendChild(script);
        });
    }

    _createMap() {
        const centerArr = normalizeCoordinate(this.options.center);
        // Google Maps 使用 {lat, lng} 格式
        const centerObj = { lat: centerArr[1], lng: centerArr[0] };

        const mapOptions = {
            center: centerObj,
            zoom: this.options.zoom,
            // 控件配置
            disableDefaultUI: false,
            zoomControl: this.options.showZoomControl,
            scaleControl: this.options.showScaleControl,
            mapTypeControl: false, // 简化显示
            streetViewControl: false,
            fullscreenControl: false,
            // 地图类型
            mapTypeId: this.options.mapType === 'satellite' ? 'satellite' : 'roadmap',
        };

        this.map = new google.maps.Map(this.options.container, mapOptions);

        if (this.options.markers) {
            const markers = Array.isArray(this.options.markers) ? this.options.markers : [this.options.markers];
            markers.forEach(m => this.addMarker(m));
        }

        // Google Maps 首次加载完成没有明确的 'complete' 事件，常用 'idle'
        google.maps.event.addListenerOnce(this.map, 'idle', () => {
             this.autoOpenMarkers.forEach(({ infoWindow, marker }) => {
                infoWindow.open(this.map, marker);
            });
            this.autoOpenMarkers = [];
        });
    }

    addMarker(markerOpts) {
        if (!markerOpts || !markerOpts.position) return;
        const pos = normalizeCoordinate(markerOpts.position);
        const position = { lat: pos[1], lng: pos[0] };

        const markerConfig = {
            position: position,
            map: this.map,
            title: markerOpts.title
        };

        if (markerOpts.iconUrl) {
            // Google Maps 图标配置
            markerConfig.icon = {
                url: markerOpts.iconUrl,
                scaledSize: new google.maps.Size(
                    markerOpts.iconSize?.width || 24, 
                    markerOpts.iconSize?.height || 36
                )
            };
        }

        const marker = new google.maps.Marker(markerConfig);
        this.markers.push(marker);

        if (markerOpts.content || markerOpts.title) {
            let contentStr = '<div style="color: black;">'; // Google 默认深色模式下可能字体颜色问题
            if (markerOpts.title) contentStr += `<h5 style="margin:0 0 5px 0;">${markerOpts.title}</h5>`;
            if (markerOpts.content) contentStr += `<div>${markerOpts.content}</div>`;
            contentStr += '</div>';

            const infoWindow = new google.maps.InfoWindow({
                content: contentStr
            });

            marker.addListener('click', () => {
                infoWindow.open(this.map, marker);
            });

            if (markerOpts.autoOpen) {
                this.autoOpenMarkers.push({ infoWindow, marker });
            }
        }
    }

    removeMarkers() {
        this.markers.forEach(m => m.setMap(null));
        this.markers = [];
    }

    setCenter(c) {
        const arr = normalizeCoordinate(c);
        this.map.setCenter({ lat: arr[1], lng: arr[0] });
    }

    setZoom(z) {
        this.map.setZoom(z);
    }

    destroy() {
        // Google Maps JS API 没有官方 destroy，通常移除 DOM 即可
        if (this.map) {
            // 清理事件
            google.maps.event.clearInstanceListeners(this.map);
            this.map = null;
        }
        this.markers = [];
        this.options.container.innerHTML = '';
    }
}

export default Map;
export { BaiduMapProvider, GaodeMapProvider, GoogleMapProvider, normalizeCoordinate, loadScript };
