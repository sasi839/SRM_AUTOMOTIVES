
import { Button } from "@/components/ui/button"

export interface CtaProps {
  ctaEnabled?: boolean
  text: string
  link?: string
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
}

export function Cta({ cta }: { cta: CtaProps }) {
  return (
    <Button variant={cta.variant} size={cta.size} asChild>
      <a href={cta.link || '#'}>{cta.text}</a>
    </Button>
  )
}
