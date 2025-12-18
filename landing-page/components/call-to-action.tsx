// import AnimatedHeading from "./animated-heading";
// import { Button } from "./ui/button";

//   <div className="max-w-5xl mx-auto">
//                 {/* Ready to Go Invisible Section */}
//                 <div className='text-center mb-20'>
//                     <AnimatedHeading text="Ready to Go Invisible?" className='text-5xl font-medium mb-4' />
//                     <p className='max-w-3xl text-md mx-auto leading-8 text-gray-600'>
//                         Experience AI assistance that operates with complete stealth. Built with Tauri and Rust for blazing-fast performance, absolute privacy, and professional-grade discretion. Your invisible AI companion for meetings, interviews, and presentations.
//                     </p>

//                     <div className='flex gap-4 justify-center mt-6'>
//                         <Button className='bg-gray-900 text-white py-5 px-8 hover:bg-gray-800 shadow-lg'>Get Started</Button>
//                         <Button className='bg-white/60 backdrop-blur-sm text-gray-900 border border-gray-200/50 rounded-lg py-5 px-8 hover:bg-white/80 shadow-md'>Learn More</Button>
//                     </div>
//                 </div>

//                 {/* FAQ Section */}
              
//             </div>

import React from 'react'
import AnimatedHeading from './animated-heading'
import { Button } from './ui/button'

const CallToAction = () => {
  return (
    <>
       <section className="bg-cover relative bg-center flex items-center justify-center py-10" style={{backgroundImage: "url('/call-to-action.jpg')"}}>
         {/* Dark overlay */}
         <div className='absolute inset-0 bg-black/50'></div>
         
         <div className="max-w-5xl mx-auto relative z-10 px-4">
           {/* Ready to Go Invisible Section */}
           <div className='text-center'>
             <AnimatedHeading text="Ready to Go Invisible?" className='text-5xl text-white font-medium mb-6' />
             <p className='max-w-3xl text-md mx-auto leading-8 text-white/90'>
               Experience AI assistance that operates with complete stealth. Built with Tauri and Rust for blazing-fast performance, absolute privacy, and professional-grade discretion. Your invisible AI companion for meetings, interviews, and presentations.
             </p>

             <div className='flex gap-4 justify-center mt-8'>
               <Button className='bg-white text-gray-900 py-5 px-8 hover:bg-gray-100 shadow-lg font-semibold'>Get Started</Button>
               <Button className='bg-transparent backdrop-blur-sm text-white border-2 border-white/70 rounded-lg py-5 px-8 hover:bg-white/20 shadow-md font-semibold'>Learn More</Button>
             </div>
           </div>
         </div>
       </section>
    </>
  )
}

export default CallToAction
