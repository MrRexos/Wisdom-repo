import * as React from "react";
import Svg, { G, Path, Defs, ClipPath, Rect } from "react-native-svg";

const SVGComponent = ({
  color = "#E85D0C",
  height = 29,
  width = 29,
  strokeWidth = 2.59,
  ...props
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 29 29"
    fill="none"
    {...props}
  >
    <G clipPath="url(#clip0_936_857)">
      <Path
        d="M25.0999 7.13989H3.12988C2.16338 7.13989 1.37988 7.92339 1.37988 8.88989V22.2499C1.37988 23.2164 2.16338 23.9999 3.12988 23.9999H25.0999C26.0664 23.9999 26.8499 23.2164 26.8499 22.2499V8.88989C26.8499 7.92339 26.0664 7.13989 25.0999 7.13989Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
      />
      <Path
        d="M1.37988 11.8201L14.1199 15.5701L26.8599 12.2701"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
      />
      <Path
        d="M18.3701 7.10002V5.10003C18.3756 4.72848 18.2352 4.36959 17.979 4.10038C17.7229 3.83116 17.3714 3.67307 17.0001 3.66003H11.5301C11.1628 3.65176 10.8068 3.78718 10.5378 4.03745C10.2689 4.28772 10.1082 4.63309 10.0901 5.00003V7.10002H18.3701Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeMiterlimit={10}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_936_857">
        <Rect width={28.14} height={28.14} fill="white" />
      </ClipPath>
    </Defs>
  </Svg>
);

export default SVGComponent;
