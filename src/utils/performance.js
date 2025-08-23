// ======================================================================
// File: src/utils/performance.js
// หน้าที่: Utilities สำหรับ Performance Monitoring และ Optimization
// ======================================================================

/**
 * วัดเวลาการทำงานของ function
 */
export const measurePerformance = (fn, label = 'Function') => {
  return async (...args) => {
    const start = performance.now();
    try {
      const result = await fn(...args);
      const end = performance.now();
      console.log(`⏱️ ${label} took ${(end - start).toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.log(`❌ ${label} failed after ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  };
};

/**
 * Debounce function สำหรับลด frequency ของการเรียกใช้
 */
export const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

/**
 * Throttle function สำหรับจำกัดการเรียกใช้ในช่วงเวลาหนึ่ง
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return (...args) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Lazy load images เมื่อเข้ามาใน viewport
 */
export const createImageObserver = (callback) => {
  if (!window.IntersectionObserver) {
    // Fallback สำหรับ browser เก่า
    return {
      observe: () => {},
      disconnect: () => {}
    };
  }

  return new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, {
    rootMargin: '50px'
  });
};

/**
 * ตรวจสอบ Network Speed
 */
export const getNetworkSpeed = () => {
  if ('connection' in navigator) {
    const connection = navigator.connection;
    return {
      effectiveType: connection.effectiveType, // '4g', '3g', '2g', 'slow-2g'
      downlink: connection.downlink, // Mbps
      rtt: connection.rtt, // ms
      saveData: connection.saveData
    };
  }
  return null;
};

/**
 * เก็บข้อมูลใน Memory Cache พร้อม TTL
 */
class MemoryCache {
  constructor(ttl = 300000) { // 5 นาที default
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, customTtl = null) {
    const expiry = Date.now() + (customTtl || this.ttl);
    this.cache.set(key, { value, expiry });
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.value;
  }

  has(key) {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear() {
    this.cache.clear();
  }

  size() {
    // ลบ items ที่หมดอายุแล้วก่อน
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
    return this.cache.size;
  }
}

/**
 * Global Memory Cache Instance
 */
export const memoryCache = new MemoryCache();

/**
 * วัดขนาดของ object ใน memory (ประมาณ)
 */
export const getObjectSize = (obj) => {
  const jsonString = JSON.stringify(obj);
  return new Blob([jsonString]).size;
};

/**
 * ตรวจสอบว่า browser รองรับ WebP หรือไม่
 */
export const supportsWebP = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').startsWith('data:image/webp');
};

/**
 * Preload critical resources
 */
export const preloadResource = (href, as = 'script', crossOrigin = null) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  if (crossOrigin) link.crossOrigin = crossOrigin;
  document.head.appendChild(link);
  return link;
};

/**
 * Performance Metrics Collector
 */
export class PerformanceMetrics {
  constructor() {
    this.metrics = [];
    this.startTimes = new Map();
  }

  start(label) {
    this.startTimes.set(label, performance.now());
  }

  end(label) {
    const startTime = this.startTimes.get(label);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.metrics.push({ label, duration, timestamp: Date.now() });
      this.startTimes.delete(label);
      return duration;
    }
    return null;
  }

  getMetrics() {
    return [...this.metrics];
  }

  getAverageTime(label) {
    const labelMetrics = this.metrics.filter(m => m.label === label);
    if (labelMetrics.length === 0) return null;
    
    const total = labelMetrics.reduce((sum, m) => sum + m.duration, 0);
    return total / labelMetrics.length;
  }

  clear() {
    this.metrics = [];
    this.startTimes.clear();
  }
}

/**
 * Global Performance Metrics Instance
 */
export const performanceMetrics = new PerformanceMetrics();

/**
 * ตรวจสอบ Page Visibility และ suspend การทำงานเมื่อซ่อน
 */
export const createVisibilityObserver = (onVisible, onHidden) => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      onHidden?.();
    } else {
      onVisible?.();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
};
