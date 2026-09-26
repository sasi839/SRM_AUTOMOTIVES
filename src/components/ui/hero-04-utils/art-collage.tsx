

export interface ArtCollageProps {
  primaryImage: string
  secondaryImage: string
  primaryAlt?: string
  secondaryAlt?: string
}

export function ArtCollage({ primaryImage, secondaryImage, primaryAlt, secondaryAlt }: ArtCollageProps) {
  return (
    <div className="relative w-full aspect-square md:aspect-[4/3] flex items-center justify-center">
      <div className="absolute top-10 left-0 w-3/4 h-3/4 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-[-4deg] z-10 transition-transform duration-500 hover:rotate-0">
        <img src={primaryImage} alt={primaryAlt} className="w-full h-full object-cover" />
      </div>
      <div className="absolute bottom-10 right-0 w-2/3 h-2/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white/10 rotate-[6deg] z-20 transition-transform duration-500 hover:rotate-0">
        <img src={secondaryImage} alt={secondaryAlt} className="w-full h-full object-cover" />
      </div>
    </div>
  )
}
