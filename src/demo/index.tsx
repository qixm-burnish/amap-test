import { Row, Col } from 'antd'
import {
  Map,
  ScaleControl,
  ToolBarControl,
  InfoWindow,
  Marker,
  MarkerProps
} from '@uiw/react-amap'
import React, {
  cloneElement,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { CloseOutlined } from '@ant-design/icons'
import VinList from './vin-list'
import { useGetCarList } from './utils'
import CarDetailList from './carDetailList.json'

import car_charing from '@src/assets/images/map/car_charing.png'
import car_offline from '@src/assets/images/map/car_offline.png'
import car_online from '@src/assets/images/map/car_online.png'
import charge_station from '@src/assets/images/map/charge_station.png'
import './index.less'

const FormatInfoWindow: any = InfoWindow

const scrollListHeight = document.body.clientHeight - 170

enum MapLevelLimit {
  PROVINCE = 7,
  CITY = 11
}

export interface MarkerItem {
  vin: number | string
  type: string
  position: [number, number]
}

const FormatMarker: React.ForwardRefExoticComponent<
  MarkerProps & {
    children?: React.ReactNode
  } & React.RefAttributes<
      MarkerProps & {
        marker?: AMap.Marker | undefined
      }
    >
> = Marker

const carNumDivStyle: React.CSSProperties = {
  minWidth: '64px',
  minHeight: '64px',
  background: '#25b388',
  borderRadius: '32px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  color: '#fff',
  padding: '5px',
  opacity: 0.9
}

const Index: React.FC = () => {
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
  const [markers, setMarkers] = useState([])
  const [markerDetail, setMarkerDetail] = useState(null)
  const [markerDetailShow, setMarkerDetailShow] = useState(false)
  const [markerDetailPosition, setMarkerDetailPosition] = useState(null)

  const [stationMarkers, setStationMarkers] = useState([])
  const [stationMarkerDetail, setStationMarkerDetail] = useState(null)
  const [stationMarkersDetailShow, setStationMarkersDetailShow] =
    useState(false)
  const [stationMarkersDetailPosition, setStationMarkersDetailPosition] =
    useState(null)
  const [map, setMap] = useState<any>()
  const [dataList, setDataList] = useState([]) // 数据列表
  const [centerPostion, setCenterPosition] = useState<[number, number]>([
    102.665927, 36.153138
  ]) // 中国地图中心点

  const [markersShow, setMarkersShow] = useState(true)
  const [stationMarkersShow, setStationMarkersShow] = useState(false)

  const {
    onGetCars,
    page: carPage,
    total: carTotal,
    data: carList
  } = useGetCarList()

  function initMarkers(list: any[], type: 'province' | 'city' | 'detail') {
    clearMarkers()
    const markerList = []
    list.forEach((e) => {
      const marker =
        type === 'detail' ? (
          <Marker
            visiable
            key={e.vin}
            position={e.position}
            icon={
              new AMap.Icon({
                imageSize: new AMap.Size(35, 28),
                image:
                  e.type === '充电中'
                    ? car_charing
                    : e.type === '离线' ||
                      e.type === '日在线' ||
                      e.type === '周在线' ||
                      e.type === '月在线'
                    ? car_offline
                    : car_online
              })
            }
            onClick={(event) => carTap(event, e)}
          />
        ) : (
          <FormatMarker
            visiable={true}
            title={e.label}
            anchor={'center'}
            position={new AMap.LngLat(e.lng, e.lat)}
          >
            <div style={carNumDivStyle}>
              <div>{e.label}</div>
              <div>{e.total}辆</div>
            </div>
          </FormatMarker>
        )
      markerList.push(marker)
    })
    setMarkers(markerList)
  }

  function clearMarkers() {
    setMarkers([])
    setMarkerDetail(null)
    setMarkerDetailPosition(null)
    setMarkerDetailShow(false)
    setStationMarkersDetailShow(false)
  }

  function carTap(event, m: any) {
    setStationMarkersDetailShow(false)

    getCarMarkerDetail(m.vin).then((res) => {
      const e = {
        ...res,
        type:
          res?.dynamic_charge_status === '1' ||
          res?.dynamic_charge_status === '2'
            ? '充电中'
            : res?.dynamic_online_status_display,
        position: m.position
      }
      const contentBody = (
        <div
          style={{
            backgroundColor: '#fff',
            padding: '10px',
            width: '260px',
            border:
              e?.type === '离线' ||
              e?.type === '日在线' ||
              e?.type === '周在线' ||
              e?.type === '月在线'
                ? '1px solid grey'
                : '1px solid #2C9F23'
          }}
        >
          <div
            style={{
              width: '30px',
              height: '30px',
              float: 'right',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
              cursor: 'pointer'
            }}
            onClick={() => setMarkerDetailShow(false)}
          >
            <CloseOutlined style={{ fontSize: '16px' }} />
          </div>
          <div
            style={{
              color:
                e?.type === '离线' ||
                e?.type === '日在线' ||
                e?.type === '周在线' ||
                e?.type === '月在线'
                  ? 'grey'
                  : '#2C9F23',
              fontWeight: 'bold'
            }}
          >
            {e?.vin}({e?.type}）
          </div>
          <p>VIN：{e?.vin}</p>
          <p>产品线：{e?.product_lines_display}</p>
          <p>结构区别号：{e?.hierarchy_num}</p>
        </div>
      )
      setMarkerDetail(contentBody)
      setMarkerDetailPosition(e.position)
      setMarkerDetailShow(true)
    })
  }

  function initStationMarkers(list: any[]) {
    const markerList = []
    list.forEach((e) => {
      markerList.push(
        <Marker
          visiable
          key={e.id}
          position={[e.lng, e.lat]}
          icon={
            new AMap.Icon({
              imageSize: new AMap.Size(35, 28),
              image: charge_station
            })
          }
          onClick={(event) => chargeStationTap(event, e)}
        />
      )
    })
    setStationMarkers(markerList)
  }

  function chargeStationTap(event, e) {
    setMarkerDetailShow(false)
    const contentBody = (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '10px',
          width: '260px',
          border: '1px solid #8F50E6'
        }}
      >
        <div
          style={{
            width: '30px',
            height: '30px',
            float: 'right',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'flex-start',
            cursor: 'pointer'
          }}
          onClick={() => setStationMarkersDetailShow(false)}
        >
          <CloseOutlined style={{ fontSize: '16px' }} />
        </div>
        <div style={{ color: '#8F50E6', fontWeight: 'bold' }}>
          {e?.unit_name}
        </div>
        <p>地址：{e?.address ?? ''}</p>
        <p>类型：{e?.station_service_type ?? ''}</p>
        <p>
          站长：<span>{e?.contact_person ?? ''}</span>
          <span>
            {e?.contact_person_phone ? `(${e?.contact_person_phone}）` : ''}
          </span>
        </p>
        <p>
          负责人：<span>{e?.charge_person ?? ''}</span>
          <span>
            {e?.charge_person_phone ? `(${e?.charge_person_phone}）` : ''}
          </span>
        </p>
      </div>
    )
    setStationMarkerDetail(contentBody)
    setStationMarkersDetailPosition([e!.lng, e!.lat])
    setStationMarkersDetailShow(true)
  }

  async function getCarMarkerDetail(vin: string) {
    return null
  }

  function clearStationMarkers() {
    setStationMarkers([])
    setStationMarkerDetail(null)
    setStationMarkersDetailShow(false)
    setStationMarkersDetailPosition(null)
  }

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

  const mapChangeHandler = () => {
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

        mapInfoRef.current = info
        mapLevelRef.current = latestMapLevel
        loadMapData()
      })
    }
  }

  // 加载车辆详细数据
  const showCarDetailData = async (cityCode: string | number) => {
    const dataList = CarDetailList.data

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
        mapChangeHandler()
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
          <div className="map-container" style={{ height: '100vh' }}>
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
