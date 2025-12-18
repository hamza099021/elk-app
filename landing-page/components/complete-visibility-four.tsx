"use client"

import React from 'react'
import AnimatedHeading from './animated-heading'

const CompleteInvisibilityFour = () => {
    return (
        <>
            <div className='max-w-6xl mx-auto p-8 '>
                <div className='flex items-center justify-between gap-12 mb-8 data-animate'>
                    <AnimatedHeading text="Always Ready & Accessible" className='font-bold text-4xl whitespace-nowrap' />
                    <p className='text-gray-600 text-left max-w-xl'>Position your AI assistant anywhere on screen with smooth drag-and-drop. Adjustable transparency, always-on-top mode, and instant keyboard access keep Pluely ready when you need it.
                    </p>
                </div>

                <div className="rounded-xl relative bg-white/60 backdrop-blur-sm border border-gray-200/50 shadow-xl p-4 max-w-6xl mx-auto">
                    <div
                        className="absolute bottom-0 left-0 w-full h-1/2 rounded-b-2xl"
                        style={{
                            background: 'linear-gradient(to top, rgba(255,255,255,0.4), rgba(255,255,255,0))',
                        }}
                    />
                    <video
                        loop
                        muted
                        autoPlay
                        playsInline
                        className="rounded-xl w-full"
                    >
                        <source src="/video/complete-4.mp4" type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </div>
            </div>

        </>
    )
}

export default CompleteInvisibilityFour;
