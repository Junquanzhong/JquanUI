(function (global) {
    const JquanUIComponents = global.JquanUIComponents || (global.JquanUIComponents = {});

    const loaderCache = new Map();
    const providerRegistry = new Map();
    const instanceRegistry = new Map();
    let instanceSeed = 0;

    const defaults = {
        provider: 'baidu',
        key: '',
        center: [116.404, 39.915],
        zoom: 12,
        minZoom: null,
        maxZoom: null,
        mapType: 'normal',
        language: 'zh-CN',
        region: '',
        libraries: [],
        plugins: [],
        markers: [],
        polylines: [],
        polygons: [],
        circles: [],
        controls: {
            zoom: true,
            scale: true
        },
        gestureEnable: true,
        fitView: false,
        cluster: false,
        infoWindow: {
            autoClose: true,
            closeWhenClickMap: true,
            offset: null
        },
        onReady: null,
        onError: null
    };

    const DECLARATIVE_EVENTS = ['click', 'dblclick', 'moveend', 'zoomend', 'dragend'];

    function nextId() {
        instanceSeed += 1;
        return `jq-map-${instanceSeed}`;
    }

    function isPlainObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]';
    }

    function deepMerge(base, extra) {
        const output = Object.assign({}, base);
        Object.keys(extra || {}).forEach(key => {
            const baseValue = output[key];
            const nextValue = extra[key];
            if (isPlainObject(baseValue) && isPlainObject(nextValue)) {
                output[key] = deepMerge(baseValue, nextValue);
            } else if (Array.isArray(nextValue)) {
                output[key] = nextValue.slice();
            } else {
                output[key] = nextValue;
            }
        });
        return output;
    }

    function normalizeCoordinate(input) {
        if (typeof input === 'string') {
            const parts = input.split(',').map(part => Number(part.trim()));
            if (parts.length === 2 && parts.every(Number.isFinite)) return [parts[0], parts[1]];
        }
        if (Array.isArray(input) && input.length === 2) {
            const lng = Number(input[0]);
            const lat = Number(input[1]);
            if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
        }
        if (input && typeof input === 'object') {
            const lng = Number(input.lng ?? input.lon ?? input.longitude);
            const lat = Number(input.lat ?? input.latitude);
            if (Number.isFinite(lng) && Number.isFinite(lat)) return [lng, lat];
        }
        throw new Error(`Invalid coordinate: ${JSON.stringify(input)}`);
    }

    function normalizeCoordinates(list) {
        return Array.isArray(list) ? list.map(normalizeCoordinate) : [];
    }

    function tryParseJSON(value, fallback) {
        if (value == null || value === '') return fallback;
        try {
            return JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    }

    function normalizeBoolean(value, fallback) {
        if (value == null || value === '') return fallback;
        if (typeof value === 'boolean') return value;
        const normalized = String(value).trim().toLowerCase();
        if (['1', 'true', 'yes', 'on'].includes(normalized)) return true;
        if (['0', 'false', 'no', 'off'].includes(normalized)) return false;
        return fallback;
    }

    function normalizeNumber(value, fallback) {
        if (value == null || value === '') return fallback;
        const next = Number(value);
        return Number.isFinite(next) ? next : fallback;
    }

    function normalizeOptions(input) {
        const merged = deepMerge(defaults, input || {});
        merged.provider = String(merged.provider || 'baidu').toLowerCase();
        merged.center = normalizeCoordinate(merged.center);
        merged.markers = Array.isArray(merged.markers) ? merged.markers : (merged.markers ? [merged.markers] : []);
        merged.polylines = Array.isArray(merged.polylines) ? merged.polylines : [];
        merged.polygons = Array.isArray(merged.polygons) ? merged.polygons : [];
        merged.circles = Array.isArray(merged.circles) ? merged.circles : [];
        merged.plugins = Array.isArray(merged.plugins) ? merged.plugins : [];
        merged.libraries = Array.isArray(merged.libraries) ? merged.libraries : [];
        merged.cluster = merged.cluster === true ? {} : (merged.cluster || false);
        return merged;
    }

    function normalizeInfoContent(payload) {
        if (payload == null) return '';
        if (typeof payload === 'string') return payload;
        if (payload.html) return String(payload.html);
        const title = payload.title ? `<div style="font-weight:700;margin-bottom:4px;">${payload.title}</div>` : '';
        const content = payload.content ? `<div>${payload.content}</div>` : '';
        return `<div style="min-width:160px;">${title}${content}</div>`;
    }

    function loadScriptOnce(url, match) {
        const key = match || url;
        if (loaderCache.has(key)) return loaderCache.get(key);
        const promise = new Promise((resolve, reject) => {
            const existing = document.querySelector(`script[data-jq-map-key="${key}"]`) ||
                Array.from(document.scripts).find(script => script.src && script.src.includes(match || url));
            if (existing) {
                if (existing.dataset.loaded === 'true') {
                    resolve(existing);
                    return;
                }
                existing.addEventListener('load', () => resolve(existing), { once: true });
                existing.addEventListener('error', () => reject(new Error(`Failed to load script: ${url}`)), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.defer = true;
            script.dataset.jqMapKey = key;
            script.onload = () => {
                script.dataset.loaded = 'true';
                resolve(script);
            };
            script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
            document.head.appendChild(script);
        });
        loaderCache.set(key, promise);
        return promise;
    }

    function resolveContainer(container) {
        if (typeof container === 'string') {
            return document.querySelector(container) || document.getElementById(container.replace(/^#/, ''));
        }
        return container instanceof HTMLElement ? container : null;
    }

    function createEmitter() {
        const listeners = new Map();
        return {
            on(event, handler) {
                if (typeof handler !== 'function') return () => {};
                if (!listeners.has(event)) listeners.set(event, new Set());
                listeners.get(event).add(handler);
                return () => this.off(event, handler);
            },
            off(event, handler) {
                const bucket = listeners.get(event);
                if (!bucket) return false;
                return bucket.delete(handler);
            },
            emit(event, payload) {
                const bucket = listeners.get(event);
                if (!bucket) return;
                Array.from(bucket).forEach(handler => {
                    try {
                        handler(payload);
                    } catch (error) {
                        setTimeout(() => {
                            throw error;
                        }, 0);
                    }
                });
            },
            clear() {
                listeners.clear();
            }
        };
    }

    class BaseProvider {
        constructor(options) {
            this.options = options;
            this.map = null;
            this.markers = [];
            this.overlays = [];
            this.cluster = null;
            this.infoWindow = null;
            this.listeners = [];
            this.autoOpenMarkers = [];
            this.emitter = createEmitter();
        }

        normalizeMarker(marker) {
            return Object.assign({}, marker, {
                position: normalizeCoordinate(marker.position)
            });
        }

        normalizePathOptions(options) {
            return Object.assign({}, options, {
                path: normalizeCoordinates(options.path || [])
            });
        }

        normalizeCircleOptions(options) {
            return Object.assign({}, options, {
                center: normalizeCoordinate(options.center),
                radius: Number(options.radius) || 500
            });
        }

        recordListener(target, type, original, remover) {
            this.listeners.push({ target, type, original, remover });
            return remover;
        }

        emit(event, payload) {
            this.emitter.emit(event, payload);
        }

        on(event, handler) {
            return this.emitter.on(event, handler);
        }

        off(event, handler) {
            return this.emitter.off(event, handler);
        }

        clearMarkers() {
            this.markers = [];
        }

        clearOverlays() {
            this.overlays = [];
        }

        clearCluster() {
            this.cluster = null;
        }

        clearListeners() {
            this.listeners.forEach(item => {
                try {
                    item.remover();
                } catch (error) {}
            });
            this.listeners = [];
            this.emitter.clear();
        }

        addPolyline() {
            throw new Error('addPolyline is not implemented.');
        }

        addPolygon() {
            throw new Error('addPolygon is not implemented.');
        }

        addCircle() {
            throw new Error('addCircle is not implemented.');
        }

        fitView() {}

        setMapType() {}

        openInfoWindow() {
            throw new Error(`${this.options.provider} provider does not support infoWindow.`);
        }

        closeInfoWindow() {}

        updateCluster() {
            return null;
        }

        geocode() {
            return Promise.reject(new Error(`${this.options.provider} provider does not support geocode.`));
        }

        reverseGeocode() {
            return Promise.reject(new Error(`${this.options.provider} provider does not support reverseGeocode.`));
        }

        route() {
            return Promise.reject(new Error(`${this.options.provider} provider does not support route.`));
        }

        addControl() {
            return null;
        }

        resize() {
            return null;
        }

        destroy() {
            this.closeInfoWindow();
            this.clearListeners();
            this.clearMarkers();
            this.clearOverlays();
            this.clearCluster();
            if (this.options.container) this.options.container.innerHTML = '';
        }
    }

    class BaiduProvider extends BaseProvider {
        async init() {
            if (!global.BMapGL) {
                const callbackName = `__jq_baidu_map_${Date.now()}`;
                await new Promise((resolve, reject) => {
                    global[callbackName] = () => {
                        delete global[callbackName];
                        resolve();
                    };
                    loadScriptOnce(
                        `https://api.map.baidu.com/api?type=webgl&v=1.0&ak=${this.options.key}&lang=${this.options.language}&callback=${callbackName}`,
                        'api.map.baidu.com/api'
                    ).catch(reject);
                });
            }
            if (this.options.cluster && !global.BMapGLLib) {
                await loadScriptOnce(
                    'https://mapopen.cdn.bcebos.com/github/BMapGLLib/MarkerClusterer/src/MarkerClusterer.min.js',
                    'MarkerClusterer.min.js'
                ).catch(() => {});
            }
            this.createMap();
        }

        createMap() {
            const point = new global.BMapGL.Point(this.options.center[0], this.options.center[1]);
            this.map = new global.BMapGL.Map(this.options.container);
            this.map.centerAndZoom(point, this.options.zoom);
            if (Number.isFinite(this.options.minZoom) && typeof this.map.setMinZoom === 'function') this.map.setMinZoom(this.options.minZoom);
            if (Number.isFinite(this.options.maxZoom) && typeof this.map.setMaxZoom === 'function') this.map.setMaxZoom(this.options.maxZoom);
            if (this.options.gestureEnable) {
                this.map.enableScrollWheelZoom(true);
                if (typeof this.map.enablePinchToZoom === 'function') this.map.enablePinchToZoom();
                if (typeof this.map.enableDragging === 'function') this.map.enableDragging();
            } else {
                if (typeof this.map.disableScrollWheelZoom === 'function') this.map.disableScrollWheelZoom();
                if (typeof this.map.disableDragging === 'function') this.map.disableDragging();
            }
            this.setMapType(this.options.mapType);
            if (this.options.controls.zoom) this.map.addControl(new global.BMapGL.ZoomControl());
            if (this.options.controls.scale) this.map.addControl(new global.BMapGL.ScaleControl());
            DECLARATIVE_EVENTS.forEach(eventName => this.bindMapEvent(eventName));
            this.seedData();
        }

        seedData() {
            this.options.markers.forEach(marker => this.addMarker(marker));
            this.options.polylines.forEach(item => this.addPolyline(item));
            this.options.polygons.forEach(item => this.addPolygon(item));
            this.options.circles.forEach(item => this.addCircle(item));
            this.updateCluster();
            if (this.options.fitView) this.fitView();
            if (this.autoOpenMarkers[0]) {
                const item = this.autoOpenMarkers[0];
                this.map.openInfoWindow(item.infoWindow, item.point);
            }
        }

        bindMapEvent(type) {
            const handler = event => this.emit(type, { type, originalEvent: event, provider: this, target: this.map });
            this.map.addEventListener(type, handler);
            this.recordListener(this.map, type, handler, () => this.map.removeEventListener(type, handler));
        }

        createInfoWindow(content, options) {
            const html = normalizeInfoContent(content);
            return new global.BMapGL.InfoWindow(html, {
                width: options.width || 0,
                title: options.title || ''
            });
        }

        addMarker(marker) {
            const normalized = this.normalizeMarker(marker);
            const point = new global.BMapGL.Point(normalized.position[0], normalized.position[1]);
            const overlay = normalized.iconUrl
                ? new global.BMapGL.Marker(point, {
                    icon: new global.BMapGL.Icon(
                        normalized.iconUrl,
                        new global.BMapGL.Size(normalized.iconSize?.width || 24, normalized.iconSize?.height || 36)
                    )
                })
                : new global.BMapGL.Marker(point);
            if (normalized.label && typeof overlay.setLabel === 'function') {
                overlay.setLabel(new global.BMapGL.Label(String(normalized.label), { position: point, offset: new global.BMapGL.Size(0, -24) }));
            }
            if (normalized.title || normalized.content || normalized.html) {
                const infoWindow = this.createInfoWindow(normalized, normalized.infoWindow || {});
                const open = () => this.map.openInfoWindow(infoWindow, point);
                overlay.addEventListener('click', open);
                this.recordListener(overlay, 'click', open, () => overlay.removeEventListener('click', open));
                if (normalized.autoOpen) this.autoOpenMarkers.push({ infoWindow, point });
            }
            if (typeof normalized.onClick === 'function') {
                const clickHandler = event => normalized.onClick({ type: 'marker:click', marker: overlay, data: normalized, originalEvent: event });
                overlay.addEventListener('click', clickHandler);
                this.recordListener(overlay, 'click', clickHandler, () => overlay.removeEventListener('click', clickHandler));
            }
            this.map.addOverlay(overlay);
            this.markers.push(overlay);
            return overlay;
        }

        removeMarkers() {
            this.markers.forEach(marker => this.map.removeOverlay(marker));
            this.clearMarkers();
            this.updateCluster();
        }

        addPolyline(options) {
            const normalized = this.normalizePathOptions(options);
            const path = normalized.path.map(point => new global.BMapGL.Point(point[0], point[1]));
            const line = new global.BMapGL.Polyline(path, {
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeWeight: normalized.strokeWeight || 3,
                strokeOpacity: normalized.strokeOpacity ?? 0.9
            });
            this.map.addOverlay(line);
            this.overlays.push(line);
            return line;
        }

        addPolygon(options) {
            const normalized = this.normalizePathOptions(options);
            const path = normalized.path.map(point => new global.BMapGL.Point(point[0], point[1]));
            const polygon = new global.BMapGL.Polygon(path, {
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeWeight: normalized.strokeWeight || 2,
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                fillColor: normalized.fillColor || '#60a5fa',
                fillOpacity: normalized.fillOpacity ?? 0.22
            });
            this.map.addOverlay(polygon);
            this.overlays.push(polygon);
            return polygon;
        }

        addCircle(options) {
            const normalized = this.normalizeCircleOptions(options);
            const circle = new global.BMapGL.Circle(
                new global.BMapGL.Point(normalized.center[0], normalized.center[1]),
                normalized.radius,
                {
                    strokeColor: normalized.strokeColor || '#2563eb',
                    strokeWeight: normalized.strokeWeight || 2,
                    strokeOpacity: normalized.strokeOpacity ?? 0.9,
                    fillColor: normalized.fillColor || '#60a5fa',
                    fillOpacity: normalized.fillOpacity ?? 0.18
                }
            );
            this.map.addOverlay(circle);
            this.overlays.push(circle);
            return circle;
        }

        clearOverlays() {
            this.overlays.forEach(overlay => this.map.removeOverlay(overlay));
            super.clearOverlays();
        }

        fitView(points) {
            const targets = Array.isArray(points) && points.length
                ? points.map(normalizeCoordinate).map(point => new global.BMapGL.Point(point[0], point[1]))
                : this.markers.map(marker => marker.getPosition());
            if (targets.length > 0) this.map.setViewport(targets);
        }

        setCenter(center) {
            const point = normalizeCoordinate(center);
            this.map.setCenter(new global.BMapGL.Point(point[0], point[1]));
        }

        setZoom(zoom) {
            this.map.setZoom(Number(zoom));
        }

        setMapType(type) {
            if (type === 'satellite' && global.BMAP_SATELLITE_MAP) {
                this.map.setMapType(global.BMAP_SATELLITE_MAP);
                return;
            }
            if (global.BMAP_NORMAL_MAP) this.map.setMapType(global.BMAP_NORMAL_MAP);
        }

        openInfoWindow(content, positionOrMarker, options) {
            const coordinate = positionOrMarker && typeof positionOrMarker.getPosition === 'function'
                ? positionOrMarker.getPosition()
                : normalizeCoordinate(positionOrMarker || this.options.center);
            const point = coordinate.lng != null
                ? coordinate
                : new global.BMapGL.Point(coordinate[0], coordinate[1]);
            const infoWindow = this.createInfoWindow(content, options || {});
            this.infoWindow = infoWindow;
            this.map.openInfoWindow(infoWindow, point);
            return infoWindow;
        }

        closeInfoWindow() {
            if (typeof this.map?.closeInfoWindow === 'function') this.map.closeInfoWindow();
            this.infoWindow = null;
        }

        updateCluster() {
            if (!this.options.cluster) return null;
            if (!(global.BMapGLLib && global.BMapGLLib.MarkerClusterer)) return null;
            if (this.cluster && typeof this.cluster.clearMarkers === 'function') this.cluster.clearMarkers();
            this.cluster = new global.BMapGLLib.MarkerClusterer(this.map, Object.assign({
                markers: this.markers.slice()
            }, isPlainObject(this.options.cluster) ? this.options.cluster : {}));
            return this.cluster;
        }

        geocode(address) {
            return new Promise((resolve, reject) => {
                if (!global.BMapGL || !global.BMapGL.Geocoder) {
                    reject(new Error('Baidu Geocoder is unavailable.'));
                    return;
                }
                const geocoder = new global.BMapGL.Geocoder();
                geocoder.getPoint(address, point => {
                    if (!point) {
                        reject(new Error(`No result for address: ${address}`));
                        return;
                    }
                    resolve({ address, location: [point.lng, point.lat], raw: point });
                }, this.options.region || '');
            });
        }

        reverseGeocode(position) {
            return new Promise((resolve, reject) => {
                if (!global.BMapGL || !global.BMapGL.Geocoder) {
                    reject(new Error('Baidu Geocoder is unavailable.'));
                    return;
                }
                const coordinate = normalizeCoordinate(position);
                const geocoder = new global.BMapGL.Geocoder();
                geocoder.getLocation(new global.BMapGL.Point(coordinate[0], coordinate[1]), result => {
                    if (!result) {
                        reject(new Error(`No reverse geocode result for: ${coordinate.join(',')}`));
                        return;
                    }
                    resolve({
                        location: coordinate,
                        formattedAddress: result.address,
                        raw: result
                    });
                });
            });
        }

        route(options) {
            return Promise.reject(new Error('Baidu route service is not implemented in this runtime yet.'));
        }

        addControl(type) {
            if (type === 'zoom') {
                const control = new global.BMapGL.ZoomControl();
                this.map.addControl(control);
                return control;
            }
            if (type === 'scale') {
                const control = new global.BMapGL.ScaleControl();
                this.map.addControl(control);
                return control;
            }
            return null;
        }

        resize() {
            if (typeof this.map?.reset === 'function') this.map.reset();
        }
    }

    class GaodeProvider extends BaseProvider {
        async init() {
            if (!global.AMap) {
                const libraries = []
                    .concat(this.options.plugins || [])
                    .concat(this.options.cluster ? ['AMap.MarkerCluster'] : [])
                    .concat(['AMap.Geocoder', 'AMap.Driving', 'AMap.Walking', 'AMap.Transfer']);
                const uniqueLibraries = Array.from(new Set(libraries.filter(Boolean)));
                const libParam = uniqueLibraries.length ? `&plugin=${uniqueLibraries.join(',')}` : '';
                await loadScriptOnce(
                    `https://webapi.amap.com/maps?v=2.0&key=${this.options.key}&lang=${this.options.language}${libParam}`,
                    'webapi.amap.com/maps'
                );
            }
            this.createMap();
        }

        createMap() {
            this.map = new global.AMap.Map(this.options.container, {
                zoom: this.options.zoom,
                center: this.options.center,
                resizeEnable: true,
                zooms: [
                    Number.isFinite(this.options.minZoom) ? this.options.minZoom : 3,
                    Number.isFinite(this.options.maxZoom) ? this.options.maxZoom : 20
                ],
                dragEnable: this.options.gestureEnable,
                scrollWheel: this.options.gestureEnable,
                mapStyle: this.options.mapType === 'satellite' ? 'amap://styles/satellite' : undefined
            });
            if (this.options.controls.zoom || this.options.controls.scale || this.options.plugins.length) {
                this.map.plugin(['AMap.ToolBar', 'AMap.Scale'].concat(this.options.plugins), () => {
                    if (this.options.controls.zoom) this.map.addControl(new global.AMap.ToolBar());
                    if (this.options.controls.scale) this.map.addControl(new global.AMap.Scale());
                });
            }
            DECLARATIVE_EVENTS.forEach(eventName => this.bindMapEvent(eventName));
            this.seedData();
        }

        seedData() {
            this.options.markers.forEach(marker => this.addMarker(marker));
            this.options.polylines.forEach(item => this.addPolyline(item));
            this.options.polygons.forEach(item => this.addPolygon(item));
            this.options.circles.forEach(item => this.addCircle(item));
            this.updateCluster();
            if (this.options.fitView) this.fitView();
        }

        bindMapEvent(type) {
            const handler = event => this.emit(type, { type, originalEvent: event, provider: this, target: this.map });
            this.map.on(type, handler);
            this.recordListener(this.map, type, handler, () => this.map.off(type, handler));
        }

        ensureInfoWindow(options) {
            if (this.infoWindow) return this.infoWindow;
            this.infoWindow = new global.AMap.InfoWindow({
                autoMove: true,
                closeWhenClickMap: this.options.infoWindow.closeWhenClickMap,
                isCustom: false,
                offset: options?.offset
            });
            return this.infoWindow;
        }

        addMarker(marker) {
            const normalized = this.normalizeMarker(marker);
            const markerInstance = new global.AMap.Marker({
                position: normalized.position,
                title: normalized.title,
                label: normalized.label ? { content: String(normalized.label), direction: 'top' } : undefined,
                icon: normalized.iconUrl ? new global.AMap.Icon({
                    image: normalized.iconUrl,
                    size: new global.AMap.Size(normalized.iconSize?.width || 24, normalized.iconSize?.height || 36),
                    imageSize: new global.AMap.Size(normalized.iconSize?.width || 24, normalized.iconSize?.height || 36)
                }) : undefined
            });
            this.map.add(markerInstance);
            if (normalized.title || normalized.content || normalized.html) {
                const open = () => this.openInfoWindow(normalized, markerInstance, normalized.infoWindow || {});
                markerInstance.on('click', open);
                this.recordListener(markerInstance, 'click', open, () => markerInstance.off('click', open));
                if (normalized.autoOpen) setTimeout(open, 0);
            }
            if (typeof normalized.onClick === 'function') {
                const clickHandler = event => normalized.onClick({ type: 'marker:click', marker: markerInstance, data: normalized, originalEvent: event });
                markerInstance.on('click', clickHandler);
                this.recordListener(markerInstance, 'click', clickHandler, () => markerInstance.off('click', clickHandler));
            }
            this.markers.push(markerInstance);
            return markerInstance;
        }

        removeMarkers() {
            this.map.remove(this.markers);
            this.clearMarkers();
            this.updateCluster();
        }

        addPolyline(options) {
            const normalized = this.normalizePathOptions(options);
            const line = new global.AMap.Polyline({
                path: normalized.path,
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeWeight: normalized.strokeWeight || 3,
                strokeOpacity: normalized.strokeOpacity ?? 0.9
            });
            this.map.add(line);
            this.overlays.push(line);
            return line;
        }

        addPolygon(options) {
            const normalized = this.normalizePathOptions(options);
            const polygon = new global.AMap.Polygon({
                path: normalized.path,
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeWeight: normalized.strokeWeight || 2,
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                fillColor: normalized.fillColor || '#60a5fa',
                fillOpacity: normalized.fillOpacity ?? 0.22
            });
            this.map.add(polygon);
            this.overlays.push(polygon);
            return polygon;
        }

        addCircle(options) {
            const normalized = this.normalizeCircleOptions(options);
            const circle = new global.AMap.Circle({
                center: normalized.center,
                radius: normalized.radius,
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeWeight: normalized.strokeWeight || 2,
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                fillColor: normalized.fillColor || '#60a5fa',
                fillOpacity: normalized.fillOpacity ?? 0.18
            });
            this.map.add(circle);
            this.overlays.push(circle);
            return circle;
        }

        clearOverlays() {
            this.map.remove(this.overlays);
            super.clearOverlays();
        }

        fitView(points) {
            if (Array.isArray(points) && points.length) {
                this.map.setFitView(points.map(normalizeCoordinate));
                return;
            }
            this.map.setFitView();
        }

        setCenter(center) {
            this.map.setCenter(normalizeCoordinate(center));
        }

        setZoom(zoom) {
            this.map.setZoom(Number(zoom));
        }

        setMapType(type) {
            this.map.setMapStyle(type === 'satellite' ? 'amap://styles/satellite' : 'amap://styles/normal');
        }

        openInfoWindow(content, positionOrMarker, options) {
            const infoWindow = this.ensureInfoWindow(options);
            infoWindow.setContent(normalizeInfoContent(content));
            if (positionOrMarker && typeof positionOrMarker.getPosition === 'function') {
                infoWindow.open(this.map, positionOrMarker.getPosition());
            } else {
                infoWindow.open(this.map, normalizeCoordinate(positionOrMarker || this.options.center));
            }
            return infoWindow;
        }

        closeInfoWindow() {
            if (this.infoWindow) this.infoWindow.close();
        }

        updateCluster(options) {
            if (!this.options.cluster && !options) return null;
            const clusterOptions = options || this.options.cluster;
            if (!global.AMap || !global.AMap.MarkerCluster) return null;
            if (this.cluster && typeof this.cluster.setMap === 'function') this.cluster.setMap(null);
            this.cluster = new global.AMap.MarkerCluster(this.map, this.markers.slice(), isPlainObject(clusterOptions) ? clusterOptions : {});
            return this.cluster;
        }

        geocode(address) {
            return new Promise((resolve, reject) => {
                this.map.plugin(['AMap.Geocoder'], () => {
                    const geocoder = new global.AMap.Geocoder({ city: this.options.region || '' });
                    geocoder.getLocation(address, (status, result) => {
                        if (status !== 'complete' || !result?.geocodes?.length) {
                            reject(new Error(`No result for address: ${address}`));
                            return;
                        }
                        const item = result.geocodes[0];
                        resolve({
                            address,
                            location: [item.location.lng, item.location.lat],
                            raw: item
                        });
                    });
                });
            });
        }

        reverseGeocode(position) {
            return new Promise((resolve, reject) => {
                const coordinate = normalizeCoordinate(position);
                this.map.plugin(['AMap.Geocoder'], () => {
                    const geocoder = new global.AMap.Geocoder();
                    geocoder.getAddress(coordinate, (status, result) => {
                        if (status !== 'complete' || !result?.regeocode) {
                            reject(new Error(`No reverse geocode result for: ${coordinate.join(',')}`));
                            return;
                        }
                        resolve({
                            location: coordinate,
                            formattedAddress: result.regeocode.formattedAddress,
                            raw: result.regeocode
                        });
                    });
                });
            });
        }

        route(options) {
            const mode = String(options.mode || 'driving').toLowerCase();
            const origin = normalizeCoordinate(options.origin);
            const destination = normalizeCoordinate(options.destination);
            return new Promise((resolve, reject) => {
                const pluginName = mode === 'walking' ? 'AMap.Walking' : (mode === 'transit' ? 'AMap.Transfer' : 'AMap.Driving');
                this.map.plugin([pluginName], () => {
                    const serviceOptions = Object.assign({
                        map: options.render === false ? null : this.map,
                        hideMarkers: !!options.hideMarkers,
                        city: options.city || this.options.region || undefined
                    }, options.serviceOptions || {});
                    const ServiceClass = pluginName.split('.').reduce((cursor, key) => cursor?.[key], global);
                    if (!ServiceClass) {
                        reject(new Error(`${pluginName} is unavailable.`));
                        return;
                    }
                    const service = new ServiceClass(serviceOptions);
                    const callback = (status, result) => {
                        if (status !== 'complete') {
                            reject(new Error(`Route search failed: ${status}`));
                            return;
                        }
                        resolve({ mode, origin, destination, raw: result, service });
                    };
                    if (mode === 'transit') {
                        service.search(origin, destination, callback);
                        return;
                    }
                    if (Array.isArray(options.waypoints) && options.waypoints.length && typeof service.search === 'function') {
                        service.search(origin, destination, { waypoints: options.waypoints.map(normalizeCoordinate) }, callback);
                        return;
                    }
                    service.search(origin, destination, callback);
                });
            });
        }

        addControl(type) {
            if (type === 'zoom') {
                const control = new global.AMap.ToolBar();
                this.map.addControl(control);
                return control;
            }
            if (type === 'scale') {
                const control = new global.AMap.Scale();
                this.map.addControl(control);
                return control;
            }
            return null;
        }

        resize() {
            if (typeof this.map?.resize === 'function') this.map.resize();
        }

        destroy() {
            this.closeInfoWindow();
            this.clearListeners();
            if (this.cluster && typeof this.cluster.setMap === 'function') this.cluster.setMap(null);
            if (this.map) this.map.destroy();
            this.clearMarkers();
            this.clearOverlays();
            this.clearCluster();
        }
    }

    class GoogleProvider extends BaseProvider {
        async init() {
            if (!(global.google && global.google.maps)) {
                const callbackName = `__jq_google_map_${Date.now()}`;
                const libraries = Array.from(new Set(['geometry', 'places'].concat(this.options.libraries || [])));
                await new Promise((resolve, reject) => {
                    global[callbackName] = () => {
                        delete global[callbackName];
                        resolve();
                    };
                    loadScriptOnce(
                        `https://maps.googleapis.com/maps/api/js?key=${this.options.key}&language=${this.options.language}&libraries=${libraries.join(',')}&callback=${callbackName}`,
                        'maps.googleapis.com/maps/api/js'
                    ).catch(reject);
                });
            }
            this.createMap();
        }

        createMap() {
            this.map = new global.google.maps.Map(this.options.container, {
                center: { lng: this.options.center[0], lat: this.options.center[1] },
                zoom: this.options.zoom,
                minZoom: Number.isFinite(this.options.minZoom) ? this.options.minZoom : undefined,
                maxZoom: Number.isFinite(this.options.maxZoom) ? this.options.maxZoom : undefined,
                mapTypeId: this.options.mapType === 'satellite' ? 'satellite' : 'roadmap',
                zoomControl: this.options.controls.zoom,
                scaleControl: this.options.controls.scale,
                streetViewControl: false,
                mapTypeControl: false,
                fullscreenControl: false,
                gestureHandling: this.options.gestureEnable ? 'auto' : 'none'
            });
            DECLARATIVE_EVENTS.forEach(eventName => this.bindMapEvent(eventName));
            this.seedData();
        }

        seedData() {
            this.options.markers.forEach(marker => this.addMarker(marker));
            this.options.polylines.forEach(item => this.addPolyline(item));
            this.options.polygons.forEach(item => this.addPolygon(item));
            this.options.circles.forEach(item => this.addCircle(item));
            this.updateCluster();
            if (this.options.fitView) this.fitView();
        }

        bindMapEvent(type) {
            const remover = this.map.addListener(type, event => this.emit(type, { type, originalEvent: event, provider: this, target: this.map }));
            this.recordListener(this.map, type, remover, () => remover.remove());
        }

        ensureInfoWindow() {
            if (this.infoWindow) return this.infoWindow;
            this.infoWindow = new global.google.maps.InfoWindow();
            return this.infoWindow;
        }

        addMarker(marker) {
            const normalized = this.normalizeMarker(marker);
            const markerInstance = new global.google.maps.Marker({
                map: this.map,
                position: { lng: normalized.position[0], lat: normalized.position[1] },
                title: normalized.title,
                label: normalized.label ? String(normalized.label) : undefined,
                icon: normalized.iconUrl ? {
                    url: normalized.iconUrl,
                    scaledSize: new global.google.maps.Size(normalized.iconSize?.width || 24, normalized.iconSize?.height || 36)
                } : undefined
            });
            if (normalized.title || normalized.content || normalized.html) {
                const clickListener = markerInstance.addListener('click', () => this.openInfoWindow(normalized, markerInstance, normalized.infoWindow || {}));
                this.recordListener(markerInstance, 'click', clickListener, () => clickListener.remove());
                if (normalized.autoOpen) setTimeout(() => this.openInfoWindow(normalized, markerInstance, normalized.infoWindow || {}), 0);
            }
            if (typeof normalized.onClick === 'function') {
                const clickListener = markerInstance.addListener('click', event => normalized.onClick({ type: 'marker:click', marker: markerInstance, data: normalized, originalEvent: event }));
                this.recordListener(markerInstance, 'click', clickListener, () => clickListener.remove());
            }
            this.markers.push(markerInstance);
            return markerInstance;
        }

        removeMarkers() {
            this.markers.forEach(marker => marker.setMap(null));
            this.clearMarkers();
            this.updateCluster();
        }

        addPolyline(options) {
            const normalized = this.normalizePathOptions(options);
            const line = new global.google.maps.Polyline({
                map: this.map,
                path: normalized.path.map(point => ({ lng: point[0], lat: point[1] })),
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                strokeWeight: normalized.strokeWeight || 3
            });
            this.overlays.push(line);
            return line;
        }

        addPolygon(options) {
            const normalized = this.normalizePathOptions(options);
            const polygon = new global.google.maps.Polygon({
                map: this.map,
                paths: normalized.path.map(point => ({ lng: point[0], lat: point[1] })),
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                strokeWeight: normalized.strokeWeight || 2,
                fillColor: normalized.fillColor || '#60a5fa',
                fillOpacity: normalized.fillOpacity ?? 0.22
            });
            this.overlays.push(polygon);
            return polygon;
        }

        addCircle(options) {
            const normalized = this.normalizeCircleOptions(options);
            const circle = new global.google.maps.Circle({
                map: this.map,
                center: { lng: normalized.center[0], lat: normalized.center[1] },
                radius: normalized.radius,
                strokeColor: normalized.strokeColor || '#2563eb',
                strokeOpacity: normalized.strokeOpacity ?? 0.9,
                strokeWeight: normalized.strokeWeight || 2,
                fillColor: normalized.fillColor || '#60a5fa',
                fillOpacity: normalized.fillOpacity ?? 0.18
            });
            this.overlays.push(circle);
            return circle;
        }

        clearOverlays() {
            this.overlays.forEach(overlay => overlay.setMap(null));
            super.clearOverlays();
        }

        fitView(points) {
            const targets = Array.isArray(points) && points.length
                ? points.map(normalizeCoordinate).map(point => ({ lng: point[0], lat: point[1] }))
                : this.markers.map(marker => marker.getPosition());
            if (!targets.length) return;
            const bounds = new global.google.maps.LatLngBounds();
            targets.forEach(target => bounds.extend(target));
            this.map.fitBounds(bounds);
        }

        setCenter(center) {
            const point = normalizeCoordinate(center);
            this.map.setCenter({ lng: point[0], lat: point[1] });
        }

        setZoom(zoom) {
            this.map.setZoom(Number(zoom));
        }

        setMapType(type) {
            this.map.setMapTypeId(type === 'satellite' ? 'satellite' : 'roadmap');
        }

        openInfoWindow(content, positionOrMarker) {
            const infoWindow = this.ensureInfoWindow();
            infoWindow.setContent(normalizeInfoContent(content));
            if (positionOrMarker && typeof positionOrMarker.getPosition === 'function') {
                infoWindow.open(this.map, positionOrMarker);
            } else {
                const point = normalizeCoordinate(positionOrMarker || this.options.center);
                infoWindow.setPosition({ lng: point[0], lat: point[1] });
                infoWindow.open({ map: this.map });
            }
            return infoWindow;
        }

        closeInfoWindow() {
            if (this.infoWindow) this.infoWindow.close();
        }

        updateCluster(options) {
            const clusterOptions = options || this.options.cluster;
            if (!clusterOptions) return null;
            const Clusterer = global.markerClusterer?.MarkerClusterer || global.MarkerClusterer;
            if (!Clusterer) return null;
            if (this.cluster?.clearMarkers) this.cluster.clearMarkers();
            this.cluster = new Clusterer({
                map: this.map,
                markers: this.markers.slice(),
                ...(isPlainObject(clusterOptions) ? clusterOptions : {})
            });
            return this.cluster;
        }

        geocode(address) {
            return new Promise((resolve, reject) => {
                const geocoder = new global.google.maps.Geocoder();
                geocoder.geocode({ address, region: this.options.region || undefined }, (results, status) => {
                    if (status !== 'OK' || !results?.length) {
                        reject(new Error(`No result for address: ${address}`));
                        return;
                    }
                    const item = results[0];
                    resolve({
                        address,
                        location: [item.geometry.location.lng(), item.geometry.location.lat()],
                        raw: item
                    });
                });
            });
        }

        reverseGeocode(position) {
            return new Promise((resolve, reject) => {
                const coordinate = normalizeCoordinate(position);
                const geocoder = new global.google.maps.Geocoder();
                geocoder.geocode({
                    location: { lng: coordinate[0], lat: coordinate[1] }
                }, (results, status) => {
                    if (status !== 'OK' || !results?.length) {
                        reject(new Error(`No reverse geocode result for: ${coordinate.join(',')}`));
                        return;
                    }
                    resolve({
                        location: coordinate,
                        formattedAddress: results[0].formatted_address,
                        raw: results[0]
                    });
                });
            });
        }

        route(options) {
            const mode = String(options.mode || 'driving').toUpperCase();
            const directionsService = new global.google.maps.DirectionsService();
            const request = {
                origin: { lng: normalizeCoordinate(options.origin)[0], lat: normalizeCoordinate(options.origin)[1] },
                destination: { lng: normalizeCoordinate(options.destination)[0], lat: normalizeCoordinate(options.destination)[1] },
                travelMode: global.google.maps.TravelMode[mode] || global.google.maps.TravelMode.DRIVING,
                waypoints: Array.isArray(options.waypoints)
                    ? options.waypoints.map(point => {
                        const normalized = normalizeCoordinate(point);
                        return { location: { lng: normalized[0], lat: normalized[1] }, stopover: true };
                    })
                    : []
            };
            return new Promise((resolve, reject) => {
                directionsService.route(request, (result, status) => {
                    if (status !== 'OK') {
                        reject(new Error(`Route search failed: ${status}`));
                        return;
                    }
                    let renderer = null;
                    if (options.render !== false) {
                        renderer = new global.google.maps.DirectionsRenderer(Object.assign({
                            map: this.map,
                            suppressMarkers: !!options.hideMarkers
                        }, options.rendererOptions || {}));
                        renderer.setDirections(result);
                        this.overlays.push(renderer);
                    }
                    resolve({
                        mode: mode.toLowerCase(),
                        raw: result,
                        renderer
                    });
                });
            });
        }

        addControl() {
            return null;
        }

        resize() {
            global.google.maps.event.trigger(this.map, 'resize');
        }

        destroy() {
            this.closeInfoWindow();
            this.clearListeners();
            if (this.options.container) this.options.container.innerHTML = '';
            this.clearMarkers();
            this.clearOverlays();
            this.clearCluster();
        }
    }

    providerRegistry.set('baidu', BaiduProvider);
    providerRegistry.set('gaode', GaodeProvider);
    providerRegistry.set('amap', GaodeProvider);
    providerRegistry.set('google', GoogleProvider);

    async function mount(options) {
        const normalized = normalizeOptions(options);
        const container = resolveContainer(normalized.container);
        if (!container) throw new Error(`Map container not found: ${normalized.container}`);
        if (!normalized.key) throw new Error('Map key is required.');

        const Provider = providerRegistry.get(normalized.provider);
        if (!Provider) throw new Error(`Unsupported map provider: ${normalized.provider}`);

        const id = container.id || nextId();
        container.id = id;

        if (instanceRegistry.has(id)) {
            const existing = instanceRegistry.get(id);
            existing.destroy();
            instanceRegistry.delete(id);
        }

        const provider = new Provider(Object.assign({}, normalized, { container }));
        try {
            await provider.init();
            const handle = createHandle(id, provider, normalized, container);
            instanceRegistry.set(id, handle);
            if (typeof normalized.onReady === 'function') normalized.onReady(handle);
            return handle;
        } catch (error) {
            if (typeof normalized.onError === 'function') normalized.onError(error);
            throw error;
        }
    }

    function createHandle(id, provider, options, container) {
        return {
            id,
            provider: options.provider,
            options: Object.assign({}, options),
            element() {
                return container;
            },
            getNativeMapInstance() {
                return provider.map;
            },
            getProviderInstance() {
                return provider;
            },
            setCenter(center) {
                provider.setCenter(center);
                return this;
            },
            setZoom(zoom) {
                provider.setZoom(zoom);
                return this;
            },
            setMapType(type) {
                provider.setMapType(type);
                return this;
            },
            addMarker(marker) {
                return provider.addMarker(marker);
            },
            addMarkers(markers) {
                (Array.isArray(markers) ? markers : [markers]).forEach(item => provider.addMarker(item));
                provider.updateCluster();
                return this;
            },
            removeMarkers() {
                provider.removeMarkers();
                return this;
            },
            addPolyline(mapOptions) {
                return provider.addPolyline(mapOptions);
            },
            addPolygon(mapOptions) {
                return provider.addPolygon(mapOptions);
            },
            addCircle(mapOptions) {
                return provider.addCircle(mapOptions);
            },
            addOverlays(payload) {
                (payload?.polylines || []).forEach(item => provider.addPolyline(item));
                (payload?.polygons || []).forEach(item => provider.addPolygon(item));
                (payload?.circles || []).forEach(item => provider.addCircle(item));
                return this;
            },
            clearOverlays() {
                provider.clearOverlays();
                return this;
            },
            fitView(points) {
                provider.fitView(points);
                return this;
            },
            openInfoWindow(content, positionOrMarker, mapOptions) {
                return provider.openInfoWindow(content, positionOrMarker, mapOptions);
            },
            closeInfoWindow() {
                provider.closeInfoWindow();
                return this;
            },
            geocode(address) {
                return provider.geocode(address);
            },
            reverseGeocode(position) {
                return provider.reverseGeocode(position);
            },
            route(routeOptions) {
                return provider.route(routeOptions);
            },
            cluster(clusterOptions) {
                return provider.updateCluster(clusterOptions);
            },
            addControl(type, controlOptions) {
                return provider.addControl(type, controlOptions);
            },
            on(event, handler) {
                return provider.on(event, handler);
            },
            off(event, handler) {
                return provider.off(event, handler);
            },
            resize() {
                provider.resize();
                return this;
            },
            destroy() {
                provider.destroy();
                instanceRegistry.delete(id);
                return true;
            }
        };
    }

    function resolveHandle(target) {
        if (!target) return null;
        if (typeof target === 'string') {
            if (instanceRegistry.has(target)) return instanceRegistry.get(target);
            const node = document.querySelector(target) || document.getElementById(target.replace(/^#/, ''));
            if (node && instanceRegistry.has(node.id)) return instanceRegistry.get(node.id);
            return null;
        }
        if (target instanceof HTMLElement && instanceRegistry.has(target.id)) return instanceRegistry.get(target.id);
        return null;
    }

    function parseDeclarativeOptions(node) {
        return {
            container: node,
            key: node.getAttribute('data-map-key'),
            provider: node.getAttribute('data-map-provider') || 'baidu',
            center: node.getAttribute('data-map-center') || '116.404,39.915',
            zoom: normalizeNumber(node.getAttribute('data-map-zoom'), 12),
            minZoom: normalizeNumber(node.getAttribute('data-map-min-zoom'), null),
            maxZoom: normalizeNumber(node.getAttribute('data-map-max-zoom'), null),
            language: node.getAttribute('data-map-language') || 'zh-CN',
            region: node.getAttribute('data-map-region') || '',
            mapType: node.getAttribute('data-map-type') || 'normal',
            fitView: normalizeBoolean(node.getAttribute('data-map-fit-view'), false),
            gestureEnable: normalizeBoolean(node.getAttribute('data-map-gesture'), true),
            cluster: normalizeBoolean(node.getAttribute('data-map-cluster'), false),
            controls: {
                zoom: normalizeBoolean(node.getAttribute('data-map-control-zoom'), true),
                scale: normalizeBoolean(node.getAttribute('data-map-control-scale'), true)
            },
            markers: tryParseJSON(node.getAttribute('data-map-markers'), []),
            polylines: tryParseJSON(node.getAttribute('data-map-polylines'), []),
            polygons: tryParseJSON(node.getAttribute('data-map-polygons'), []),
            circles: tryParseJSON(node.getAttribute('data-map-circles'), [])
        };
    }

    const mapApi = {
        mount(options) {
            return mount(options);
        },
        registerProvider(name, ProviderClass) {
            providerRegistry.set(String(name).toLowerCase(), ProviderClass);
            return true;
        },
        normalizeCoordinate,
        get(target) {
            return resolveHandle(target);
        },
        destroy(target) {
            const handle = resolveHandle(target);
            return handle ? handle.destroy() : false;
        }
    };

    JquanUIComponents.mapApi = mapApi;

    JquanUIComponents.map = {
        name: 'jquanui-map',
        version: '2.0.0',
        requires: [],
        install(api) {
            api.addBase(`
[jq-map]{
  position:relative;
  display:block;
  width:100%;
  min-height:320px;
  background:rgb(241 245 249 / 1);
  overflow:hidden;
}
            `);

            api.addBehaviors({
                selector: '[jq-map]',
                setup(node) {
                    const options = parseDeclarativeOptions(node);
                    mount(options).then(handle => {
                        DECLARATIVE_EVENTS.forEach(eventName => {
                            const methodName = node.getAttribute(`data-map-on-${eventName}`);
                            if (!methodName) return;
                            const fn = global[methodName];
                            if (typeof fn === 'function') {
                                handle.on(eventName, payload => fn(payload, handle));
                            }
                        });
                    }).catch(() => {});

                    return () => {
                        if (node.id && instanceRegistry.has(node.id)) {
                            instanceRegistry.get(node.id).destroy();
                        }
                    };
                }
            });
        }
    };
})(window);
