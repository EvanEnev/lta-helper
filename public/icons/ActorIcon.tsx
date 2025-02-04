import {SVGProps} from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={240}
    height={240}
    fill="none"
    {...props}>
    <path
      fill="#79B7A8"
      d="m121.207 0 82.532 137.23h-45.351l-.01-.016h-50.186l.001.001 56.573 94.156C208.867 213.628 240 170.448 240 119.997 240 54.124 186.925.647 121.207 0Z"
    />
    <path
      fill="#79B7A8"
      d="m80.027 6.813 55.153 91.792H70.174l-30.557-.245 85.05 141.551A122.54 122.54 0 0 1 120 240C53.726 240 0 186.273 0 119.997 0 67.737 33.405 23.279 80.027 6.813Z"
    />
  </svg>
)
export default SvgComponent
