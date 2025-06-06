import {useMediaQuery} from 'react-responsive'

const useIsMobile = () => {
  const isPC = useMediaQuery({query: '(width >= 40rem)'})

  return !isPC
}

export default useIsMobile
