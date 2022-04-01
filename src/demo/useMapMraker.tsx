import { Marker, MarkerProps } from '@uiw/react-amap'
import React, { useState } from 'react'
import car_charing from '@src/assets/images/map/car_charing.png'
import car_offline from '@src/assets/images/map/car_offline.png'
import car_online from '@src/assets/images/map/car_online.png'
import charge_station from '@src/assets/images/map/charge_station.png'
import { CloseOutlined } from '@ant-design/icons'

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

export function useMapMraker() {
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
          <p>电池厂：{e?.battery_manufacturer}</p>
          <p>电机厂：{e?.motor_manufacturer}</p>
          <p>高压盒厂：{e?.high_box_manufacturers}</p>
          <p>大客户：{e?.customer_info}</p>
          <p>客户姓名：{e?.contact}</p>
          <p>联系方式：{e?.contact_phone}</p>
          <p>信息来源：{e?.origin_display}</p>
          <p>详细地址：{e?.dynamic_location}</p>
          <p>SOC：{e?.soc}</p>
          <p>里程：{e?.accumulated_mileage}</p>
          <p>最高电压：{e?.battery_cell_voltage_highest_value}</p>
          <p>最低电压：{e?.battery_cell_voltage_lowest_value}</p>
          <p>最高温度：{e?.max_temperature_value}</p>
          <p>最低温度：{e?.min_temperature_value}</p>
          <p>最后上报时间：{e?.dynamic_last_report_time_display}</p>
          <p>终端编号： {e?.terminal_number}</p>
          <p>软件版本：{e?.software_version}</p>
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
    setStationMarkersDetailPosition([e.lng, e.lat])
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

  return {
    markers,
    markerDetail,
    markerDetailShow,
    markerDetailPosition,
    initMarkers,
    clearMarkers,

    stationMarkers,
    stationMarkerDetail,
    stationMarkersDetailShow,
    stationMarkersDetailPosition,
    initStationMarkers,
    clearStationMarkers
  }
}
