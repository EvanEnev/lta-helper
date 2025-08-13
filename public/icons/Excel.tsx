import * as React from 'react'
import {SVGProps} from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    {...props}>
    <g clipPath="url(#a)">
      <path
        fill="#9D9C9B"
        fillRule="evenodd"
        d="M16 5.587v52.826C16 61.499 18.462 64 21.5 64h37c3.038 0 5.5-2.502 5.5-5.587v-43.71a5.632 5.632 0 0 0-1.632-3.973l-9.072-9.115A5.456 5.456 0 0 0 49.428 0H21.5C18.462 0 16 2.502 16 5.587Zm3.5 52.826V5.587c0-1.122.895-2.031 2-2.031h27.25v12.19c0 2.104 1.679 3.81 3.75 3.81h8v38.857c0 1.122-.895 2.031-2 2.031h-37c-1.105 0-2-.91-2-2.031ZM60.5 16v-1.297c0-.543-.214-1.063-.594-1.445L52.25 5.565v10.181c0 .14.112.254.25.254h8Z"
        clipRule="evenodd"
      />
      <path
        fill="#69C997"
        fillRule="evenodd"
        d="M41 26.25c0-.966.783-1.75 1.75-1.75h11.5a1.75 1.75 0 1 1 0 3.5h-11.5A1.75 1.75 0 0 1 41 26.25Z"
        clipRule="evenodd"
      />
      <path
        fill="#54AD7D"
        fillRule="evenodd"
        d="M41 34.25c0-.967.783-1.75 1.75-1.75h11.5a1.75 1.75 0 1 1 0 3.5h-11.5A1.75 1.75 0 0 1 41 34.25Z"
        clipRule="evenodd"
      />
      <path
        fill="#2B593D"
        fillRule="evenodd"
        d="M41 42.25c0-.967.783-1.75 1.75-1.75h11.5a1.75 1.75 0 1 1 0 3.5h-11.5A1.75 1.75 0 0 1 41 42.25Z"
        clipRule="evenodd"
      />
      <path
        fill="#3D8A58"
        d="M0 18.5a3 3 0 0 1 3-3h30a3 3 0 0 1 3 3v30a3 3 0 0 1-3 3H3a3 3 0 0 1-3-3v-30Z"
      />
      <path
        fill="#fff"
        d="m10 43.543 5.62-10.459-5.1-9.584h3.882l3.295 6.44 3.227-6.44h3.842l-5.1 9.734 5.62 10.309h-4.007l-3.65-6.932-3.65 6.932H10Z"
      />
    </g>
    <defs>
      <clipPath id="a">
        <path fill="#fff" d="M0 0h64v64H0z" />
      </clipPath>
    </defs>
  </svg>
)
export default SvgComponent
