import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

const SVGComponent = ({ width = 30, height = 14, fill = "white", ...props }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 30 14"
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip0_604_852)">
      <Path
        d="M11.7432 1.39091L0 14H30L18.2591 1.39091C17.8524 0.952402 17.3514 0.601051 16.7895 0.360343C16.2277 0.119635 15.618 -0.00488281 15.0011 -0.00488281C14.3843 -0.00488281 13.7746 0.119635 13.2128 0.360343C12.6509 0.601051 12.1499 0.952402 11.7432 1.39091Z"
        fill={fill}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_604_852">
        <Rect width={30} height={14} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default SVGComponent;
