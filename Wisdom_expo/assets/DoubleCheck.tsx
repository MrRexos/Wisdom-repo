import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SVGComponent = ({ color = "#323131", ...props }) => (
  <Svg
    width={13}
    height={7}
    viewBox="0 0 13 7"
    fill="none"
    {...props}
  >
    <Path
      d="M1 4.19849L2.57135 5.76983"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M2.80127 6L7.80127 1"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
    <Path
      d="M6.72949 6L11.7295 1"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

export default SVGComponent;