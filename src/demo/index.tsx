import { Input, Space, Select, Button, Checkbox, Form, Row, Col } from 'antd'
import { Map, ScaleControl, ToolBarControl, InfoWindow } from '@uiw/react-amap'
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { deletObjEmptyValue } from '@src/utils'

import VinList from './vin-list'
import { useMapMraker } from './useMapMraker'
import { useGetCarList } from './utils'
import CarDetailList from './carDetailList.json'

import './index.less'

const { Option } = Select

const FormatInfoWindow: any = InfoWindow

const headerWidth: React.CSSProperties = { width: '160px' }

const STEP_PAGE_SIZE = 500
const scrollListHeight = document.body.clientHeight - 170

enum MapLevelLimit {
  PROVINCE = 7,
  CITY = 11
}

const Index: React.FC = () => {
  const [form] = Form.useForm()
  const provinceList = useRef([]) // 省列表，用于获取省经纬度
  const searchParamsRef = useRef<Record<string, any>>({})
  const isExactSearchRef = useRef<boolean>(false)
  const mapOnceEvent = useRef(null)
  const mapLevelRef = useRef<string>(null)
  const mapZoomRef = useRef<number>(null)
  const mapInfoRef = useRef<{
    province?: string
    city?: string
    citycode?: string
    district?: string
  }>(null)

  const [map, setMap] = useState<any>()
  const [dataList, setDataList] = useState([]) // 数据列表
  const [centerPostion, setCenterPosition] = useState<[number, number]>([
    102.665927, 36.153138
  ]) // 中国地图中心点

  const [markersShow, setMarkersShow] = useState(true)
  const [stationMarkersShow, setStationMarkersShow] = useState(false)
  const stationCheckBoxRef = useRef(null)

  const {
    markers,
    markerDetail,
    markerDetailShow,
    markerDetailPosition,

    stationMarkers,
    stationMarkerDetail,
    stationMarkersDetailShow,
    stationMarkersDetailPosition,
    initMarkers,
    initStationMarkers,
    clearStationMarkers
  } = useMapMraker()

  const {
    onGetCars,
    page: carPage,
    total: carTotal,
    data: carList
  } = useGetCarList()

  const onGetCarList = useCallback(
    async (params: Record<string, any> = {}) => {
      params = { page_num: carPage + 1, ...searchParamsRef.current, ...params }

      if (params.page_num === 1) {
        const scrollable = document.getElementById('scrollableDiv')
        scrollable.scrollTop = 0
      }

      await onGetCars(params)
    },
    [searchParamsRef.current, onGetCars, carPage]
  )

  const loadMapData = () => {
    const zoom = mapZoomRef.current
    const info = mapInfoRef.current

    if (!zoom) return
    showCarDetailData(info.citycode)
  }

  const mapChangeHandler = (forceUpdate = false) => {
    if (map) {
      if (mapOnceEvent.current) {
        map.clearEvents('moveend')
        mapOnceEvent.current = null
      }

      map.getCity((info) => {
        const zoom = map.getZoom()

        mapZoomRef.current = zoom

        const latestMapLevel =
          zoom > MapLevelLimit.PROVINCE && zoom <= MapLevelLimit.CITY
            ? 'city'
            : zoom > MapLevelLimit.CITY
            ? 'detail'
            : 'province'

        if (mapLevelRef.current != latestMapLevel || forceUpdate) {
          mapInfoRef.current = info
          mapLevelRef.current = latestMapLevel

          if (!isExactSearchRef.current || forceUpdate) {
            loadMapData()
          }
        }
      })
    }
  }

  // 加载车辆详细数据
  const showCarDetailData = async (cityCode: string | number) => {
    const dataList = CarDetailList.data

    isExactSearchRef.current =
      searchParamsRef.current?.vin && dataList.length == 1
    // 非精确搜索模式下，如果分批加载完层后地图已经被缩放或被切换到其他城市时，则不显示本次的车辆数据
    if (
      !isExactSearchRef.current &&
      (mapInfoRef.current.citycode !== cityCode ||
        mapZoomRef.current < MapLevelLimit.CITY)
    )
      return

    const list = dataList.map((e) => {
      return {
        ...e,
        type:
          e?.dynamic_charge_status === '1' || e?.dynamic_charge_status === '2'
            ? '充电中'
            : e?.dynamic_online_status_display,
        position: [Number(e.dynamic_lng), Number(e.dynamic_lat)]
      }
    })

    initMarkers(list, 'detail')
    setDataList(dataList)
  }

  // 选择左侧车辆
  const onLeftCarSelect = (item) => {
    setCenterPosition([item.dynamic_lng, item.dynamic_lat])

    if (map) {
      map.setZoom(15)
      // 地图移动完成后，根据地图当前位置去获取当前城市的车辆列表
      mapOnceEvent.current = true
      map.on('moveend', () => {
        mapChangeHandler(true)
      })
    }
  }

  useEffect(() => {
    if (map) {
      map.on('zoomend', () => mapChangeHandler())
      mapChangeHandler()
    }
  }, [map])

  useEffect(() => {
    onGetCarList({ page_num: 1 })
  }, [])

  // 精确单车时，30s轮询刷新单车数据
  useEffect(() => {
    let timer = null

    if (isExactSearchRef.current) {
      const cityCodeCache = mapInfoRef.current.citycode
      timer = setInterval(() => showCarDetailData(cityCodeCache), 30 * 1000)
    }

    return () => {
      if (timer) clearInterval(timer)
    }
  }, [isExactSearchRef.current])

  useEffect(() => {
    if (markers.length === 1) {
      const position = markers[0].props.position

      if (Array.isArray(position) && position.length == 2)
        setCenterPosition(position as [number, number])
    }
  }, [markers])

  return (
    <div className="car-monitor-container">
      <Row className="conetent">
        <Col span={6} xxl={3} className="list">
          <div
            style={{
              height: scrollListHeight,
              overflowX: 'hidden',
              overflowY: 'auto'
            }}
            id="scrollableDiv"
          >
            <VinList
              total={carTotal}
              dataList={carList}
              onLoad={onGetCarList}
              onCarSelect={onLeftCarSelect}
            />
          </div>
        </Col>
        <Col span={18} xxl={21}>
          <div className="map-container">
            <Map
              center={centerPostion}
              zoom={4.9}
              ref={(instance) => {
                if (instance && instance.map && !map) {
                  setMap(instance.map)
                }
              }}
            >
              <ScaleControl offset={[16, 30]} position="LB" />
              <ToolBarControl offset={[16, 10]} position="RB" />
              {markersShow &&
                markers.map((e, idx) => cloneElement(e, { key: idx }))}
              {stationMarkersShow &&
                stationMarkers.map((e, idx) => cloneElement(e, { key: idx }))}
              {markerDetail && (
                <FormatInfoWindow
                  anchor="bottom-right"
                  isCustom={true}
                  autoMove={true}
                  visiable={markerDetailShow}
                  position={markerDetailPosition}
                >
                  {markerDetail}
                </FormatInfoWindow>
              )}
              {stationMarkerDetail && (
                <FormatInfoWindow
                  anchor="bottom-right"
                  isCustom={true}
                  autoMove={true}
                  visiable={stationMarkersDetailShow}
                  position={stationMarkersDetailPosition}
                >
                  {stationMarkerDetail}
                </FormatInfoWindow>
              )}
            </Map>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Index
