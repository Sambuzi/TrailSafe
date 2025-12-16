#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const Trail = require('../models/Trail');

const defaultFile = path.join(__dirname, '..', 'data', 'umap_backup_mappa-trentino.umap');
const filePath = process.argv[2] ? path.resolve(process.argv[2]) : defaultFile;

function computeLengthKm(coords) {
  // Haversine over successive points
  const R = 6371; // km
  let d = 0;
  for (let i = 1; i < coords.length; i++) {
    const [lon1, lat1] = coords[i - 1];
    const [lon2, lat2] = coords[i];
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    d += R * c;
  }
  return Number(d.toFixed(2));
}

async function connectDb() {
  const mongoUri = process.env.MONGODB_URI;
  if (mongoUri) {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB at', mongoUri);
  } else {
    // try to reuse mongodb-memory-server like server/index.js
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('Started temporary in-memory MongoDB');
  }
}

function tryParseJsonBuffer(buf) {
  try {
    const txt = buf.toString('utf8');
    return JSON.parse(txt);
  } catch (e) {
    return null;
  }
}

async function importFromGeojson(obj) {
  if (!obj) return 0;
  let features = [];
  if (obj.type === 'FeatureCollection' && Array.isArray(obj.features)) {
    features = obj.features;
  } else if (obj.type === 'Feature') {
    features = [obj];
  } else if (Array.isArray(obj)) {
    // array of features
    features = obj;
  } else {
    return 0;
  }

  const toInsert = [];

  for (const feat of features) {
    const geom = feat.geometry;
    if (!geom) continue;
    let coords = null;
    if (geom.type === 'LineString') coords = geom.coordinates;
    else if (geom.type === 'MultiLineString') coords = [].concat(...geom.coordinates);
    else if (geom.type === 'Polygon') coords = geom.coordinates[0];
    else continue; // skip points

    if (!coords || coords.length < 2) continue;

    const props = feat.properties || {};
    const name = props.name || props.title || props.label || 'Imported trail';
    const difficulty = props.difficulty || props.level || 'Medium';
    const status = props.status || props.state || 'Aperto';
    const length_km = props.length_km || props.length || computeLengthKm(coords);

    toInsert.push({
      name,
      difficulty,
      status,
      length_km,
      geometry: { type: 'LineString', coordinates: coords }
    });
  }

  if (toInsert.length) {
    await Trail.insertMany(toInsert);
  }

  return toInsert.length;
}

async function run() {
  console.log('Importing from', filePath);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(1);
  }

  await connectDb();

  const buf = fs.readFileSync(filePath);

  // Try parse as JSON directly
  const parsed = tryParseJsonBuffer(buf);
  if (parsed) {
    // Special-case uMap backup format which contains `layers` arrays
    if (parsed.layers && Array.isArray(parsed.layers)) {
      const combined = { type: 'FeatureCollection', features: [] };
      for (const layer of parsed.layers) {
        if (Array.isArray(layer.features)) {
          combined.features.push(...layer.features.map(f => ({ type: 'Feature', properties: f.properties || {}, geometry: f.geometry })));
        }
      }
      const n = await importFromGeojson(combined);
      console.log(`Imported ${n} features from uMap JSON file (layers).`);
      process.exit(0);
    }

    const n = await importFromGeojson(parsed);
    console.log(`Imported ${n} features from JSON file.`);
    process.exit(0);
  }

  // Try unzip
  try {
    const zip = new AdmZip(buf);
    const entries = zip.getEntries();
    let total = 0;
    for (const e of entries) {
      const name = e.entryName.toLowerCase();
      if (name.endsWith('.geojson') || name.endsWith('.json')) {
        console.log('Found geojson-like entry:', e.entryName);
        const txt = e.getData().toString('utf8');
        let obj;
        try { obj = JSON.parse(txt); } catch (err) { obj = null; }
        if (obj) {
          const n = await importFromGeojson(obj);
          console.log(`Imported ${n} features from ${e.entryName}`);
          total += n;
        }
      }
    }

    if (total === 0) {
      console.warn('No GeoJSON entries found in archive. Try converting the .umap backup to GeoJSON first.');
    } else {
      console.log(`Imported total ${total} features.`);
    }

  } catch (err) {
    console.error('Failed to unzip or parse .umap:', err);
  }

  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
