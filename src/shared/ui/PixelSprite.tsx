import type { HeroHair, HeroOutfit } from '../../entities/game/model/types'

type PixelSpriteProps = {
  variant: 'hero' | 'zhenya'
  active?: boolean
  label: string
  hair?: HeroHair
  outfit?: HeroOutfit
}

export const PixelSprite = ({
  variant,
  active = false,
  label,
  hair = 'default',
  outfit = 'jacket',
}: PixelSpriteProps) => (
  <div
    aria-label={label}
    className={`pixel-sprite pixel-sprite--${variant} pixel-sprite--hair-${hair} pixel-sprite--outfit-${outfit} ${active ? 'is-active' : ''}`}
    role="img"
  >
    <span className="sprite-hair" />
    <span className="sprite-head" />
    <span className="sprite-eyes" />
    <span className="sprite-body" />
    <span className="sprite-arm sprite-arm--left" />
    <span className="sprite-arm sprite-arm--right" />
    <span className="sprite-leg sprite-leg--left" />
    <span className="sprite-leg sprite-leg--right" />
  </div>
)
