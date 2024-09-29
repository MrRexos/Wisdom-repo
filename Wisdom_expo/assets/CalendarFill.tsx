import * as React from "react";
import Svg, { Path } from "react-native-svg";

const SVGComponent = ({ color = "#444343", height = 24, width = 24, strokeWidth = 2, ...props }) => (
  <Svg
    width={width}
    height={height}
    viewBox="0 0 24 24"
    fill="none"
    {...props}
  >
    <Path
      d="M2.2 10V19.2C2.19461 19.5692 2.26335 19.9357 2.40216 20.2779C2.54096 20.62 2.74701 20.9308 3.00809 21.1919C3.26918 21.453 3.58 21.659 3.92214 21.7978C4.26429 21.9366 4.63081 22.0054 5 22H19C19.3692 22.0054 19.7357 21.9366 20.0779 21.7978C20.42 21.659 20.7308 21.453 20.9919 21.1919C21.253 20.9308 21.459 20.62 21.5978 20.2779C21.7366 19.9357 21.8054 19.5692 21.8 19.2V10H2.2Z"
      fill={color}
    />
    <Path
      d="M21.8 8.29996V5.10996C21.8014 4.74374 21.7296 4.38093 21.5889 4.04282C21.4481 3.70471 21.2413 3.39812 20.9805 3.14103C20.7197 2.88394 20.4101 2.68153 20.07 2.54569C19.7299 2.40985 19.3661 2.3433 19 2.34996H16.77V1.09996C16.7822 0.99352 16.7719 0.885684 16.7395 0.783532C16.7072 0.68138 16.6536 0.587222 16.5823 0.507235C16.511 0.427248 16.4236 0.363241 16.3258 0.319414C16.2281 0.275587 16.1221 0.25293 16.015 0.25293C15.9078 0.25293 15.8019 0.275587 15.7041 0.319414C15.6063 0.363241 15.5189 0.427248 15.4476 0.507235C15.3763 0.587222 15.3228 0.68138 15.2904 0.783532C15.2581 0.885684 15.2477 0.99352 15.26 1.09996V2.34996H8.72997V1.09996C8.73012 0.903491 8.65418 0.714593 8.51808 0.572898C8.38198 0.431202 8.19629 0.34772 7.99997 0.339964C7.90063 0.339955 7.80228 0.359681 7.71063 0.397996C7.61898 0.436311 7.53585 0.492451 7.46607 0.563158C7.3963 0.633864 7.34126 0.717728 7.30417 0.80988C7.26707 0.902031 7.24865 1.00063 7.24997 1.09996V2.34996H4.99997C4.63381 2.3433 4.27 2.40985 3.9299 2.54569C3.5898 2.68153 3.28026 2.88394 3.01945 3.14103C2.75863 3.39812 2.55179 3.70471 2.41107 4.04282C2.27035 4.38093 2.19858 4.74374 2.19997 5.10996V8.29996H21.8Z"
      fill={color}
    />
  </Svg>
);

export default SVGComponent;