import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SVGComponent = ({
  width = 53,
  height = 53,
  fill = "black",
  ...props
}) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 53 53"
    fill="none"
    {...props}
  >
    <Path
      d="M31.4688 0C31.908 0 32.3293 0.174497 32.6399 0.485104C32.9505 0.795712 33.125 1.21699 33.125 1.65625C33.125 2.09551 33.2995 2.51679 33.6101 2.8274C33.9207 3.138 34.342 3.3125 34.7812 3.3125C35.2205 3.3125 35.6418 3.487 35.9524 3.7976C36.263 4.10821 36.4375 4.52949 36.4375 4.96875V6.625C36.4375 7.06426 36.263 7.48554 35.9524 7.79615C35.6418 8.10675 35.2205 8.28125 34.7812 8.28125H18.2188C17.7795 8.28125 17.3582 8.10675 17.0476 7.79615C16.737 7.48554 16.5625 7.06426 16.5625 6.625V4.96875C16.5625 4.52949 16.737 4.10821 17.0476 3.7976C17.3582 3.487 17.7795 3.3125 18.2188 3.3125C18.658 3.3125 19.0793 3.138 19.3899 2.8274C19.7005 2.51679 19.875 2.09551 19.875 1.65625C19.875 1.21699 20.0495 0.795712 20.3601 0.485104C20.6707 0.174497 21.092 0 21.5312 0L31.4688 0Z"
      fill={fill}
    />
    <Path
      d="M11.5938 3.3125H13.5316C13.3444 3.8446 13.2492 4.40469 13.25 4.96875V6.625C13.25 7.94279 13.7735 9.20662 14.7053 10.1384C15.6371 11.0703 16.901 11.5937 18.2188 11.5938H34.7812C36.099 11.5937 37.3629 11.0703 38.2947 10.1384C39.2265 9.20662 39.75 7.94279 39.75 6.625V4.96875C39.7478 4.38575 39.6539 3.83367 39.4684 3.3125H41.4062C42.724 3.3125 43.9879 3.83599 44.9197 4.76781C45.8515 5.69963 46.375 6.96346 46.375 8.28125V48.0312C46.375 49.349 45.8515 50.6129 44.9197 51.5447C43.9879 52.4765 42.724 53 41.4062 53H11.5938C10.276 53 9.01213 52.4765 8.08031 51.5447C7.14849 50.6129 6.625 49.349 6.625 48.0312V8.28125C6.625 6.96346 7.14849 5.69963 8.08031 4.76781C9.01213 3.83599 10.276 3.3125 11.5938 3.3125Z"
      fill={fill}
    />
  </Svg>
);

export default SVGComponent;

