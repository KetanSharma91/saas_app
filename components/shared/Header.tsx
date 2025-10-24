import React from 'react'

const Header = ({ title, subtitle }: { title: string, subtitle?: string }) => {
    return (
        <div>
            <h2 className='h2-bold text-dark-600'>{title}</h2>
            {subtitle && <p className="p-14-regualr mt-4">{subtitle}</p>}
        </div>
    )
}

export default Header