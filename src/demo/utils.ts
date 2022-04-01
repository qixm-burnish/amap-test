import { useCallback, useState } from 'react'

import carsData from './mockCars.json'

export function useGetCarList() {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  const onGetCars = useCallback(
    async (queryParams: any = {}) => {
      if (loading) {
        return
      }

      queryParams.page_size = 30

      setLoading(true)
      const { data: carData, page_info } = carsData

      setPage(page_info.page_num)
      setTotal(page_info.total_count)
      if (queryParams.page_num === 1) {
        setData(carData)
      } else {
        setData([...data, ...carData])
      }
      setLoading(false)
    },
    [loading, page, data]
  )

  return {
    page,
    total,
    data,
    onGetCars
  }
}
