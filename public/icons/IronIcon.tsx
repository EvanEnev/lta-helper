import {SVGProps} from 'react'
const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={220}
    height={250}
    fill="none"
    {...props}>
    <path
      fill="#555754"
      d="M110 0c51.915 0 94 42.085 94 94v62c0 51.915-42.085 94-94 94V0Z"
    />
    <path
      fill="#484D50"
      d="M110 0C58.085 0 16 42.085 16 94v62c0 51.915 42.085 94 94 94V0Z"
    />
    <mask
      id="a"
      width={120}
      height={162}
      x={50}
      y={44}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}>
      <rect width={120} height={162} x={50} y={44} fill="#5D5D5D" rx={60} />
    </mask>
    <g mask="url(#a)">
      <path
        fill="#363536"
        d="M110 44a81.002 81.002 0 0 0-24.265 3.72L110 125V44Z"
      />
      <path
        fill="#333233"
        d="M110 206a80.986 80.986 0 0 1-24.265-3.72L110 125v81Z"
      />
      <path
        fill="#393839"
        d="M85.758 47.713a81 81 0 0 0-52.485 51.326L110 125 85.758 47.713Z"
      />
      <path
        fill="#2E2E2E"
        d="M85.758 202.287a80.992 80.992 0 0 1-52.485-51.326L110 125l-24.242 77.287Z"
      />
      <path
        fill="#313031"
        d="M33.281 99.015A81 81 0 0 0 29 125.027l81-.027-76.719-25.985Z"
      />
      <path
        fill="#313031"
        d="M33.281 150.985A81.004 81.004 0 0 1 29 124.973l81 .027-76.719 25.985Z"
      />
      <path
        fill="#5D5B5D"
        d="M110 44c8.23 0 16.413 1.254 24.265 3.72L110 125V44Z"
      />
      <path
        fill="#424342"
        d="M110 206c8.23 0 16.413-1.254 24.265-3.72L110 125v81Z"
      />
      <path
        fill="#4F4F4F"
        d="M134.242 47.713a81.005 81.005 0 0 1 52.485 51.326L110 125l24.242-77.287Z"
      />
      <path
        fill="#3F3C3F"
        d="M134.242 202.287a80.996 80.996 0 0 0 52.485-51.326L110 125l24.242 77.287Z"
      />
      <path
        fill="#474747"
        d="M186.719 99.015A80.995 80.995 0 0 1 191 125.027L110 125l76.719-25.985Z"
      />
      <path
        fill="#3F403F"
        d="M186.719 150.985A80.998 80.998 0 0 0 191 124.973L110 125l76.719 25.985Z"
      />
    </g>
    <rect width={70} height={88} x={75} y={81} fill="#C5C3C5" rx={35} />
    <mask
      id="b"
      width={70}
      height={88}
      x={75}
      y={81}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}>
      <path
        fill="#C5C3C5"
        d="M75 116c0-19.33 15.67-35 35-35s35 15.67 35 35v18c0 19.33-15.67 35-35 35s-35-15.67-35-35v-18Z"
      />
    </mask>
    <g mask="url(#b)">
      <path fill="#656665" d="M110 81a44 44 0 0 0-13.18 2.02L110 125V81Z" />
      <path
        fill="#5A5B5D"
        d="M110 169c-4.471 0-8.915-.681-13.18-2.021L110 125v44Z"
      />
      <path
        fill="#6B6C6D"
        d="M96.831 83.017a44 44 0 0 0-28.51 27.881L110 125 96.831 83.017Z"
      />
      <path
        fill="#545654"
        d="M96.831 166.983a44 44 0 0 1-28.51-27.881L110 125l-13.169 41.983Z"
      />
      <path
        fill="#656668"
        d="M68.326 110.885A43.998 43.998 0 0 0 66 125.015l44-.015-41.674-14.115Z"
      />
      <path
        fill="#5A5A5D"
        d="M68.326 139.115A43.998 43.998 0 0 1 66 124.985l44 .015-41.674 14.115Z"
      />
      <path
        fill="#C3C3C6"
        d="M110 81c4.471 0 8.915.681 13.181 2.02L110 125V81Z"
      />
      <path
        fill="#6A6A6A"
        d="M110 169a43.98 43.98 0 0 0 13.181-2.021L110 125v44Z"
      />
      <path
        fill="#949394"
        d="M123.169 83.017a43.993 43.993 0 0 1 28.51 27.881L110 125l13.169-41.983Z"
      />
      <path
        fill="#636463"
        d="M123.169 166.983a43.994 43.994 0 0 0 28.51-27.881L110 125l13.169 41.983Z"
      />
      <path
        fill="#79797A"
        d="M151.674 110.885a43.974 43.974 0 0 1 2.326 14.13L110 125l41.674-14.115Z"
      />
      <path
        fill="#6A6A6A"
        d="M151.674 139.115a43.974 43.974 0 0 0 2.326-14.13L110 125l41.674 14.115Z"
      />
    </g>
    <path
      fill="#7B797B"
      fillRule="evenodd"
      d="M35 133h-6v17c0 44.735 36.265 81 81 81s81-36.265 81-81v-17h-6v16c0 41.421-33.579 75-75 75s-75-33.579-75-75v-16ZM35 114h-6V97c0-44.735 36.265-81 81-81s81 36.265 81 81v17h-6V98c0-41.421-33.579-75-75-75S35 56.579 35 98v16Z"
      clipRule="evenodd"
    />
    <g filter="url(#c)">
      <path fill="#A2A19F" d="M18 125h14v17c-3.11-7.108-6.27-11.501-14-17Z" />
      <path fill="#D6D7D6" d="M46 125H32v17c3.11-7.108 6.27-11.501 14-17Z" />
      <path fill="#BDBEBD" d="M18 125h14v-17c-3.11 7.108-6.27 11.501-14 17Z" />
      <path fill="#fff" d="M46 125H32v-17c3.11 7.108 6.27 11.501 14 17Z" />
    </g>
    <g filter="url(#d)">
      <path
        fill="#A2A19F"
        d="M174 125h14v17c-3.109-7.108-6.271-11.501-14-17Z"
      />
      <path
        fill="#D6D7D6"
        d="M202 125h-14v17c3.109-7.108 6.271-11.501 14-17Z"
      />
      <path
        fill="#BDBEBD"
        d="M174 125h14v-17c-3.109 7.108-6.271 11.501-14 17Z"
      />
      <path fill="#fff" d="M202 125h-14v-17c3.109 7.108 6.271 11.501 14 17Z" />
    </g>
    <g filter="url(#e)">
      <path
        fill="#A2A19F"
        d="M77 125h33v40.071c-7.329-16.755-14.781-27.11-33-40.071Z"
      />
      <path
        fill="#D6D7D6"
        d="M143 125h-33v40.071c7.329-16.755 14.781-27.11 33-40.071Z"
      />
      <path
        fill="#BDBEBD"
        d="M77 125h33V84.929c-7.329 16.755-14.781 27.11-33 40.071Z"
      />
      <path
        fill="#fff"
        d="M143 125h-33V84.929c7.329 16.755 14.781 27.11 33 40.071Z"
      />
    </g>
    <path
      fill="#E7E7E7"
      fillRule="evenodd"
      d="M110 27.006V14.013c20.285.35 38.869 7.683 53.45 19.699l-7.804 9.3A75.659 75.659 0 0 0 110 27.006Z"
      clipRule="evenodd"
    />
    <path
      fill="#AFAFAF"
      fillRule="evenodd"
      d="M110 27.007c-.34-.005-.681-.007-1.023-.007-18.103 0-34.728 6.33-47.782 16.897L53 34.13C68.017 21.564 87.364 14 108.477 14c.509 0 1.016.004 1.523.013v12.994Z"
      clipRule="evenodd"
    />
    <path
      fill="#E7E7E7"
      d="M110 233.683v-13.004c17.137-.186 32.848-6.319 45.166-16.432l8.34 9.939c-14.502 12.112-33.151 19.424-53.506 19.497Z"
    />
    <path
      fill="#AFAFAF"
      d="M110 220.679v13.004l-.307.001c-20.889 0-39.997-7.625-54.693-20.244l7.921-9.44c12.555 10.419 28.682 16.684 46.272 16.684.27 0 .538-.002.807-.005Z"
    />
    <defs>
      <filter
        id="c"
        width={64}
        height={70}
        x={0}
        y={90}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={9} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2167" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2167"
          result="shape"
        />
      </filter>
      <filter
        id="d"
        width={64}
        height={70}
        x={156}
        y={90}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={9} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2167" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2167"
          result="shape"
        />
      </filter>
      <filter
        id="e"
        width={102}
        height={116.143}
        x={59}
        y={66.929}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse">
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset />
        <feGaussianBlur stdDeviation={9} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.65 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2167" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2167"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default SvgComponent
