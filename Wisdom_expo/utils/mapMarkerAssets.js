import { Image } from 'react-native';

const mapMarkerImage = require('../assets/MapMarker.png');

const resolvedMarker = Image.resolveAssetSource
  ? Image.resolveAssetSource(mapMarkerImage)
  : { width: 88, height: 116 };

const TARGET_MARKER_HEIGHT = 40;
const markerScale = resolvedMarker.height ? TARGET_MARKER_HEIGHT / resolvedMarker.height : 1;

const mapMarkerStyle = Object.freeze({
  width: resolvedMarker.width ? resolvedMarker.width * markerScale : TARGET_MARKER_HEIGHT,
  height: TARGET_MARKER_HEIGHT,
});

const mapMarkerAnchor = Object.freeze({ x: 0.5, y: 1 });
const mapMarkerCenterOffset = Object.freeze({ x: 0.5, y: -TARGET_MARKER_HEIGHT / 2 });

export {
  mapMarkerImage,
  mapMarkerStyle,
  mapMarkerAnchor,
  mapMarkerCenterOffset,
};