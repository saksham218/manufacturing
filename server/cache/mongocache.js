import mongoose from 'mongoose';

import Manager from "../models/manager.js";
import Worker from "../models/worker.js";
import Item from "../models/item.js";

const cacheConfig = {
  'manager': {
    model: Manager,
    projection: { manager_id: 1, name: 1, _id: 1 },
    cacheKey: '_id'
  },
  'worker': {
    model: Worker,
    projection: { worker_id: 1, name: 1, _id: 1 },
    cacheKey: '_id'
  },
  'item': {
    model: Item,
    projection: { design_number: 1, description: 1, _id: 1 },
    cacheKey: '_id'
  }
};

class MongoCache {
  constructor() {
    this.cache = new Map();
    this.initialized = false;
  }


  async initialize() {

    if (this.initialized) return;

    const keys = Object.keys(cacheConfig);
    for (const key of keys) {
      this.cache.set(key, new Map());
      const config = cacheConfig[key];
      const data = await config.model.find({}, config.projection).lean();
      for (const item of data) {
        const cacheKey = item[config.cacheKey].toString();
        this.cache.get(key).set(cacheKey, item);
      }
    }

    this.initialized = true;

    console.log("MongoCache initialized with data:", this.cache);

  }

  async get(sectionKey, cacheKey) {
    if (!this.initialized) {
      console.log("Cache not initialized, initializing..")
      await this.initialize();
    }

    if (!cacheConfig[sectionKey]) {
      throw new Error(`Cache configuration for key "${sectionKey}" not found.`);
    }

    const cacheSection = this.cache.get(sectionKey);
    if (cacheSection.has(cacheKey)) {
      console.log(`Cache hit for key: ${cacheKey}`);
      return cacheSection.get(cacheKey);
    } else {
      console.log(`Cache miss for key: ${cacheKey}`);
      const config = cacheConfig[sectionKey];
      const data = await config.model.findOne({ [config.cacheKey]: cacheKey }, config.projection).lean();
      if (data) {
        cacheSection.set(cacheKey, data);
        return data;
      }
    }
    return null;
  }

}

const mongoCache = new MongoCache();
export default mongoCache;
