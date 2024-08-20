import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SVGComponent = ({ color, ...props }) => (
  <Svg
    width={36}
    height={36}
    viewBox="0 0 36 36"
    fill="none"
    {...props}
  >
    <Path
      d="M14.5801 3.13989H21.4201C22.1547 3.13989 22.8593 3.43173 23.3787 3.95121C23.8982 4.47068 24.1901 5.17524 24.1901 5.90989V9.40989H11.8101V5.90989C11.8101 5.17524 12.1019 4.47068 12.6214 3.95121C13.1408 3.43173 13.8454 3.13989 14.5801 3.13989Z"
      stroke={color}
      strokeWidth={2.37}
      strokeMiterlimit={10}
    />
    <Path
      d="M30.7198 9.40991H5.27977C3.61187 9.40991 2.25977 10.762 2.25977 12.4299V28.8499C2.25977 30.5178 3.61187 31.8699 5.27977 31.8699H30.7198C32.3877 31.8699 33.7398 30.5178 33.7398 28.8499V12.4299C33.7398 10.762 32.3877 9.40991 30.7198 9.40991Z"
      stroke={color}
      strokeWidth={2.37}
      strokeMiterlimit={10}
    />
    <Path
      d="M10.5 15.73V24.94"
      stroke={color}
      strokeWidth={2.37}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
    <Path
      d="M25.6201 15.73V24.94"
      stroke={color}
      strokeWidth={2.37}
      strokeMiterlimit={10}
      strokeLinecap="round"
    />
  </Svg>
);
export default SVGComponent;
