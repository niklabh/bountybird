import { Spin } from 'antd'
import React from 'react'
import { LoadingOutlined } from "@ant-design/icons";

const Loader = () => {
  return (
    <div className='border border-solid border-gray-600 px-3 rounded-lg h-8 font-semibold text-sm min-w-[90px] md:min-w-[125px] capitalize flex items-center gap-x-2 cursor-pointer justify-center'>
      <div>
        <Spin
          indicator={
            <LoadingOutlined />
          }
          className='flex items-center justify-center'
        />
      </div>
    </div>
  )
}

export default Loader