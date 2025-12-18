import { Bolt, Check, Heart, Search, Smile, Star, User } from 'lucide-react';
import React, { useState } from 'react';


const VideoWithCards = () => {
    const slides = [
        { icon: <Star />, label: 'Star', video: '/video/slide-1.mp4' },
        { icon: <Heart />, label: 'Heart', video: '/video/slide-2.mp4' },
        { icon: <User />, label: 'User', video: '/video/slide-3.mp4' },
        { icon: <Bolt />, label: 'Bolt', video: '/video/slide-4.mp4' },
        { icon: <Check />, label: 'Check', video: '/video/slide-5.mp4' },
        { icon: <Smile />, label: 'Smile', video: '/video/slide-6.mp4' },
    ];

    const [activeSlide, setActiveSlide] = useState(0);

    return (
        <div className='mx-auto flex items-center justify-center max-w-6xl border border-gray-200/50 bg-white/60 backdrop-blur-sm shadow-xl my-16 py-16 p-4 rounded-xl relative min-h-[950px]'>
            {/* Video */}
            <video
                width="640"
                height="360"
                loop
                muted
                autoPlay
                playsInline
                className='rounded-xl border border-gray-200/50 w-full h-full object-cover absolute inset-0 p-4'
            >
                <source src="/video/feature-bg.mp4" type="video/mp4" />
                Your browser does not support the video tag.
            </video>

            {/* Overlay container */}
            <div className="absolute inset-0 mx-auto py-4 my-6 px-4 flex flex-col gap-4">
                {/* First Box: Icon slides with search */}
                <div className="flex justify-between items-center mx-auto gap-4 border border-gray-200/50 bg-white/70 backdrop-blur-sm shadow-lg p-4 rounded-xl max-w-3xl w-full">
                    {/* First 2 icons */}
                    {slides.slice(0, 2).map((item, index) => (
                        <div
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-transform duration-200
                         ${activeSlide === index ? 'bg-gray-900 text-white scale-110 shadow-lg' : 'bg-white hover:scale-110 hover:bg-gray-100 shadow-md text-gray-700'}`}
                        >
                            {item.icon}
                        </div>
                    ))}

                    {/* Search box */}
                    <div className="flex items-center gap-2 border-2 border-gray-300 focus-within:border-gray-400 rounded-3xl px-4 h-13 py-2 bg-white/80 backdrop-blur-sm transition-colors duration-200">
                        <Search className="w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent outline-none text-gray-900 placeholder-gray-500 w-82 focus:outline-none"
                        />
                    </div>

                    {/* Last 4 icons */}
                    {slides.slice(2).map((item, index) => (
                        <div
                            key={index + 2}
                            onClick={() => setActiveSlide(index + 2)}
                            className={`w-12 h-12 flex items-center justify-center rounded-lg cursor-pointer transition-transform duration-200
                         ${activeSlide === index + 2 ? 'bg-gray-900 text-white scale-110 shadow-lg' : 'bg-white hover:scale-110 hover:bg-gray-100 shadow-md text-gray-700'}`}
                        >
                            {item.icon}
                        </div>
                    ))}
                </div>

                {/* Second Box: Slide content with videos */}
                <div className='flex justify-center items-center max-w-4xl w-full bg-white/70 backdrop-blur-sm shadow-inner mx-auto p-2 rounded-xl flex-1'>
                    <div className="w-full h-[750px] object-cover rounded-xl overflow-hidden transition-all duration-300">
                        <video
                            key={activeSlide}
                            width="100%"
                            height="100%"
                            loop
                            muted
                            autoPlay
                            playsInline
                            className='w-full h-full object-cover rounded-lg'
                        >
                            <source src={slides[activeSlide].video} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoWithCards;
