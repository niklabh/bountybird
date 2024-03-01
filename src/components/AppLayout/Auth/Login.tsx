import React, { FC } from 'react'

interface ILoginProps {
    login: () => void;
}

const Login: FC<ILoginProps> = (props) => {
  return (
    <button
        onClick={props.login}
        className='bg-[#2f45c6] hover:bg-[#2f45c6]/90 font-helvetica-md font-light rounded-3xl box-border text-sm px-3 py-1 md:px-5 text-white text-center'
    >
        Log In
    </button>
  )
}

export default Login