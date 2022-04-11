import { Row, Col } from 'antd'

import React, { useCallback, useEffect, useState } from 'react'

import { load as AMapLoader } from '@amap/amap-jsapi-loader'

import VinList from './vin-list'
import { useGetCarList } from './utils'
import CarDetailList from './carDetailList.json'

import car_charing from '@src/assets/images/map/car_charing.png'
import car_offline from '@src/assets/images/map/car_offline.png'
import car_online from '@src/assets/images/map/car_online.png'
import './index.less'

export interface MarkerItem {
  vin: number | string
  type: string
  position: [number, number]
}

const Index: React.FC = () => {
  const [map, setMap] = useState<any>()
  const {
    onGetCars,
    page: carPage,
    total: carTotal,
    data: carList
  } = useGetCarList()

  function initMapMarkers(list = CarDetailList.data) {
    const markerList = []
    console.log('initMarkers', list)
    list.forEach((e) => {
      const marker = e

      // @ts-ignore
      const mapMarker = new AMap.Marker({
        // @ts-ignore
        icon: new AMap.Icon({
          // @ts-ignore
          imageSize: new AMap.Size(35, 28),
          image:
            e?.dynamic_charge_status === '1' || e?.dynamic_charge_status === '2'
              ? car_charing
              : e?.dynamic_online_status_display
              ? car_online
              : car_offline
        }),
        // @ts-ignore
        position: new AMap.LngLat(e.dynamic_lng, e.dynamic_lat)
      })

      map.add(mapMarker)
      markerList.push(marker)
    })
  }

  const onGetCarList = useCallback(
    async (params: Record<string, any> = {}) => {
      if (params.page_num === 1) {
        const scrollable = document.getElementById('scrollableDiv')
        scrollable.scrollTop = 0
      }

      await onGetCars(params)
    },
    [onGetCars]
  )

  // 选择左侧车辆
  const onLeftCarSelect = (item) => {
    if (map) {
      map.setZoom(15)
      // 地图移动完成后，根据地图当前位置去获取当前城市的车辆列表
      map.setCenter([item.dynamic_lng, item.dynamic_lat])
    }
  }

  useEffect(() => {
    onGetCarList({ page_num: 1 })

    AMapLoader({
      key: 'ca9aa2e65bad33d40c4ef759008ef76c', // 申请好的Web端开发者Key，首次调用 load 时必填
      version: '2.0', // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ['AMap.Marker'] // 需要使用的的插件列表，如比例尺'AMap.Scale'等
    })
      .then((AMap) => {
        const mapObj = new AMap.Map('mapContainer', {
          //设置地图容器id
          // viewMode: '3D', //是否为3D地图模式
          zoom: 5, //初始化地图级别
          center: [105.602725, 37.076636] //初始化地图中心点位置
        })

        setMap(mapObj)
      })
      .catch((e) => {
        console.log(e)
      })
  }, [])

  useEffect(() => {
    if (map) {
      initMapMarkers()
    }
  }, [map])

  return (
    <div className="car-monitor-container">
      <Row className="conetent">
        <Col span={6} xxl={3} className="list">
          <div
            style={{
              height: '100vh',
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
          <div
            className="map-container"
            style={{ height: '100vh' }}
            id="mapContainer"
          ></div>
        </Col>
      </Row>
    </div>
  )
}

export default Index
