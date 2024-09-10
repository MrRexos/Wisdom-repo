import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SVGComponent = ({ color, ...props }) => (
  <Svg
    width={12}
    height={12}
    viewBox="0 0 31 35"
    fill="none"
    {...props}
  >
    <Path
      d="M29 20C29 20.7956 28.6839 21.5587 28.1213 22.1213C27.5587 22.6839 26.7956 23 26 23H8L2 29V5C2 4.20435 2.31607 3.44129 2.87868 2.87868C3.44129 2.31607 4.20435 2 5 2H26C26.7956 2 27.5587 2.31607 28.1213 2.87868C28.6839 3.44129 29 4.20435 29 5V20Z"
      fill={color}
      stroke={color}
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
export default SVGComponent;
