import React, { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'
import { List as AntdList } from 'antd'

export const scrollListHeight = document.body.clientHeight - 250

const ActiveStyle: React.CSSProperties = {
  background: '#c3e6d7',
  cursor: 'pointer',
  paddingLeft: '10px'
}

const UnActiveStyle: React.CSSProperties = {
  background: '#fff',
  cursor: 'pointer',
  paddingLeft: '10px'
}

interface IProps {
  dataList: any[]
  total: number
  onCarSelect?: (item: any) => void
  onLoad: () => void
}

const List: React.FC<IProps> = ({ dataList, onCarSelect, total, onLoad }) => {
  const [activeItem, setActiveItem] = useState()

  return (
    <InfiniteScroll
      scrollableTarget="scrollableDiv"
      dataLength={dataList.length}
      hasMore={dataList.length < total}
      next={onLoad}
      loader={<h4>正在加载，请稍后...</h4>}
    >
      <AntdList
        dataSource={dataList}
        renderItem={(item) => (
          <AntdList.Item
            style={
              activeItem && activeItem === item?.vin
                ? ActiveStyle
                : UnActiveStyle
            }
            onClick={() => {
              setActiveItem(item?.vin)
              onCarSelect?.(item)
            }}
          >
            <AntdList.Item.Meta
              title={item?.vin}
              description={item?.license_plate}
            />
          </AntdList.Item>
        )}
      />
    </InfiniteScroll>
  )
}

export default List
