"use client"

import { Users, Download, Brush } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const Hero = () => {
    const router = useRouter()
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
      {/* Left Content */}
      <div className="space-y-8">
        <div className="space-y-6">
          <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Collaborative Whiteboard for Everyone (dithub action )
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Draw. Share. Think Visually.
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={()=>router.push('/rooms')} className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
            Start Drawing
          </Button>
          <Button onClick={()=>router.push('/canvas/global')} variant="outline" className="px-8 py-3 text-lg border-gray-300">
            View Demo (global canvas)
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="h-6 w-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Real-time Collaboration</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Live cursors</li>
              <li>• Invite link</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Download className="h-6 w-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Export Easily</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• PNG, SVG, JSON</li>
              <li>• Cloud sync (opt)</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Brush className="h-6 w-6 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Drawing Tools</h3>
            </div>
            <ul className="space-y-2 text-gray-600">
              <li>• Shapes, arrows</li>
              <li>• Text, colors</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right Content - Whiteboard Mockup */}
      <div className="flex justify-center lg:justify-end">
        <div className="bg-white rounded-lg border-2 border-gray-200 shadow-lg p-6 max-w-md w-full">
          {/* Browser Header */}
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-200">
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full"></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            </div>
          </div>

          <Image 
            src="/home1.png"
            alt="Whiteboard mockup showing collaborative drawing features"
            width={800} 
            height={600} 
            className="w-full h-auto rounded"
          />

        </div>
      </div>
    </div>
  );
};

export default Hero;