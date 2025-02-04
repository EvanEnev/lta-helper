const SvgComponent = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={216 * props?.scale || 1}
    height={250 * props?.scale || 1}
    fill="none"
    {...props}>
    <path
      fill="#555754"
      d="M108 250 209.846 70.089C227.583 38.758 204.861 0 168.757 0H108v250Z"
    />
    <path
      fill="#484D50"
      d="M108 0H47.243C11.14 0-11.583 38.758 6.153 70.089L108 250V0Z"
    />
    <mask
      id="a"
      width={126}
      height={146}
      x={45}
      y={35}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}>
      <path
        fill="red"
        d="M48.59 75.932 108 181l59.41-105.068C177.757 57.635 164.502 35 143.441 35H72.559c-21.061 0-34.316 22.635-23.97 40.932Z"
      />
    </mask>
    <g mask="url(#a)">
      <path fill="#8C6F47" d="M108-24a109 109 0 0 0-96.58 58.47L108 85V-24Z" />
      <path fill="#543908" d="M108 195A109 109 0 0 1-.7 77.924L108 86v109Z" />
      <path
        fill="#68450D"
        d="M-.855 80.374A109 109 0 0 1 15.997 27.55L108 86-.855 80.374Z"
      />
      <path
        fill="#CBB691"
        d="M108-24a109.005 109.005 0 0 1 96.581 58.47L108 85V-24Z"
      />
      <path
        fill="#A5855D"
        d="M108 195a108.996 108.996 0 0 0 79.879-34.836 109.003 109.003 0 0 0 28.821-82.24L108 86v109Z"
      />
      <path
        fill="#B59670"
        d="M216.855 80.374a108.996 108.996 0 0 0-16.852-52.824L108 86l108.855-5.626Z"
      />
    </g>
    <mask
      id="b"
      width={68}
      height={79}
      x={73}
      y={56}
      maskUnits="userSpaceOnUse"
      style={{
        maskType: 'alpha',
      }}>
      <path
        fill="#00F"
        d="m75 81 33.051 54 31.048-54c5.428-9.9-1.405-25-12.454-25H89.458C78.408 56 69.572 71.1 75 81Z"
      />
    </mask>
    <g mask="url(#b)">
      <path
        fill="#996D19"
        d="M108-31a109 109 0 0 1 72.293 27.424L108 78V-31Z"
      />
      <path
        fill="#785100"
        d="M108 187a109 109 0 0 0 103.157-73.791L108 78v109Z"
      />
      <path
        fill="#895B00"
        d="M211.162 113.195A108.996 108.996 0 0 0 177.574-5.907L108 78l103.162 35.195Z"
      />
      <path fill="#6B4908" d="M108-31A109 109 0 0 0 36.055-3.884L108 78V-31Z" />
      <path
        fill="#4A3802"
        d="M108 187A108.996 108.996 0 0 1 4.843 113.209L108 78v109Z"
      />
      <path
        fill="#553D08"
        d="M4.838 113.195A109 109 0 0 1 38.426-5.907L108 78 4.838 113.195Z"
      />
    </g>
    <path
      fill="#73572F"
      d="M52.894 13.523C33.114 16.687 18 33.829 18 54.5c0 10.202 6.637 24.1 14.708 34.356l2.022-7.545C28.63 72.907 24 62.233 24 54c0-16.733 11.574-30.445 27.257-34.37l1.637-6.107Z"
    />
    <path
      fill="#8C7147"
      d="M161 13c19.78 3.164 34.894 20.306 34.894 40.977 0 10.202-6.637 24.1-14.709 34.356l-2.021-7.545c6.1-8.403 10.73-19.078 10.73-27.31 0-16.733-11.575-30.446-27.257-34.37L161 13Z"
    />
    <path
      fill="#7B5D31"
      d="M188.839 61c-1.703 6.609-5.313 13.779-9.675 19.788l2.021 7.545c6.336-8.05 11.787-18.344 13.839-27.333h-6.185ZM173.324 94l5.202 2.99-33.323 57.985-5.203-2.99zM42.202 94 37 96.99l33.324 57.985 5.202-2.99z"
    />
    <g filter="url(#c)">
      <path fill="#A2A19F" d="M19 92h14v17c-3.11-7.108-6.27-11.501-14-17Z" />
      <path fill="#D6D7D6" d="M47 92H33v17c3.11-7.108 6.27-11.501 14-17Z" />
      <path fill="#BDBEBD" d="M19 92h14V75c-3.11 7.108-6.27 11.501-14 17Z" />
      <path fill="#fff" d="M47 92H33V75c3.11 7.108 6.27 11.501 14 17Z" />
    </g>
    <g filter="url(#d)">
      <path
        fill="#A2A19F"
        d="M75 91h33v40.071c-7.329-16.755-14.781-27.11-33-40.071Z"
      />
      <path
        fill="#D6D7D6"
        d="M141 91h-33v40.071c7.329-16.755 14.781-27.11 33-40.071Z"
      />
      <path
        fill="#BDBEBD"
        d="M75 91h33V50.929C100.671 67.684 93.219 78.039 75 91Z"
      />
      <path
        fill="#fff"
        d="M141 91h-33V50.929c7.329 16.755 14.781 27.11 33 40.071Z"
      />
    </g>
    <g filter="url(#e)">
      <path fill="#A2A19F" d="M169 91h14v17c-3.109-7.108-6.271-11.501-14-17Z" />
      <path fill="#D6D7D6" d="M197 91h-14v17c3.109-7.108 6.271-11.501 14-17Z" />
      <path fill="#BDBEBD" d="M169 91h14V74c-3.109 7.108-6.271 11.501-14 17Z" />
      <path fill="#fff" d="M197 91h-14V74c3.109 7.108 6.271 11.501 14 17Z" />
    </g>
    <path fill="#C6C6C6" d="M73.365 146 108 207v21l-45-75.953L73.365 146Z" />
    <path fill="#E7E8E7" d="m142.484 146-34.634 61v21l45-75.953L142.484 146Z" />
    <path
      fill="#C6C6C6"
      d="m47 14 11.339-3.543A32.001 32.001 0 0 1 67.883 9H108v11H68.803c-3.837 0-7.643.69-11.236 2.038L51 24.5 47 14Z"
    />
    <path
      fill="#ECEBEC"
      d="m169 14-11.339-3.543A32 32 0 0 0 148.116 9H108v11h39.197a32 32 0 0 1 11.236 2.038L165 24.5l4-10.5Z"
    />
    <defs>
      <filter
        id="c"
        width={64}
        height={70}
        x={1}
        y={57}
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
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2163" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2163"
          result="shape"
        />
      </filter>
      <filter
        id="d"
        width={102}
        height={116.143}
        x={57}
        y={32.929}
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
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2163" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2163"
          result="shape"
        />
      </filter>
      <filter
        id="e"
        width={64}
        height={70}
        x={151}
        y={56}
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
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_41_2163" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_41_2163"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)
export default SvgComponent
