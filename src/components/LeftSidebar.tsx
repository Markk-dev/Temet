import React from 'react'

const LeftSidebar = () => {
  return (
    <section className='flex flex-col border border-sidebar-border bg-white text-black 
        min-2-[227px] sticky left-0 h-full max-sm:hidden overflow-y-auto pb-20'>
        <h3 className='px-5 pt-4 text-xs uppercase'>
            Elements
        </h3>
    </section>
  )
}

export default LeftSidebar